import logging
from sqlalchemy import inspect, text
from ..database import engine, Base
from ..models.empresa import Empresa, Socio, Relacao
from ..models.qsa_metadata import QsaMetadata
from ..models.config import Config

logger = logging.getLogger(__name__)


def ensure_schema():
    """Idempotent schema migration: creates new tables, adds columns, creates indices.

    Safe to run multiple times — all operations use PRAGMA/IF NOT EXISTS guards.
    """
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)

            # 1. Create new tables idempotently
            Base.metadata.create_all(
                bind=engine,
                tables=[QsaMetadata.__table__, Config.__table__],
            )
            logger.info("Tables QsaMetadata and Config ensured.")

            # 2. Add columns to relacoes
            relacoes_cols = [col["name"] for col in inspector.get_columns("relacoes")]

            if "alta_exposicao" not in relacoes_cols:
                conn.execute(
                    text(
                        "ALTER TABLE relacoes ADD COLUMN alta_exposicao BOOLEAN DEFAULT 0"
                    )
                )
                logger.info("Column alta_exposicao added to relacoes.")
            else:
                logger.info("Column alta_exposicao already exists in relacoes.")

            if "via_conjuge" not in relacoes_cols:
                conn.execute(
                    text(
                        "ALTER TABLE relacoes ADD COLUMN via_conjuge BOOLEAN DEFAULT 0"
                    )
                )
                logger.info("Column via_conjuge added to relacoes.")
            else:
                logger.info("Column via_conjuge already exists in relacoes.")

            # 3. Add column to empresas
            empresas_cols = [col["name"] for col in inspector.get_columns("empresas")]

            if "capital_social" not in empresas_cols:
                conn.execute(
                    text("ALTER TABLE empresas ADD COLUMN capital_social FLOAT")
                )
                logger.info("Column capital_social added to empresas.")
            else:
                logger.info("Column capital_social already exists in empresas.")

            # 4. Create indices
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_relacoes_deputado_cnpj "
                    "ON relacoes(deputado_id, cnpj)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_relacoes_alta_exposicao "
                    "ON relacoes(alta_exposicao)"
                )
            )
            logger.info("Indices ensured on relacoes table.")

            conn.commit()
            logger.info("Schema migration completed successfully.")

    except Exception as e:
        logger.error("Schema migration failed: %s", e)
        raise
