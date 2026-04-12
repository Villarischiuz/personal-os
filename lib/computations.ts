// ============================================================
// COMPUTATION ENGINE
// Pure functions that derive UI state from raw mock data.
// When DB is connected, replace inputs with Supabase query results.
// ============================================================

import type {
  DailyLog,
  WorkoutEntry,
  SystemStatus,
  PerformanceDataPoint,
  StreakData,
  InventoryItem,
  Task,
} from "./types";
import { parseLocalDate } from "./utils";

// ─── SYSTEM TRAFFIC LIGHT ─────────────────────────────────────
const SLEEP_THRESHOLD = 7;
const HIGH_RPE_THRESHOLD = 8;

export function computeSystemStatus(log: DailyLog): SystemStatus {
  const flags: string[] = [];
  let score = 100;

  if (log.sleep_hours < SLEEP_THRESHOLD) {
    flags.push(`Deficit sonno (${log.sleep_hours}h < ${SLEEP_THRESHOLD}h)`);
    score -= 30;
  }
  if (!log.macros_hit) {
    flags.push("Macro non centrate");
    score -= 25;
  }
  if (log.training_rpe >= HIGH_RPE_THRESHOLD) {
    flags.push(`Carico allenamento alto (RPE ${log.training_rpe})`);
    score -= 15;
  }
  if (log.rhr > 65) {
    flags.push(`FC riposo elevata (${log.rhr} bpm)`);
    score -= 10;
  }

  const color: SystemStatus["color"] =
    score >= 80 ? "green" : score >= 50 ? "yellow" : "red";

  const label =
    color === "green"
      ? "Systems Optimal"
      : color === "yellow"
        ? "Monitor Closely"
        : "Recovery Priority";

  return { color, label, score: Math.max(0, score), flags };
}

// ─── PRODUCTIVITY SCORE ───────────────────────────────────────
/** Normalise pomodoros to 0–10 scale. 10 pomodoros = max score 10. */
export function computeProductivityScore(pomodoros: number): number {
  return Math.min(10, Math.round((pomodoros / 10) * 10));
}

// ─── PERFORMANCE CHART DATA (last 7 days) ────────────────────
export function buildPerformanceData(logs: DailyLog[]): PerformanceDataPoint[] {
  const last7 = logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return last7.map((log) => ({
    date: formatChartDate(log.date),
    sleep_hours: log.sleep_hours,
    productivity_score: computeProductivityScore(log.pomodoros_completed),
    training_rpe: log.training_rpe,
  }));
}

function formatChartDate(isoDate: string): string {
  const [, , day] = isoDate.split("-");
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];
  const d = parseLocalDate(isoDate);
  return `${months[d.getMonth()]} ${parseInt(day)}`;
}

// ─── STREAK CALCULATION ───────────────────────────────────────
/** A "good day" = sleep ≥ 7h AND macros hit */
function isDayAdherent(log: DailyLog): boolean {
  return log.sleep_hours >= SLEEP_THRESHOLD && log.macros_hit;
}

export function computeStreak(logs: DailyLog[]): StreakData {
  const sorted = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let lastBroken: string | null = null;
  let inCurrentStreak = true;

  for (const log of sorted) {
    if (isDayAdherent(log)) {
      runningStreak++;
      if (inCurrentStreak) currentStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      if (inCurrentStreak && currentStreak === 0) {
        lastBroken = log.date;
      }
      inCurrentStreak = false;
      runningStreak = 0;
    }
  }

  return { current_streak: currentStreak, longest_streak: longestStreak, last_broken: lastBroken };
}

// ─── INVENTORY: ITEMS BELOW THRESHOLD ────────────────────────
export function getLowStockItems(inventory: InventoryItem[]): InventoryItem[] {
  return inventory.filter((item) => item.current_stock <= item.threshold);
}

export function getDaysUntilDepletion(item: InventoryItem): number {
  if (item.daily_usage === 0) return Infinity;
  return Math.floor(item.current_stock / item.daily_usage);
}

// ─── WORKOUT: PROGRESSIVE OVERLOAD TABLE ─────────────────────
export interface OverloadRow {
  exercise: string;
  muscle_group: string;
  prev_weight: number | null;
  prev_reps: number | null;
  curr_weight: number | null;
  curr_reps: number | null;
  overload_achieved: boolean;
  is_pr: boolean;
  weight_unit: "kg" | "lbs";
}

export function buildOverloadTable(entries: WorkoutEntry[]): OverloadRow[] {
  const exerciseMap: Record<string, WorkoutEntry[]> = {};

  for (const entry of entries) {
    if (!exerciseMap[entry.exercise]) exerciseMap[entry.exercise] = [];
    exerciseMap[entry.exercise].push(entry);
  }

  const rows: OverloadRow[] = [];

  for (const [exercise, sessions] of Object.entries(exerciseMap)) {
    const sorted = sessions.sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const previous = sorted[1] ?? null;

    const maxWeight = Math.max(...sessions.map((s) => s.weight));
    const isPR = latest.weight >= maxWeight;

    rows.push({
      exercise,
      muscle_group: latest.muscle_group,
      prev_weight: previous?.weight ?? null,
      prev_reps: previous?.reps ?? null,
      curr_weight: latest.weight,
      curr_reps: latest.reps,
      overload_achieved: latest.progressive_overload_achieved,
      is_pr: isPR,
      weight_unit: latest.weight_unit,
    });
  }

  return rows.sort((a, b) => a.muscle_group.localeCompare(b.muscle_group));
}

// ─── TASK HELPERS ─────────────────────────────────────────────
export function getTasksByStatus(tasks: Task[], status: Task["status"]): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getTasksByEnergyBlock(
  tasks: Task[],
  block: NonNullable<Task["energy_block"]>
): Task[] {
  return tasks.filter((t) => t.energy_block === block);
}

// ─── WEEKLY REVIEW SUMMARY ────────────────────────────────────
export interface WeeklyReview {
  avg_sleep: number;
  avg_rhr: number;
  total_pomodoros: number;
  total_tasks_completed: number;
  macros_hit_days: number;
  training_sessions: number;
  avg_training_rpe: number;
  adherence_score: number; // 0–100
}

export function buildWeeklyReview(logs: DailyLog[]): WeeklyReview {
  const last7 = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const n = last7.length || 1;

  const avg_sleep = round1(last7.reduce((s, l) => s + l.sleep_hours, 0) / n);
  const avg_rhr = round1(last7.reduce((s, l) => s + l.rhr, 0) / n);
  const total_pomodoros = last7.reduce((s, l) => s + l.pomodoros_completed, 0);
  const total_tasks_completed = last7.reduce((s, l) => s + l.tasks_completed, 0);
  const macros_hit_days = last7.filter((l) => l.macros_hit).length;
  const trainingSessions = last7.filter((l) => l.training_rpe > 0);
  const training_sessions = trainingSessions.length;
  const avg_training_rpe =
    training_sessions > 0
      ? round1(trainingSessions.reduce((s, l) => s + l.training_rpe, 0) / training_sessions)
      : 0;

  const adherence_score = Math.round(
    ((avg_sleep >= SLEEP_THRESHOLD ? 1 : 0) +
      macros_hit_days / n +
      (total_pomodoros >= 35 ? 1 : total_pomodoros / 35)) *
      (100 / 3)
  );

  return {
    avg_sleep,
    avg_rhr,
    total_pomodoros,
    total_tasks_completed,
    macros_hit_days,
    training_sessions,
    avg_training_rpe,
    adherence_score,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
