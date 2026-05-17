"use client";
import { cn } from "@/lib/utils";
import { useTodayStore } from "@/lib/stores/todayStore";
import type { Energy, Mood } from "@/lib/types/today";

const LEVELS: { value: Energy; label: string }[] = [
  { value: "low", label: "Bassa" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const COLOR: Record<Energy | Mood, string> = {
  low: "border-red-500/40 bg-red-500/10 text-red-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  high: "border-green-500/40 bg-green-500/10 text-green-300",
};

export function CheckIn() {
  const energy = useTodayStore((s) => s.energy);
  const mood = useTodayStore((s) => s.mood);
  const setEnergy = useTodayStore((s) => s.setEnergy);
  const setMood = useTodayStore((s) => s.setMood);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Energia</p>
        <div className="flex gap-2">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setEnergy(value)}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
                energy === value
                  ? COLOR[value]
                  : "border-white/10 bg-white/3 text-white/40 hover:bg-white/8"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Umore</p>
        <div className="flex gap-2">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMood(value as Mood)}
              className={cn(
                "flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors",
                mood === value
                  ? COLOR[value]
                  : "border-white/10 bg-white/3 text-white/40 hover:bg-white/8"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
