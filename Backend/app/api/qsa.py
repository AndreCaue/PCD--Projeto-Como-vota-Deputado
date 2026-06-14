from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..database import get_db
from ..models.qsa_metadata import QsaMetadata

router = APIRouter(prefix="/qsa", tags=["QSA"])


@router.get("/freshness")
def get_qsa_freshness(db: Session = Depends(get_db)):
    meta = db.query(QsaMetadata).order_by(
        QsaMetadata.last_import_at.desc()).first()
    if not meta:
        return {"qsa_data_disponivel": False}
    days_stale = (datetime.now(timezone.utc) - meta.last_import_at.replace(tzinfo=timezone.utc)).days
    return {
        "qsa_data_disponivel": True,
        "ultima_atualizacao_qsa": meta.last_import_at.isoformat(),
        "dias_desde_atualizacao": days_stale,
        "dados_antigos": days_stale > 45,
    }
