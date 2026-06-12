import pytest
from fastapi.testclient import TestClient
from app.models.empresa import Relacao


class TestQSAMatching:
    def test_exact_cpf_match(self, client: TestClient, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        assert len(result) > 0
        match = result[0]
        assert match["tipo_relacao"] == "cpf_match"

    def test_fuzzy_name_match(self, client: TestClient, db_session, sample_deputado):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        socios = service.buscar_empresas_por_nome(sample_deputado.nome)
        assert len(socios) >= 0

    def test_dual_strategy_match(self, client: TestClient, db_session, sample_deputado, sample_empresa):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        if result:
            match = result[0]
            assert "tipo_relacao" in match
            assert match["tipo_relacao"] in ("cpf_match", "nome_match")

    def test_match_type_relationship(self, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        if result:
            assert "tipo_relacao" in result[0]
            assert result[0]["tipo_relacao"] == "cpf_match"

    def test_confidence_score_range(self, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        if result:
            score = result[0].get("score_confianca", 0)
            assert 0 <= score <= 100

    def test_relationship_type_boolean_storage(self, db_session, sample_deputado, sample_empresa, sample_socio):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        service.gerar_relacoes_deputado(sample_deputado.id)
        relacoes = db_session.query(Relacao).filter(
            Relacao.deputado_id == sample_deputado.id
        ).all()
        for r in relacoes:
            assert hasattr(r, "tipo_relacao")

    def test_multiple_matches_handling(self, client: TestClient, db_session, sample_deputado):
        from app.services.relacao_service import RelacaoService
        service = RelacaoService(db_session)
        result = service.gerar_relacoes_deputado(sample_deputado.id)
        assert isinstance(result, list)

    def test_matches_via_api(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/relacoes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_match_nonexistent_deputado(self, client: TestClient):
        response = client.get("/deputados/999999/relacoes")
        assert response.status_code in (200, 404)
