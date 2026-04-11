"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, X, Zap } from "@/lib/icons";
import { useKanbanStore } from "@/lib/stores/workStore";

export function QuickCaptureOverlay() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useKanbanStore((s) => s.addTask);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setValue("");
  }, [open]);

  function save() {
    const t = value.trim();
    if (!t) return;
    addTask(t);
    setValue("");
    setOpen(false);
  }

  return (
    <>
      {/* FAB — mobile */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Cattura task"
        className="fixed bottom-[72px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-900/50 active:scale-95 transition-transform md:hidden"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm pt-24 px-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[hsl(222,47%,8%)] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/8">
              <Zap size={16} className="text-blue-400 flex-shrink-0" />
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder="Cattura un'attività… (Invio per salvare)"
                className="flex-1 bg-transparent text-base text-white placeholder-white/25 outline-none"
              />
              <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 p-1">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-white/25 hidden md:block">⌘K per aprire/chiudere · Esc per annullare</span>
              <button
                onClick={save}
                disabled={!value.trim()}
                className="w-full md:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-40 active:scale-95 transition-transform"
              >
                Salva in Inbox
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
