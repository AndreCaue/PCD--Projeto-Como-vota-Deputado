import { Building2, AlertTriangle, DollarSign, Users } from "lucide-react";

interface QsaSummaryCardsProps {
  stats: {
    total: number;
    conflito: number;
    exposicao: number;
    conjuge: number;
  };
}

export function QsaSummaryCards({ stats }: QsaSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
        <Building2 className="w-5 h-5 text-gray-400" />
        <span className="text-lg font-semibold text-gray-100">{stats.total}</span>
        <span className="text-xs text-gray-400">Deputados com vínculos</span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
        <AlertTriangle className="w-5 h-5 text-red-400" />
        <span className="text-lg font-semibold text-gray-100">{stats.conflito}</span>
        <span className="text-xs text-red-400">Com conflito</span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-1">
        <DollarSign className="w-5 h-5 text-orange-400" />
        <span className="text-lg font-semibold text-gray-100">{stats.exposicao}</span>
        <span className="text-xs text-orange-400">Alta exposição</span>
      </div>

      <div className="bg-violet-950/20 border border-violet-800/40 rounded-xl p-3 flex flex-col gap-1">
        <Users className="w-5 h-5 text-violet-400" />
        <span className="text-lg font-semibold text-gray-100">{stats.conjuge}</span>
        <span className="text-xs text-violet-400">Via cônjuge</span>
      </div>
    </div>
  );
}
