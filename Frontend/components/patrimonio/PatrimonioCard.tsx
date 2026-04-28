"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, Landmark, DollarSign } from "lucide-react";

interface PatrimonioCardProps {
  nome: string;
  patrimonioTotal: number;
  totalBens: number;
  anoBase: number;
  variacaoPercentual?: number | null;
  variacaoAbsoluta?: number;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function PatrimonioCard({
  nome,
  patrimonioTotal,
  totalBens,
  anoBase,
  variacaoPercentual,
  variacaoAbsoluta,
  className,
}: PatrimonioCardProps) {
  const temDados = patrimonioTotal > 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 flex flex-col gap-4",
        temDados
          ? "bg-gray-900 border-gray-800"
          : "bg-gray-900/50 border-gray-800/50",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          Patrimônio Declarado
        </h3>
        <span className="text-xs text-gray-500">{anoBase}</span>
      </div>

      {temDados ? (
        <>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-100">
              {formatCurrency(patrimonioTotal)}
            </p>
            <p className="text-sm text-gray-500">
              {formatNumber(totalBens)} {totalBens === 1 ? "bem" : "bens"} declarado
              {totalBens !== 1 ? "s" : ""}
            </p>
          </div>

          {variacaoPercentual !== undefined && variacaoPercentual !== null && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
              {variacaoPercentual > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-400" />
              ) : variacaoPercentual < 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-400" />
              ) : (
                <Minus className="w-4 h-4 text-gray-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  variacaoPercentual > 0
                    ? "text-red-400"
                    : variacaoPercentual < 0
                      ? "text-emerald-400"
                      : "text-gray-500",
                )}
              >
                {variacaoPercentual > 0 ? "+" : ""}
                {variacaoPercentual.toFixed(1)}%
              </span>
              {variacaoAbsoluta !== undefined && variacaoAbsoluta !== 0 && (
                <span className="text-xs text-gray-500">
                  ({formatCurrency(variacaoAbsoluta)})
                </span>
              )}
              <span className="text-xs text-gray-600">
                vs. eleição anterior
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <DollarSign className="w-8 h-8 mx-auto text-gray-600 mb-2" />
          <p className="text-sm text-gray-500">Dados não disponíveis</p>
          <p className="text-xs text-gray-600 mt-1">
            Este deputado não declarou bens ou os dados não foram encontrados.
          </p>
        </div>
      )}
    </div>
  );
}

export function PatrimonioCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-800 p-6 flex flex-col gap-4 animate-pulse",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-800 rounded w-32" />
        <div className="h-3 bg-gray-800 rounded w-8" />
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-800 rounded w-48" />
        <div className="h-4 bg-gray-800 rounded w-24" />
      </div>
    </div>
  );
}