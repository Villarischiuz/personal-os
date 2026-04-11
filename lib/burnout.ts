import type { DailyLog } from "./types";

export interface BurnoutStatus {
  warning: boolean;
  reason: string;
}

export function checkBurnout(logs: DailyLog[]): BurnoutStatus {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const recent = sorted.slice(0, 3);

  // 2 consecutive days sleep < 6.5h
  const sleepStreak =
    recent.length >= 2 &&
    recent[0].sleep_hours < 6.5 &&
    recent[1].sleep_hours < 6.5;

  // last workout RPE > 8
  const highRPE = recent.find((l) => l.training_rpe > 0);
  const overloaded = highRPE ? highRPE.training_rpe > 8 : false;

  if (sleepStreak && overloaded) {
    return {
      warning: true,
      reason: `Sonno < 6.5h per 2 giorni consecutivi + RPE ${highRPE!.training_rpe}/10. Priorità: recupero attivo.`,
    };
  }
  return { warning: false, reason: "" };
}
