from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from ..models.deputado import Deputado
from ..models.empresa import Socio, Empresa, Relacao
import logging

logger = logging.getLogger(__name__)

FUZZY_THRESHOLD = 75


class RelacaoService:
    def __init__(self, db: Session):
        self.db = db

    def _get_alta_threshold(self) -> float:
        from ..models.config import Config
        config = self.db.query(Config).filter(
            Config.key == "alta_exposicao_threshold").first()
        return float(config.value) if config else 1000000.0

    def _get_cnae_conflito_classes(self) -> set:
        from ..models.config import Config
        config = self.db.query(Config).filter(
            Config.key == "conflito_cnae_classes").first()
        if config and config.value:
            classes = set()
            for c in config.value.split(","):
                c = c.strip()
                if c:
                    classes.add(c)
            return classes
        return {"41204", "70204", "73190", "86101"}

    def _is_cnae_conflito(self, cnae_principal: str) -> bool:
        if not cnae_principal:
            return False
        conflito_classes = self._get_cnae_conflito_classes()
        cnae_class = cnae_principal[:5]
        return cnae_class in conflito_classes

    def _get_cnae_secundarios_conflito(self, cnpj: str) -> bool:
        from ..models.empresa import EmpresaCnaeSecundario
        secundarios = self.db.query(EmpresaCnaeSecundario).filter(
            EmpresaCnaeSecundario.cnpj == cnpj).all()
        if not secundarios:
            return False
        conflito_classes = self._get_cnae_conflito_classes()
        for sec in secundarios:
            if sec.cnae_secundario and sec.cnae_secundario[:5] in conflito_classes:
                return True
        return False

    def buscar_empresas_por_cpf(self, cpf: str):
        return self.db.query(Socio).filter(Socio.cpf_socio == cpf).all()

    def buscar_empresas_por_nome(self, nome: str):
        return self.db.query(Socio).filter(Socio.nome_socio.ilike(f"%{nome}%")).all()

    def _calc_confianca_nome(self, nome_deputado: str, nome_socio: str) -> tuple:
        score = fuzz.token_sort_ratio(nome_deputado.lower(), nome_socio.lower())
        if score >= 90:
            return (score, 85)
        if score >= 75:
            return (score, 60)
        return (score, 0)

    def gerar_relacoes_deputado(self, deputado_id: str):
        deputado = self.db.query(Deputado).filter(
            Deputado.id == deputado_id).first()
        if not deputado:
            return []

        relacoes_encontradas = []

        # 1. Exact CPF matching
        if deputado.cpf:
            socios = self.buscar_empresas_por_cpf(deputado.cpf)
            for s in socios:
                relacoes_encontradas.append({
                    "cnpj": s.cnpj,
                    "tipo_relacao": "cpf_match",
                    "relationship_type": False,
                    "score_confianca": 100,
                    "nome_socio": s.nome_socio
                })

        # 2. Fuzzy name matching for unmatched deputies (dual strategy)
        socios_nome = self.buscar_empresas_por_nome(deputado.nome)
        for s in socios_nome:
            if any(r["cnpj"] == s.cnpj for r in relacoes_encontradas):
                continue
            raw_score, confianca = self._calc_confianca_nome(deputado.nome, s.nome_socio)
            if raw_score < FUZZY_THRESHOLD:
                continue
            relacoes_encontradas.append({
                "cnpj": s.cnpj,
                "tipo_relacao": "nome_match",
                "relationship_type": True,
                "score_confianca": confianca,
                "nome_socio": s.nome_socio
            })

        # 3. Compute flags for each relationship
        threshold = self._get_alta_threshold()
        conflito_classes = self._get_cnae_conflito_classes()
        for r in relacoes_encontradas:
            empresa = self.db.query(Empresa).filter(
                Empresa.cnpj == r["cnpj"]).first()
            alta_exposicao = (
                empresa is not None
                and empresa.capital_social is not None
                and empresa.capital_social > threshold
            )
            via_conjuge = r["tipo_relacao"] == "nome_match"

            cnae_conflito = False
            if empresa is not None and empresa.cnae_principal:
                cnae_class = empresa.cnae_principal[:5]
                cnae_conflito = cnae_class in conflito_classes

            if not cnae_conflito and empresa is not None:
                cnae_conflito = self._get_cnae_secundarios_conflito(r["cnpj"])

            score = 0
            if alta_exposicao:
                score += 50
            if cnae_conflito:
                score += 30
            if r["tipo_relacao"] == "cpf_match":
                score += 20

            conflito_interesse = score > 0

            r["alta_exposicao"] = alta_exposicao
            r["via_conjuge"] = via_conjuge
            r["conflito_interesse"] = conflito_interesse
            r["score_conflito"] = score

        self.db.query(Relacao).filter(
            Relacao.deputado_id == deputado_id).delete()

        for r in relacoes_encontradas:
            new_rel = Relacao(
                deputado_id=deputado_id,
                cnpj=r["cnpj"],
                tipo_relacao=r["tipo_relacao"],
                relationship_type=r.get("relationship_type"),
                score_confianca=r["score_confianca"],
                origem="import_socios",
                alta_exposicao=r["alta_exposicao"],
                via_conjuge=r["via_conjuge"],
                conflito_interesse=r["conflito_interesse"],
                score_conflito=r["score_conflito"],
            )
            self.db.add(new_rel)

        self.db.commit()
        return relacoes_encontradas

    def get_relacoes_com_detalhes(self, deputado_id: str):
        relacoes = self.db.query(Relacao).filter(
            Relacao.deputado_id == deputado_id).all()

        resultado = []
        for r in relacoes:
            empresa = self.db.query(Empresa).filter(
                Empresa.cnpj == r.cnpj).first()
            resultado.append({
                "id": r.id,
                "cnpj": r.cnpj,
                "tipo": r.tipo_relacao,
                "tipo_relacao": r.tipo_relacao,
                "relationship_type": r.relationship_type,
                "score": r.score_confianca,
                "score_confianca": r.score_confianca,
                "alta_exposicao": r.alta_exposicao,
                "via_conjuge": r.via_conjuge,
                "conflito_interesse": r.conflito_interesse,
                "score_conflito": r.score_conflito,
                "empresa": {
                    "razao_social": empresa.razao_social if empresa else "Não cadastrada",
                    "municipio": empresa.municipio if empresa else None,
                    "capital_social": empresa.capital_social if empresa else None,
                    "cnae_principal": empresa.cnae_principal if empresa else None,
                    "cnae_descricao": empresa.cnae_descricao if empresa else None,
                }
            })
        return resultado
