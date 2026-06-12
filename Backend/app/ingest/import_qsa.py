import os
import zipfile
import tempfile
import logging
import pandas as pd
import httpx
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.empresa import Empresa, Socio

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
            record = {"cnpj": row.get("cnpj", ""), "razao_social": row.get("razao_social", ""), "nome_fantasia": row.get("nome_fantasia", ""), "municipio": row.get("municipio", ""), "estado": row.get("estado", ""), "situacao": row.get("situacao", "")}
            if not validate_qsa_data(record):
                continue
            empresa = Empresa(cnpj=record["cnpj"], razao_social=record["razao_social"], nome_fantasia=record["nome_fantasia"], municipio=record["municipio"], estado=record["estado"], situacao=record["situacao"])
            db.add(empresa)
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


def importar_qsa_completo():
    db = SessionLocal()
    tmp = tempfile.TemporaryDirectory()
    try:
        logger.info("Iniciando importação QSA completa...")
        zips = baixar_qsa(tmp.name)
        for nome, zip_path in zips.items():
            csvs = extrair_csvs(zip_path, tmp.name)
            for csv_path in csvs:
                if "EMPRECSV" in csv_path.upper() or "empres" in nome.lower():
                    processar_csv_empresas(csv_path, db)
                elif "SOCIOCSV" in csv_path.upper() or "soci" in nome.lower():
                    processar_csv_socios(csv_path, db)
        logger.info("Importação QSA concluída com sucesso!")
    except Exception as e:
        logger.error("Erro na importação QSA: %s", e)
        db.rollback()
    finally:
        db.close()
        tmp.cleanup()
