"use client";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ChevronDown, ChevronUp } from "@/lib/icons";
import { useReviewStore } from "@/lib/stores/reviewStore";
import type { Review } from "@/lib/types/review";

const ANSWER_LABELS: Record<string, string> = {
  whatWorked: "Cosa ha funzionato",
  whereDispersed: "Dove mi sono disperso",
  bestBlock: "Blocco migliore",
  whatToCut: "Da eliminare subito",
  topPriority: "Priorità assoluta",
  dispersingProject: "Progetto che disperde",
  bestHabit: "Abitudine vincente",
  whatToEliminate: "Da eliminare definitivamente",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  corpo: "💪 Corpo",
  ielts: "📚 IELTS / Studio",
  outreach: "🎯 Outreach",
  autonomia: "💰 Autonomia",
  vita: "❤️ Vita",
};

function ReviewCard({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);

  const weekLabel = format(new Date(review.weekStart + "T12:00:00"), "d MMM yyyy", { locale: it });
  const hasAnswers = Object.values(review.answers).some((v) => v.trim() !== "");
  const hasObjectives = Object.values(review.objectives).some((v) => v.trim() !== "");

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/3 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-white/80">Settimana del {weekLabel}</p>
          <p className="text-[11px] text-white/30 mt-0.5">
            Salvata il {format(new Date(review.savedAt), "d MMM, HH:mm", { locale: it })}
          </p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-white/30 shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-white/30 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-5 border-t border-white/6 pt-4">
          {hasAnswers && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-white/30">Retrospettiva</p>
              {(Object.entries(review.answers) as [string, string][])
                .filter(([, v]) => v.trim() !== "")
                .map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] text-white/40 mb-0.5">{ANSWER_LABELS[key] ?? key}</p>
                    <p className="text-sm text-white/75 leading-relaxed">{value}</p>
                  </div>
                ))}
            </div>
          )}

          {hasObjectives && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-white/30">Obiettivi</p>
              {(Object.entries(review.objectives) as [string, string][])
                .filter(([, v]) => v.trim() !== "")
                .map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-[11px] text-white/40 shrink-0 w-28">{OBJECTIVE_LABELS[key] ?? key}</span>
                    <span className="text-sm text-white/75">{value}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ReviewHistory() {
  const reviews = useReviewStore((s) => s.reviews);

  const sorted = [...reviews].sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-white/30 text-center py-8">
        Nessuna review salvata ancora.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
