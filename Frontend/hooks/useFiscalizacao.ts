"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

export interface Alerta {
  id: number;
  tipo: string;
  score_risco: number;
  titulo: string;
  descricao: string;
  valor_ref: number | null;
  resolvido: boolean;
}

export interface CruzamentoResult {
  deputado_id: string;
  score_global: number;
  nivel_risco: "BAIXO" | "MÉDIO" | "ALTO" | "CRÍTICO";
  alertas: Alerta[];
  metricas: {
    total_alertas: number;
    anos_analisados: number[];
  };
}

export interface EvolucaoPatrimonio {
  deputado_id: string;
  total_2022: number;
  total_2026: number;
  variacao_absoluta: number;
  variacao_percentual: number | null;
  bens_2022: number;
  bens_2026: number;
  por_tipo: {
    tipo: string;
    valor_2022: number;
    valor_2026: number;
    variacao: number;
  }[];
}

export interface GastoCategoria {
  tipo_despesa: string;
  total: number;
  quantidade: number;
  media_por_item: number;
}

export interface GastoFornecedor {
  nome_fornecedor: string;
  cnpj_cpf: string;
  total: number;
  quantidade: number;
}

export interface ResumoCEAP {
  deputado_id: string;
  ano: number;
  total_gasto: number;
  total_remuneracao_anual: number;
  razao_ceap_salario: number;
  por_categoria: GastoCategoria[];
  top_fornecedores: GastoFornecedor[];
}

export interface EvolucaoMensal {
  mes: number;
  total: number;
}

export function useAlertas(deputadoId: string) {
  const [data, setData] = useState<Alerta[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Alerta[]>(`/api/v1/irregularidades/${deputadoId}/alertas`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deputadoId]);

  return { data, loading, error };
}

export function useEvolucaoPatrimonio(deputadoId: string) {
  const [data, setData] = useState<EvolucaoPatrimonio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<EvolucaoPatrimonio>(`/api/v1/patrimonio/${deputadoId}/evolucao`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deputadoId]);

  return { data, loading, error };
}

export function useResumoCEAP(deputadoId: string, ano: number) {
  const [data, setData] = useState<ResumoCEAP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<ResumoCEAP>(`/api/v1/ceap/${deputadoId}/resumo`, { params: { ano } })
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [deputadoId, ano]);

  return { data, loading, error };
}

export function useEvolucaoMensal(deputadoId: string, ano: number) {
  const [data, setData] = useState<EvolucaoMensal[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<EvolucaoMensal[]>(`/api/v1/ceap/${deputadoId}/mensal`, { params: { ano } })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [deputadoId, ano]);

  return { data, loading };
}

export function useCruzamento(
  deputadoId: string,
  anos: number[] = [2023, 2024],
) {
  const [data, setData] = useState<CruzamentoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analisar = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = anos.map((a) => `anos_ceap=${a}`).join("&");
      const res = await api.post<CruzamentoResult>(
        `/api/v1/irregularidades/${deputadoId}/analisar?${params}`,
      );
      setData(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, analisar };
}
