"use client";

import { useBiometricStore } from "@/lib/stores/biometricStore";
import { localDateString } from "@/lib/utils";
import type { IntegrityLog } from "@/lib/types";

const KPI_LABELS: Record<keyof IntegrityLog, string> = {
  sunlight: "Luce",
  deepWork: "Deep Work",
  emailOutreach: "Outreach",
  noSideProjects: "No Side",
};

function scoreDay(log: IntegrityLog | undefined): number | null {
  if (!log) return null;
  const vals = [log.sunlight, log.deepWork, log.emailOutreach, log.noSideProjects];
  if (vals.every((v) => v === null)) return null;
  return vals.filter((v) => v === true).length;
}

function cellColor(score: number | null): string {
  if (score === null) return "bg-white/5 border-white/8";
  if (score === 4) return "bg-green-500/70 border-green-400/40";
  if (score >= 2) return "bg-amber-500/60 border-amber-400/40";
  return "bg-red-500/60 border-red-400/40";
}

export function ConsistencyHeatmap() {
  const { dailyIntegrity } = useBiometricStore();

  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(localDateString(d));
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-4">
      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-white/30">
        Consistenza 30 giorni
      </p>

      <div className="grid grid-cols-10 gap-1.5">
        {days.map((date) => {
          const log = dailyIntegrity[date];
          const score = scoreDay(log);
          const isToday = date === localDateString();

          return (
            <div
              key={date}
              title={buildTooltip(date, log)}
              className={`aspect-square rounded-md border transition-all ${cellColor(score)} ${
                isToday ? "ring-1 ring-white/40 ring-offset-1 ring-offset-transparent" : ""
              }`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4">
        <LegendDot color="bg-green-500/70" label="4/4 KPI" />
        <LegendDot color="bg-amber-500/60" label="2–3 KPI" />
        <LegendDot color="bg-red-500/60" label="0–1 KPI" />
        <LegendDot color="bg-white/5" label="Nessun dato" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span className="text-[10px] text-white/30">{label}</span>
    </div>
  );
}

function buildTooltip(date: string, log: IntegrityLog | undefined): string {
  if (!log) return date + " · nessun dato";
  const lines = (Object.keys(KPI_LABELS) as (keyof IntegrityLog)[]).map(
    (k) => `${KPI_LABELS[k]}: ${log[k] === null ? "–" : log[k] ? "✓" : "✗"}`
  );
  return date + "\n" + lines.join(" · ");
}
