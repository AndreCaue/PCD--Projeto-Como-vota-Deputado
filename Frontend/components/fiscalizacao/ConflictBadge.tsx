import { cn } from "@/lib/utils"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConflictBadgeProps {
  hasConflict: boolean
  score?: number
}

export function ConflictBadge({ hasConflict, score }: ConflictBadgeProps) {
  if (!hasConflict) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-800 px-2.5 py-1 text-xs font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-emerald-400">Sem conflito</span>
      </span>
    )
  }

  const badge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950/40 border border-red-800 px-2.5 py-1 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-red-400">Conflito</span>
    </span>
  )

  if (score !== undefined) {
    return (
      <span className={cn("inline-flex items-center")}>
        {badge}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="ml-1 inline-flex"
                aria-label="Sobre os scores"
              >
                <Info className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              Os scores são indicadores algorítmicos baseados em dados públicos
              da Receita Federal e não constituem determinação legal de conflito
              de interesses.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    )
  }

  return badge
}
