"use client";

import { useEffect, useState } from "react";
import { patrimonioService, type BemPatrimonio } from "@/services/api";

export interface ResumoPatrimonioCard {
  deputies_id: string;
  dados_disponiveis: boolean;
  ano_referencia?: number;
  total_declarado?: number;
  variacao_pct?: number | null;
  variacao_abs?: number;
  tem_evolucao?: boolean;
}

export function useBensPatrimonio(
  deputiesId: string,
  options?: { ano?: number; tipo?: string },
) {
  const [data, setData] = useState<BemPatrimonio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deputiesId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await patrimonioService.buscar(
          deputiesId,
          options?.ano,
          options?.tipo,
        );
        setData(result);
      } catch (e: any) {
        setError(e.message || "Erro ao carregar patrimônio");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deputiesId, options?.ano, options?.tipo]);

  return { data, loading, error };
}

export function useResumoPatrimonio(deputiesId: string) {
  const [data, setData] = useState<ResumoPatrimonioCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deputiesId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await patrimonioService.resumo(deputiesId);
        setData(result);
      } catch (e) {
        setError(e.message || "Erro ao carregar resumo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deputiesId]);

  return { data, loading, error };
}

export function useTopVariacao(limit = 10) {
  const [data, setData] = useState<
    {
      deputies_id: string;
      nome: string;
      patrimonio_2018: number;
      patrimonio_2022: number;
      variacao: number;
      percentual: number | null;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await patrimonioService.topVariacao(limit);
        setData(result);
      } catch (e) {
        setError(e.message || "Erro ao carregar ranking");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  return { data, loading, error };
}
