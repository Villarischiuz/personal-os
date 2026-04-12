"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MOCK_INVENTORY, MOCK_WORKOUT_ENTRIES } from "@/lib/mock-data";
import type { InventoryItem, WorkoutEntry } from "@/lib/types";

function nid(prefix: string) {
  return `${prefix}-z${Date.now()}`;
}

interface PhysicalStore {
  inventory: InventoryItem[];
  workoutEntries: WorkoutEntry[];
  addInventoryItem: (item: Omit<InventoryItem, "id">) => void;
  updateInventoryItem: (id: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  deleteInventoryItem: (id: string) => void;
  addWorkoutEntry: (entry: Omit<WorkoutEntry, "id">) => void;
  updateWorkoutEntry: (id: string, patch: Partial<Omit<WorkoutEntry, "id">>) => void;
  deleteWorkoutEntry: (id: string) => void;
}

export const usePhysicalStore = create<PhysicalStore>()(
  persist(
    (set) => ({
      inventory: MOCK_INVENTORY,
      workoutEntries: MOCK_WORKOUT_ENTRIES,

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
    }),
    { name: "personal-os-physical" }
  )
);
