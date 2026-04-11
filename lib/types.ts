// ============================================================
// CORE DOMAIN TYPES
// Simulates Supabase PostgreSQL schema — no DB connected yet
// ============================================================

export type TaskCategory = "Work" | "Study" | "Admin";
export type TaskStatus = "Inbox" | "Todo" | "InProgress" | "Done";
export type EnergyBlock = "Peak" | "Trough" | "Rebound";
export type ItemCategory = "Supplement" | "Food";

// ─── TASK ───────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  /** 1 = very low effort, 5 = deep focus required */
  energy_required: 1 | 2 | 3 | 4 | 5;
  status: TaskStatus;
  duration_mins: number;
  /** ISO date string, e.g. "2026-04-11" */
  created_at: string;
  /** Optional assigned energy block for calendar view */
  energy_block?: EnergyBlock;
  /** Optional ISO date "YYYY-MM-DD" for day-pinned tasks */
  date?: string;
  /** Optional notes */
  notes?: string;
}

// ─── INVENTORY ──────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  /** Current stock in units (pills, grams, servings, etc.) */
  current_stock: number;
  /** Minimum threshold before flagging for reorder */
  threshold: number;
  auto_reorder: boolean;
  /** Unit label for display, e.g. "pills", "g", "servings" */
  unit: string;
  /** Estimated daily usage for depletion calculation */
  daily_usage: number;
}

// ─── DAILY LOG ──────────────────────────────────────────────
export interface DailyLog {
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  sleep_hours: number;
  /** Resting Heart Rate in bpm */
  rhr: number;
  /** Training Rate of Perceived Exertion 1–10 */
  training_rpe: number;
  pomodoros_completed: number;
  tasks_completed: number;
  macros_hit: boolean;
  /** Optional HRV reading in ms */
  hrv?: number;
  /** Water intake in ml */
  water_ml?: number;
  mood?: 1 | 2 | 3 | 4 | 5;
}

// ─── WORKOUT ENTRY ──────────────────────────────────────────
export interface WorkoutEntry {
  id: string;
  /** ISO date string "YYYY-MM-DD" */
  date: string;
  exercise: string;
  /** Muscle group for grouping */
  muscle_group: string;
  weight: number;
  /** Weight unit */
  weight_unit: "kg" | "lbs";
  reps: number;
  sets: number;
  progressive_overload_achieved: boolean;
  notes?: string;
}

// ─── MACRO LOG ──────────────────────────────────────────────
export interface MacroLog {
  date: string;
  calories_target: number;
  calories_actual: number;
  protein_g_target: number;
  protein_g_actual: number;
  carbs_g_target: number;
  carbs_g_actual: number;
  fat_g_target: number;
  fat_g_actual: number;
}

// ─── CALENDAR ────────────────────────────────────────────────
export type EventColor = "blue" | "green" | "orange" | "violet" | "rose";

export interface WeeklyEvent {
  id: string;
  title: string;
  /** 0=Lunedì … 6=Domenica */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hour: number;   // 6–22
  minute: number; // 0 | 30
  durationMins: number;
  color: EventColor;
}

// ─── DERIVED / COMPUTED TYPES ────────────────────────────────
export interface SystemStatus {
  color: "green" | "yellow" | "red";
  label: string;
  score: number;
  flags: string[];
}

export interface PerformanceDataPoint {
  date: string;
  sleep_hours: number;
  productivity_score: number;
  training_rpe: number;
}

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_broken: string | null;
}
