"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_INVENTORY, MOCK_WORKOUT_ENTRIES } from "@/lib/mock-data";
import type { InventoryItem, WorkoutEntry, RoutineDay, RoutineExercise, WeightLog } from "@/lib/types";

function nid(prefix: string) {
  return `${prefix}-z${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const INITIAL_ROUTINE: RoutineDay[] = [
  {
    day: "Lunedì",
    focus: "Petto · Quadricipiti · Spalle · Addome",
    warmup: "Tappeto riscaldamento · 10 minuti",
    cooldown: "Tappeto defaticamento · 10-15 minuti",
    accent: "text-amber-300",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    exercises: [
      { id: "ex-lun-1", name: "Spinte Manubri Panca 45°", prescription: "3×10", weightNum: 12.5, weightUnit: "kg" },
      { id: "ex-lun-2", name: "Chest Press", prescription: "3×12", weightNum: 30, weightUnit: "kg" },
      { id: "ex-lun-3", name: "Fly Machine", prescription: "3×15", weightNum: 35, weightUnit: "kg" },
      { id: "ex-lun-4", name: "Calf alla Macchina", prescription: "3×15", weightNum: 20, weightUnit: "kg" },
      { id: "ex-lun-5", name: "Leg Extension", prescription: "5×15", weightNum: 40, weightUnit: "kg" },
      { id: "ex-lun-6", name: "Alzate Laterali Manubri", prescription: "3×12", weightNum: 7.5, weightUnit: "kg" },
      { id: "ex-lun-7", name: "Crunch + Sit Up", prescription: "3×20", weightUnit: "kg" },
    ],
  },
  {
    day: "Mercoledì",
    focus: "Schiena · Posteriori coscia · Bicipiti · Core",
    warmup: "Vogatore riscaldamento · 5 minuti",
    cooldown: "Tappeto / Cyclette defaticamento · 15 minuti",
    accent: "text-sky-300",
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    exercises: [
      { id: "ex-mer-1", name: "Stacco Rumeno Manubri", prescription: "3×10", weightNum: 15, weightUnit: "kg" },
      { id: "ex-mer-2", name: "Lat Machine Presa Media", prescription: "3×12", weightNum: 40, weightUnit: "kg" },
      { id: "ex-mer-3", name: "Pulley Largo", prescription: "3×12", weightNum: 30, weightUnit: "kg" },
      { id: "ex-mer-4", name: "Leg Curl Seduto", prescription: "3×15", weightNum: 45, weightUnit: "kg" },
      { id: "ex-mer-5", name: "Curl Bilanciere EZ", prescription: "3×10", weightNum: 10, weightUnit: "kg" },
      { id: "ex-mer-6", name: "Curl Corda al Cavo Basso", prescription: "3×15", weightNum: 10, weightUnit: "kg" },
      { id: "ex-mer-7", name: "Hyperextension", prescription: "3×12", weightUnit: "kg" },
      { id: "ex-mer-8", name: "Criss Cross", prescription: "3×MAX", weightUnit: "kg" },
    ],
  },
  {
    day: "Venerdì",
    focus: "Gambe · Petto · Spalle · Tricipiti",
    warmup: "Air Bike riscaldamento · 5 minuti",
    cooldown: "Cyclette / Tappeto defaticamento · 20 minuti",
    accent: "text-violet-300",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    exercises: [
      { id: "ex-ven-1", name: "Russian Twist + Mountain Climber", prescription: "1×1", weightUnit: "kg" },
      { id: "ex-ven-2", name: "Affondi Dietro", prescription: "3×12", weightNum: 15, weightUnit: "kg" },
      { id: "ex-ven-3", name: "Abductor", prescription: "3×15", weightNum: 45, weightUnit: "kg" },
      { id: "ex-ven-4", name: "Chest a 30°", prescription: "3×10", weightNum: 15, weightUnit: "kg" },
      { id: "ex-ven-5", name: "Shoulder Press", prescription: "3×12", weightUnit: "kg" },
      { id: "ex-ven-6", name: "Push Down Corda", prescription: "3×15", weightUnit: "kg" },
      { id: "ex-ven-7", name: "French Press Manubri", prescription: "3×12", weightUnit: "kg" },
      { id: "ex-ven-8", name: "Alzate Frontali Disco + Alzate Post. Manubri", prescription: "3×10", weightUnit: "kg" },
    ],
  },
];

interface PhysicalStore {
  inventory: InventoryItem[];
  workoutEntries: WorkoutEntry[];
  weeklyRoutine: RoutineDay[];
  weightLogs: WeightLog[];

  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  deleteInventoryItem: (id: string) => void;

  addWorkoutEntry: (entry: Omit<WorkoutEntry, "id">) => void;
  updateWorkoutEntry: (id: string, patch: Partial<Omit<WorkoutEntry, "id">>) => void;
  deleteWorkoutEntry: (id: string) => void;

  addRoutineExercise: (day: string, exercise: Omit<RoutineExercise, "id">) => void;
  updateRoutineExercise: (day: string, exerciseId: string, patch: Partial<Omit<RoutineExercise, "id">>) => void;
  deleteRoutineExercise: (day: string, exerciseId: string) => void;
  moveRoutineExercise: (day: string, fromIndex: number, toIndex: number) => void;
  updateRoutineDay: (day: string, patch: Partial<Pick<RoutineDay, "focus" | "warmup" | "cooldown">>) => void;

  logWeight: (exerciseName: string, weightNum: number, weightUnit: "kg" | "lbs") => void;
}

export const usePhysicalStore = create<PhysicalStore>()(
  persist(
    (set, get) => ({
      inventory: MOCK_INVENTORY,
      workoutEntries: MOCK_WORKOUT_ENTRIES,
      weeklyRoutine: INITIAL_ROUTINE,
      weightLogs: [],

      addInventoryItem: (item) =>
        set((s) => ({ inventory: [...s.inventory, { ...item, id: nid("inv") }] })),
      updateInventoryItem: (id, patch) =>
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      deleteInventoryItem: (id) =>
        set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) })),

      addWorkoutEntry: (entry) =>
        set((s) => ({ workoutEntries: [...s.workoutEntries, { ...entry, id: nid("w") }] })),
      updateWorkoutEntry: (id, patch) =>
        set((s) => ({
          workoutEntries: s.workoutEntries.map((entry) =>
            entry.id === id ? { ...entry, ...patch } : entry
          ),
        })),
      deleteWorkoutEntry: (id) =>
        set((s) => ({ workoutEntries: s.workoutEntries.filter((e) => e.id !== id) })),

      addRoutineExercise: (day, exercise) =>
        set((s) => ({
          weeklyRoutine: s.weeklyRoutine.map((d) =>
            d.day === day
              ? { ...d, exercises: [...d.exercises, { ...exercise, id: nid("ex") }] }
              : d
          ),
        })),

      updateRoutineExercise: (day, exerciseId, patch) => {
        const existing = get()
          .weeklyRoutine.find((d) => d.day === day)
          ?.exercises.find((e) => e.id === exerciseId);

        set((s) => ({
          weeklyRoutine: s.weeklyRoutine.map((d) =>
            d.day === day
              ? {
                  ...d,
                  exercises: d.exercises.map((e) =>
                    e.id === exerciseId ? { ...e, ...patch } : e
                  ),
                }
              : d
          ),
        }));

        if (existing && patch.weightNum !== undefined && patch.weightNum > 0) {
          const unitChanged = patch.weightUnit !== undefined && patch.weightUnit !== existing.weightUnit;
          const numChanged = patch.weightNum !== existing.weightNum;
          if (numChanged || unitChanged) {
            get().logWeight(
              existing.name,
              patch.weightNum,
              patch.weightUnit ?? existing.weightUnit
            );
          }
        }
      },

      deleteRoutineExercise: (day, exerciseId) =>
        set((s) => ({
          weeklyRoutine: s.weeklyRoutine.map((d) =>
            d.day === day
              ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) }
              : d
          ),
        })),

      moveRoutineExercise: (day, fromIndex, toIndex) =>
        set((s) => ({
          weeklyRoutine: s.weeklyRoutine.map((d) => {
            if (d.day !== day) return d;
            const exercises = [...d.exercises];
            const [removed] = exercises.splice(fromIndex, 1);
            exercises.splice(toIndex, 0, removed);
            return { ...d, exercises };
          }),
        })),

      updateRoutineDay: (day, patch) =>
        set((s) => ({
          weeklyRoutine: s.weeklyRoutine.map((d) => (d.day === day ? { ...d, ...patch } : d)),
        })),

      logWeight: (exerciseName, weightNum, weightUnit) =>
        set((s) => ({
          weightLogs: [
            ...s.weightLogs,
            {
              id: nid("wl"),
              exerciseName,
              weightNum,
              weightUnit,
              date: new Date().toISOString().slice(0, 10),
            },
          ],
        })),
    }),
    { name: "personal-os-physical" }
  )
);
