"use client";

import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-blue-950/20 border border-blue-800/40 p-3 mb-6">
      <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-300 leading-relaxed">
        Os scores são indicadores algorítmicos baseados em dados públicos
        da Receita Federal e não constituem determinação legal de conflito
        de interesses.
      </p>
    </div>
  );
}
