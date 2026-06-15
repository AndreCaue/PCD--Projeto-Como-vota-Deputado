import axios from "axios";
import type {
  Deputado,
  Partido,
  Votacao,
  Voto,
  PaginatedResponse,
  ListResponse,
  ResumoVotacao,
  VotoPorPartido,
  GrafoData,
  EstatisticasDeputado,
  SyncLog,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  },
);

export const votacoesService = {
  listar: (params?: {
    page?: number;
    limit?: number;
    sigla_tipo?: string;
    dataInicio?: string;
    dataFim?: string;
  }) =>
    api
      .get<PaginatedResponse<Votacao>>("/votacoes", { params })
      .then((r) => r.data),

  recentes: (limit = 10) =>
    api
      .get<ListResponse<Votacao>>("/votacoes/recentes", { params: { limit } })
      .then((r) => r.data),

  buscar: (id: string) =>
    api.get<Votacao>(`/votacoes/${id}`).then((r) => r.data),

  votos: (
    id: string,
    params?: { page?: number; limit?: number; voto?: string },
  ) =>
    api
      .get<PaginatedResponse<Voto>>(`/votacoes/${id}/votos`, { params })
      .then((r) => r.data),

  resumo: (id: string) =>
    api.get<ResumoVotacao>(`/votacoes/${id}/`).then((r) => r.data),

  grafo: (id: string) =>
    api.get<GrafoData>(`/votacoes/${id}/grafo`).then((r) => r.data),
};

export const deputadosService = {
  listar: (params?: {
    page?: number;
    limit?: number;
    partido?: string;
    estado?: string;
  }) =>
    api
      .get<PaginatedResponse<Deputado>>("/deputados", { params })
      .then((r) => r.data),

  buscar: (id: string) =>
    api.get<Deputado>(`/deputados/${id}`).then((r) => r.data),

  votos: (id: string, params?: { page?: number; limit?: number }) =>
    api
      .get<PaginatedResponse<Voto>>(`/deputados/${id}/votos`, { params })
      .then((r) => r.data),

  estatisticas: (id: string) =>
    api
      .get<EstatisticasDeputado>(`/deputados/${id}/estatisticas`)
      .then((r) => r.data),
};

export const partidosService = {
  listar: () => api.get<Partido[]>("/partidos").then((r) => r.data),

  buscar: (id: string) =>
    api.get<Partido>(`/partidos/${id}`).then((r) => r.data),

  deputados: (id: string) =>
    api
      .get<ListResponse<Deputado>>(`/partidos/${id}/deputados`)
      .then((r) => r.data),
};

export const votosService = {
  porPartido: (votacaoId: string) =>
    api
      .get<{
        data: VotoPorPartido[];
      }>("/votos/por-partido", { params: { votacaoId } })
      .then((r) => r.data),

  divergentes: (votacaoId: string) =>
    api
      .get("/votos/divergencia", { params: { votacaoId } })
      .then((r) => r.data),
};

export const integracaoService = {
  syncCompleto: (dataInicio?: string) =>
    api
      .post("/integracao/sync/completo", null, { params: { dataInicio } })
      .then((r) => r.data),

  syncPartidos: () => api.post("/integracao/sync/partidos").then((r) => r.data),

  syncDeputados: () =>
    api.post("/integracao/sync/deputados").then((r) => r.data),

  syncVotacoes: (dataInicio?: string, dataFim?: string) =>
    api
      .post("/integracao/sync/votacoes", null, {
        params: { dataInicio, dataFim },
      })
      .then((r) => r.data),

  syncVotos: (votacaoId: string) =>
    api.post(`/integracao/sync/votos/${votacaoId}`).then((r) => r.data),

  logs: (limit = 20) =>
    api
      .get<SyncLog[]>("/integracao/logs", { params: { limit } })
      .then((r) => r.data),

  status: () => api.get("/integracao/status").then((r) => r.data),
};

export default api;

export const statsService = {
  resumo: () => api.get("/stats/resumo").then((r) => r.data),

  distribuicaoVotos: () =>
    api.get("/stats/distribuicao-votos").then((r) => r.data),

  disciplinaPartidos: (limit = 20) =>
    api
      .get("/stats/disciplina-partidos", { params: { limit } })
      .then((r) => r.data),

  deputadosDestaque: (limit = 10) =>
    api
      .get("/stats/deputados-destaque", { params: { limit } })
      .then((r) => r.data),

  votacoesDestaque: (limit = 5) =>
    api
      .get("/stats/votacoes-destaque", { params: { limit } })
      .then((r) => r.data),

  busca: (q: string, limit = 5) =>
    api
      .get("/stats/busca", { params: { nome: q, query: q, limit } })
      .then((r) => r.data),
};

export const dropdownService = {
  comissoes: () =>
    api.get("/api/v1/lookups/tipos-comissoes").then((r) => r.data),
};

export interface BemPatrimonio {
  id: number;
  ano_eleicao: number;
  tipo: string;
  descricao: string;
  valor: number;
  score_match: number | null;
}

export interface PatrimonioDeputado {
  deputados: {
    id: string;
    nome: string;
    foto?: string;
    partido: string;
    estado: string;
    patrimonio_total: number;
    total_bens: number;
    bens: BemPatrimonio[];
  };
  ano_base: number;
  ultima_atualizacao: string;
}

export const patrimonioService = {
  listar_bens: (deputadoId: string, ano?: number, tipo?: string) =>
    api
      .get<BemPatrimonio[]>(`/api/v1/patrimonio/${deputadoId}`, {
        params: { ano, tipo },
      })
      .then((r) => r.data),

  resumo: (deputadoId: string) =>
    api.get(`/api/v1/patrimonio/${deputadoId}/resumo`).then((r) => r.data),

  evolucao: (deputadoId: string) =>
    api.get(`/api/v1/patrimonio/${deputadoId}/evolucao`).then((r) => r.data),

  topVariacao: (limit = 10) =>
    api
      .get("/api/v1/patrimonio/top-variacao", { params: { limit } })
      .then((r) => r.data),
};

export interface QsaFreshness {
  qsa_data_disponivel: boolean;
  ultima_atualizacao_qsa?: string;
  dias_desde_atualizacao?: number;
  dados_antigos?: boolean;
}

export interface DeputadoEmpresa {
  id: string;
  nome: string;
  partido: string;
  estado: string;
  total_empresas: number;
  total_conflito: number;
  total_alta_exposicao?: number;
  total_conjuge?: number;
}

export interface RelacaoDetalhada {
  id: number;
  cnpj: string;
  tipo_relacao: string;
  relationship_type: boolean | null;
  score_confianca: number;
  score_conflito: number;
  conflito_interesse: boolean;
  alta_exposicao: boolean;
  via_conjuge: boolean;
  empresa: {
    razao_social: string;
    municipio: string | null;
    capital_social: number | null;
    cnae_principal: string | null;
    cnae_descricao: string | null;
  };
}

export const qsaService = {
  listar: (params?: Record<string, unknown>) =>
    api.get("/deputados/empresas", { params }).then((r) => r.data),

  freshness: () =>
    api.get<QsaFreshness>("/qsa/freshness").then((r) => r.data),

  relacoes: (deputadoId: string) =>
    api.get<RelacaoDetalhada[]>(`/deputados/${deputadoId}/relacoes`).then((r) => r.data),

  empresas: (deputadoId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/deputados/${deputadoId}/empresas`, { params }).then((r) => r.data),

  atualizar: () =>
    api.post("/atualizar-qsa").then((r) => r.data),
};
