import pytest


class TestConflictDetectionModels:

    def test_cnae_principal_model_column(self, db_session):
        from app.models.empresa import Empresa
        assert hasattr(Empresa, "cnae_principal")

    def test_cnae_descricao_model_column(self, db_session):
        from app.models.empresa import Empresa
        assert hasattr(Empresa, "cnae_descricao")

    def test_empresa_cnae_secundario_model(self, db_session, sample_empresa_with_cnae, sample_empresa_cnae_secundario):
        from app.models.empresa import EmpresaCnaeSecundario
        cnaes = db_session.query(EmpresaCnaeSecundario).filter(
            EmpresaCnaeSecundario.cnpj == sample_empresa_with_cnae.cnpj
        ).all()
        assert len(cnaes) == 2
        assert cnaes[0].cnae_secundario is not None
        assert cnaes[0].cnae_descricao is not None

    def test_conflito_interesse_model_column(self, db_session):
        from app.models.empresa import Relacao
        assert hasattr(Relacao, "conflito_interesse")

    def test_score_conflito_model_column(self, db_session):
        from app.models.empresa import Relacao
        assert hasattr(Relacao, "score_conflito")

    def test_empresa_with_cnae_fixture(self, db_session, sample_empresa_with_cnae):
        assert sample_empresa_with_cnae.cnae_principal == "4120400"
        assert sample_empresa_with_cnae.cnae_descricao == "Construção de edifícios"
