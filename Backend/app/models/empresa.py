from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, func
from .base import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cnpj = Column(String, unique=True, index=True)
    razao_social = Column(String)
    nome_fantasia = Column(String, nullable=True)
    municipio = Column(String, nullable=True)
    estado = Column(String, nullable=True)
    situacao = Column(String, nullable=True)
    capital_social = Column(Float, nullable=True)
    cnae_principal = Column(String, nullable=True)
    cnae_descricao = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

class Socio(Base):
    __tablename__ = "socios"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cpf_socio = Column(String, index=True)
    nome_socio = Column(String, index=True)
    cnpj = Column(String, index=True)
    qualificacao = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())

class Relacao(Base):
    __tablename__ = "relacoes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    deputado_id = Column(String, index=True)
    cnpj = Column(String, index=True)
    tipo_relacao = Column(String) # cpf_match, nome_match
    score_confianca = Column(Integer)
    relationship_type = Column(Boolean, index=True)
    origem = Column(String, nullable=True)
    alta_exposicao = Column(Boolean, default=False, index=True)
    via_conjuge = Column(Boolean, default=False)
    conflito_interesse = Column(Boolean, default=False, index=True)
    score_conflito = Column(Integer, default=0)
    criado_em = Column(DateTime, server_default=func.now())


class EmpresaCnaeSecundario(Base):
    __tablename__ = "empresa_cnae_secundario"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cnpj = Column(String, index=True)
    cnae_secundario = Column(String, nullable=False)
    cnae_descricao = Column(String, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
