import logging
from sqlalchemy import inspect, text
from ..database import engine, Base
from ..models.empresa import Empresa, Socio, Relacao, EmpresaCnaeSecundario
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

            # 5. Create EmpresaCnaeSecundario table idempotently
            Base.metadata.create_all(
                bind=engine,
                tables=[EmpresaCnaeSecundario.__table__],
            )
            logger.info("Table empresa_cnae_secundario ensured.")

            # 6. Add CNAE columns to empresas
            empresas_cols = [col["name"] for col in inspector.get_columns("empresas")]

            if "cnae_principal" not in empresas_cols:
                conn.execute(
                    text("ALTER TABLE empresas ADD COLUMN cnae_principal VARCHAR")
                )
                logger.info("Column cnae_principal added to empresas.")
            else:
                logger.info("Column cnae_principal already exists in empresas.")

            if "cnae_descricao" not in empresas_cols:
                conn.execute(
                    text("ALTER TABLE empresas ADD COLUMN cnae_descricao VARCHAR")
                )
                logger.info("Column cnae_descricao added to empresas.")
            else:
                logger.info("Column cnae_descricao already exists in empresas.")

            # 7. Add conflict detection columns to relacoes
            relacoes_cols = [col["name"] for col in inspector.get_columns("relacoes")]

            if "conflito_interesse" not in relacoes_cols:
                conn.execute(
                    text("ALTER TABLE relacoes ADD COLUMN conflito_interesse BOOLEAN DEFAULT 0")
                )
                logger.info("Column conflito_interesse added to relacoes.")
            else:
                logger.info("Column conflito_interesse already exists in relacoes.")

            if "score_conflito" not in relacoes_cols:
                conn.execute(
                    text("ALTER TABLE relacoes ADD COLUMN score_conflito INTEGER DEFAULT 0")
                )
                logger.info("Column score_conflito added to relacoes.")
            else:
                logger.info("Column score_conflito already exists in relacoes.")

            # 8. Create indices for new query patterns
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_relacoes_conflito_interesse "
                    "ON relacoes(conflito_interesse)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_empresa_cnae_secundario_cnae "
                    "ON empresa_cnae_secundario(cnae_secundario)"
                )
            )
            logger.info("Indices ensured for conflict detection.")

            # 9. Seed default conflict CNAE classes
            existing_config = conn.execute(
                text("SELECT key FROM config WHERE key = 'conflito_cnae_classes'")
            ).fetchone()
            if not existing_config:
                conn.execute(
                    text(
                        "INSERT INTO config (key, value) VALUES "
                        "('conflito_cnae_classes', '41204,70204,73190,86101')"
                    )
                )
                logger.info("Default conflito_cnae_classes seeded in config table.")
            else:
                logger.info("conflito_cnae_classes already exists in config table — skipping seed.")

            conn.commit()
            logger.info("Schema migration completed successfully.")

    except Exception as e:
        logger.error("Schema migration failed: %s", e)
        raise
