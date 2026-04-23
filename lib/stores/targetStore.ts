"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SharedTargetConfig } from "@/lib/types";

const STORAGE_KEY = "personal-os-shared-targets-v1";
const DEFAULT_DSE_EXAM_AT = new Date("2026-05-20T09:00:00").toISOString();

function defaultIeltsExamAt() {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), 8, 1, 9, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate.toISOString();
}

function buildDefaults(): SharedTargetConfig {
  return {
    dse_exam_at: DEFAULT_DSE_EXAM_AT,
    ielts_exam_at: defaultIeltsExamAt(),
  };
}

interface TargetStore extends SharedTargetConfig {
  setDseExamAt: (value: string) => void;
  setIeltsExamAt: (value: string) => void;
}

export const useTargetStore = create<TargetStore>()(
  persist(
    (set) => ({
      ...buildDefaults(),
      setDseExamAt: (value) => set({ dse_exam_at: value }),
      setIeltsExamAt: (value) => set({ ielts_exam_at: value }),
    }),
    {
      name: STORAGE_KEY,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<TargetStore> | undefined),
      }),
    }
  )
);

export function daysUntilTarget(targetIso: string, now: Date = new Date()) {
  return Math.max(0, Math.ceil((new Date(targetIso).getTime() - now.getTime()) / 86400000));
}

export function toDateTimeLocalValue(iso: string) {
  const value = new Date(iso);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
