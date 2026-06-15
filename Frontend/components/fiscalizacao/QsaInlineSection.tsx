"use client";

import { useState } from "react";
import { Building2, ChevronDown, ChevronUp } from "lucide-react";
import { qsaService } from "@/services/api";
import type { RelacaoDetalhada } from "@/services/api";
import { ConflictBadge } from "./ConflictBadge";
import { MatchTypeBadge } from "./MatchTypeBadge";
import { ExposureIndicator } from "./ExposureIndicator";
import { SpouseDisclosure } from "./SpouseDisclosure";
import { CnaeLabel } from "./CnaeLabel";
import { Skeleton } from "@/components/ui/skeleton";

interface QsaInlineSectionProps {
  deputadoId: string;
  deputadoNome: string;
}

function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function QsaInlineSection({ deputadoId }: QsaInlineSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [relacoes, setRelacoes] = useState<RelacaoDetalhada[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isExpanded && relacoes === null) {
      setLoading(true);
      setError(null);
      try {
        const data = await qsaService.relacoes(deputadoId);
        setRelacoes(data);
      } catch {
        setError("Erro ao carregar relações");
      } finally {
        setLoading(false);
      }
    }
    setIsExpanded((prev) => !prev);
  };

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await qsaService.relacoes(deputadoId);
      setRelacoes(data);
    } catch {
      setError("Erro ao carregar relações");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl cursor-pointer hover:border-gray-600 transition-all"
        onClick={handleToggle}
      >
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Relações QSA
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="bg-gray-900 border border-gray-800 border-t-0 rounded-b-2xl p-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          )}

          {error && (
            <div className="py-4 text-center">
              <p className="text-sm text-red-400 mb-2">{error}</p>
              <button
                onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                className="text-xs text-brasil-amarelo hover:underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {relacoes && relacoes.length === 0 && (
            <p className="text-sm text-gray-500 py-8 text-center">Nenhuma relação encontrada</p>
          )}

          {relacoes && relacoes.length > 0 && (
            <div className="space-y-0">
              {relacoes.map((rel) => (
                <div key={rel.id} className="flex flex-col gap-2 py-3 border-b border-gray-800 last:border-b-0">
                  <p className="text-sm font-medium text-gray-100">{rel.empresa.razao_social}</p>
                  <p className="text-xs font-mono text-gray-400">{formatCnpj(rel.cnpj)}</p>
                  {rel.empresa.capital_social != null && (
                    <p className="text-xs font-semibold font-mono text-gray-300">
                      R$ {rel.empresa.capital_social.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                  <div className="mt-1">
                    <CnaeLabel
                      cnaePrincipal={rel.empresa.cnae_principal}
                      cnaeDescricao={rel.empresa.cnae_descricao}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <ConflictBadge hasConflict={rel.conflito_interesse} score={rel.score_conflito} />
                    <MatchTypeBadge relationshipType={rel.relationship_type} />
                    <ExposureIndicator altaExposicao={rel.alta_exposicao} capitalSocial={rel.empresa.capital_social} />
                    <SpouseDisclosure viaConjuge={rel.via_conjuge} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
