// ============================================================
// COMPUTATION ENGINE
// Pure functions that derive UI state from raw data.
// ============================================================

import {
  endOfWeek,
  isWithinInterval,
  startOfWeek,
} from "date-fns";
import type {
  DailyLog,
  WorkoutEntry,
  SystemStatus,
  PerformanceDataPoint,
  StreakData,
  InventoryItem,
  Task,
  TaskArea,
  TaskBucket,
  TaskCategory,
  TaskPriority,
} from "./types";
import { parseLocalDate, today as todayIso } from "./utils";

const TASK_AREAS: TaskArea[] = ["IELTS", "DSE", "Projects", "Websites", "Admin"];
const TASK_PRIORITIES: TaskPriority[] = ["P0", "P1", "P2", "P3"];
const TASK_BUCKETS: TaskBucket[] = ["Backlog", "ThisWeek", "Today"];
const TASK_STATUS_ORDER: Record<Task["status"], number> = {
  InProgress: 0,
  Todo: 1,
  Inbox: 2,
  Done: 3,
};
const TASK_BUCKET_ORDER: Record<TaskBucket, number> = {
  Today: 0,
  ThisWeek: 1,
  Backlog: 2,
};
const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  P0: 0,
  P1: 1,
  P2: 2,
  P3: 3,
};
const TASK_CATEGORY_DEFAULT_AREA: Record<TaskCategory, TaskArea> = {
  Work: "Projects",
  Study: "DSE",
  Admin: "Admin",
};
const BLOCK_PREFERENCE: Record<string, number> = {
  Peak: 0,
  Trough: 1,
  Rebound: 2,
};

export interface TaskDraftLike extends Partial<Omit<Task, "id">> {
  title: string;
  category?: TaskCategory;
  notes?: string;
}

export interface AreaMetricsRow {
  area: TaskArea;
  active_count: number;
  done_count: number;
  total_minutes: number;
  completed_minutes: number;
  today_count: number;
  week_count: number;
}

export interface TaskMetrics {
  today_completed: number;
  week_completed: number;
  today_planned: number;
  today_planned_minutes: number;
  week_planned: number;
  week_planned_minutes: number;
  backlog_count: number;
  area_rows: AreaMetricsRow[];
}

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
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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

// ─── TASK DOMAIN HELPERS ──────────────────────────────────────
export function getTaskAreas(): TaskArea[] {
  return TASK_AREAS;
}

export function getTaskPriorities(): TaskPriority[] {
  return TASK_PRIORITIES;
}

export function getTaskBuckets(): TaskBucket[] {
  return TASK_BUCKETS;
}

export function defaultTaskAreaForCategory(category: TaskCategory): TaskArea {
  return TASK_CATEGORY_DEFAULT_AREA[category];
}

export function inferTaskArea(task: Pick<TaskDraftLike, "title" | "category" | "notes">): TaskArea {
  if (task.category === "Admin") return "Admin";

  const haystack = `${task.title} ${task.notes ?? ""}`.toLowerCase();
  if (haystack.includes("ielts") || haystack.includes("cambridge")) return "IELTS";
  if (
    haystack.includes("data science") ||
    haystack.includes("polito") ||
    haystack.includes("statistic") ||
    haystack.includes("math for ds") ||
    haystack.includes("dse")
  ) {
    return "DSE";
  }
  if (
    haystack.includes("website") ||
    haystack.includes("landing page") ||
    haystack.includes("web") ||
    haystack.includes("site") ||
    haystack.includes("skappa")
  ) {
    return "Websites";
  }

  return task.category === "Study" ? "DSE" : "Projects";
}

export function deriveBucketFromDate(date?: string, referenceDate: string = todayIso()): TaskBucket {
  if (!date) return "Backlog";
  if (date === referenceDate) return "Today";
  if (isIsoInWeek(date, referenceDate)) return "ThisWeek";
  return "Backlog";
}

export function normalizeTask(task: TaskDraftLike & { id: string; created_at?: string }): Task {
  const status = task.status ?? "Inbox";
  const bucket = status === "Done"
    ? deriveBucketFromDate(task.date)
    : task.bucket ?? inferBucket(task, task.date);

  return {
    id: task.id,
    title: task.title,
    category: task.category ?? "Admin",
    area: task.area ?? inferTaskArea(task),
    priority: task.priority ?? "P2",
    bucket,
    energy_required: task.energy_required ?? 2,
    status,
    duration_mins: task.duration_mins ?? 30,
    created_at: task.created_at ?? todayIso(),
    completed_at: task.completed_at,
    energy_block: task.energy_block,
    date: task.date,
    notes: task.notes,
  };
}

function inferBucket(task: Pick<TaskDraftLike, "date"> & Partial<Pick<Task, "status" | "energy_block" | "bucket">>, date?: string): TaskBucket {
  if (task.status === "Done") {
    return deriveBucketFromDate(date);
  }
  if (task.bucket) return task.bucket;
  if (date === todayIso()) return "Today";
  if (date && isIsoInWeek(date, todayIso())) return "ThisWeek";
  if (task.energy_block) return "Today";
  return "Backlog";
}

function isIsoInWeek(isoDate: string, referenceDate: string): boolean {
  const reference = parseLocalDate(referenceDate);
  return isWithinInterval(parseLocalDate(isoDate), {
    start: startOfWeek(reference, { weekStartsOn: 1 }),
    end: endOfWeek(reference, { weekStartsOn: 1 }),
  });
}

