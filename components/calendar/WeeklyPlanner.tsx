"use client";

import { useState } from "react";
import { Plus, ChevronRight, RefreshCw, Star, Zap } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { WeeklyEvent, EventColor } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────
const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

const COLOR_MAP: Record<EventColor, { bg: string; text: string; dot: string }> = {
  blue:   { bg: "bg-blue-500/20",   text: "text-blue-300",   dot: "bg-blue-400"   },
  green:  { bg: "bg-green-500/20",  text: "text-green-300",  dot: "bg-green-400"  },
  orange: { bg: "bg-orange-500/20", text: "text-orange-300", dot: "bg-orange-400" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-300", dot: "bg-violet-400" },
  rose:   { bg: "bg-rose-500/20",   text: "text-rose-300",   dot: "bg-rose-400"   },
};

const TEMPLATE_KEY = "personal-os-template";

// ─── Batch input parser ───────────────────────────────────────
const DAY_MAP: Record<string, number[]> = {
  lun: [0], mar: [1], mer: [2], gio: [3], ven: [4], sab: [5], dom: [6],
  "ogni giorno": [0, 1, 2, 3, 4, 5, 6],
  "lun-ven": [0, 1, 2, 3, 4],
  "lun-sab": [0, 1, 2, 3, 4, 5],
};

const COLOR_KEYWORDS: { keywords: string[]; color: EventColor }[] = [
  { keywords: ["allenamento", "palestra", "sport", "corsa", "nuoto", "ciclismo", "yoga"], color: "orange" },
  { keywords: ["lavoro", "deep work", "riunione", "meeting", "call", "progetto", "coding", "sviluppo"], color: "blue" },
  { keywords: ["pranzo", "cena", "colazione", "pasto", "meal prep", "riposo", "pausa", "relax"], color: "green" },
  { keywords: ["studio", "inglese", "lingua", "lettura", "corso", "apprendimento", "libro"], color: "violet" },
];

function guessColor(title: string): EventColor {
  const lower = title.toLowerCase();
  for (const { keywords, color } of COLOR_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return color;
  }
  return "rose";
}

function parseDuration(raw: string): number {
  const hourMin = raw.match(/(\d+)h(\d+)m?/);
  if (hourMin) return parseInt(hourMin[1]) * 60 + parseInt(hourMin[2]);
  const hours = raw.match(/(\d+(?:\.\d+)?)h/);
  if (hours) return Math.round(parseFloat(hours[1]) * 60);
  const mins = raw.match(/(\d+)m/);
  if (mins) return parseInt(mins[1]);
  return 60;
}

function parseDays(raw: string): number[] {
  const lower = raw.toLowerCase().trim();
  if (DAY_MAP[lower]) return DAY_MAP[lower];
  // comma-separated: "lun,mer,ven"
  const parts = lower.split(",").map((s) => s.trim());
  const days: number[] = [];
  for (const p of parts) {
    const found = DAY_MAP[p];
    if (found) days.push(...found);
  }
  return days.length > 0 ? [...new Set(days)].sort() : [];
}

export function parseBatchInput(text: string): Omit<WeeklyEvent, "id">[] {
  const events: Omit<WeeklyEvent, "id">[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // skip comment lines
    if (line.startsWith("#") || line.startsWith("//")) continue;

    // Format: <giorni> <HH:MM> <titolo> <durata>
    // e.g.: "Lun,Mer,Ven 07:00 Allenamento 1h30m"
    //       "Ogni giorno 13:00 Pranzo 45m"
    //       "Lun-Ven 09:00 Deep work 2h"
    const m = line.match(
      /^([a-zà-ùA-ZÀ-Ù ,\-]+?)\s+(\d{1,2})[:\.](\d{2})\s+(.+?)\s+((?:\d+h\d*m?|\d+m|\d+(?:\.\d+)?h))$/i
    );

    if (!m) continue;

    const [, rawDays, rawH, rawM, title, rawDur] = m;
    const days = parseDays(rawDays);
    if (days.length === 0) continue;

    const hour = parseInt(rawH);
    const minute = parseInt(rawM) >= 30 ? 30 : 0;
    const durationMins = parseDuration(rawDur);
    const color = guessColor(title);

    for (const dayOfWeek of days as (0|1|2|3|4|5|6)[]) {
      events.push({ title: title.trim(), dayOfWeek, hour, minute, durationMins, color });
    }
  }

  return events;
}

// ─── Mini week grid ───────────────────────────────────────────
function MiniWeekGrid({ events }: { events: Omit<WeeklyEvent, "id">[] }) {
  const DISPLAY_HOURS = [7, 9, 11, 13, 15, 17, 19, 21];
  const MINI_H = 28; // px per hour

  return (
    <div className="overflow-x-auto rounded-xl border border-white/8 bg-white/2">
      <div className="min-w-[640px]">
        {/* Day headers */}
        <div className="flex border-b border-white/8">
          <div className="w-10 flex-shrink-0" />
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={cn(
                "flex-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide",
                i < 5 ? "text-white/50" : "text-white/25"
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex" style={{ height: DISPLAY_HOURS.length * MINI_H }}>
          {/* Hour labels */}
          <div className="w-10 flex-shrink-0">
            {DISPLAY_HOURS.map((h) => (
              <div
                key={h}
                className="flex items-start justify-end pr-2 text-[9px] text-white/20"
                style={{ height: MINI_H }}
              >
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIdx) => {
            const dayEvents = events.filter((e) => e.dayOfWeek === dayIdx);
            return (
              <div
                key={dayIdx}
                className="relative flex-1 border-l border-white/5"
                style={{ height: DISPLAY_HOURS.length * MINI_H }}
              >
                {/* Hour lines */}
                {DISPLAY_HOURS.map((_, hi) => (
                  <div
                    key={hi}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{ top: hi * MINI_H }}
                  />
                ))}

                {/* Events */}
                {dayEvents.map((ev, i) => {
                  const firstDisplayH = DISPLAY_HOURS[0];
                  const top = Math.max(0, (ev.hour - firstDisplayH) * MINI_H + (ev.minute / 60) * MINI_H);
                  const height = Math.max(10, (ev.durationMins / 60) * MINI_H - 2);
                  const c = COLOR_MAP[ev.color];
                  return (
                    <div
                      key={i}
                      className={cn("absolute inset-x-0.5 rounded overflow-hidden", c.bg)}
                      style={{ top, height }}
                    >
                      <p className={cn("truncate px-1 text-[8px] font-medium leading-tight pt-0.5", c.text)}>
                        {ev.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────
interface Props {
  onApply: (events: Omit<WeeklyEvent, "id">[]) => void;
}

export function WeeklyPlanner({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [preview, setPreview] = useState<Omit<WeeklyEvent, "id">[]>([]);
  const [previewGenerated, setPreviewGenerated] = useState(false);

  function handleTextChange(text: string) {
    setBatchText(text);
    setPreviewGenerated(false);
  }

  function handlePreview() {
    const parsed = parseBatchInput(batchText);
    setPreview(parsed);
    setPreviewGenerated(true);
  }

  function handleApply() {
    const parsed = parseBatchInput(batchText);
    if (parsed.length === 0) return;
    onApply(parsed);
    setOpen(false);
  }

  function saveTemplate() {
    localStorage.setItem(TEMPLATE_KEY, batchText);
  }

  function loadTemplate() {
    const saved = localStorage.getItem(TEMPLATE_KEY);
    if (saved) { setBatchText(saved); setPreviewGenerated(false); }
  }

  async function generateWithAI() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/genera-settimana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (data.error) { setAiError(data.error); return; }
      // Convert AI events array to batch text format for review
      const lines = (data.events as Omit<WeeklyEvent, "id">[]).map((ev) => {
        const dayName = DAYS[ev.dayOfWeek];
        const timeStr = `${String(ev.hour).padStart(2,"0")}:${String(ev.minute).padStart(2,"0")}`;
        const dur = ev.durationMins >= 60
          ? `${Math.floor(ev.durationMins/60)}h${ev.durationMins%60 ? ev.durationMins%60+"m" : ""}`
          : `${ev.durationMins}m`;
        return `${dayName} ${timeStr} ${ev.title} ${dur}`;
      });
      setBatchText(lines.join("\n"));
      setPreview(data.events);
      setPreviewGenerated(true);
      setShowAI(false);
    } catch {
      setAiError("Errore di rete. Controlla la connessione.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/3">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-white/3"
      >
        <div className="flex items-center gap-2.5">
          <RefreshCw size={14} className="text-violet-400" />
          <span className="text-sm font-semibold text-white/70">Pianificazione Settimanale</span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] text-violet-300">
            domenica
          </span>
        </div>
        <ChevronRight
          size={14}
          className={cn("text-white/30 transition-transform duration-200", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="border-t border-white/8 p-5 space-y-4">
          {/* Instructions */}
          <div className="rounded-lg border border-white/6 bg-white/3 px-3 py-2.5 text-xs text-white/40 space-y-0.5">
            <p className="font-medium text-white/60 mb-1">Formato batch (una riga per evento):</p>
            <p className="font-mono">Ogni giorno 07:00 Allenamento 1h30m</p>
            <p className="font-mono">Lun,Mer,Ven 09:00 Deep work 2h</p>
            <p className="font-mono">Mar,Gio 15:00 Riunione 1h</p>
            <p className="font-mono">Lun-Ven 13:00 Pranzo 45m</p>
            <p className="font-mono">Dom 11:00 Meal prep 2h</p>
          </div>

          {/* Batch textarea */}
          <textarea
            value={batchText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={"Ogni giorno 07:00 Allenamento 1h\nLun,Mer,Ven 09:00 Deep work 2h\nLun-Ven 13:00 Pranzo 45m\nMar,Gio,Sab 20:00 Studio inglese 1h"}
            rows={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-xs text-white placeholder-white/20 outline-none focus:border-violet-500/50 resize-none"
          />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreview}
              disabled={!batchText.trim()}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/8 disabled:opacity-30"
            >
              <ChevronRight size={12} /> Anteprima
            </button>
            <button
              onClick={handleApply}
              disabled={!batchText.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-30"
            >
              <Plus size={12} /> Applica alla settimana
            </button>
            <button
              onClick={saveTemplate}
              disabled={!batchText.trim()}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/5 disabled:opacity-30"
            >
              <Star size={12} /> Salva template
            </button>
            <button
              onClick={loadTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/5"
            >
              <RefreshCw size={12} /> Carica template
            </button>
            <button
              onClick={() => setShowAI((s) => !s)}
              className={cn(
                "ml-auto flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                showAI
                  ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                  : "border-amber-500/25 text-amber-400/70 hover:bg-amber-500/10"
              )}
            >
              <Zap size={12} /> Genera con AI
            </button>
          </div>

          {/* AI section */}
          {showAI && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <p className="text-xs text-amber-300/80 font-medium">
                Descrivi la tua settimana in linguaggio naturale:
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Es: Ho allenamento in palestra ogni lunedì, mercoledì e venerdì alle 7 di mattina per circa 1h30. Lavoro in smart working, faccio deep work dalle 9 alle 12 i giorni feriali. Pranzo sempre alle 13 per 45 minuti. Martedì e giovedì ho spesso riunioni alle 15. Studio inglese il martedì e giovedì sera alle 20. La domenica faccio meal prep alle 11."
                rows={5}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-amber-500/40 resize-none"
              />
              {aiError && (
                <p className="text-xs text-red-400">{aiError}</p>
              )}
              <button
                onClick={generateWithAI}
                disabled={!aiPrompt.trim() || aiLoading}
                className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-40"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Generazione in corso…
                  </>
                ) : (
                  <>
                    <Zap size={12} /> Genera piano
                  </>
                )}
              </button>
              <p className="text-[10px] text-white/25">
                Usa claude-haiku-4-5 · ~$0.001 per generazione · Richiede ANTHROPIC_API_KEY in .env.local
              </p>
            </div>
          )}

          {/* Preview grid */}
          {previewGenerated && (
            <div className="space-y-2">
              <p className="text-xs text-white/40">
                Anteprima — <span className="text-white/60 font-medium">{preview.length} eventi parsati</span>
              </p>
              {preview.length > 0 ? (
                <MiniWeekGrid events={preview} />
              ) : (
                <p className="text-xs text-red-400/70">Nessun evento riconosciuto. Controlla il formato.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
