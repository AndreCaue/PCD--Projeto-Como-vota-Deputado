import { UserCheck, UserSearch } from "lucide-react"

interface MatchTypeBadgeProps {
  relationshipType: boolean | null
}

export function MatchTypeBadge({ relationshipType }: MatchTypeBadgeProps) {
  if (relationshipType === null) return null

  if (relationshipType === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/40 border border-emerald-800 px-2.5 py-1 text-xs font-medium">
        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-emerald-400">CPF</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/40 border border-amber-800 px-2.5 py-1 text-xs font-medium">
      <UserSearch className="w-3.5 h-3.5 text-amber-400" />
      <span className="text-amber-400">Nome</span>
    </span>
  )
}
