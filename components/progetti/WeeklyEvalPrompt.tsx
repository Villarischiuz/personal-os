"use client";
import { useProjectsStore } from "@/lib/stores/projectsStore";
import { cn } from "@/lib/utils";

export function WeeklyEvalPrompt({ projectId }: { projectId: string }) {
  const addWeeklyEval = useProjectsStore((s) => s.addWeeklyEval);
  const hasEvalThisWeek = useProjectsStore((s) => s.hasEvalThisWeek);
  const getConsecutiveNos = useProjectsStore((s) => s.getConsecutiveNos);

  const alreadyAnswered = hasEvalThisWeek(projectId);
  const consecutiveNos = getConsecutiveNos(projectId);

  if (alreadyAnswered && consecutiveNos < 2) return null;

  if (consecutiveNos >= 2) {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
        <p className="text-sm font-semibold text-amber-300">
          Questo progetto non ha prodotto risultati concreti per 2 settimane.
        </p>
        <p className="text-xs text-amber-300/60 mt-1">
          Valuta una pausa o un cambio di approccio.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-4">
      <p className="text-sm font-semibold text-white/80 mb-3">
        Questa settimana ha prodotto soldi, clienti o competenze forti?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => addWeeklyEval(projectId, true)}
          className="flex-1 rounded-lg border border-green-500/30 bg-green-500/10 py-2 text-sm font-bold text-green-400 hover:bg-green-500/20 transition-colors"
        >
          Sì
        </button>
        <button
          onClick={() => addWeeklyEval(projectId, false)}
          className="flex-1 rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors"
        >
          No
        </button>
      </div>
    </div>
  );
}
