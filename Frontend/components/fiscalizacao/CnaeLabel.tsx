const CONFLICT_CNAE_CLASSES = ["41204", "70204", "73190", "86101"];

interface CnaeLabelProps {
  cnaePrincipal: string | null;
  cnaeDescricao: string | null;
}

export function CnaeLabel({ cnaePrincipal, cnaeDescricao }: CnaeLabelProps) {
  if (!cnaePrincipal) return null;

  const cnaeClass = cnaePrincipal.slice(0, 5);
  const isConflict = CONFLICT_CNAE_CLASSES.includes(cnaeClass);

  return (
    <div className="flex items-center gap-1.5">
      {cnaeDescricao && (
        <span className={`text-xs ${isConflict ? "text-amber-300" : "text-gray-300"}`}>
          {cnaeDescricao}
        </span>
      )}
      <span className={`font-mono text-xs ${isConflict ? "text-amber-400" : "text-gray-500"}`}>
        {cnaePrincipal}
      </span>
    </div>
  );
}
