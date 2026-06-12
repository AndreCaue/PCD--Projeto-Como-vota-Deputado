import datetime
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.main import app
from app.models.empresa import Empresa, Socio, Relacao
from app.models.deputado import Deputado
from app.models.partido import Partido
from app.models.qsa_metadata import QsaMetadata
from app.models.config import Config


TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_deputado(db_session):
    dep = Deputado(
        id="123",
        nome="Maria Silva",
        cpf="12345678901",
        estado="SP",
        partido_id="PT"
    )
    db_session.add(dep)
    db_session.commit()
    return dep


@pytest.fixture
def sample_partido(db_session):
    partido = Partido(
        id="PT",
        sigla="PT",
        nome="Partido dos Trabalhadores"
    )
    db_session.add(partido)
    db_session.commit()
    return partido


@pytest.fixture
def sample_empresa(db_session):
    empresa = Empresa(
        cnpj="11222333000181",
        razao_social="Empresa Exemplo Ltda",
        nome_fantasia="Exemplo",
        municipio="São Paulo",
        estado="SP",
        situacao="ATIVA"
    )
    db_session.add(empresa)
    db_session.commit()
    return empresa


@pytest.fixture
def sample_socio(db_session):
    socio = Socio(
        cpf_socio="12345678901",
        nome_socio="Maria Silva",
        cnpj="11222333000181",
        qualificacao="Sócio-Administrador"
    )
    db_session.add(socio)
    db_session.commit()
    return socio


@pytest.fixture
def sample_relacao(db_session, sample_deputado, sample_empresa):
    relacao = Relacao(
        deputado_id=sample_deputado.id,
        cnpj=sample_empresa.cnpj,
        tipo_relacao="cpf_match",
        score_confianca=100,
        origem="test"
    )
    db_session.add(relacao)
    db_session.commit()
    return relacao


@pytest.fixture
def sample_empresa_with_capital(db_session):
    empresa = Empresa(
        cnpj="99887766000199",
        razao_social="Empresa Alto Capital Ltda",
        nome_fantasia="Alto Capital",
        municipio="São Paulo",
        estado="SP",
        situacao="ATIVA",
        capital_social=2000000.00,
    )
    db_session.add(empresa)
    db_session.commit()
    return empresa


@pytest.fixture
def sample_qsa_metadata(db_session):
    meta = QsaMetadata(
        last_import_at=datetime.datetime(2026, 1, 1),
        status="success",
        row_count=1000,
    )
    db_session.add(meta)
    db_session.commit()
    return meta


@pytest.fixture
def sample_config(db_session):
    config = Config(
        key="alta_exposicao_threshold",
        value="1000000.0",
    )
    db_session.add(config)
    db_session.commit()
    return config
