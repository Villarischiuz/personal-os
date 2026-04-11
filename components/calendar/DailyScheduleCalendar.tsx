"use client";

import { useState, useEffect } from "react";
import { Plus, X, Clock, ChevronRight } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { WeeklyEvent, EventColor } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────
interface OneOffEvent {
  id: string;
  title: string;
  date: string;   // "YYYY-MM-DD"
  hour: number;
  minute: number;
  durationMins: number;
  color: EventColor;
}

interface FormState {
  hour: number;
  minute: number;
  title: string;
  durationMins: number;
  color: EventColor;
}

// ─── Constants ────────────────────────────────────────────────
const START_HOUR = 6;
const END_HOUR = 23;
const SLOT_H = 56;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const DAYS_IT = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const ONE_OFF_KEY = "personal-os-oneoff";

const COLOR_MAP: Record<EventColor, { bg: string; border: string; text: string; btn: string }> = {
  blue:   { bg: "bg-blue-500/20",   border: "border-blue-500/40",   text: "text-blue-300",   btn: "bg-blue-500" },
  green:  { bg: "bg-green-500/20",  border: "border-green-500/40",  text: "text-green-300",  btn: "bg-green-500" },
  orange: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300", btn: "bg-orange-500" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300", btn: "bg-violet-500" },
  rose:   { bg: "bg-rose-500/20",   border: "border-rose-500/40",   text: "text-rose-300",   btn: "bg-rose-500" },
};
const COLORS: EventColor[] = ["blue", "green", "orange", "violet", "rose"];

let _nextId = 500;
function genId() { return `oo-${++_nextId}`; }

function isoDate(d: Date) { return d.toISOString().split("T")[0]; }

// dayOfWeek: 0=Mon … 6=Sun (matching WeeklyEvent)
function jsToWeekDay(d: Date): 0|1|2|3|4|5|6 {
  return ((d.getDay() + 6) % 7) as 0|1|2|3|4|5|6;
}

// ─── Props ────────────────────────────────────────────────────
interface Props {
  weeklyEvents: WeeklyEvent[];
  selectedDayOfWeek: 0|1|2|3|4|5|6;
  onDayChange: (d: 0|1|2|3|4|5|6) => void;
}

