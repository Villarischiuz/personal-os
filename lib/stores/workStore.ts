"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_TASKS } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { today } from "@/lib/utils";
import {
  defaultTaskAreaForCategory,
  normalizeTask,
} from "@/lib/computations";

// ─── Kanban store ─────────────────────────────────────────────
const CYCLE: Task["status"][] = ["Todo", "InProgress", "Done", "Inbox"];

interface KanbanStore {
  tasks: Task[];
  _hydrated: boolean;
  advanceTask: (id: string) => void;
  addTask: (title: string) => void;
  addFull: (task: Omit<Task, "id" | "created_at">) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: string) => void;
}

let _id = 200;
function newId() { return `t-z${++_id}`; }

function withTaskLifecycle(existing: Task, patch: Partial<Omit<Task, "id">>): Task {
  const mergedBase = normalizeTask({
    ...existing,
    ...patch,
    id: existing.id,
    created_at: existing.created_at,
  });
  const merged =
    mergedBase.bucket === "Today" && !mergedBase.date
      ? { ...mergedBase, date: today() }
      : mergedBase;

  if (merged.status === "Done") {
    return {
      ...merged,
      completed_at: patch.status === "Done" || existing.status !== "Done"
        ? today()
        : merged.completed_at,
    };
  }

  return {
    ...merged,
    completed_at: undefined,
  };
}

function normalizeIncomingTask(task: Task): Task {
  return normalizeTask(task);
}

function normalizePersistedTasks(tasks: unknown): Task[] {
  if (!Array.isArray(tasks)) return MOCK_TASKS.map(normalizeIncomingTask);
  return tasks
    .filter((task): task is Partial<Task> & { id: string; title: string } =>
      !!task &&
      typeof task === "object" &&
      "id" in task &&
      "title" in task &&
      typeof (task as { id?: unknown }).id === "string" &&
      typeof (task as { title?: unknown }).title === "string"
    )
    .map((task) => normalizeTask(task));
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS.map(normalizeIncomingTask),
      _hydrated: false,

      advanceTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const idx = CYCLE.indexOf(t.status as (typeof CYCLE)[number]);
            return withTaskLifecycle(t, { status: CYCLE[(idx + 1) % CYCLE.length] });
          }),
        })),

      addTask: (title) =>
        set((s) => ({
          tasks: [
            normalizeTask({
              id: newId(), title, category: "Admin",
              area: defaultTaskAreaForCategory("Admin"),
              priority: "P2",
              bucket: "Backlog",
              energy_required: 2, status: "Inbox",
              duration_mins: 30, created_at: today(),
            } satisfies Task),
            ...s.tasks,
          ],
        })),

      addFull: (task) =>
        set((s) => ({
          tasks: [normalizeTask({ ...task, id: newId(), created_at: today() }), ...s.tasks],
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? withTaskLifecycle(t, patch) : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: "personal-os-kanban-v2",
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<KanbanStore> | undefined;
        if (!state) {
          return {
            tasks: MOCK_TASKS.map(normalizeIncomingTask),
            _hydrated: false,
          } satisfies Pick<KanbanStore, "tasks" | "_hydrated">;
        }

        return {
          ...state,
          tasks: normalizePersistedTasks(state.tasks),
          _hydrated: false,
        };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<KanbanStore> | undefined;
        return {
          ...currentState,
          ...persisted,
          tasks: normalizePersistedTasks(persisted?.tasks),
        } as KanbanStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state) state._hydrated = true;
      },
    }
  )
);

// ─── Pomodoro store ───────────────────────────────────────────
const WORK_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

interface PomodoroStore {
  secs: number;
  running: boolean;
  isBreak: boolean;
  completed: number;
  activeTask: string;
  zenMode: boolean;
  tick: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  setActiveTask: (t: string) => void;
  setZen: (v: boolean) => void;
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set) => ({
      secs: WORK_SECS,
      running: false,
      isBreak: false,
      completed: 0,
      activeTask: "",
      zenMode: false,
      tick: () =>
        set((s) => {
          if (s.secs <= 1) {
            const nowBreak = !s.isBreak;
            return {
              secs: nowBreak ? BREAK_SECS : WORK_SECS,
              isBreak: nowBreak,
              completed: nowBreak ? s.completed + 1 : s.completed,
            };
          }
          return { secs: s.secs - 1 };
        }),
      toggle: () => set((s) => ({ running: !s.running })),
      reset: () => set({ running: false, isBreak: false, secs: WORK_SECS }),
      skip: () =>
        set((s) => ({
          running: false,
          isBreak: !s.isBreak,
          secs: s.isBreak ? WORK_SECS : BREAK_SECS,
          completed: !s.isBreak ? s.completed + 1 : s.completed,
        })),
      setActiveTask: (t) => set({ activeTask: t }),
      setZen: (v) => set({ zenMode: v }),
    }),
    {
      name: "personal-os-pomodoro",
      partialize: (s) => ({
        completed: s.completed,
        activeTask: s.activeTask,
        isBreak: s.isBreak,
        secs: s.secs,
      }),
    }
  )
);
