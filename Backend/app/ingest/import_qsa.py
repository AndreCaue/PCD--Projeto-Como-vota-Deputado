import os
import zipfile
import tempfile
import logging
from datetime import datetime, timezone
import pandas as pd
import httpx
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert as sqlite_upsert
from ..database import SessionLocal
from ..models.empresa import Empresa, Socio, EmpresaCnaeSecundario

logger = logging.getLogger(__name__)

RECEITA_BASE_URL = "https://dadosabertos.receita.fazenda.gov.br/api/cnpj"

CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]


def validar_cnpj(cnpj: str) -> bool:
    digits = "".join(c for c in cnpj if c.isdigit())
    if len(digits) != 14:
        return False
    if all(d == digits[0] for d in digits):
        return False
    total = sum(int(d) * w for d, w in zip(digits[:12], CNPJ_WEIGHTS_FIRST))
    rest = total % 11
    dig1 = 0 if rest < 2 else 11 - rest
    if int(digits[12]) != dig1:
        return False
    total = sum(int(d) * w for d, w in zip(digits[:13], CNPJ_WEIGHTS_SECOND))
    rest = total % 11
    dig2 = 0 if rest < 2 else 11 - rest
    return int(digits[13]) == dig2


def validate_qsa_data(record: dict) -> bool:
    cnpj = record.get("cnpj", "")
    if not validar_cnpj(cnpj):
        logger.warning("CNPJ inválido rejeitado: %s | dados: %s", cnpj, record)
        return False
    return True


def processar_csv_empresas(csv_path: str, db: Session):
    total = 0
    for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
        for _, row in chunk.iterrows():
            record = {
                "cnpj": row.get("cnpj", ""),
                "razao_social": row.get("razao_social", ""),
                "nome_fantasia": row.get("nome_fantasia", ""),
                "municipio": row.get("municipio", ""),
                "estado": row.get("estado", ""),
                "situacao": row.get("situacao", ""),
                "cnae_principal": row.get("cnae_principal", "").strip() or None,
                "cnae_descricao": row.get("cnae_descricao", "").strip() or None,
            }
            if not validate_qsa_data(record):
                continue
            empresa = Empresa(
                cnpj=record["cnpj"],
                razao_social=record["razao_social"],
                nome_fantasia=record["nome_fantasia"],
                municipio=record["municipio"],
                estado=record["estado"],
                situacao=record["situacao"],
                cnae_principal=record["cnae_principal"],
                cnae_descricao=record["cnae_descricao"],
            )
            db.add(empresa)
            db.flush()

            cnae_secundaria_raw = row.get("cnae_secundaria", "").strip()
            if cnae_secundaria_raw:
                for codigo in cnae_secundaria_raw.split(";"):
                    codigo = codigo.strip()
                    if codigo:
                        sec = EmpresaCnaeSecundario(
                            cnpj=record["cnpj"],
                            cnae_secundario=codigo,
                            cnae_descricao=record["cnae_descricao"],
                        )
                        db.add(sec)

        db.commit()
        total += len(chunk)
        logger.info("Empresas processadas: %d", total)


def processar_csv_socios(csv_path: str, db: Session):
    total = 0
    for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
        for _, row in chunk.iterrows():
            socio = Socio(cpf_socio=str(row.get("cpf_socio", row.get("cpf", ""))), nome_socio=str(row.get("nome_socio", row.get("nome", ""))), cnpj=str(row.get("cnpj", "")), qualificacao=str(row.get("qualificacao", "")))
            db.add(socio)
        db.commit()
        total += len(chunk)
        logger.info("Sócios processados: %d", total)
    return total