// ─── Component ────────────────────────────────────────────────
export function DailyScheduleCalendar({ weeklyEvents, selectedDayOfWeek, onDayChange }: Props) {
  const [oneOffs, setOneOffs] = useState<OneOffEvent[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(ONE_OFF_KEY) || "[]"); }
    catch { return []; }
  });
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    localStorage.setItem(ONE_OFF_KEY, JSON.stringify(oneOffs));
  }, [oneOffs]);

  // Compute the display date for the selected day-of-week
  const today = new Date();
  const todayDow = jsToWeekDay(today);
  const diffDays = (selectedDayOfWeek - todayDow + 7) % 7;
  const displayDate = new Date(today);
  displayDate.setDate(today.getDate() + diffDays);
  const displayIso = isoDate(displayDate);

  const dayLabel = DAYS_IT[selectedDayOfWeek];
  const dateLabel = displayDate.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const isToday = selectedDayOfWeek === todayDow;

  // Events for this day
  const weekEvents = weeklyEvents.filter((e) => e.dayOfWeek === selectedDayOfWeek);
  const dayOneOffs = oneOffs.filter((e) => e.date === displayIso);

  function goDay(delta: -1 | 1) {
    onDayChange(((selectedDayOfWeek + delta + 7) % 7) as 0|1|2|3|4|5|6);
  }

  function openForm(hour: number, minute: number) {
    setForm({ hour, minute, title: "", durationMins: 60, color: "blue" });
  }

  function addOneOff() {
    if (!form || !form.title.trim()) return;
    setOneOffs((prev) => [
      ...prev,
      { id: genId(), title: form.title.trim(), date: displayIso, hour: form.hour, minute: form.minute, durationMins: form.durationMins, color: form.color },
    ]);
    setForm(null);
  }

  function removeOneOff(id: string) {
    setOneOffs((prev) => prev.filter((e) => e.id !== id));
  }

  const totalH = HOURS.length * SLOT_H;

  const now = new Date();
  const currentIndicator = isToday && now.getHours() >= START_HOUR && now.getHours() < END_HOUR
    ? (now.getHours() - START_HOUR) * SLOT_H + (now.getMinutes() / 60) * SLOT_H
    : null;

  function eventTop(hour: number, minute: number) {
    return (hour - START_HOUR) * SLOT_H + (minute / 60) * SLOT_H;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <h3 className="text-sm font-semibold text-white/70">Agenda Giornaliera</h3>

        {/* Day navigation */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => goDay(-1)} className="rounded-md p-1.5 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors">
            <ChevronRight size={13} className="rotate-180" />
          </button>
          <div className="text-center">
            <span className={cn("text-xs font-semibold", isToday ? "text-blue-400" : "text-white/70")}>
              {isToday ? "Oggi" : dayLabel}
            </span>
            <span className="ml-1.5 text-[10px] text-white/30">{dateLabel}</span>
          </div>
          <button onClick={() => goDay(1)} className="rounded-md p-1.5 text-white/30 hover:bg-white/8 hover:text-white/70 transition-colors">
            <ChevronRight size={13} />
          </button>
          {!isToday && (
            <button
              onClick={() => onDayChange(todayDow)}
              className="ml-1 rounded-md border border-blue-500/30 px-2 py-0.5 text-[10px] text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              Oggi
            </button>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 border-b border-white/5 px-5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded bg-white/20" />
          <span className="text-[10px] text-white/30">Piano settimana</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded border border-white/30" style={{ background: "transparent" }} />
          <span className="text-[10px] text-white/30">One-off</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative overflow-hidden" style={{ height: totalH }}>
        {HOURS.map((h) => {
          const top = (h - START_HOUR) * SLOT_H;
          return (
            <div key={h} className="absolute left-0 right-0 flex items-start border-t border-white/5" style={{ top, height: SLOT_H }}>
              <span className="w-14 flex-shrink-0 pl-4 pt-1.5 text-[10px] text-white/20 select-none">
                {String(h).padStart(2, "0")}:00
              </span>
              <div className="absolute left-14 right-0" style={{ top: SLOT_H / 2, borderTop: "1px dashed rgba(255,255,255,0.03)" }} />
              <div className="relative flex-1">
                <button onClick={() => openForm(h, 0)} className="group absolute inset-x-0 top-0 flex h-[50%] items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">
                    <Plus size={8} /> Aggiungi
                  </span>
                </button>
                <button onClick={() => openForm(h, 30)} className="group absolute inset-x-0 bottom-0 flex h-[50%] items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="flex items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">
                    <Plus size={8} /> Aggiungi
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Current time */}
        {currentIndicator !== null && (
          <div className="absolute left-14 right-0 z-20 flex items-center gap-1.5 pointer-events-none" style={{ top: currentIndicator }}>
            <div className="h-2 w-2 rounded-full bg-blue-400 -ml-1 flex-shrink-0" />
            <div className="h-px flex-1 bg-blue-400/50" />
          </div>
        )}

        {/* Weekly events (base — not deletable here) */}
        {weekEvents.map((ev) => {
          const c = COLOR_MAP[ev.color];
          const top = eventTop(ev.hour, ev.minute);
          const height = Math.max((ev.durationMins / 60) * SLOT_H - 4, 20);
          return (
            <div
              key={ev.id}
              className={cn("absolute z-10 rounded-lg px-2.5 py-1.5 overflow-hidden", c.bg)}
              style={{ left: 56, right: 64, top: top + 2, height }}
              title="Evento del piano settimanale"
            >
              <p className={cn("text-xs font-medium truncate", c.text)}>{ev.title}</p>
              {height > 30 && (
                <p className="flex items-center gap-1 text-[9px] text-white/30 mt-0.5">
                  <Clock size={8} />{ev.durationMins}m
                </p>
              )}
            </div>
          );
        })}

        {/* One-off events (deletable) */}
        {dayOneOffs.map((ev) => {
          const c = COLOR_MAP[ev.color];
          const top = eventTop(ev.hour, ev.minute);
          const height = Math.max((ev.durationMins / 60) * SLOT_H - 4, 20);
          return (
            <div
              key={ev.id}
              className={cn("group absolute z-10 rounded-lg border px-2.5 py-1.5 overflow-hidden", c.bg, c.border)}
              style={{ left: 56, right: 8, top: top + 2, height }}
            >
              <div className="flex items-start justify-between gap-1">
                <p className={cn("text-xs font-medium truncate", c.text)}>{ev.title}</p>
                <button onClick={() => removeOneOff(ev.id)} className="flex-shrink-0 opacity-0 group-hover:opacity-100 rounded p-0.5 text-white/30 hover:text-white/70 transition-all">
                  <X size={10} />
                </button>
              </div>
              {height > 30 && (
                <p className="flex items-center gap-1 text-[9px] text-white/30 mt-0.5">
                  <Clock size={8} />{ev.durationMins}m
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add event modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-white/15 bg-[hsl(222,47%,9%)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                Aggiungi — {String(form.hour).padStart(2,"0")}:{String(form.minute).padStart(2,"0")} · {dayLabel}
              </h4>
              <button onClick={() => setForm(null)} className="text-white/30 hover:text-white/70">
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => f && { ...f, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addOneOff()}
              placeholder="Titolo impegno…"
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50"
            />
            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-white/40">Durata</label>
              <select value={form.durationMins} onChange={(e) => setForm((f) => f && { ...f, durationMins: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50">
                <option value={30}>30 minuti</option>
                <option value={60}>1 ora</option>
                <option value={90}>1h 30m</option>
                <option value={120}>2 ore</option>
                <option value={180}>3 ore</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="mb-1.5 block text-xs text-white/40">Colore</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setForm((f) => f && { ...f, color: c })} className={cn("h-6 w-6 rounded-full transition-all", COLOR_MAP[c].btn, form.color === c ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[hsl(222,47%,9%)]" : "opacity-50")} />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addOneOff} disabled={!form.title.trim()} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors">
                Aggiungi
              </button>
              <button onClick={() => setForm(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:bg-white/5">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
