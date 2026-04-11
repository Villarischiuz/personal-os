"use client";

import { useState } from "react";
import { Plus, X, Clock } from "@/lib/icons";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────
type EventColor = "blue" | "green" | "orange" | "violet" | "rose";

interface CalendarEvent {
  id: string;
  title: string;
  hour: number;      // 6–22
  minute: number;    // 0 or 30
  durationMins: number;
  color: EventColor;
}

// ─── Constants ────────────────────────────────────────────────
const START_HOUR = 6;
const END_HOUR = 23;
const SLOT_H = 56; // px per hour

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

const COLOR_MAP: Record<EventColor, { bg: string; border: string; text: string; btn: string }> = {
  blue:   { bg: "bg-blue-500/20",   border: "border-blue-500/40",   text: "text-blue-300",   btn: "bg-blue-500" },
  green:  { bg: "bg-green-500/20",  border: "border-green-500/40",  text: "text-green-300",  btn: "bg-green-500" },
  orange: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300", btn: "bg-orange-500" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300", btn: "bg-violet-500" },
  rose:   { bg: "bg-rose-500/20",   border: "border-rose-500/40",   text: "text-rose-300",   btn: "bg-rose-500" },
};

const COLORS: EventColor[] = ["blue", "green", "orange", "violet", "rose"];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: "ev-1", title: "Allenamento",          hour: 7,  minute: 0,  durationMins: 60,  color: "orange" },
  { id: "ev-2", title: "Sessione deep work",   hour: 9,  minute: 0,  durationMins: 120, color: "blue"   },
  { id: "ev-3", title: "Pranzo",               hour: 13, minute: 0,  durationMins: 60,  color: "green"  },
  { id: "ev-4", title: "Studio / lettura",     hour: 17, minute: 30, durationMins: 90,  color: "violet" },
];

// ─── Add Event Form ────────────────────────────────────────────
interface FormState {
  hour: number;
  minute: number;
  title: string;
  durationMins: number;
  color: EventColor;
}

let _nextEventId = 100;

// ─── Component ────────────────────────────────────────────────
export function DailyScheduleCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [form, setForm] = useState<FormState | null>(null);

  const totalHeight = HOURS.length * SLOT_H;

  function openForm(hour: number, minute: number) {
    setForm({ hour, minute, title: "", durationMins: 60, color: "blue" });
  }

  function closeForm() {
    setForm(null);
  }

  function addEvent() {
    if (!form || !form.title.trim()) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `ev-${++_nextEventId}`,
        title: form.title.trim(),
        hour: form.hour,
        minute: form.minute,
        durationMins: form.durationMins,
        color: form.color,
      },
    ]);
    closeForm();
  }

  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  function eventTop(e: CalendarEvent) {
    return (e.hour - START_HOUR) * SLOT_H + (e.minute / 60) * SLOT_H;
  }

  function eventHeight(e: CalendarEvent) {
    return (e.durationMins / 60) * SLOT_H;
  }

  const now = new Date();
  const currentMinuteOffset =
    now.getHours() >= START_HOUR && now.getHours() < END_HOUR
      ? (now.getHours() - START_HOUR) * SLOT_H + (now.getMinutes() / 60) * SLOT_H
      : null;

  return (
    <div className="rounded-xl border border-white/10 bg-white/3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <h3 className="text-sm font-semibold text-white/70">
          Programma Giornaliero
        </h3>
        <p className="text-xs text-white/30">
          {new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <div className="flex">
        {/* Timeline */}
        <div className="relative flex-1 overflow-hidden">
          {/* Hour rows */}
          <div className="relative" style={{ height: totalHeight }}>
            {HOURS.map((h) => {
              const topPx = (h - START_HOUR) * SLOT_H;
              return (
                <div
                  key={h}
                  className="absolute left-0 right-0 flex items-start border-t border-white/5"
                  style={{ top: topPx, height: SLOT_H }}
                >
                  {/* Time label */}
                  <span className="w-14 flex-shrink-0 pl-4 pt-1.5 text-[10px] text-white/25 select-none">
                    {String(h).padStart(2, "0")}:00
                  </span>

                  {/* Half-hour divider (visual only) */}
                  <div
                    className="absolute left-14 right-0 border-t border-dashed border-white/[0.04]"
                    style={{ top: SLOT_H / 2 }}
                  />

                  {/* Click targets — full hour and half-hour */}
                  <div className="relative flex-1">
                    <button
                      onClick={() => openForm(h, 0)}
                      className="group absolute inset-x-0 top-0 flex h-[50%] items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="flex items-center gap-1 rounded-md bg-white/8 px-2 py-0.5 text-[10px] text-white/50">
                        <Plus size={9} /> Aggiungi
                      </span>
                    </button>
                    <button
                      onClick={() => openForm(h, 30)}
                      className="group absolute inset-x-0 bottom-0 flex h-[50%] items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <span className="flex items-center gap-1 rounded-md bg-white/8 px-2 py-0.5 text-[10px] text-white/50">
                        <Plus size={9} /> Aggiungi
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Current time indicator */}
            {currentMinuteOffset !== null && (
              <div
                className="absolute left-14 right-0 z-20 flex items-center gap-1.5 pointer-events-none"
                style={{ top: currentMinuteOffset }}
              >
                <div className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0 -ml-1" />
                <div className="h-px flex-1 bg-blue-400/60" />
              </div>
            )}

            {/* Events */}
            {events.map((ev) => {
              const c = COLOR_MAP[ev.color];
              const top = eventTop(ev);
              const height = Math.max(eventHeight(ev), 24);
              return (
                <div
                  key={ev.id}
                  className={cn(
                    "group absolute left-14 right-2 z-10 rounded-lg border px-2.5 py-1.5 cursor-default overflow-hidden",
                    c.bg, c.border
                  )}
                  style={{ top: top + 2, height: height - 4 }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className={cn("text-xs font-medium leading-snug truncate", c.text)}>
                      {ev.title}
                    </p>
                    <button
                      onClick={() => removeEvent(ev.id)}
                      className="flex-shrink-0 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  {height > 32 && (
                    <p className="flex items-center gap-1 text-[9px] text-white/30 mt-0.5">
                      <Clock size={8} />
                      {ev.durationMins}m
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add event modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-white/15 bg-[hsl(222,47%,9%)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                Nuovo impegno — {String(form.hour).padStart(2, "0")}:{String(form.minute).padStart(2, "0")}
              </h4>
              <button onClick={closeForm} className="text-white/30 hover:text-white/70">
                <X size={16} />
              </button>
            </div>

            {/* Title */}
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => f && { ...f, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addEvent()}
              placeholder="Titolo impegno…"
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50"
            />

            {/* Duration */}
            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-white/40">Durata</label>
              <select
                value={form.durationMins}
                onChange={(e) => setForm((f) => f && { ...f, durationMins: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              >
                <option value={30}>30 minuti</option>
                <option value={60}>1 ora</option>
                <option value={90}>1h 30m</option>
                <option value={120}>2 ore</option>
                <option value={180}>3 ore</option>
              </select>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-white/40">Colore</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => f && { ...f, color: c })}
                    className={cn(
                      "h-6 w-6 rounded-full transition-all",
                      COLOR_MAP[c].btn,
                      form.color === c ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[hsl(222,47%,9%)]" : "opacity-50"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={addEvent}
                disabled={!form.title.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
              >
                Aggiungi
              </button>
              <button
                onClick={closeForm}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:bg-white/5"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
