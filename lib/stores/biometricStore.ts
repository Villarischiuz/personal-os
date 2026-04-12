"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_DAILY_LOGS, MOCK_MACRO_LOGS } from "@/lib/mock-data";
import type { DailyLog, MacroLog } from "@/lib/types";
import { today as todayISO } from "@/lib/utils";

function latestDailySeed(): DailyLog {
  const latest = MOCK_DAILY_LOGS[MOCK_DAILY_LOGS.length - 1];
  return {
    ...latest,
    date: todayISO(),
  };
}

function latestMacroSeed(): MacroLog {
  const latest = MOCK_MACRO_LOGS[MOCK_MACRO_LOGS.length - 1];
  return {
    ...latest,
    date: todayISO(),
  };
}

function pct(actual: number, target: number) {
  if (target <= 0) return 0;
  return (actual / target) * 100;
}

function computeMacrosHit(macros: MacroLog) {
  const caloriesPct = pct(macros.calories_actual, macros.calories_target);
  const proteinPct = pct(macros.protein_g_actual, macros.protein_g_target);
  const carbsPct = pct(macros.carbs_g_actual, macros.carbs_g_target);
  const fatPct = pct(macros.fat_g_actual, macros.fat_g_target);

  return (
    caloriesPct >= 90 &&
    caloriesPct <= 110 &&
    proteinPct >= 95 &&
    carbsPct >= 85 &&
    fatPct >= 85
  );
}

function buildInitialState() {
  const todayMacros = latestMacroSeed();
  return {
    todayLog: {
      ...latestDailySeed(),
      macros_hit: computeMacrosHit(todayMacros),
    },
    todayMacros,
  };
}

interface BiometricStoreState {
  todayLog: DailyLog;
  todayMacros: MacroLog;
}

interface BiometricStore extends BiometricStoreState {
  updateTodayLog: (patch: Partial<DailyLog>) => void;
  updateTodayMacros: (patch: Partial<MacroLog>) => void;
  updateTodayMetrics: (payload: {
    logPatch?: Partial<DailyLog>;
    macroPatch?: Partial<MacroLog>;
  }) => void;
  resetToday: () => void;
}

export const useBiometricStore = create<BiometricStore>()(
  persist(
    (set) => ({
      ...buildInitialState(),
      updateTodayLog: (patch) =>
        set((state) => ({
          todayLog: {
            ...state.todayLog,
            ...patch,
            date: todayISO(),
          },
        })),
      updateTodayMacros: (patch) =>
        set((state) => {
          const todayMacros = {
            ...state.todayMacros,
            ...patch,
            date: todayISO(),
          };

          return {
            todayMacros,
            todayLog: {
              ...state.todayLog,
              date: todayISO(),
              macros_hit: computeMacrosHit(todayMacros),
            },
          };
        }),
      updateTodayMetrics: ({ logPatch, macroPatch }) =>
        set((state) => {
          const todayMacros = {
            ...state.todayMacros,
            ...macroPatch,
            date: todayISO(),
          };

          return {
            todayMacros,
            todayLog: {
              ...state.todayLog,
              ...logPatch,
              date: todayISO(),
              macros_hit: computeMacrosHit(todayMacros),
            },
          };
        }),
      resetToday: () => set(buildInitialState()),
    }),
    {
      name: "personal-os-biometrics",
      merge: (persistedState, currentState) => {
        const merged = {
          ...currentState,
          ...(persistedState as Partial<BiometricStoreState>),
        } as BiometricStoreState;

        if (merged.todayLog?.date !== todayISO()) {
          return buildInitialState() as BiometricStore;
        }

        return {
          ...merged,
          todayLog: {
            ...merged.todayLog,
            macros_hit: computeMacrosHit(merged.todayMacros),
          },
        } as BiometricStore;
      },
    }
  )
);