function compareIsoAsc(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function compareTaskFocus(a: Task, b: Task, currentBlock?: string): number {
  const blockA = a.energy_block ? BLOCK_PREFERENCE[a.energy_block] ?? 99 : 99;
  const blockB = b.energy_block ? BLOCK_PREFERENCE[b.energy_block] ?? 99 : 99;
  const preferredBlock = currentBlock ? BLOCK_PREFERENCE[currentBlock] ?? -1 : -1;

  const currentBlockDiff =
    (blockA === preferredBlock ? -1 : 0) - (blockB === preferredBlock ? -1 : 0);
  if (currentBlockDiff !== 0) return currentBlockDiff;

  return (
    TASK_STATUS_ORDER[a.status] - TASK_STATUS_ORDER[b.status] ||
    TASK_BUCKET_ORDER[a.bucket] - TASK_BUCKET_ORDER[b.bucket] ||
    TASK_PRIORITY_ORDER[a.priority] - TASK_PRIORITY_ORDER[b.priority] ||
    compareIsoAsc(a.date, b.date) ||
    a.created_at.localeCompare(b.created_at) ||
    a.title.localeCompare(b.title)
  );
}

export function getTasksByStatus(tasks: Task[], status: Task["status"]): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getTasksByEnergyBlock(
  tasks: Task[],
  block: NonNullable<Task["energy_block"]>
): Task[] {
  return tasks.filter((t) => t.energy_block === block);
}

export function getBacklogTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status !== "Done" && task.bucket === "Backlog")
    .slice()
    .sort((a, b) => compareTaskFocus(a, b));
}

export function getThisWeekTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status !== "Done" && task.bucket === "ThisWeek")
    .slice()
    .sort((a, b) => compareTaskFocus(a, b));
}

export function getTodayTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status !== "Done" && task.bucket === "Today")
    .slice()
    .sort((a, b) => compareTaskFocus(a, b));
}

export function getDoneTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === "Done")
    .slice()
    .sort((a, b) => compareIsoAsc(b.completed_at, a.completed_at) || b.created_at.localeCompare(a.created_at));
}

export function getActionableTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === "Todo" || task.status === "InProgress")
    .slice()
    .sort((a, b) => compareTaskFocus(a, b));
}

export function getFocusTask(tasks: Task[], currentBlock?: string): Task | null {
  const active = tasks.filter((task) => task.status !== "Done");
  if (active.length === 0) return null;
  return active.slice().sort((a, b) => compareTaskFocus(a, b, currentBlock))[0] ?? null;
}

export function buildTaskMetrics(tasks: Task[], referenceDate: string = todayIso()): TaskMetrics {
  const todayTasks = getTodayTasks(tasks);
  const thisWeekTasks = getThisWeekTasks(tasks);
  const backlogTasks = getBacklogTasks(tasks);
  const doneTasks = getDoneTasks(tasks);
  const weekDone = doneTasks.filter((task) => task.completed_at && isIsoInWeek(task.completed_at, referenceDate));
  const todayDone = doneTasks.filter((task) => task.completed_at === referenceDate);

  return {
    today_completed: todayDone.length,
    week_completed: weekDone.length,
    today_planned: todayTasks.length,
    today_planned_minutes: todayTasks.reduce((sum, task) => sum + task.duration_mins, 0),
    week_planned: todayTasks.length + thisWeekTasks.length,
    week_planned_minutes:
      todayTasks.reduce((sum, task) => sum + task.duration_mins, 0) +
      thisWeekTasks.reduce((sum, task) => sum + task.duration_mins, 0),
    backlog_count: backlogTasks.length,
    area_rows: TASK_AREAS.map((area) => {
      const areaTasks = tasks.filter((task) => task.area === area);
      const areaDone = weekDone.filter((task) => task.area === area);
      const areaToday = todayTasks.filter((task) => task.area === area);
      const areaWeek = [...todayTasks, ...thisWeekTasks].filter((task) => task.area === area);
      const activeTasks = areaTasks.filter((task) => task.status !== "Done");

      return {
        area,
        active_count: activeTasks.length,
        done_count: areaDone.length,
        total_minutes: activeTasks.reduce((sum, task) => sum + task.duration_mins, 0),
        completed_minutes: areaDone.reduce((sum, task) => sum + task.duration_mins, 0),
        today_count: areaToday.length,
        week_count: areaWeek.length,
      };
    }),
  };
}

export function countCompletedTaskMinutes(tasks: Task[], referenceDate: string = todayIso()): number {
  return getDoneTasks(tasks)
    .filter((task) => task.completed_at === referenceDate)
    .reduce((sum, task) => sum + task.duration_mins, 0);
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

export function buildWeeklyReview(logs: DailyLog[], taskCountOverride?: number): WeeklyReview {
  const last7 = logs
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const n = last7.length || 1;

  const avg_sleep = round1(last7.reduce((s, l) => s + l.sleep_hours, 0) / n);
  const avg_rhr = round1(last7.reduce((s, l) => s + l.rhr, 0) / n);
  const total_pomodoros = last7.reduce((s, l) => s + l.pomodoros_completed, 0);
  const total_tasks_completed = taskCountOverride ?? last7.reduce((s, l) => s + l.tasks_completed, 0);
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
