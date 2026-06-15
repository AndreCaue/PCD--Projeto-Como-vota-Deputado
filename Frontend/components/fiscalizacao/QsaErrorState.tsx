import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QsaErrorStateProps {
  onRetry?: () => void
  variant?: "page" | "expand"
}

export function QsaErrorState({ onRetry, variant = "page" }: QsaErrorStateProps) {
  if (variant === "expand") {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400/80 mx-auto mb-3" />
        <h3 className="text-gray-400 text-base font-semibold">Erro ao carregar relações</h3>
        <p className="text-gray-500 text-sm mt-1 mb-4">
          Não foi possível carregar as relações deste deputado.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-brasil-amarelo hover:underline cursor-pointer"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="py-16 text-center">
      <AlertCircle className="w-12 h-12 text-red-400/80 mx-auto mb-4" />
      <h3 className="text-gray-400 text-lg font-semibold">Erro ao carregar</h3>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
