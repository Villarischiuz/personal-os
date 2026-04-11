"use client";

import { useEffect, useState, useRef } from "react";
import { useKanbanStore } from "@/lib/stores/workStore";

const CACHE_KEY = "ai_boot_cache";
const CACHE_TTL_MS = 120 * 60 * 1000; // 120 minutes

interface Cache {
  text: string;
  timestamp: number;
}

function useNextEvent(): string | null {
  // Read from localStorage weekly events for today
  try {
    const raw = localStorage.getItem("personal-os-weekly");
    if (!raw) return null;
    const events: Array<{ title: string; dayOfWeek: number; hour: number; minute: number }> =
      JSON.parse(raw);
    const now = new Date();
    const todayDow = (now.getDay() + 6) % 7;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const upcoming = events
      .filter((e) => e.dayOfWeek === todayDow && e.hour * 60 + e.minute > nowMins)
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    if (!upcoming.length) return null;
    const e = upcoming[0];
    return `${e.title} at ${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}`;
  } catch {
    return null;
  }
}

export function AIBootBanner() {
  const [display, setDisplay] = useState<string>("");
  const [typed, setTyped] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const tasks = useKanbanStore((s) => s.tasks);
  const didFetch = useRef(false);

  // Typewriter effect
  useEffect(() => {
    if (!display) return;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(display.slice(0, i));
      if (i >= display.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [display]);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    // Check cache
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache: Cache = JSON.parse(raw);
        if (Date.now() - cache.timestamp < CACHE_TTL_MS) {
          setDisplay(cache.text);
          return;
        }
      }
    } catch {
      /* ignore corrupt cache */
    }

    // Build payload
    const now = new Date();
    const currentTime = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const nextEvent = useNextEventSnapshot();
    const topTasks = tasks
      .filter((t) => t.status === "Todo")
      .slice(0, 2)
      .map((t) => t.title);

    setLoading(true);
    fetch("/api/ai-boot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentTime, nextEvent, topTasks }),
    })
      .then((r) => r.json())
      .then((data: { text?: string; error?: string }) => {
        if (data.text) {
          setDisplay(data.text);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ text: data.text, timestamp: Date.now() }));
        }
      })
      .catch(() => {/* silent fail */})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!display && !loading) return null;

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 font-mono text-[10px] font-bold tracking-widest text-white/20 uppercase">
          OS://
        </span>
        {loading ? (
          <span className="flex items-center gap-1.5 text-sm text-white/30">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:150ms]" />
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:300ms]" />
          </span>
        ) : (
          <p className="text-sm font-semibold text-white leading-snug">
            {typed}
            {typed.length < display.length && (
              <span className="inline-block w-[2px] h-[1em] bg-white align-middle ml-0.5 animate-pulse" />
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// Called inside useEffect (not a hook itself) — reads localStorage snapshot
function useNextEventSnapshot(): string | null {
  try {
    const raw = localStorage.getItem("personal-os-weekly");
    if (!raw) return null;
    const events: Array<{ title: string; dayOfWeek: number; hour: number; minute: number }> =
      JSON.parse(raw);
    const now = new Date();
    const todayDow = (now.getDay() + 6) % 7;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const upcoming = events
      .filter((e) => e.dayOfWeek === todayDow && e.hour * 60 + e.minute > nowMins)
      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    if (!upcoming.length) return null;
    const e = upcoming[0];
    return `${e.title} at ${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}`;
  } catch {
    return null;
  }
}
