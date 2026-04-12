"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_TASKS } from "@/lib/mock-data";
import type { Task } from "@/lib/types";
import { today } from "@/lib/utils";

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

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set) => ({
      tasks: MOCK_TASKS,
      _hydrated: false,

      advanceTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t;
            const idx = CYCLE.indexOf(t.status as (typeof CYCLE)[number]);
            return { ...t, status: CYCLE[(idx + 1) % CYCLE.length] };
          }),
        })),

      addTask: (title) =>
        set((s) => ({
          tasks: [
            {
              id: newId(), title, category: "Admin",
              energy_required: 2, status: "Inbox",
              duration_mins: 30, created_at: today(),
            } satisfies Task,
            ...s.tasks,
          ],
        })),

      addFull: (task) =>
        set((s) => ({
          tasks: [{ ...task, id: newId(), created_at: today() } as Task, ...s.tasks],
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: "personal-os-kanban",
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
