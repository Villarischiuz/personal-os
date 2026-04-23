"use client";

import { useState } from "react";
import type { EnergyBlock, WeeklyEvent, EventTag, DatedEvent } from "@/lib/types";
import { ActiveWeekEditor } from "@/components/calendar/ActiveWeekEditor";
import { CalendarFocusStudio } from "@/components/calendar/CalendarFocusStudio";
import { QuickCapture } from "@/components/calendar/QuickCapture";
import { InboxPanel } from "@/components/calendar/InboxPanel";
import { EnergyCalendar } from "@/components/calendar/EnergyCalendar";
import { WeeklyPlanner } from "@/components/calendar/WeeklyPlanner";
import { useWeeklySchedule } from "@/lib/useWeeklySchedule";
import type { ActiveWeekRange } from "@/lib/activeWeekPlan";
import { AIBootBanner } from "@/components/global/AIBootBanner";
import { CalendarViews } from "@/components/calendar/CalendarViews";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import { Button } from "@/components/ui/button";
import { useViewportOrientation } from "@/lib/hooks/useViewportOrientation";
import { useActiveWeekStore } from "@/lib/stores/calendarStore";
import { useKanbanStore } from "@/lib/stores/workStore";
import {
  Zap,
  Inbox,
  Clock,
  Sun,
  Sunset,
  Moon,
  ArrowUpRight,
  Target,
  Maximize2,
  Minimize2,
} from "@/lib/icons";
import { cn, localDateString } from "@/lib/utils";

const TAG_STYLE: Record<EventTag, string> = {
  Deep: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  Creative: "border-violet-500/40 bg-violet-500/15 text-violet-300",
  Rest: "border-green-500/40 bg-green-500/15 text-green-300",
};

