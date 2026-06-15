import { SearchX, Building2 } from "lucide-react"

interface QsaEmptyStateProps {
  variant?: "filters" | "nodata"
}

export function QsaEmptyState({ variant = "filters" }: QsaEmptyStateProps) {
  const Icon = variant === "nodata" ? Building2 : SearchX

  return (
    <div className="py-16 text-center">
      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 className="text-gray-400 text-lg font-semibold">Nenhuma relação encontrada</h3>
      <p className="text-gray-500 text-sm mt-1">
        {variant === "nodata"
          ? "Este deputado não possui vínculos QSA com empresas."
          : "Tente alterar os filtros para ver mais resultados."}
      </p>
    </div>
  )
}
