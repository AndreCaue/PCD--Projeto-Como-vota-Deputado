from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Query, HTTPException
from ..database import get_db
from ..models.deputado import Deputado
from ..models.partido import Partido
from ..models.empresa import Relacao
from ..models.votacao import Voto, Votacao
from ..services.relacao_service import RelacaoService

router = APIRouter(prefix="/deputados", tags=["Deputados"])


@router.get("")
def list_deputados(
    partido: str = None,
    estado: str = None,
    page: int = 1,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Deputado)
    if estado:
        query = query.filter(Deputado.estado == estado.upper())
    if partido:
        query = query.join(Partido).filter(Partido.sigla == partido.upper())

    total = query.count()
    deputados = query.order_by(Deputado.nome).offset(
        (page - 1) * limit).limit(limit).all()

    return {
        "data": deputados,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit
        }
    }


@router.get("/{id}")
def get_deputado(id: str, db: Session = Depends(get_db)):
    deputado = db.query(Deputado).filter(Deputado.id == id).first()
    if not deputado:
        raise HTTPException(status_code=404, detail="Deputado não encontrado")
    return deputado


@router.get("/{id}/relacoes")
def get_relacoes(id: str, db: Session = Depends(get_db)):
    service = RelacaoService(db)
    rels = service.get_relacoes_com_detalhes(id)
    if not rels:
        service.gerar_relacoes_deputado(id)
        rels = service.get_relacoes_com_detalhes(id)
    return rels


@router.get("/{id}/empresas")
def get_empresas_deputado(
    id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    deputado = db.query(Deputado).filter(Deputado.id == id).first()
    if not deputado:
        raise HTTPException(status_code=404, detail="Deputado não encontrado")
    service = RelacaoService(db)
    rels = service.get_relacoes_com_detalhes(id)
    if not rels:
        service.gerar_relacoes_deputado(id)
        rels = service.get_relacoes_com_detalhes(id)
    return rels


@router.get("/{id}/votos")
def get_votos_deputado(
    id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1),
    db: Session = Depends(get_db)
):
    query = db.query(Voto).join(Votacao).filter(Voto.deputado_id == id)
    total = query.count()

    votos = query.order_by(Votacao.data.desc())\
        .offset((page - 1) * limit)\
        .limit(limit)\
        .all()

    data = []
    for v in votos:
        data.append({
            "id": str(v.id),
            "voto": v.voto,
            "votacaoId": v.votacao_id,
            "votacao": {
                "id": v.votacao.id,
                "descricao": v.votacao.descricao,
                "data": v.votacao.data.isoformat() if v.votacao.data else None
            }
        })

    return {
        "data": data,
        "meta": {
            "page": page,
            "limit": limit,
            "total": total,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0
        }
    }


@router.get("/{id}/estatisticas")
def get_estatisticas_deputado(id: str, db: Session = Depends(get_db)):
    votos_query = db.query(Voto.voto).filter(Voto.deputado_id == id).all()

    total = len(votos_query)
    if total == 0:
        return {
            "total": 0,
            "porTipo": {},
            "percentuais": {}
        }

    por_tipo = {}
    for (tipo,) in votos_query:
        por_tipo[tipo] = por_tipo.get(tipo, 0) + 1

    percentuais = {}
    for tipo, qtd in por_tipo.items():
        percentuais[tipo] = round((qtd / total) * 100, 2)

    return {
        "total": total,
        "porTipo": por_tipo,
        "percentuais": percentuais
    }


@router.get("/empresas")
def list_deputados_empresas(
    partido: str = None,
    estado: str = None,
    tem_conflito: bool = None,
    alta_exposicao: bool = None,
    page: int = Query(1, ge=1, le=200),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func

    query = (
        db.query(
            Deputado.id,
            Deputado.nome,
            Partido.sigla.label("partido"),
            Deputado.estado,
            func.count(Relacao.cnpj).label("total_empresas"),
        )
        .outerjoin(Relacao, Deputado.id == Relacao.deputado_id)
        .outerjoin(Partido, Deputado.partido_id == Partido.id)
    )

    if partido:
        query = query.filter(Partido.sigla == partido.upper())
    if estado:
        query = query.filter(Deputado.estado == estado.upper())
    if tem_conflito is not None:
        # tem_conflito = has any relationship (total_empresas > 0)
        if tem_conflito:
            query = query.filter(Relacao.cnpj.isnot(None))
        else:
            query = query.having(func.count(Relacao.cnpj) == 0)
    if alta_exposicao is not None:
        query = query.filter(Relacao.alta_exposicao == alta_exposicao)

    query = query.group_by(Deputado.id).order_by(func.count(Relacao.cnpj).desc())

    total = db.query(func.count()).select_from(
        query.order_by(None).subquery()).scalar()
    rows = query.offset((page - 1) * limit).limit(limit).all()

    # Inline freshness from qsa_metadata
    from ..models.qsa_metadata import QsaMetadata
    from datetime import datetime
    meta = db.query(QsaMetadata).order_by(
        QsaMetadata.last_import_at.desc()).first()
    freshness = {}
    if meta:
        days_stale = (datetime.utcnow() - meta.last_import_at).days
        freshness = {
            "qsa_data_disponivel": True,
            "ultima_atualizacao_qsa": meta.last_import_at.isoformat(),
            "dias_desde_atualizacao": days_stale,
            "dados_antigos": days_stale > 45,
        }
    else:
        freshness = {"qsa_data_disponivel": False}

    return {
        "data": [
            {
                "id": r.id,
                "nome": r.nome,
                "partido": r.partido,
                "estado": r.estado,
                "total_empresas": r.total_empresas,
            }
            for r in rows
        ],
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": (total + limit - 1) // limit if total > 0 else 0,
        },
        "freshness": freshness,
    }
