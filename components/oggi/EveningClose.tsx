"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTodayStore } from "@/lib/stores/todayStore";

export function EveningClose() {
  const eveningNote = useTodayStore((s) => s.eveningNote);
  const closed = useTodayStore((s) => s.closed);
  const setEveningNote = useTodayStore((s) => s.setEveningNote);
  const closeDay = useTodayStore((s) => s.closeDay);

  const [good, setGood] = useState(eveningNote?.good ?? "");
  const [change, setChange] = useState(eveningNote?.change ?? "");
  const [open, setOpen] = useState(false);

  const hour = new Date().getHours();
  const isEvening = hour >= 18;

  if (closed) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/8 px-4 py-3">
        <p className="text-sm font-semibold text-green-400">✓ Giornata chiusa</p>
        {eveningNote && <p className="text-xs text-green-400/60 mt-1">{eveningNote.good}</p>}
      </div>
    );
  }

  if (!isEvening) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
        <p className="text-xs text-white/30">La chiusura serale si sblocca dopo le 18:00</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30">Chiusura serale</p>
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
          >
            Chiudi la giornata
          </button>
        )}
      </div>
      {open && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Cosa è andato bene oggi?</label>
            <textarea
              value={good}
              onChange={(e) => setGood(e.target.value)}
              placeholder="..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none resize-none focus:border-white/20"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Cosa cambi domani?</label>
            <textarea
              value={change}
              onChange={(e) => setChange(e.target.value)}
              placeholder="..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 outline-none resize-none focus:border-white/20"
            />
          </div>
          <button
            onClick={() => { setEveningNote({ good, change }); closeDay(); }}
            disabled={!good.trim()}
            className={cn(
              "w-full rounded-lg py-2.5 text-sm font-bold transition-colors",
              good.trim() ? "bg-green-600 text-white hover:bg-green-500" : "bg-white/5 text-white/25 cursor-not-allowed"
            )}
          >
            Salva e chiudi
          </button>
        </div>
      )}
    </div>
  );
}