def processar_csv_empresas_incremental(csv_path: str, db: Session):
    total = 0
    for chunk in pd.read_csv(csv_path, chunksize=10000, dtype=str):
        records = []
        for _, row in chunk.iterrows():
            capital_raw = row.get("capital_social", "").strip()
            capital_value = None
            if capital_raw:
                try:
                    # Brazilian format: "1.000.000,00" -> 1000000.00
                    capital_value = float(
                        capital_raw.replace(".", "").replace(",", ".")
                    )
                except ValueError:
                    pass
            records.append({
                "cnpj": row.get("cnpj", ""),
                "razao_social": row.get("razao_social", ""),
                "nome_fantasia": row.get("nome_fantasia", ""),
                "municipio": row.get("municipio", ""),
                "estado": row.get("estado", ""),
                "situacao": row.get("situacao", ""),
                "capital_social": capital_value,
                "cnae_principal": row.get("cnae_principal", "").strip() or None,
                "cnae_descricao": row.get("cnae_descricao", "").strip() or None,
            })
        # CRITICAL: All dicts in records MUST have identical keys
        stmt = sqlite_upsert(Empresa).values(records)
        stmt = stmt.on_conflict_do_update(
            index_elements=[Empresa.cnpj],
            set_={
                "razao_social": stmt.excluded.razao_social,
                "nome_fantasia": stmt.excluded.nome_fantasia,
                "municipio": stmt.excluded.municipio,
                "estado": stmt.excluded.estado,
                "situacao": stmt.excluded.situacao,
                "capital_social": stmt.excluded.capital_social,
                "cnae_principal": stmt.excluded.cnae_principal,
                "cnae_descricao": stmt.excluded.cnae_descricao,
            }
        )
        db.execute(stmt)
        db.commit()

        for _, row in chunk.iterrows():
            cnpj_raw = row.get("cnpj", "").strip()
            cnae_secundaria_raw = row.get("cnae_secundaria", "").strip()
            if cnae_secundaria_raw and cnpj_raw:
                db.query(EmpresaCnaeSecundario).filter(
                    EmpresaCnaeSecundario.cnpj == cnpj_raw
                ).delete()
                for codigo in cnae_secundaria_raw.split(";"):
                    codigo = codigo.strip()
                    if codigo:
                        sec = EmpresaCnaeSecundario(
                            cnpj=cnpj_raw,
                            cnae_secundario=codigo,
                            cnae_descricao=row.get("cnae_descricao", "").strip() or None,
                        )
                        db.add(sec)
        db.commit()
        total += len(chunk)
        logger.info("Empresas upserted (incremental): %d", total)
    return total


def importar_qsa_incremental():
    db = SessionLocal()
    tmp = tempfile.TemporaryDirectory()
    try:
        logger.info("Iniciando importação QSA incremental...")
        zips = baixar_qsa(tmp.name)
        empresa_total = 0
        socio_total = 0
        for nome, zip_path in zips.items():
            csvs = extrair_csvs(zip_path, tmp.name)
            for csv_path in csvs:
                if "EMPRECSV" in csv_path.upper() or "empres" in nome.lower():
                    empresa_total = processar_csv_empresas_incremental(csv_path, db)
                elif "SOCIOCSV" in csv_path.upper() or "soci" in nome.lower():
                    socio_total = processar_csv_socios(csv_path, db)
        from ..models.qsa_metadata import QsaMetadata
        meta = QsaMetadata(
            last_import_at=datetime.now(timezone.utc),
            status="success",
            row_count=empresa_total + socio_total
        )
        db.add(meta)
        db.commit()
        logger.info("Importação QSA incremental concluída com sucesso!")
    except Exception as e:
        logger.error("Erro na importação QSA incremental: %s", e)
        db.rollback()
        try:
            from ..models.qsa_metadata import QsaMetadata
            meta = QsaMetadata(
                last_import_at=datetime.now(timezone.utc),
                status="failed",
                row_count=0,
                error_message=str(e)
            )
            db.add(meta)
            db.commit()
        except Exception:
            pass
    finally:
        db.close()
        tmp.cleanup()


def baixar_qsa(temp_dir: str) -> dict:
    paths = {}
    for nome in ("Empresas", "Socios"):
        url = f"{RECEITA_BASE_URL}/{nome}.zip"
        dest = os.path.join(temp_dir, f"{nome}.zip")
        logger.info("Baixando %s...", url)
        with httpx.Client(timeout=300) as client:
            resp = client.get(url)
            resp.raise_for_status()
            with open(dest, "wb") as f:
                f.write(resp.content)
        paths[nome] = dest
    return paths


def extrair_csvs(zip_path: str, dest_dir: str) -> list:
    csv_paths = []
    with zipfile.ZipFile(zip_path, "r") as zf:
        for name in zf.namelist():
            if name.endswith(".csv") or "EMPRECSV" in name or "SOCIOCSV" in name:
                zf.extract(name, dest_dir)
                csv_paths.append(os.path.join(dest_dir, name))
    return csv_paths

