"use client";
import { useReviewStore } from "@/lib/stores/reviewStore";
import type { ReviewAnswers, ReviewObjectives } from "@/lib/types/review";

const ANSWER_FIELDS: { key: keyof ReviewAnswers; label: string; placeholder: string }[] = [
  { key: "whatWorked", label: "Cosa ha funzionato questa settimana?", placeholder: "Es. le sessioni mattutine concentrate..." },
  { key: "whereDispersed", label: "Dove mi sono disperso?", placeholder: "Es. troppo tempo su social, riunioni inutili..." },
  { key: "bestBlock", label: "Il blocco di lavoro migliore?", placeholder: "Es. martedì mattina, 3h su X..." },
  { key: "whatToCut", label: "Cosa eliminerei subito?", placeholder: "Es. controllare email ogni ora..." },
  { key: "topPriority", label: "La priorità assoluta della prossima settimana?", placeholder: "Es. chiudere la demo del cliente..." },
  { key: "dispersingProject", label: "Il progetto che mi disperde di più?", placeholder: "Es. progetto Y che non produce risultati..." },
  { key: "bestHabit", label: "L'abitudine che ha funzionato meglio?", placeholder: "Es. palestra alle 7..." },
  { key: "whatToEliminate", label: "Una cosa da eliminare definitivamente?", placeholder: "Es. guardare Netflix dopo le 23..." },
];

const OBJECTIVE_FIELDS: { key: keyof ReviewObjectives; label: string; emoji: string }[] = [
  { key: "corpo", label: "Corpo", emoji: "💪" },
  { key: "ielts", label: "IELTS / Studio", emoji: "📚" },
  { key: "outreach", label: "Outreach / Lavoro", emoji: "🎯" },
  { key: "autonomia", label: "Autonomia economica", emoji: "💰" },
  { key: "vita", label: "Vita / Relazioni", emoji: "❤️" },
];

export function ReviewForm() {
  const draft = useReviewStore((s) => s.draft);
  const setDraftAnswer = useReviewStore((s) => s.setDraftAnswer);
  const setDraftObjective = useReviewStore((s) => s.setDraftObjective);
  const saveReview = useReviewStore((s) => s.saveReview);
  const resetDraft = useReviewStore((s) => s.resetDraft);

  const hasContent = Object.values(draft.answers).some((v) => v.trim() !== "") ||
    Object.values(draft.objectives).some((v) => v.trim() !== "");

  function handleSave() {
    saveReview();
  }

  return (
    <div className="space-y-8">
      {/* Domande retrospettiva */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Retrospettiva</h2>
        <div className="space-y-4">
          {ANSWER_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="rounded-xl border border-white/8 bg-white/3 p-4">
              <label className="block text-sm font-semibold text-white/80 mb-2">{label}</label>
              <textarea
                value={draft.answers[key]}
                onChange={(e) => setDraftAnswer(key, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none leading-relaxed"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Obiettivi settimana prossima */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4">Obiettivi settimana prossima</h2>
        <div className="space-y-3">
          {OBJECTIVE_FIELDS.map(({ key, label, emoji }) => (
            <div key={key} className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <span className="text-base mt-0.5">{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1">{label}</p>
                <input
                  type="text"
                  value={draft.objectives[key]}
                  onChange={(e) => setDraftObjective(key, e.target.value)}
                  placeholder="Obiettivo concreto..."
                  className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/20 outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Azioni */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!hasContent}
          className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Salva review
        </button>
        {hasContent && (
          <button
            onClick={resetDraft}
            className="rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
