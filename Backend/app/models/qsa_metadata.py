from sqlalchemy import Column, Integer, String, DateTime, func
from .base import Base


class QsaMetadata(Base):
    __tablename__ = "qsa_metadata"

    id = Column(Integer, primary_key=True, autoincrement=True)
    last_import_at = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)
    row_count = Column(Integer, default=0)
    error_message = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
