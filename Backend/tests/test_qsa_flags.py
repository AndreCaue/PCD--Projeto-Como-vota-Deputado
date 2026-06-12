import pytest
from fastapi.testclient import TestClient


class TestQSAFlags:
    def test_alta_exposicao_model_column(self, db_session):
        """Verifies the Relacao model has alta_exposicao attribute."""
        from app.models.empresa import Relacao

        assert hasattr(Relacao, "alta_exposicao")

    def test_via_conjuge_model_column(self, db_session):
        """Verifies the Relacao model has via_conjuge attribute."""
        from app.models.empresa import Relacao

        assert hasattr(Relacao, "via_conjuge")

    def test_capital_social_model_column(self, db_session):
        """Verifies the Empresa model has capital_social attribute."""
        from app.models.empresa import Empresa

        assert hasattr(Empresa, "capital_social")

    def test_qsa_metadata_columns(self, db_session, sample_qsa_metadata):
        """Verifies QsaMetadata has required columns."""
        from app.models.qsa_metadata import QsaMetadata

        meta = db_session.query(QsaMetadata).first()
        assert meta.last_import_at is not None
        assert meta.status == "success"
        assert meta.row_count == 1000

    def test_config_model(self, db_session, sample_config):
        """Verifies Config model works."""
        from app.models.config import Config

        config = db_session.query(Config).first()
        assert config.key == "alta_exposicao_threshold"
        assert config.value == "1000000.0"
