"use client";

import { useState } from "react";
import type { EnergyBlock, WeeklyEvent } from "@/lib/types";
import { QuickCapture } from "@/components/calendar/QuickCapture";
import { InboxPanel } from "@/components/calendar/InboxPanel";
import { EnergyCalendar } from "@/components/calendar/EnergyCalendar";
import { WeeklyPlanner } from "@/components/calendar/WeeklyPlanner";
import { useWeeklySchedule } from "@/lib/useWeeklySchedule";
import { AIBootBanner } from "@/components/global/AIBootBanner";
import { CalendarViews } from "@/components/calendar/CalendarViews";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import { useKanbanStore } from "@/lib/stores/workStore";
import { Zap, Inbox, Clock, Sun, Sunset, Moon, ArrowUpRight, Target } from "@/lib/icons";

// 0=Lun … 6=Dom (compatibile con WeeklyEvent)
function todayDow(): 0|1|2|3|4|5|6 {
  return ((new Date().getDay() + 6) % 7) as 0|1|2|3|4|5|6;
}

export default function CalendarPage() {
  const today = new Date();
  const currentDow = todayDow();
  const [selectedDow, setSelectedDow] = useState<0|1|2|3|4|5|6>(currentDow);
  const [sheet, setSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({
    open: false,
    ctx: null,
  });
  const { events: weeklyEvents, replaceAll } = useWeeklySchedule();
  const { tasks, addFull, updateTask, deleteTask } = useKanbanStore();

  const inboxTasks = tasks.filter((t) => t.status === "Inbox" && !t.energy_block);
  const calendarTasks = tasks.filter((t) => !!t.energy_block);
  const todaysEvents = weeklyEvents
    .filter((event) => event.dayOfWeek === currentDow)
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
  const todaysPlannedTasks = calendarTasks.sort((a, b) => {
    const blockOrder = { Peak: 0, Trough: 1, Rebound: 2 } as const;
    return blockOrder[a.energy_block as EnergyBlock] - blockOrder[b.energy_block as EnergyBlock];
  });
  const currentMinutes = today.getHours() * 60 + today.getMinutes();
  const nextEvent =
    todaysEvents.find((event) => event.hour * 60 + event.minute >= currentMinutes) ?? null;
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

  return (
    <div className="w-full space-y-8">
      {/* AI Boot Banner */}
      <AIBootBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Calendario Energia</h1>
        <p className="mt-1 text-sm text-white/40">
          Cattura i task e assegnali alle finestre del tuo ritmo circadiano.
        </p>
      </div>

      {/* Quick Capture */}
      <QuickCapture onCapture={addToInbox} />

      {/* Weekly Planner (collapsibile) */}
      <WeeklyPlanner onApply={handleReplaceAll} />

      {/* Task Inbox + Energy Calendar */}
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
                text: "Finestra di calo fisiologico: email, admin, task operativi e attività leggere.",
                accent: "text-sky-400",
                border: "border-sky-500/20 bg-sky-500/5",
              },
              {
                key: "rebound",
                icon: Moon,
                title: "Rebound",
                time: "17:00 - 21:00",
                text: "Risalita serale più stabile: studio, revisione, pianificazione e allenamento mentale medio.",
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
                  label: "Prossimo evento",
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
                  Eventi settimanali di oggi e task già assegnati ai blocchi.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/35">
                {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
              </span>
            </div>
            <div className="space-y-2">
              {todaysEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-black/10 px-3 py-2.5">
                  <span className="font-mono text-xs text-white/45">
                    {String(event.hour).padStart(2, "0")}:{String(event.minute).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white/85">{event.title}</p>
                    <p className="text-[11px] text-white/30">{event.durationMins} minuti</p>
                  </div>
                  <ArrowUpRight size={13} className="text-white/20" />
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

      {/* Multi-view Calendar Engine */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-white/40" />
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
            Calendario
          </h2>
        </div>
        <CalendarViews
          weeklyEvents={weeklyEvents}
          selectedDow={selectedDow}
          onDowChange={setSelectedDow}
        />
      </div>
      <CrudSheet
        open={sheet.open}
        context={sheet.ctx}
        onClose={() => setSheet({ open: false, ctx: null })}
      />
    </div>
  );
}
