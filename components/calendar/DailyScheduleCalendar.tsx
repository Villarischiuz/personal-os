"use client";

import { useEffect, useState } from "react";
import { Plus, X, Clock, ChevronRight } from "@/lib/icons";
import { useActiveWeekStore } from "@/lib/stores/calendarStore";
import { cn, localDateString } from "@/lib/utils";
import type { WeeklyEvent, EventColor, EventTag, DatedEvent } from "@/lib/types";

const TAG_STYLE: Record<EventTag, string> = {
  Deep: "border-blue-500/50 bg-blue-500/20 text-blue-300",
  Creative: "border-violet-500/50 bg-violet-500/20 text-violet-300",
  Rest: "border-green-500/50 bg-green-500/20 text-green-300",
};

interface FormState {
  hour: number;
  minute: number;
  title: string;
  durationMins: number;
  color: EventColor;
}

const START_HOUR = 6;
const END_HOUR = 23;
const SLOT_H = 56;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const DAYS_IT = ["Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica"];
const ONE_OFF_KEY = "personal-os-oneoff";

const COLOR_MAP: Record<EventColor, { bg: string; border: string; text: string; btn: string }> = {
  blue: { bg: "bg-blue-500/20", border: "border-blue-500/40", text: "text-blue-300", btn: "bg-blue-500" },
  green: { bg: "bg-green-500/20", border: "border-green-500/40", text: "text-green-300", btn: "bg-green-500" },
  orange: { bg: "bg-orange-500/20", border: "border-orange-500/40", text: "text-orange-300", btn: "bg-orange-500" },
  violet: { bg: "bg-violet-500/20", border: "border-violet-500/40", text: "text-violet-300", btn: "bg-violet-500" },
  rose: { bg: "bg-rose-500/20", border: "border-rose-500/40", text: "text-rose-300", btn: "bg-rose-500" },
};
const COLORS: EventColor[] = ["blue", "green", "orange", "violet", "rose"];

let nextId = 500;
function genId() {
  nextId += 1;
  return `oo-${nextId}`;
}

