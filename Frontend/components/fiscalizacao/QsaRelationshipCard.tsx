"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { qsaService } from "@/services/api";
import type { DeputadoEmpresa, RelacaoDetalhada } from "@/services/api";
import { ConflictBadge } from "./ConflictBadge";
import { MatchTypeBadge } from "./MatchTypeBadge";
import { ExposureIndicator } from "./ExposureIndicator";
import { SpouseDisclosure } from "./SpouseDisclosure";
import { Skeleton } from "@/components/ui/skeleton";

interface QsaRelationshipCardProps {
  deputado: DeputadoEmpresa;
}

function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

function formatBrl(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function QsaRelationshipCard({ deputado }: QsaRelationshipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [relacoes, setRelacoes] = useState<RelacaoDetalhada[] | null>(null);
  const [loadingRelacoes, setLoadingRelacoes] = useState(false);
  const [errorRelacoes, setErrorRelacoes] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!isExpanded && relacoes === null) {
      setLoadingRelacoes(true);
      setErrorRelacoes(null);
      try {
        const data = await qsaService.relacoes(deputado.id);
        setRelacoes(data);
      } catch {
        setErrorRelacoes("Erro ao carregar relações");
      } finally {
        setLoadingRelacoes(false);
      }
    }
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-gray-600 transition-all"
      onClick={handleToggle}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="px-3 py-1 rounded-full bg-brasil-azul/20 border border-brasil-azul/30 text-brasil-azul text-xs font-medium">
          {deputado.partido}
        </span>
        <span className="text-xs text-gray-500">{deputado.estado}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-100 mb-3">{deputado.nome}</h3>

      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-400">{deputado.total_empresas} empresas</span>
        <ConflictBadge hasConflict={(deputado.total_conflito ?? 0) > 0} score={deputado.total_conflito} />
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-3 mt-3">
        <span className="text-xs text-gray-500">
          {isExpanded ? "Ocultar detalhes" : `Ver detalhes (${relacoes?.length ?? "..."} relações)`}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-800 mt-3 pt-3">
          {loadingRelacoes && (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          )}

          {errorRelacoes && (
            <div className="py-4 text-center">
              <p className="text-sm text-red-400 mb-2">{errorRelacoes}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLoadingRelacoes(true);
                  setErrorRelacoes(null);
                  qsaService.relacoes(deputado.id).then(setRelacoes).catch(() => setErrorRelacoes("Erro ao carregar relações")).finally(() => setLoadingRelacoes(false));
                }}
                className="text-xs text-brasil-amarelo hover:underline cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {relacoes && relacoes.length === 0 && (
            <p className="text-sm text-gray-500 py-4 text-center">Nenhuma relação encontrada</p>
          )}

          {relacoes && relacoes.length > 0 && (
            <div className="space-y-3">
              {relacoes.map((rel) => (
                <div key={rel.id} className="border-t border-gray-800 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
                  <p className="text-sm font-medium text-gray-100">{rel.empresa.razao_social}</p>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">{formatCnpj(rel.cnpj)}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {rel.empresa.capital_social != null && (
                      <span className="text-xs font-semibold font-mono text-gray-300">
                        {formatBrl(rel.empresa.capital_social)}
                      </span>
                    )}
                    <span className={`text-xs font-semibold font-mono ${
                      rel.score_conflito === 0 ? "text-green-400" :
                      rel.score_conflito < 50 ? "text-amber-400" :
                      "text-red-400"
                    }`}>
                      {rel.score_conflito}/100
                    </span>
                    {rel.empresa.cnae_principal && (
                      <span className="text-xs font-mono text-gray-500">{rel.empresa.cnae_principal}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
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
