interface ScoreBreakdownBarProps {
  scoreConflito: number;
  altaExposicao: boolean;
  relationshipType: boolean | null;
}

export function ScoreBreakdownBar({
  scoreConflito,
  altaExposicao,
  relationshipType,
}: ScoreBreakdownBarProps) {
  const capitalScore = altaExposicao ? 50 : 0;
  const cpfScore = relationshipType === false ? 20 : 0;
  const cnaeScore = scoreConflito - capitalScore - cpfScore;

  if (scoreConflito === 0) {
    return (
      <p className="text-xs text-gray-500 italic">Sem fatores de conflito</p>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-800">
        <div
          className={`h-full transition-all ${
            capitalScore > 0 ? "bg-emerald-500" : "bg-gray-700/50"
          }`}
          style={{ width: "50%" }}
        />
        <div
          className={`h-full transition-all ${
            cnaeScore > 0 ? "bg-amber-500" : "bg-gray-700/50"
          }`}
          style={{ width: "30%" }}
        />
        <div
          className={`h-full transition-all ${
            cpfScore > 0 ? "bg-blue-500" : "bg-gray-700/50"
          }`}
          style={{ width: "20%" }}
        />
      </div>
      <div className="flex text-[10px] text-gray-400 gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-emerald-500" /> Capital (50pts)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-amber-500" /> CNAE (30pts)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500" /> CPF (20pts)
        </span>
      </div>
    </div>
  );
}
