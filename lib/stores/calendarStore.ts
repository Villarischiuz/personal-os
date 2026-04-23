"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DatedEvent } from "@/lib/types";
import {
  DEFAULT_ACTIVE_WEEK_EVENTS,
  DEFAULT_ACTIVE_WEEK_RANGE,
  type ActiveWeekRange,
} from "@/lib/activeWeekPlan";

interface ActiveWeekStore {
  range: ActiveWeekRange;
  events: DatedEvent[];
  _hydrated: boolean;
  replaceAll: (events: Omit<DatedEvent, "id">[]) => void;
  setRange: (range: ActiveWeekRange) => void;
  resetDefaults: () => void;
}

let nextActiveWeekId = 4000;
function newActiveWeekId() {
  nextActiveWeekId += 1;
  return `aw-local-${nextActiveWeekId}`;
}

export const useActiveWeekStore = create<ActiveWeekStore>()(
  persist(
    (set) => ({
      range: DEFAULT_ACTIVE_WEEK_RANGE,
      events: DEFAULT_ACTIVE_WEEK_EVENTS,
      _hydrated: false,

      replaceAll: (events) =>
        set({
          events: events.map((event) => ({
            ...event,
            id: newActiveWeekId(),
            locked: true,
          })),
        }),

      setRange: (range) => set({ range }),

      resetDefaults: () =>
        set({
          range: DEFAULT_ACTIVE_WEEK_RANGE,
          events: DEFAULT_ACTIVE_WEEK_EVENTS,
        }),
    }),
    {
      name: "personal-os-active-week-v1",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
        }
      },
    }
  )
);
