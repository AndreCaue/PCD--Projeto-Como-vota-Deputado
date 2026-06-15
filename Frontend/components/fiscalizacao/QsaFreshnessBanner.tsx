import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface QsaFreshness {
  qsa_data_disponivel: boolean
  ultima_atualizacao_qsa?: string
  dias_desde_atualizacao?: number
  dados_antigos?: boolean
}

interface QsaFreshnessBannerProps {
  freshness?: QsaFreshness | null
  loading?: boolean
}

export function QsaFreshnessBanner({ freshness, loading }: QsaFreshnessBannerProps) {
  if (loading || !freshness) {
    return <Skeleton className="h-10 rounded-lg" />
  }

  if (!freshness.qsa_data_disponivel) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-gray-800 border border-gray-700 p-3">
        <AlertCircle className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">Dados QSA indisponíveis</span>
      </div>
    )
  }

  const dias = freshness.dias_desde_atualizacao ?? 0

  if (dias > 45 || freshness.dados_antigos) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-950/20 border border-red-800 p-3">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">Dados desatualizados ({dias} dias)</span>
      </div>
    )
  }

  if (dias > 30) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-amber-950/20 border border-amber-800 p-3">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-400">Dados com {dias} dias</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-emerald-950/20 border border-emerald-800 p-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      <span className="text-sm font-medium text-emerald-400">Dados atualizados ({dias} dias atrás)</span>
    </div>
  )
}
