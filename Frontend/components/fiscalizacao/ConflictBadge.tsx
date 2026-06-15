import { cn } from "@/lib/utils"

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
      <span className={cn("group relative")}>
        {badge}
      </span>
    )
  }

  return badge
}
