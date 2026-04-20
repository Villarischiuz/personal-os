"use client";

import { useEffect, useState } from "react";

const DEFAULT_ISO = "2026-05-20T09:00:00";
const STORAGE_KEY = "personal-os-exam-date";

function getTarget(): Date {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Date(stored) : new Date(DEFAULT_ISO);
  } catch {
    return new Date(DEFAULT_ISO);
  }
}

export function ExamCountdown() {
  const [remaining, setRemaining] = useState(0);
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(DEFAULT_ISO.slice(0, 16));
  const [targetLabel, setTargetLabel] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setInput(stored.slice(0, 16));
    const target = getTarget();
    setTargetLabel(
      target.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    const tick = () => setRemaining(Math.max(0, getTarget().getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 50);
    return () => clearInterval(id);
  }, []);

  function saveDate() {
    const d = new Date(input);
    localStorage.setItem(STORAGE_KEY, d.toISOString());
    setTargetLabel(
      d.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setEditing(false);
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1_000);
  const ms = Math.floor((remaining % 1_000) / 10);

  const urgencyClass =
    days < 3 ? "text-red-400" : days < 10 ? "text-amber-400" : "text-green-400";

  return (
    <div className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
          Countdown Esame Polito
        </p>
        <button
          onClick={() => setEditing((v) => !v)}
          className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
        >
          {editing ? "✕" : "modifica data"}
        </button>
      </div>

      {editing ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="datetime-local"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500/50"
          />
          <button
            onClick={saveDate}
            className="rounded-lg bg-blue-600/30 border border-blue-500/30 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-600/40 transition-colors"
          >
            Salva
          </button>
        </div>
      ) : (
        <>
          <div className={`mt-1.5 font-mono font-black tracking-tight ${urgencyClass}`}>
            <span className="text-3xl">{days}d </span>
            <span className="text-2xl">
              {String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-base text-opacity-70">.{String(ms).padStart(2, "0")}</span>
          </div>
          <p className="mt-1 text-[11px] text-white/25">{targetLabel}</p>
        </>
      )}
    </div>
  );
}
