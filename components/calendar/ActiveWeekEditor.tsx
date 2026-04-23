"use client";

import { useMemo, useState } from "react";
import {
  buildActiveWeekLabel,
  buildActiveWeekSubtitle,
  parseActiveWeekBatchInput,
  stringifyActiveWeekEvents,
  type ActiveWeekRange,
} from "@/lib/activeWeekPlan";
import type { DatedEvent } from "@/lib/types";
import { ChevronRight, RefreshCw, Star, Copy, Check } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Props {
  range: ActiveWeekRange;
  events: DatedEvent[];
  onApply: (range: ActiveWeekRange, events: Omit<DatedEvent, "id">[]) => void;
  onReset: () => void;
}

export function ActiveWeekEditor({ range, events, onApply, onReset }: Props) {
  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<ActiveWeekRange>(range);
  const [batchText, setBatchText] = useState(() => stringifyActiveWeekEvents(events));
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const label = useMemo(() => buildActiveWeekLabel(range), [range]);
  const subtitle = useMemo(() => buildActiveWeekSubtitle(range), [range]);

  function handlePreview() {
    setPreviewCount(parseActiveWeekBatchInput(batchText).length);
  }

  function handleApply() {
    const parsed = parseActiveWeekBatchInput(batchText);
    if (parsed.length === 0) {
      setPreviewCount(0);
      return;
    }

    onApply(draftRange, parsed);
    setPreviewCount(parsed.length);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(batchText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/8">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/3"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
              Settimana attiva
            </span>
            <p className="text-sm font-semibold text-white">{label}</p>
          </div>
          <p className="mt-2 text-sm text-white/55">{subtitle}</p>
        </div>
        <ChevronRight
          size={14}
          className={cn("flex-shrink-0 text-white/30 transition-transform duration-200", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-white/8 p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">Inizio</span>
              <input
                type="date"
                value={draftRange.start}
                onChange={(e) => setDraftRange((current) => ({ ...current, start: e.target.value }))}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
              />
            </label>
            <label className="rounded-xl border border-white/10 bg-black/10 px-3 py-2.5">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/30">Fine</span>
              <input
                type="date"
                value={draftRange.end}
                onChange={(e) => setDraftRange((current) => ({ ...current, end: e.target.value }))}
                className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none"
              />
            </label>
          </div>

          <div className="rounded-lg border border-white/6 bg-white/3 px-3 py-2.5 text-xs text-white/40 space-y-0.5">
            <p className="mb-1 font-medium text-white/60">Formato batch della settimana attiva:</p>
            <p className="font-mono">2026-04-23 14:00 Outreach Agent - Daily check 45m | Telegram + dashboard</p>
            <p className="font-mono">2026-04-23 14:45 Fix Claude Code [Deep] 1h | Bloccante</p>
            <p className="font-mono">2026-04-26 09:00 Riposo completo [Rest] 12h | Nessun lavoro</p>
          </div>

          <textarea
            value={batchText}
            onChange={(e) => {
              setBatchText(e.target.value);
              setPreviewCount(null);
            }}
            rows={12}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-3 font-mono text-xs text-white outline-none focus:border-amber-500/40"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/8"
            >
              <Star size={12} /> Anteprima
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-500"
            >
              <RefreshCw size={12} /> Salva sul dispositivo
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/45 transition-colors hover:bg-white/5"
            >
              <RefreshCw size={12} /> Ripristina base
            </button>
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/45 transition-colors hover:bg-white/5"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copiato" : "Copia piano"}
            </button>
          </div>

          {previewCount !== null && (
            <p className={cn("text-xs", previewCount > 0 ? "text-amber-200" : "text-red-400")}>
              {previewCount > 0
                ? `${previewCount} eventi riconosciuti e pronti da applicare.`
                : "Nessun evento riconosciuto. Controlla il formato del batch."}
            </p>
          )}

          <p className="text-xs leading-relaxed text-white/35">
            Questo piano viene salvato nel browser, quindi puoi aggiornarlo senza deploy. Se vuoi sincronizzarlo tra dispositivi, il prossimo passo e collegarlo a un backend.
          </p>
        </div>
      )}
    </div>
  );
}
