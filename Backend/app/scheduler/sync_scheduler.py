import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..services.integracao_service import IntegracaoService

logger = logging.getLogger(__name__)

async def popular_banco_inicial():
    db: Session = SessionLocal()
    try:
        service = IntegracaoService(db)

        from ..models.votacao import Votacao
        total = db.query(Votacao).count()

        if total > 0:
            logger.info(
                f"Banco já populado ({total} votações). Pulando sync histórico.")
            return

        logger.info(
            "Banco vazio. Iniciando população histórica (2021 → hoje)...")
        await service.sync_full_historico(
            data_inicio="2021-01-01",
            data_fim=datetime.now().strftime("%Y-%m-%d"),
            janela_meses=1
        )
        logger.info("População histórica concluída.")

    except Exception as e:
        logger.error(f"Erro na população inicial: {e}")
    finally:
        db.close()


async def check_qsa_freshness():
    """Background check: if QSA data >7 days stale, auto-trigger incremental import."""
    db = SessionLocal()
    try:
        from ..models.qsa_metadata import QsaMetadata
        from ..ingest.import_qsa import importar_qsa_incremental
        metadata = db.query(QsaMetadata).order_by(
            QsaMetadata.last_import_at.desc()).first()
        if metadata:
            days_stale = (datetime.now(timezone.utc) - metadata.last_import_at.replace(tzinfo=timezone.utc)).days
            if days_stale > 7:
                logger.info(
                    "QSA data %d dias desatualizada — acionando atualização incremental",
                    days_stale
                )
                importar_qsa_incremental()
        else:
            logger.info("Nenhum metadado QSA encontrado — acionando importação inicial")
            importar_qsa_incremental()
    except Exception as e:
        logger.error(f"Erro na verificação de frescor QSA: {e}")
    finally:
        db.close()
