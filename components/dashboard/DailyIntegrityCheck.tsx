"use client";

import { useState } from "react";
import { useBiometricStore } from "@/lib/stores/biometricStore";
import { today } from "@/lib/utils";
import type { IntegrityLog } from "@/lib/types";

const KPIs: {
  key: keyof IntegrityLog;
  label: string;
  area: string;
  costMessage: string;
}[] = [
  {
    key: "sunlight",
    label: "Luce Solare",
    area: "Area 1",
    costMessage: "–2% capacità focus oggi. La luce mattutina regola il cortisolo e sincronizza il ritmo circadiano.",
  },
  {
    key: "deepWork",
    label: "90' Deep Work",
    area: "Area 2",
    costMessage: "–0.8% probabilità ammissione Polito. Ogni sessione persa è un passo indietro nel ranking.",
  },
  {
    key: "emailOutreach",
    label: "50 Email Outreach",
    area: "Area 3",
    costMessage: "–1.2 contatti potenziali questa settimana. La pipeline commerciale non si scalda da sola.",
  },
  {
    key: "noSideProjects",
    label: "Zero Progetti Secondari",
    area: "Area 5",
    costMessage: "–3% bandwidth cognitivo per Data Science. Il context-switch distrugge la memoria di lavoro.",
  },
];

export function DailyIntegrityCheck() {
  const { dailyIntegrity, setIntegrity } = useBiometricStore();
  const [openCost, setOpenCost] = useState<keyof IntegrityLog | null>(null);
  const todayKey = today();
  const log = dailyIntegrity[todayKey] ?? { sunlight: null, deepWork: null, emailOutreach: null, noSideProjects: null };

  const allDone = KPIs.every((k) => log[k.key] === true);
  const anyNo = KPIs.some((k) => log[k.key] === false);

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Daily Integrity Check</p>
          {allDone && (
            <p className="mt-0.5 text-xs font-semibold text-green-400">Integrità 100% — giornata blindata</p>
          )}
          {anyNo && !allDone && (
            <p className="mt-0.5 text-xs font-medium text-red-400/80">Uno o più KPI mancati oggi</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {KPIs.map(({ key, label, area, costMessage }) => {
          const value = log[key];
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/6 bg-black/10 px-3 py-2.5">
                <div>
                  <span className="text-sm font-medium text-white/85">{label}</span>
                  <span className="ml-2 text-[10px] text-white/30">{area}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      setIntegrity(todayKey, key, true);
                      if (openCost === key) setOpenCost(null);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      value === true
                        ? "bg-green-500/25 text-green-400 border border-green-500/40"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-green-500/15 hover:text-green-400"
                    }`}
                  >
                    Sì
                  </button>
                  <button
                    onClick={() => {
                      setIntegrity(todayKey, key, false);
                      setOpenCost(key);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      value === false
                        ? "bg-red-500/25 text-red-400 border border-red-500/40"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-red-500/15 hover:text-red-400"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {openCost === key && value === false && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2.5 text-xs text-red-300/90">
                  <span className="font-semibold">Costo Opportunità:</span> {costMessage}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
