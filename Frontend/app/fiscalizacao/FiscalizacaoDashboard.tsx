"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { qsaService } from "@/services/api";
import type { DeputadoEmpresa, QsaFreshness } from "@/services/api";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
import { QsaFreshnessBanner } from "@/components/fiscalizacao/QsaFreshnessBanner";
import { QsaSummaryCards } from "@/components/fiscalizacao/QsaSummaryCards";
import { QsaFilterBar } from "@/components/fiscalizacao/QsaFilterBar";
import { QsaRelationshipCard } from "@/components/fiscalizacao/QsaRelationshipCard";
import { QsaEmptyState } from "@/components/fiscalizacao/QsaEmptyState";
import { QsaErrorState } from "@/components/fiscalizacao/QsaErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export function FiscalizacaoDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentFilter = searchParams.get("filtro") ?? "all";
  const currentSort = searchParams.get("ordem") ?? "score";
  const currentPage = parseInt(searchParams.get("pagina") ?? "1", 10);

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) params.delete(key);
        else params.set(key, value);
      });
      return params.toString();
    },
    [searchParams]
  );

  const [deputados, setDeputados] = useState<DeputadoEmpresa[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [freshness, setFreshness] = useState<QsaFreshness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiParams: Record<string, unknown> = { page: currentPage, limit: 30 };
      if (currentFilter === "conflict") apiParams.tem_conflito = true;
      else if (currentFilter === "exposure") apiParams.alta_exposicao = true;

      const sortByMap: Record<string, string> = { score: "score", capital: "capital", nome: "nome" };
      if (currentSort && sortByMap[currentSort]) {
        apiParams.sort_by = sortByMap[currentSort];
        apiParams.sort_order = currentSort === "nome" ? "asc" : "desc";
      }

      const result = await qsaService.listar(apiParams);
      setDeputados(result.data ?? []);
      setMeta(result.meta);
      setFreshness(result.freshness);
    } catch {
      setError("Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentFilter, currentSort]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleFilterChange = (filtro: string) => {
    const qs = createQueryString({ filtro, pagina: "1" });
    router.push(`${pathname}?${qs}`);
  };

  const handleSortChange = (ordem: string) => {
    const qs = createQueryString({ ordem, pagina: "1" });
    router.push(`${pathname}?${qs}`);
  };

  const handlePageChange = (page: number) => {
    const qs = createQueryString({ pagina: String(page) });
    router.push(`${pathname}?${qs}`);
  };

  const stats = {
    total: meta?.total ?? 0,
    conflito: deputados.filter((d) => (d.total_conflito ?? 0) > 0).length,
    exposicao: deputados.reduce((s, d) => s + (d.total_alta_exposicao ?? 0), 0),
    conjuge: deputados.reduce((s, d) => s + (d.total_conjuge ?? 0), 0),
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-6">Fiscalização QSA</h1>
        <QsaErrorState onRetry={carregar} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Fiscalização QSA</h1>

      {loading ? (
        <Skeleton className="h-10 rounded-lg mb-6" />
      ) : (
        <QsaFreshnessBanner freshness={freshness} />
      )}

      {!loading && (
        <>
          <div className="mb-6">
            <QsaSummaryCards stats={stats} />
          </div>

          <div className="mb-6">
            <QsaFilterBar
              filter={currentFilter}
              sort={currentSort}
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
            />
          </div>

          {deputados.length === 0 ? (
            <QsaEmptyState variant={currentFilter === "all" ? "nodata" : "filters"} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {deputados.map((dep) => (
                  <QsaRelationshipCard key={dep.id} deputado={dep} />
                ))}
              </div>

              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg disabled:opacity-40 hover:border-gray-500 transition"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-400">
                    {currentPage} / {meta.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(Math.min(meta.totalPages, currentPage + 1))}
                    disabled={currentPage === meta.totalPages}
                    className="px-4 py-2 text-sm bg-gray-900 border border-gray-700 rounded-lg disabled:opacity-40 hover:border-gray-500 transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
