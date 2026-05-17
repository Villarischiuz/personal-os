"use client";
import { cn } from "@/lib/utils";
import { Check } from "@/lib/icons";
import { useTodayStore } from "@/lib/stores/todayStore";
import type { CardArea } from "@/lib/types/today";

const AREA_LABEL: Record<CardArea, string> = {
  corpo: "Corpo",
  ielts: "IELTS",
  outreach: "Outreach",
  autonomia: "Autonomia",
  vita: "Ora di vita",
};

const AREA_ACCENT: Record<CardArea, { border: string }> = {
  corpo:     { border: "border-blue-500/25" },
  ielts:     { border: "border-violet-500/25" },
  outreach:  { border: "border-amber-500/25" },
  autonomia: { border: "border-green-500/25" },
  vita:      { border: "border-pink-500/25" },
};

export function AreaCard({ area, dimmed }: { area: CardArea; dimmed: boolean }) {
  const tasks = useTodayStore((s) => s.cards[area]);
  const toggleTask = useTodayStore((s) => s.toggleTask);
  const setFreeTask = useTodayStore((s) => s.setFreeTask);
  const ieltsBooked = useTodayStore((s) => s.ieltsBooked);
  const setIeltsBooked = useTodayStore((s) => s.setIeltsBooked);

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const status =
    doneCount === 0 ? "non iniziato" : doneCount === totalCount ? "fatto" : "in corso";
  const statusStyle =
    doneCount === totalCount
      ? "bg-green-500/10 text-green-300 border-green-500/30"
      : doneCount > 0
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : "bg-white/5 text-white/30 border-white/10";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-opacity bg-white/3",
        AREA_ACCENT[area].border,
        dimmed && "opacity-40 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{AREA_LABEL[area]}</h3>
        <span className={cn("text-[10px] border rounded-full px-2 py-0.5 font-semibold", statusStyle)}>
          {status}
        </span>
      </div>

      {area === "ielts" && (
        <button
          onClick={() => setIeltsBooked(!ieltsBooked)}
          className="mb-3 text-[10px] text-violet-400/50 hover:text-violet-400 transition-colors underline underline-offset-2"
        >
          {ieltsBooked ? "✓ Esame prenotato" : "Esame non ancora prenotato"} — cambia
        </button>
      )}

      <ul className="space-y-2.5">
        {tasks.map((task) =>
          task.isFree ? (
            <li key={task.id} className="flex items-center gap-2.5">
              <button
                onClick={() => toggleTask(area, task.id)}
                className={cn(
                  "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  task.done ? "bg-white/80 border-white/80" : "border-white/25 hover:border-white/50"
                )}
              >
                {task.done && <Check size={10} className="text-black" />}
              </button>
              <input
                type="text"
                placeholder="task libero del giorno..."
                value={task.text}
                onChange={(e) => setFreeTask(area, e.target.value)}
                className="flex-1 bg-transparent text-xs text-white/55 placeholder:text-white/20 outline-none"
              />
            </li>
          ) : (
            <li key={task.id} className="flex items-center gap-2.5">
              <button
                onClick={() => toggleTask(area, task.id)}
                className={cn(
                  "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
                  task.done ? "bg-white/80 border-white/80" : "border-white/25 hover:border-white/50"
                )}
              >
                {task.done && <Check size={10} className="text-black" />}
              </button>
              <span className={cn("text-xs transition-colors", task.done ? "line-through text-white/25" : "text-white/75")}>
                {task.text}
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
