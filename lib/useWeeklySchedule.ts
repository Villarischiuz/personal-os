"use client";

import { useState, useEffect } from "react";
import type { WeeklyEvent } from "./types";

const STORAGE_KEY = "personal-os-weekly";

const DEFAULT_EVENTS: WeeklyEvent[] = [
  { id: "we-1", title: "Allenamento",        dayOfWeek: 0, hour: 7,  minute: 0,  durationMins: 90,  color: "orange" },
  { id: "we-2", title: "Deep work",           dayOfWeek: 0, hour: 9,  minute: 0,  durationMins: 120, color: "blue"   },
  { id: "we-3", title: "Pranzo",              dayOfWeek: 0, hour: 13, minute: 0,  durationMins: 60,  color: "green"  },
  { id: "we-4", title: "Allenamento",        dayOfWeek: 2, hour: 7,  minute: 0,  durationMins: 90,  color: "orange" },
  { id: "we-5", title: "Deep work",           dayOfWeek: 2, hour: 9,  minute: 0,  durationMins: 120, color: "blue"   },
  { id: "we-6", title: "Pranzo",              dayOfWeek: 2, hour: 13, minute: 0,  durationMins: 60,  color: "green"  },
  { id: "we-7", title: "Allenamento",        dayOfWeek: 4, hour: 7,  minute: 0,  durationMins: 90,  color: "orange" },
  { id: "we-8", title: "Deep work",           dayOfWeek: 4, hour: 9,  minute: 0,  durationMins: 120, color: "blue"   },
  { id: "we-9", title: "Pranzo",              dayOfWeek: 4, hour: 13, minute: 0,  durationMins: 60,  color: "green"  },
  { id: "we-10", title: "Studio inglese",     dayOfWeek: 1, hour: 20, minute: 0,  durationMins: 60,  color: "violet" },
  { id: "we-11", title: "Studio inglese",     dayOfWeek: 3, hour: 20, minute: 0,  durationMins: 60,  color: "violet" },
  { id: "we-12", title: "Meal prep",          dayOfWeek: 6, hour: 11, minute: 0,  durationMins: 120, color: "green"  },
];

let _idCounter = 1000;
function genId() { return `we-${++_idCounter}`; }

export function useWeeklySchedule() {
  const [events, setEvents] = useState<WeeklyEvent[]>(() => {
    if (typeof window === "undefined") return DEFAULT_EVENTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as WeeklyEvent[]) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  function addEvent(ev: Omit<WeeklyEvent, "id">) {
    setEvents((prev) => [...prev, { ...ev, id: genId() }]);
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function replaceAll(newEvents: Omit<WeeklyEvent, "id">[]) {
    setEvents(newEvents.map((e) => ({ ...e, id: genId() })));
  }

  return { events, addEvent, removeEvent, replaceAll };
}
