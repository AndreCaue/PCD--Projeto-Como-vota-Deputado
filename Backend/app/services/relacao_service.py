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
        for r in relacoes_encontradas:
            empresa = self.db.query(Empresa).filter(
                Empresa.cnpj == r["cnpj"]).first()
            alta_exposicao = (
                empresa is not None
                and empresa.capital_social is not None
                and empresa.capital_social > threshold
            )
            via_conjuge = r["tipo_relacao"] == "nome_match"
            r["alta_exposicao"] = alta_exposicao
            r["via_conjuge"] = via_conjuge

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
                "empresa": {
                    "razao_social": empresa.razao_social if empresa else "Não cadastrada",
                    "municipio": empresa.municipio if empresa else None,
                    "capital_social": empresa.capital_social if empresa else None
                }
            })
        return resultado
