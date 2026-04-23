"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { WeeklyEvent } from "@/lib/types";
import { CalendarViews } from "@/components/calendar/CalendarViews";
import { Button } from "@/components/ui/button";
import { useViewportOrientation } from "@/lib/hooks/useViewportOrientation";
import { cn } from "@/lib/utils";
import { Timer, Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Target } from "@/lib/icons";

const TIMER_STORAGE_KEY = "personal-os-calendar-focus-timer-v1";

type TimerPhase = "focus" | "break";

interface TimerSettings {
  focusMinutes: number;
  breakMinutes: number;
  cyclesTarget: number;
}

interface TimerState extends TimerSettings {
  remainingSeconds: number;
  phase: TimerPhase;
  running: boolean;
  completedCycles: number;
}

interface Props {
  weeklyEvents: WeeklyEvent[];
  selectedDow: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onDowChange: (d: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  onExit: () => void;
}

function getDefaultTimerState(): TimerState {
  return {
    focusMinutes: 25,
    breakMinutes: 5,
    cyclesTarget: 4,
    remainingSeconds: 25 * 60,
    phase: "focus",
    running: false,
    completedCycles: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadTimerState(): TimerState {
  if (typeof window === "undefined") {
    return getDefaultTimerState();
  }

  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) {
      return getDefaultTimerState();
    }

    const parsed = JSON.parse(raw) as Partial<TimerState>;
    const focusMinutes = clamp(Number(parsed.focusMinutes ?? 25), 5, 180);
    const breakMinutes = clamp(Number(parsed.breakMinutes ?? 5), 1, 60);
    const cyclesTarget = clamp(Number(parsed.cyclesTarget ?? 4), 1, 12);
    const defaultState = getDefaultTimerState();

    return {
      ...defaultState,
      focusMinutes,
      breakMinutes,
      cyclesTarget,
      remainingSeconds:
        typeof parsed.remainingSeconds === "number"
          ? parsed.remainingSeconds
          : focusMinutes * 60,
      phase: parsed.phase === "break" ? "break" : "focus",
      running: false,
      completedCycles: clamp(Number(parsed.completedCycles ?? 0), 0, cyclesTarget),
    };
  } catch {
    return getDefaultTimerState();
  }
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function CalendarFocusStudio({ weeklyEvents, selectedDow, onDowChange, onExit }: Props) {
  const orientation = useViewportOrientation();
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timer, setTimer] = useState<TimerState>(() => loadTimerState());
  const [fullscreenTimer, setFullscreenTimer] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    if (!timer.running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((current) => {
        if (current.remainingSeconds > 1) {
          return { ...current, remainingSeconds: current.remainingSeconds - 1 };
        }

        if (current.phase === "focus") {
          const completedCycles = current.completedCycles + 1;
          if (completedCycles >= current.cyclesTarget) {
            return {
              ...current,
              completedCycles,
              running: false,
              phase: "focus",
              remainingSeconds: current.focusMinutes * 60,
            };
          }

          return {
            ...current,
            completedCycles,
            phase: "break",
            remainingSeconds: current.breakMinutes * 60,
          };
        }

        return {
          ...current,
          phase: "focus",
          remainingSeconds: current.focusMinutes * 60,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.running]);

  useEffect(() => {
    async function syncFullscreen() {
      if (fullscreenTimer && fullscreenRef.current && document.fullscreenElement !== fullscreenRef.current) {
        try {
          await fullscreenRef.current.requestFullscreen();
        } catch {
          // Fallback overlay still covers the viewport even if Fullscreen API is blocked.
        }
      }

      if (!fullscreenTimer && document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // Ignore browsers that refuse programmatic exit.
        }
      }
    }

    syncFullscreen();
  }, [fullscreenTimer]);

  useEffect(() => {
    function handleFullscreenChange() {
      if (!document.fullscreenElement) {
        setFullscreenTimer(false);
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const totalSeconds = timer.phase === "focus" ? timer.focusMinutes * 60 : timer.breakMinutes * 60;
  const progress = totalSeconds === 0 ? 0 : ((totalSeconds - timer.remainingSeconds) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 84;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const phaseLabel = timer.phase === "focus" ? "Focus" : "Pausa";
  const phaseAccent =
    timer.phase === "focus"
      ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

  const summary = useMemo(
    () => `${timer.completedCycles}/${timer.cyclesTarget} pomodori completati`,
    [timer.completedCycles, timer.cyclesTarget]
  );

  function updateSetting<K extends keyof TimerSettings>(key: K, rawValue: number) {
    const value =
      key === "focusMinutes"
        ? clamp(rawValue, 5, 180)
        : key === "breakMinutes"
          ? clamp(rawValue, 1, 60)
          : clamp(rawValue, 1, 12);

    setTimer((current) => {
      const next = { ...current, [key]: value } as TimerState;

      if (key === "cyclesTarget" && current.completedCycles > value) {
        next.completedCycles = value;
      }

      if (key === "focusMinutes" && current.phase === "focus" && !current.running) {
        next.remainingSeconds = value * 60;
      }

      if (key === "breakMinutes" && current.phase === "break" && !current.running) {
        next.remainingSeconds = value * 60;
      }

      return next;
    });
  }

  function toggleRunning() {
    setTimer((current) => ({ ...current, running: !current.running }));
  }

  function resetTimer() {
    setTimer((current) => ({
      ...current,
      running: false,
      phase: "focus",
      remainingSeconds: current.focusMinutes * 60,
      completedCycles: 0,
    }));
  }

  function skipPhase() {
    setTimer((current) => {
      if (current.phase === "focus") {
        const completedCycles = Math.min(current.completedCycles + 1, current.cyclesTarget);
        const finishedAll = completedCycles >= current.cyclesTarget;

        return {
          ...current,
          running: false,
          completedCycles,
          phase: finishedAll ? "focus" : "break",
          remainingSeconds: finishedAll ? current.focusMinutes * 60 : current.breakMinutes * 60,
        };
      }

      return {
        ...current,
        running: false,
        phase: "focus",
        remainingSeconds: current.focusMinutes * 60,
      };
    });
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/8 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Modalita concentrazione</p>
            <p className="text-xs text-white/45">
              Vedi solo calendario ed eventi, con timer configurabile e schermo intero.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onExit}>
            <Minimize2 size={14} /> Esci
          </Button>
        </div>

        <div
          className={cn(
            "grid gap-4",
            orientation === "portrait" ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_340px]"
          )}
        >
          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/4 p-3 md:p-4">
            <CalendarViews
              key={`focus-calendar-${orientation}`}
              weeklyEvents={weeklyEvents}
              selectedDow={selectedDow}
              onDowChange={onDowChange}
              focusOnly
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/4 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Timer size={16} className="text-blue-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Pomodoro focus</p>
                  <p className="text-xs text-white/40">Configura durata, pausa e numero di sessioni.</p>
                </div>
              </div>

              <button
                onClick={() => setFullscreenTimer(true)}
                className="w-full rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),rgba(15,23,42,0.3)_60%)] p-4 text-left transition-colors hover:border-blue-400/35"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]", phaseAccent)}>
                      {phaseLabel}
                    </span>
                    <p className="mt-3 font-mono text-4xl font-black tracking-tight text-white">
                      {formatSeconds(timer.remainingSeconds)}
                    </p>
                    <p className="mt-1 text-xs text-white/35">{summary}</p>
                  </div>
                  <span className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/50">
                    <Maximize2 size={16} />
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      timer.phase === "focus" ? "bg-blue-400" : "bg-emerald-400"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </button>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <label className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">Focus</span>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={timer.focusMinutes}
                    onChange={(e) => updateSetting("focusMinutes", Number(e.target.value))}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">Pausa</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={timer.breakMinutes}
                    onChange={(e) => updateSetting("breakMinutes", Number(e.target.value))}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                  />
                </label>
                <label className="rounded-2xl border border-white/10 bg-black/10 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">Cicli</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={timer.cyclesTarget}
                    onChange={(e) => updateSetting("cyclesTarget", Number(e.target.value))}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
                  />
                </label>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button variant={timer.running ? "outline" : "default"} className="flex-1" onClick={toggleRunning}>
                  {timer.running ? <Pause size={15} /> : <Play size={15} />}
                  {timer.running ? "Pausa" : "Avvia"}
                </Button>
                <Button variant="outline" size="icon" onClick={resetTimer} aria-label="Reset timer">
                  <RotateCcw size={15} />
                </Button>
                <Button variant="outline" size="icon" onClick={skipPhase} aria-label="Salta fase">
                  <SkipForward size={15} />
                </Button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-black/10 px-3 py-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Target size={14} />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">Layout adattivo</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/42">
                  In portrait il calendario privilegia la vista verticale, in landscape passa a una vista piu orizzontale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullscreenTimer && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-[220] flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(30,64,175,0.28),rgba(2,6,23,0.96)_58%)] px-6"
        >
          <button
            onClick={() => setFullscreenTimer(false)}
            className="absolute right-6 top-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-white/50 transition-colors hover:text-white"
          >
            <Minimize2 size={20} />
          </button>

          <span className={cn("mb-6 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]", phaseAccent)}>
            {phaseLabel}
          </span>

          <div className="relative flex items-center justify-center">
            <svg width="240" height="240" className="-rotate-90">
              <circle cx="120" cy="120" r="84" stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
              <circle
                cx="120"
                cy="120"
                r="84"
                stroke={timer.phase === "focus" ? "#60a5fa" : "#34d399"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute text-center">
              <p className="font-mono text-6xl font-black tracking-tight text-white">
                {formatSeconds(timer.remainingSeconds)}
              </p>
              <p className="mt-2 text-sm text-white/35">{summary}</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={resetTimer} aria-label="Reset timer fullscreen">
              <RotateCcw size={18} />
            </Button>
            <Button size="lg" className="min-w-[180px]" onClick={toggleRunning}>
              {timer.running ? <Pause size={18} /> : <Play size={18} />}
              {timer.running ? "Metti in pausa" : "Inizia sessione"}
            </Button>
            <Button variant="outline" size="icon" onClick={skipPhase} aria-label="Salta fase fullscreen">
              <SkipForward size={18} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
