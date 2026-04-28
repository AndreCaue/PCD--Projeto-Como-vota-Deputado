"use client";

import { cn } from "@/lib/utils";
import { Home, Car, Building2, Wallet, Package } from "lucide-react";

interface Bem {
  id: number;
  ano_eleicao: number;
  tipo: string;
  descricao: string;
  valor: number;
  score_match: number | null;
}

interface ListaBensProps {
  bens: Bem[];
  className?: string;
}

const ICONE_TIPO: Record<
  string,
  { icon: React.ElementType; cor: string; label: string }
> = {
  imóvel: {
    icon: Home,
    cor: "text-blue-400",
    label: "Imóvel",
  },
  terreno: {
    icon: Home,
    cor: "text-blue-400",
    label: "Terreno",
  },
  casa: {
    icon: Home,
    cor: "text-blue-400",
    label: "Casa",
  },
  apartamento: {
    icon: Building2,
    cor: "text-indigo-400",
    label: "Apartamento",
  },
  veículo: {
    icon: Car,
    cor: "text-orange-400",
    label: "Veículo",
  },
  carro: {
    icon: Car,
    cor: "text-orange-400",
    label: "Carro",
  },
  moto: {
    icon: Car,
    cor: "text-orange-400",
    label: "Moto",
  },
  aplicação: {
    icon: Wallet,
    cor: "text-green-400",
    label: "Aplicação",
  },
  depósito: {
    icon: Wallet,
    cor: "text-green-400",
    label: "Depósito",
  },
  dinheiro: {
    icon: Wallet,
    cor: "text-green-400",
    label: "Dinheiro",
  },
  outros: {
    icon: Package,
    cor: "text-gray-400",
    label: "Outros",
  },
};

function getCategoria(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes("imóvel") || t.includes("terreno") || t.includes("casa"))
    return "imóvel";
  if (t.includes("apartamento")) return "apartamento";
  if (t.includes("veículo") || t.includes("carro") || t.includes("moto"))
    return "veículo";
  if (t.includes("aplicação") || t.includes("depósito") || t.includes("dinheiro"))
    return "aplicação";
  return "outros";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function ListaBensItem({
  bem,
}: {
  bem: Bem;
}) {
  const cat = getCategoria(bem.tipo);
  const config = ICONE_TIPO[cat] ?? ICONE_TIPO["outros"];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          config.cor,
        )}
      >
        <Icon className={cn("w-5 h-5")} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">
          {bem.descricao || bem.tipo}
        </p>
        <p className="text-xs text-gray-500">{config.label}</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-gray-200">
          {formatCurrency(bem.valor)}
        </p>
        <p className="text-xs text-gray-500">{bem.ano_eleicao}</p>
      </div>
    </div>
  );
}

export function ListaBens({ bens, className }: ListaBensProps) {
  if (!bens || bens.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        <p>Nenhum bem declarado encontrado.</p>
      </div>
    );
  }

  const porAno = bens.reduce(
    (acc, bem) => {
      if (!acc[bem.ano_eleicao]) acc[bem.ano_eleicao] = [];
      acc[bem.ano_eleicao].push(bem);
      return acc;
    },
    {} as Record<number, Bem[]>,
  );

  const anos = Object.keys(porAno)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className={cn("space-y-6", className)}>
      {anos.map((ano) => (
        <div key={ano}>
          <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Eleição {ano}
          </h4>
          <div className="space-y-1">
            {porAno[ano].map((bem) => (
              <ListaBensItem key={bem.id} bem={bem} />
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between text-sm">
            <span className="text-gray-500">Total {ano}</span>
            <span className="font-semibold text-gray-200">
              {formatCurrency(
                porAno[ano].reduce((sum, b) => sum + b.valor, 0),
              )}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListaBensSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-800 rounded w-3/4" />
            <div className="h-3 bg-gray-800 rounded w-1/4" />
          </div>
          <div className="h-4 bg-gray-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
}