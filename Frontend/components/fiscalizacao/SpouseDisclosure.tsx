import { Heart } from "lucide-react"

interface SpouseDisclosureProps {
  viaConjuge: boolean
}

export function SpouseDisclosure({ viaConjuge }: SpouseDisclosureProps) {
  if (!viaConjuge) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-950/40 border border-violet-800 px-2.5 py-1 text-xs font-medium">
      <Heart className="w-3.5 h-3.5 text-violet-400" />
      <span className="text-violet-400">via cônjuge</span>
    </span>
  )
}