function jsToWeekDay(d: Date): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return ((d.getDay() + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function sortByTime<T extends { hour: number; minute: number }>(events: T[]) {
  return [...events].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
}

function getEventState(hour: number, minute: number, durationMins: number, isToday: boolean, nowMinutes: number) {
  if (!isToday) {
    return { isPast: false, isOngoing: false };
  }

  const start = hour * 60 + minute;
  const end = start + durationMins;

  return {
    isPast: end <= nowMinutes,
    isOngoing: start <= nowMinutes && nowMinutes < end,
  };
}

interface Props {
  weeklyEvents: WeeklyEvent[];
  selectedDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onDayChange: (d: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  focusMode?: boolean;
}

export function DailyScheduleCalendar({
  weeklyEvents,
  selectedDayOfWeek,
  onDayChange,
  focusMode = false,
}: Props) {
  const activeWeekEvents = useActiveWeekStore((state) => state.events);
  const [oneOffs, setOneOffs] = useState<DatedEvent[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      return JSON.parse(localStorage.getItem(ONE_OFF_KEY) || "[]") as DatedEvent[];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    localStorage.setItem(ONE_OFF_KEY, JSON.stringify(oneOffs));
  }, [oneOffs]);

  const today = new Date();
  const todayDow = jsToWeekDay(today);
  const diffDays = (selectedDayOfWeek - todayDow + 7) % 7;
  const displayDate = new Date(today);
  displayDate.setDate(today.getDate() + diffDays);
  const displayIso = localDateString(displayDate);

  const dayLabel = DAYS_IT[selectedDayOfWeek];
  const dateLabel = displayDate.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const isToday = selectedDayOfWeek === todayDow;
  const seededEvents = sortByTime(activeWeekEvents.filter((event) => event.date === displayIso));
  const weekEvents = seededEvents.length === 0
    ? sortByTime(weeklyEvents.filter((event) => event.dayOfWeek === selectedDayOfWeek))
    : [];
  const dayOneOffs = sortByTime([
    ...seededEvents,
    ...oneOffs.filter((event) => event.date === displayIso),
  ]);

  function goDay(delta: -1 | 1) {
    onDayChange(((selectedDayOfWeek + delta + 7) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  }

  function openForm(hour: number, minute: number) {
    setForm({ hour, minute, title: "", durationMins: 60, color: "blue" });
  }

  function addOneOff() {
    if (!form || !form.title.trim()) {
      return;
    }

    setOneOffs((prev) => [
      ...prev,
      {
        id: genId(),
        title: form.title.trim(),
        date: displayIso,
        hour: form.hour,
        minute: form.minute,
        durationMins: form.durationMins,
        color: form.color,
      },
    ]);
    setForm(null);
  }

  function removeOneOff(id: string) {
    setOneOffs((prev) => prev.filter((event) => event.id !== id));
  }

  const totalH = HOURS.length * SLOT_H;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentIndicator =
    isToday && now.getHours() >= START_HOUR && now.getHours() < END_HOUR
      ? (now.getHours() - START_HOUR) * SLOT_H + (now.getMinutes() / 60) * SLOT_H
      : null;

  function eventTop(hour: number, minute: number) {
    return (hour - START_HOUR) * SLOT_H + (minute / 60) * SLOT_H;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/3">
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-3">
        <h3 className="text-sm font-semibold text-white/70">Agenda Giornaliera</h3>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goDay(-1)}
            className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
          >
            <ChevronRight size={13} className="rotate-180" />
          </button>
          <div className="text-center">
            <span className={cn("text-xs font-semibold", isToday ? "text-blue-400" : "text-white/70")}>
              {isToday ? "Oggi" : dayLabel}
            </span>
            <span className="ml-1.5 text-[10px] text-white/30">{dateLabel}</span>
          </div>
          <button
            onClick={() => goDay(1)}
            className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/8 hover:text-white/70"
          >
            <ChevronRight size={13} />
          </button>
          {!isToday && (
            <button
              onClick={() => onDayChange(todayDow)}
              className="ml-1 rounded-md border border-blue-500/30 px-2 py-0.5 text-[10px] text-blue-400 transition-colors hover:bg-blue-500/10"
            >
              Oggi
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded bg-white/20" />
          <span className="text-[10px] text-white/30">Piano ricorrente</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded border border-amber-400/70 bg-amber-400/25" />
          <span className="text-[10px] text-white/30">Settimana attiva</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-3 rounded border border-white/30 bg-transparent" />
          <span className="text-[10px] text-white/30">One-off</span>
        </div>
        {seededEvents.length > 0 && (
          <span className="ml-auto rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-300">
            Giorno agganciato al piano datato
          </span>
        )}
      </div>

      <div className="relative overflow-hidden" style={{ height: totalH }}>
        {HOURS.map((hour) => {
          const top = (hour - START_HOUR) * SLOT_H;
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-start border-t border-white/5"
              style={{ top, height: SLOT_H }}
            >
              <span className="w-14 flex-shrink-0 select-none pl-4 pt-1.5 text-[10px] text-white/20">
                {String(hour).padStart(2, "0")}:00
              </span>
              <div
                className="absolute left-14 right-0"
                style={{ top: SLOT_H / 2, borderTop: "1px dashed rgba(255,255,255,0.03)" }}
              />
              <div className="relative flex-1">
                {!focusMode && (
                  <>
                    <button
                      onClick={() => openForm(hour, 0)}
                      className="group absolute inset-x-0 top-0 flex h-[50%] items-center justify-end pr-3 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <span className="flex items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">
                        <Plus size={8} /> Aggiungi
                      </span>
                    </button>
                    <button
                      onClick={() => openForm(hour, 30)}
                      className="group absolute inset-x-0 bottom-0 flex h-[50%] items-center justify-end pr-3 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <span className="flex items-center gap-1 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/40">
                        <Plus size={8} /> Aggiungi
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {currentIndicator !== null && (
          <div
            className="pointer-events-none absolute left-14 right-0 z-20 flex items-center gap-1.5"
            style={{ top: currentIndicator }}
          >
            <div className="-ml-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-400" />
            <div className="h-px flex-1 bg-blue-400/50" />
          </div>
        )}

        {weekEvents.map((event) => {
          const color = COLOR_MAP[event.color];
          const top = eventTop(event.hour, event.minute);
          const height = Math.max((event.durationMins / 60) * SLOT_H - 4, 20);
          const state = getEventState(event.hour, event.minute, event.durationMins, isToday, nowMinutes);

          return (
            <div
              key={event.id}
              className={cn(
                "absolute z-10 overflow-hidden rounded-lg px-2.5 py-1.5",
                color.bg,
                state.isPast && "opacity-45",
                state.isOngoing && "ring-1 ring-blue-400/60"
              )}
              style={{ left: 56, right: 64, top: top + 2, height }}
              title="Evento del piano ricorrente"
            >
              <div className="flex items-start justify-between gap-1">
                <p
                  className={cn(
                    "truncate text-xs font-medium",
                    color.text,
                    state.isPast && "line-through decoration-white/30"
                  )}
                >
                  {event.title}
                </p>
                {event.tag && height > 24 && (
                  <span
                    className={cn(
                      "flex-shrink-0 rounded-full border px-1.5 py-px text-[8px] font-bold leading-tight",
                      TAG_STYLE[event.tag]
                    )}
                  >
                    {event.tag}
                  </span>
                )}
              </div>
              {height > 30 && (
                <p className="mt-0.5 flex items-center gap-1 text-[9px] text-white/30">
                  <Clock size={8} />
                  {event.durationMins}m
                </p>
              )}
            </div>
          );
        })}

        {dayOneOffs.map((event) => {
          const color = COLOR_MAP[event.color];
          const top = eventTop(event.hour, event.minute);
          const height = Math.max((event.durationMins / 60) * SLOT_H - 4, 20);
          const state = getEventState(event.hour, event.minute, event.durationMins, isToday, nowMinutes);

          return (
            <div
              key={event.id}
              className={cn(
                "group absolute z-10 overflow-hidden rounded-lg border px-2.5 py-1.5",
                color.bg,
                color.border,
                event.locked && "shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]",
                state.isPast && "opacity-55",
                state.isOngoing && "ring-1 ring-blue-400/60"
              )}
              style={{ left: 56, right: 8, top: top + 2, height }}
              title={event.locked ? "Evento della settimana attiva" : "Evento one-off"}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate text-xs font-medium",
                      color.text,
                      state.isPast && "line-through decoration-white/30"
                    )}
                  >
                    {event.title}
                  </p>
                  {height > 44 && event.notes && (
                    <p className="mt-0.5 line-clamp-2 text-[9px] text-white/35">{event.notes}</p>
                  )}
                </div>
                {event.locked ? (
                  <span className="flex-shrink-0 rounded-full border border-amber-400/40 bg-amber-400/15 px-1.5 py-px text-[8px] font-semibold text-amber-200">
                    Piano
                  </span>
                ) : (
                  <button
                    onClick={() => removeOneOff(event.id)}
                    className="flex-shrink-0 rounded p-0.5 text-white/30 opacity-0 transition-all group-hover:opacity-100 hover:text-white/70"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
              {height > 30 && (
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1 text-[9px] text-white/30">
                    <Clock size={8} />
                    {event.durationMins}m
                  </p>
                  {state.isOngoing && (
                    <span className="rounded-full border border-blue-400/35 bg-blue-400/10 px-1.5 py-px text-[8px] font-semibold text-blue-300">
                      In corso
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!focusMode && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-80 rounded-2xl border border-white/15 bg-[hsl(222,47%,9%)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">
                Aggiungi — {String(form.hour).padStart(2, "0")}:{String(form.minute).padStart(2, "0")} · {dayLabel}
              </h4>
              <button onClick={() => setForm(null)} className="text-white/30 hover:text-white/70">
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={form.title}
              onChange={(e) => setForm((currentForm) => currentForm && { ...currentForm, title: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addOneOff()}
              placeholder="Titolo impegno..."
              className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50"
            />
            <div className="mb-3">
              <label className="mb-1.5 block text-xs text-white/40">Durata</label>
              <select
                value={form.durationMins}
                onChange={(e) =>
                  setForm((currentForm) =>
                    currentForm ? { ...currentForm, durationMins: Number(e.target.value) } : currentForm
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              >
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
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setForm((currentForm) => currentForm && { ...currentForm, color })}
                    className={cn(
                      "h-6 w-6 rounded-full transition-all",
                      COLOR_MAP[color].btn,
                      form.color === color
                        ? "ring-2 ring-white/50 ring-offset-1 ring-offset-[hsl(222,47%,9%)]"
                        : "opacity-50"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addOneOff}
                disabled={!form.title.trim()}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-40"
              >
                Aggiungi
              </button>
              <button
                onClick={() => setForm(null)}
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
