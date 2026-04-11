"use client";

import { useState } from "react";
import { MOCK_TASKS } from "@/lib/mock-data";
import type { Task, EnergyBlock } from "@/lib/types";
import { QuickCapture } from "@/components/calendar/QuickCapture";
import { InboxPanel } from "@/components/calendar/InboxPanel";
import { EnergyCalendar } from "@/components/calendar/EnergyCalendar";
import { Zap, Inbox } from "@/lib/icons";

let _nextId = 100;
function genId() {
  return `t-cap-${++_nextId}`;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const inboxTasks = tasks.filter((t) => t.status === "Inbox" && !t.energy_block);
  const calendarTasks = tasks.filter((t) => !!t.energy_block);

  function addToInbox(title: string) {
    const now = new Date().toISOString().split("T")[0];
    const newTask: Task = {
      id: genId(),
      title,
      category: "Admin",
      energy_required: 2,
      status: "Inbox",
      duration_mins: 30,
      created_at: now,
    };
    setTasks((prev) => [newTask, ...prev]);
  }

  function assignToBlock(taskId: string, block: EnergyBlock) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, energy_block: block, status: "Todo" as const }
          : t
      )
    );
  }

  function removeFromBlock(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, energy_block: undefined, status: "Inbox" as const }
          : t
      )
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Energy Calendar</h1>
        <p className="mt-1 text-sm text-white/40">
          Capture tasks, then assign them to your circadian rhythm windows.
        </p>
      </div>

      {/* Quick Capture */}
      <QuickCapture onCapture={addToInbox} />

      {/* Body — two columns on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left: Inbox */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Inbox size={14} className="text-white/40" />
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Inbox
            </h2>
            {inboxTasks.length > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-white/50">
                {inboxTasks.length}
              </span>
            )}
          </div>
          <InboxPanel tasks={inboxTasks} onAssign={assignToBlock} />
        </div>

        {/* Right: Energy Calendar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-white/40" />
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Circadian Schedule
            </h2>
          </div>
          <EnergyCalendar tasks={calendarTasks} onRemove={removeFromBlock} />
        </div>
      </div>
    </div>
  );
}