function todayDow(): 0 | 1 | 2 | 3 | 4 | 5 | 6 {
  return ((new Date().getDay() + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

type AgendaEvent = WeeklyEvent | DatedEvent;

function eventStartMinutes(event: Pick<AgendaEvent, "hour" | "minute">) {
  return event.hour * 60 + event.minute;
}

function eventEndMinutes(event: Pick<AgendaEvent, "hour" | "minute" | "durationMins">) {
  return eventStartMinutes(event) + event.durationMins;
}

export default function CalendarPage() {
  const today = new Date();
  const currentDow = todayDow();
  const todayIso = localDateString(today);
  const orientation = useViewportOrientation();
  const [selectedDow, setSelectedDow] = useState<0 | 1 | 2 | 3 | 4 | 5 | 6>(currentDow);
  const [focusMode, setFocusMode] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({
    open: false,
    ctx: null,
  });
  const { events: weeklyEvents, replaceAll, loadProtocol } = useWeeklySchedule();
  const {
    range: activeWeekRange,
    events: activeWeekEvents,
    replaceAll: replaceActiveWeek,
    setRange: setActiveWeekRange,
    resetDefaults: resetActiveWeek,
  } = useActiveWeekStore();
  const { tasks, addFull, updateTask, deleteTask } = useKanbanStore();

  const inboxTasks = tasks.filter((task) => task.status === "Inbox" && !task.energy_block);
  const calendarTasks = tasks.filter((task) => !!task.energy_block);
  const todaysOverrideEvents = activeWeekEvents.filter((event) => event.date === todayIso);
  const todaysEvents: AgendaEvent[] = (todaysOverrideEvents.length > 0
    ? todaysOverrideEvents
    : weeklyEvents.filter((event) => event.dayOfWeek === currentDow))
    .sort((a, b) => eventStartMinutes(a) - eventStartMinutes(b));
  const todaysPlannedTasks = calendarTasks.sort((a, b) => {
    const blockOrder = { Peak: 0, Trough: 1, Rebound: 2 } as const;
    return blockOrder[a.energy_block as EnergyBlock] - blockOrder[b.energy_block as EnergyBlock];
  });
  const currentMinutes = today.getHours() * 60 + today.getMinutes();
  const currentEvent =
    todaysEvents.find((event) => eventStartMinutes(event) <= currentMinutes && currentMinutes < eventEndMinutes(event)) ?? null;
  const nextEvent =
    currentEvent ?? todaysEvents.find((event) => eventStartMinutes(event) >= currentMinutes) ?? null;
  const focusCandidate =
    todaysPlannedTasks.find((task) => task.status === "Todo" || task.status === "InProgress") ?? null;
  const todaysPlannedMinutes = todaysPlannedTasks.reduce((sum, task) => sum + task.duration_mins, 0);

  function addToInbox(title: string) {
    addFull({
      title,
      category: "Admin",
      energy_required: 2,
      status: "Inbox",
      duration_mins: 30,
    });
  }

  function assignToBlock(taskId: string, block: EnergyBlock) {
    updateTask(taskId, { energy_block: block, status: "Todo" });
  }

  function removeFromBlock(taskId: string) {
    updateTask(taskId, { energy_block: undefined, status: "Inbox" });
  }

  function handleReplaceAll(events: Omit<WeeklyEvent, "id">[]) {
    replaceAll(events);
  }

  function handleApplyActiveWeek(range: ActiveWeekRange, events: Omit<DatedEvent, "id">[]) {
    setActiveWeekRange(range);
    replaceActiveWeek(events);
  }

  return (
    <div className="w-full space-y-8">
      <AIBootBanner />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendario Energia</h1>
          <p className="mt-1 text-sm text-white/40">
            Il calendario e ora il blocco principale, con una modalita concentrazione dedicata.
          </p>
        </div>
        <Button variant={focusMode ? "default" : "outline"} onClick={() => setFocusMode((current) => !current)}>
          {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          {focusMode ? "Esci da concentrazione" : "Concentrazione"}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Calendario
          </h2>
        </div>
        {focusMode ? (
          <CalendarFocusStudio
            weeklyEvents={weeklyEvents}
            selectedDow={selectedDow}
            onDowChange={setSelectedDow}
            onExit={() => setFocusMode(false)}
          />
        ) : (
          <CalendarViews
            key={`calendar-${orientation}`}
            weeklyEvents={weeklyEvents}
            selectedDow={selectedDow}
            onDowChange={setSelectedDow}
          />
        )}
      </div>

      {!focusMode && (
        <>
          <QuickCapture onCapture={addToInbox} />

          <WeeklyPlanner onApply={handleReplaceAll} onLoadProtocol={loadProtocol} />

          <ActiveWeekEditor
            key={`${activeWeekRange.start}-${activeWeekRange.end}-${activeWeekEvents.length}-${activeWeekEvents.map((event) => event.id).join("-")}`}
            range={activeWeekRange}
            events={activeWeekEvents}
            onApply={handleApplyActiveWeek}
            onReset={resetActiveWeek}
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Inbox size={14} className="text-white/40" />
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  In Arrivo
                </h2>
                {inboxTasks.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/50">
                    {inboxTasks.length}
                  </span>
                )}
              </div>
              <InboxPanel
                tasks={inboxTasks}
                onAssign={assignToBlock}
                onEdit={(task) => setSheet({ open: true, ctx: { type: "task", item: task } })}
                onDelete={deleteTask}
                onDropToInbox={removeFromBlock}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-white/40" />
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  Programma Circadiano
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {[
                  {
                    key: "peak",
                    icon: Sun,
                    title: "Peak",
                    time: "6:00 - 12:00",
                    text: "Blocco ad alta energia: deep work, analisi, coding e compiti cognitivi pesanti.",
                    accent: "text-amber-400",
                    border: "border-amber-500/20 bg-amber-500/5",
                  },
                  {
                    key: "trough",
                    icon: Sunset,
                    title: "Trough",
                    time: "13:00 - 15:00",
                    text: "Finestra di calo fisiologico: email, admin, task operativi e attivita leggere.",
                    accent: "text-sky-400",
                    border: "border-sky-500/20 bg-sky-500/5",
                  },
                  {
                    key: "rebound",
                    icon: Moon,
                    title: "Rebound",
                    time: "17:00 - 21:00",
                    text: "Risalita serale piu stabile: studio, revisione, pianificazione e allenamento mentale medio.",
                    accent: "text-violet-400",
                    border: "border-violet-500/20 bg-violet-500/5",
                  },
                ].map(({ key, icon: Icon, title, time, text, accent, border }) => (
                  <div key={key} className={`rounded-xl border p-4 ${border}`}>
                    <div className="mb-2 flex items-center gap-2">
                      <Icon size={15} className={accent} />
                      <span className={`text-sm font-semibold ${accent}`}>{title}</span>
                    </div>
                    <p className="text-xs font-medium text-white/55">{time}</p>
                    <p className="mt-2 text-xs leading-relaxed text-white/40">{text}</p>
                  </div>
                ))}
              </div>
              <EnergyCalendar
                tasks={calendarTasks}
                onRemove={removeFromBlock}
                onEdit={(task) => setSheet({ open: true, ctx: { type: "task", item: task } })}
                onDelete={deleteTask}
                onDropTask={assignToBlock}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-white/40" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60">Oggi</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    {
                      label: currentEvent ? "In corso" : "Prossimo evento",
                      value: nextEvent ? nextEvent.title : "Libero",
                      hint: nextEvent
                        ? `${String(nextEvent.hour).padStart(2, "0")}:${String(nextEvent.minute).padStart(2, "0")}`
                        : "nessun blocco fisso rimasto",
                    },
                    {
                      label: "Task pianificati",
                      value: todaysPlannedTasks.length,
                      hint: `${todaysPlannedMinutes} minuti allocati`,
                    },
                    {
                      label: "Inbox da smistare",
                      value: inboxTasks.length,
                      hint: inboxTasks.length > 0 ? "trascinali nei blocchi" : "inbox pulita",
                    },
                    {
                      label: "Task guida",
                      value: focusCandidate ? focusCandidate.title : "Nessuno",
                      hint: focusCandidate ? `${focusCandidate.energy_block} · ${focusCandidate.duration_mins}m` : "scegli il prossimo focus",
                    },
                  ].map(({ label, value, hint }) => (
                    <div key={label} className="rounded-xl border border-white/8 bg-black/10 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">{label}</p>
                      <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{value}</p>
                      <p className="mt-1 text-xs text-white/30">{hint}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Agenda di oggi</p>
                    <p className="text-xs text-white/35">
                      {todaysOverrideEvents.length > 0
                        ? "Piano datato della settimana attiva applicato alla data di oggi."
                        : "Eventi del piano ricorrente per la giornata di oggi."}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/35">
                    {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="space-y-2">
                  {todaysEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                        eventEndMinutes(event) <= currentMinutes
                          ? "border-white/6 bg-black/5 opacity-50"
                          : currentEvent?.id === event.id
                            ? "border-blue-400/35 bg-blue-500/10"
                            : "border-white/8 bg-black/10"
                      )}
                    >
                      <span className="flex-shrink-0 font-mono text-xs text-white/45">
                        {String(event.hour).padStart(2, "0")}:{String(event.minute).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "truncate text-sm font-medium text-white/85",
                            eventEndMinutes(event) <= currentMinutes && "line-through decoration-white/30"
                          )}
                        >
                          {event.title}
                        </p>
                        <p className="text-[11px] text-white/30">
                          {event.durationMins} minuti
                          {"notes" in event && event.notes ? ` · ${event.notes}` : ""}
                        </p>
                      </div>
                      {event.tag && (
                        <span className={cn("flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold", TAG_STYLE[event.tag])}>
                          {event.tag}
                        </span>
                      )}
                      {currentEvent?.id === event.id && (
                        <span className="flex-shrink-0 rounded-full border border-blue-400/35 bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
                          In corso
                        </span>
                      )}
                      <ArrowUpRight size={13} className="flex-shrink-0 text-white/20" />
                    </div>
                  ))}
                  {todaysEvents.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/8 py-6 text-center text-sm text-white/30">
                      Nessun evento fisso oggi. Puoi costruire la giornata a partire dall&apos;inbox.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <CrudSheet
        open={sheet.open}
        context={sheet.ctx}
        onClose={() => setSheet({ open: false, ctx: null })}
      />
    </div>
  );
}
