"use client";

import { useEffect, useState } from "react";
import { useTargetStore, toDateTimeLocalValue } from "@/lib/stores/targetStore";

export function ExamCountdown() {
  const dseExamAt = useTargetStore((state) => state.dse_exam_at);
  const setDseExamAt = useTargetStore((state) => state.setDseExamAt);
  const [remaining, setRemaining] = useState(0);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(() => toDateTimeLocalValue(dseExamAt));

  useEffect(() => {
    setInput(toDateTimeLocalValue(dseExamAt));
  }, [dseExamAt]);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(dseExamAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dseExamAt]);

  function saveDate() {
    setDseExamAt(new Date(input).toISOString());
    setEditing(false);
  }

  const targetLabel = new Date(dseExamAt).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1_000);

  const urgencyClass =
    days < 3 ? "text-red-400" : days < 10 ? "text-amber-400" : "text-green-400";

  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
            Countdown Esame DSE
          </p>
          <p className="mt-1 text-[11px] text-white/25">{targetLabel}</p>
        </div>
        <button
          onClick={() => setEditing((value) => !value)}
          className="text-[10px] text-white/25 transition-colors hover:text-white/50"
        >
          {editing ? "chiudi" : "modifica data"}
        </button>
      </div>

      {editing ? (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="datetime-local"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-mono text-white focus:border-blue-500/50 focus:outline-none"
          />
          <button
            onClick={saveDate}
            className="rounded-lg border border-blue-500/30 bg-blue-600/30 px-3 py-1.5 text-xs font-bold text-blue-400 transition-colors hover:bg-blue-600/40"
          >
            Salva
          </button>
        </div>
      ) : (
        <div className={`mt-2 font-mono font-black tracking-tight ${urgencyClass}`}>
          <span className="text-3xl">{days}d </span>
          <span className="text-2xl">
            {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
