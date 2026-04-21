"use client";

import { useState, useEffect } from "react";
import type { WeeklyEvent } from "./types";

const STORAGE_KEY = "personal-os-weekly";

const DEFAULT_EVENTS: WeeklyEvent[] = [
  // ── Lunedì (0) ─────────────────────────────────────────────
  { id: "we-l1", title: "Colazione Metabolica",               dayOfWeek: 0, hour: 9,  minute: 15, durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-l2", title: "Deep Work: Data Science & Inglese",  dayOfWeek: 0, hour: 10, minute: 0,  durationMins: 120, color: "blue",   tag: "Deep"     },
  { id: "we-l3", title: "Palestra",                           dayOfWeek: 0, hour: 12, minute: 0,  durationMins: 90,  color: "orange", tag: "Rest"     },
  { id: "we-l4", title: "Pranzo",                             dayOfWeek: 0, hour: 13, minute: 30, durationMins: 30,  color: "green",  tag: "Rest"     },
  { id: "we-l5", title: "Passeggiata con il Cane",            dayOfWeek: 0, hour: 14, minute: 0,  durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-l6", title: "Lead Gen Outreach",                  dayOfWeek: 0, hour: 15, minute: 0,  durationMins: 60,  color: "violet", tag: "Creative" },
  { id: "we-l7", title: "Skappa Graphics",                    dayOfWeek: 0, hour: 16, minute: 0,  durationMins: 90,  color: "rose",   tag: "Creative" },
  // ── Martedì (1) ────────────────────────────────────────────
  { id: "we-m1", title: "Colazione Metabolica",               dayOfWeek: 1, hour: 9,  minute: 15, durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-m2", title: "Deep Work: Simulazioni Esame Inglese", dayOfWeek: 1, hour: 10, minute: 0, durationMins: 90, color: "blue",   tag: "Deep"     },
  { id: "we-m3", title: "Deep Work: Polito Data Science Prep",  dayOfWeek: 1, hour: 11, minute: 45, durationMins: 90, color: "blue",  tag: "Deep"     },
  { id: "we-m4", title: "Pranzo",                             dayOfWeek: 1, hour: 13, minute: 30, durationMins: 30,  color: "green",  tag: "Rest"     },
  { id: "we-m5", title: "Passeggiata con il Cane",            dayOfWeek: 1, hour: 14, minute: 0,  durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-m6", title: "AI Model Photos & Editing",          dayOfWeek: 1, hour: 15, minute: 0,  durationMins: 120, color: "violet", tag: "Creative" },
  { id: "we-m7", title: "CRM & Follow-up",                   dayOfWeek: 1, hour: 17, minute: 0,  durationMins: 60,  color: "rose",   tag: "Creative" },
  { id: "we-m8", title: "Corso di Graphic Design",            dayOfWeek: 1, hour: 19, minute: 0,  durationMins: 120, color: "violet", tag: "Creative" },
  // ── Mercoledì (2) ──────────────────────────────────────────
  { id: "we-w1", title: "Colazione Metabolica",               dayOfWeek: 2, hour: 9,  minute: 15, durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-w2", title: "Deep Work: Data Science & Inglese",  dayOfWeek: 2, hour: 10, minute: 0,  durationMins: 120, color: "blue",   tag: "Deep"     },
  { id: "we-w3", title: "Palestra",                           dayOfWeek: 2, hour: 12, minute: 0,  durationMins: 90,  color: "orange", tag: "Rest"     },
  { id: "we-w4", title: "Pranzo",                             dayOfWeek: 2, hour: 13, minute: 30, durationMins: 30,  color: "green",  tag: "Rest"     },
  { id: "we-w5", title: "Passeggiata con il Cane",            dayOfWeek: 2, hour: 14, minute: 0,  durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-w6", title: "Lead Gen Outreach",                  dayOfWeek: 2, hour: 15, minute: 0,  durationMins: 60,  color: "violet", tag: "Creative" },
  { id: "we-w7", title: "Skappa Graphics",                    dayOfWeek: 2, hour: 16, minute: 0,  durationMins: 90,  color: "rose",   tag: "Creative" },
  // ── Giovedì (3) ────────────────────────────────────────────
  { id: "we-g1", title: "Colazione Metabolica",               dayOfWeek: 3, hour: 9,  minute: 15, durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-g2", title: "Deep Work: Simulazioni Esame Inglese", dayOfWeek: 3, hour: 10, minute: 0, durationMins: 90, color: "blue",   tag: "Deep"     },
  { id: "we-g3", title: "Deep Work: Polito Data Science Prep",  dayOfWeek: 3, hour: 11, minute: 45, durationMins: 90, color: "blue",  tag: "Deep"     },
  { id: "we-g4", title: "Pranzo",                             dayOfWeek: 3, hour: 13, minute: 30, durationMins: 30,  color: "green",  tag: "Rest"     },
  { id: "we-g5", title: "Passeggiata con il Cane",            dayOfWeek: 3, hour: 14, minute: 0,  durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-g6", title: "AI Model Photos & Editing",          dayOfWeek: 3, hour: 15, minute: 0,  durationMins: 120, color: "violet", tag: "Creative" },
  { id: "we-g7", title: "CRM & Follow-up",                   dayOfWeek: 3, hour: 17, minute: 0,  durationMins: 60,  color: "rose",   tag: "Creative" },
  // ── Venerdì (4) ────────────────────────────────────────────
  { id: "we-v1", title: "Colazione Metabolica",               dayOfWeek: 4, hour: 9,  minute: 15, durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-v2", title: "Deep Work: Data Science & Inglese",  dayOfWeek: 4, hour: 10, minute: 0,  durationMins: 120, color: "blue",   tag: "Deep"     },
  { id: "we-v3", title: "Palestra",                           dayOfWeek: 4, hour: 12, minute: 0,  durationMins: 90,  color: "orange", tag: "Rest"     },
  { id: "we-v4", title: "Pranzo",                             dayOfWeek: 4, hour: 13, minute: 30, durationMins: 30,  color: "green",  tag: "Rest"     },
  { id: "we-v5", title: "Passeggiata con il Cane",            dayOfWeek: 4, hour: 14, minute: 0,  durationMins: 45,  color: "green",  tag: "Rest"     },
  { id: "we-v6", title: "Lead Gen Outreach",                  dayOfWeek: 4, hour: 15, minute: 0,  durationMins: 60,  color: "violet", tag: "Creative" },
  { id: "we-v7", title: "Skappa Graphics",                    dayOfWeek: 4, hour: 16, minute: 0,  durationMins: 90,  color: "rose",   tag: "Creative" },
  { id: "we-v8", title: "Corso di Graphic Design",            dayOfWeek: 4, hour: 19, minute: 0,  durationMins: 120, color: "violet", tag: "Creative" },
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

  function loadProtocol() {
    setEvents(DEFAULT_EVENTS);
  }

  return { events, addEvent, removeEvent, replaceAll, loadProtocol };
}
