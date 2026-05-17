"use client";
import { useEffect } from "react";
import { Play, Pause, RotateCcw } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useTodayStore } from "@/lib/stores/todayStore";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function FocusTimer() {
  const secondsLeft = useTodayStore((s) => s.timerSecondsLeft);
  const running = useTodayStore((s) => s.timerRunning);
  const startTimer = useTodayStore((s) => s.startTimer);
  const pauseTimer = useTodayStore((s) => s.pauseTimer);
  const resetTimer = useTodayStore((s) => s.resetTimer);
  const tickTimer = useTodayStore((s) => s.tickTimer);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tickTimer, 1000);
    return () => clearInterval(id);
  }, [running, tickTimer]);

  const done = secondsLeft === 0;
  const progress = ((40 * 60 - secondsLeft) / (40 * 60)) * 100;

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">Timer focus</p>
      <div className="flex items-center justify-between gap-4">
        <span className={cn("text-4xl font-black tabular-nums", done ? "text-green-400" : running ? "text-white" : "text-white/60")}>
          {done ? "✓ fatto" : formatTime(secondsLeft)}
        </span>
        <div className="flex gap-2">
          {!done && (
            <button
              onClick={running ? pauseTimer : startTimer}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              {running ? <Pause size={13} /> : <Play size={13} />}
              {running ? "Pausa" : "Avvia"}
            </button>
          )}
          <button
            onClick={resetTimer}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/40 hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={12} />
          </button>
        </div>
      </div>
      <div className="mt-4 h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", done ? "bg-green-500" : "bg-blue-500")}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
