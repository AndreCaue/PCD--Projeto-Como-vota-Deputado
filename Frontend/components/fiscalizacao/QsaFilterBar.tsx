"use client";

import { useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QsaFilterBarProps {
  filter: string;
  sort: string;
  onFilterChange: (f: string) => void;
  onSortChange: (s: string) => void;
}

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "conflict", label: "Conflito" },
  { value: "exposure", label: "Alta Exposição" },
  { value: "spouse", label: "Cônjuge" },
];

const SORT_OPTIONS = [
  { value: "score", label: "Score (maior)" },
  { value: "capital", label: "Capital (maior)" },
  { value: "nome", label: "Nome (A-Z)" },
];

export function QsaFilterBar({ filter, sort, onFilterChange, onSortChange }: QsaFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Score (maior)";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(f.value)}
            className={cn(
              filter === f.value && "text-brasil-amarelo border-brasil-amarelo/50 bg-brasil-amarelo/10"
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOpen((prev) => !prev)}
          className="flex items-center gap-1"
        >
          {currentSortLabel}
          <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {sortOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="p-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-2 text-sm rounded-md transition-colors",
                      sort === opt.value
                        ? "text-brasil-amarelo bg-brasil-amarelo/10"
                        : "text-gray-300 hover:bg-gray-800"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        sort === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
