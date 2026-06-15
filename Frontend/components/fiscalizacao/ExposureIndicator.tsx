import { AlertTriangle } from "lucide-react"

interface ExposureIndicatorProps {
  altaExposicao: boolean
  capitalSocial?: number | null
}

export function ExposureIndicator({ altaExposicao, capitalSocial }: ExposureIndicatorProps) {
  const capitalStr = capitalSocial != null
    ? `R$ ${capitalSocial.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
    : ""

  if (altaExposicao) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-400">
        <AlertTriangle className="w-3.5 h-3.5" />
        {capitalStr}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
      {capitalStr}
    </span>
  )
}
