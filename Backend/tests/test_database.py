import pytest
from app.models.empresa import Empresa, Socio, Relacao
from app.database import Base


class TestDatabase:
    def test_create_empresa(self, db_session):
        empresa = Empresa(
            cnpj="99888777000155",
            razao_social="Nova Empresa Ltda",
            estado="RJ"
        )
        db_session.add(empresa)
        db_session.commit()
        saved = db_session.query(Empresa).filter_by(cnpj="99888777000155").first()
        assert saved is not None
        assert saved.razao_social == "Nova Empresa Ltda"

    def test_create_socio(self, db_session):
        socio = Socio(
            cpf_socio="98765432100",
            nome_socio="João Souza",
            cnpj="99888777000155",
            qualificacao="Sócio"
        )
        db_session.add(socio)
        db_session.commit()
        saved = db_session.query(Socio).filter_by(cpf_socio="98765432100").first()
        assert saved is not None
        assert saved.nome_socio == "João Souza"

    def test_create_relacao(self, db_session):
        relacao = Relacao(
            deputado_id="456",
            cnpj="99888777000155",
            tipo_relacao="cpf_match",
            score_confianca=100
        )
        db_session.add(relacao)
        db_session.commit()
        saved = db_session.query(Relacao).filter_by(deputado_id="456").first()
        assert saved is not None
        assert saved.tipo_relacao == "cpf_match"

    def test_store_match_type(self, db_session):
        relacao = Relacao(
            deputado_id="789",
            cnpj="99888777000155",
            tipo_relacao="nome_match",
            score_confianca=85
        )
        db_session.add(relacao)
        db_session.commit()
        saved = db_session.query(Relacao).filter_by(deputado_id="789").first()
        assert saved is not None
        assert saved.score_confianca == 85

    def test_relacao_relationship_boolean(self, db_session):
        relacao = Relacao(
            deputado_id="101",
            cnpj="99888777000155",
            tipo_relacao="cpf_match",
            score_confianca=100
        )
        db_session.add(relacao)
        db_session.commit()
        saved = db_session.query(Relacao).filter_by(deputado_id="101").first()
        assert saved.tipo_relacao in ("cpf_match", "nome_match")

    def test_relacao_confidence_score(self, db_session):
        relacao = Relacao(
            deputado_id="202",
            cnpj="99888777000155",
            tipo_relacao="nome_match",
            score_confianca=75
        )
        db_session.add(relacao)
        db_session.commit()
        saved = db_session.query(Relacao).filter_by(deputado_id="202").first()
        assert 0 <= saved.score_confianca <= 100

    def test_empresa_unique_cnpj(self, db_session):
        empresa1 = Empresa(cnpj="11111111000199", razao_social="Empresa A")
        db_session.add(empresa1)
        db_session.commit()
        empresa2 = Empresa(cnpj="11111111000199", razao_social="Empresa B")
        db_session.add(empresa2)
        with pytest.raises(Exception):
            db_session.commit()
        db_session.rollback()

    def test_query_relacoes_by_deputado(self, db_session, sample_relacao):
        relacoes = db_session.query(Relacao).filter(
            Relacao.deputado_id == sample_relacao.deputado_id
        ).all()
        assert len(relacoes) > 0
        assert relacoes[0].deputado_id == sample_relacao.deputado_id

    def test_cascade_behavior(self, db_session, sample_relacao):
        relacao = db_session.query(Relacao).filter_by(id=sample_relacao.id).first()
        assert relacao is not None
        db_session.delete(relacao)
        db_session.commit()
        deleted = db_session.query(Relacao).filter_by(id=sample_relacao.id).first()
        assert deleted is None

    def test_database_tables_exist(self, db_session):
        from sqlalchemy import inspect
        inspector = inspect(db_session.bind)
        table_names = inspector.get_table_names()
        for required in ("empresas", "socios", "relacoes"):
            assert required in table_names, f"Tabela {required} nao encontrada"
