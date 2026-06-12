from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import stats, deputados, integracao, votacoes, partidos, patrimonio, ceap, lookups
from .database import engine, Base
from contextlib import asynccontextmanager
from .scheduler.sync_scheduler import popular_banco_inicial
from .scheduler.sync_scheduler import check_qsa_freshness
from .api import qsa
from .ingest.migrate_schema import ensure_schema
import asyncio


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_schema()  # Phase 2: schema migration + index creation
    asyncio.create_task(popular_banco_inicial())
    asyncio.create_task(check_qsa_freshness())  # Phase 2: auto-freshness check
    yield


app = FastAPI(
    title="PCD - Projeto Como Vota Deputado (Python Backend)",
    description="API para monitoramento de atividade parlamentar e cruzamento de dados de empresas/sócios.",
    version="1.0.0",
    lifespan=lifespan
)

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusão de rotas
app.include_router(stats.router)
app.include_router(deputados.router)
app.include_router(integracao.router)
app.include_router(integracao.qsa_router)
app.include_router(qsa.router)
app.include_router(votacoes.router)
app.include_router(partidos.router)
app.include_router(patrimonio.router, prefix='/api/v1')
app.include_router(ceap.router, prefix='/api/v1')
app.include_router(lookups.router, prefix='/api/v1')


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Backend Python (FastAPI) Rodando"}
