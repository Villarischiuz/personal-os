"use client";
import { useState, useRef } from "react";
import { X, Brain, RefreshCw } from "@/lib/icons";
import { useKanbanStore } from "@/lib/stores/workStore";
import { cn } from "@/lib/utils";

const ACTIONS = [
  {
    label: "Energy Pivot",
    emoji: "⚡",
    color: "border-amber-500/40 text-amber-300 bg-amber-500/10",
    system: "Sei un coach di produttività personale. L'utente ha questi task attivi:",
    suffix: "\n\nSuggerisci in 3 punti concisi come riallocare l'energia per massimizzare il rendimento oggi. Rispondi in italiano.",
  },
  {
    label: "Overcome Inertia",
    emoji: "🚀",
    color: "border-blue-500/40 text-blue-300 bg-blue-500/10",
    system: "Sei un coach di produttività personale. L'utente è bloccato e non riesce a iniziare. Ha questi task:",
    suffix: "\n\nDai 3 micro-azioni concrete (meno di 2 minuti ciascuna) per sbloccarsi subito. Rispondi in italiano.",
  },
  {
    label: "Handle Interruption",
    emoji: "🛑",
    color: "border-rose-500/40 text-rose-300 bg-rose-500/10",
    system: "Sei un coach di produttività. L'utente è stato interrotto. Ha questi task in sospeso:",
    suffix: "\n\nSuggerisci come riprendere il focus velocemente e come gestire l'interruzione senza perdere il filo. Rispondi in italiano.",
  },
  {
    label: "Evening Debrief",
    emoji: "🌙",
    color: "border-violet-500/40 text-violet-300 bg-violet-500/10",
    system: "Sei un coach di produttività. L'utente sta concludendo la giornata. Ecco i suoi task:",
    suffix: "\n\nFai un debrief rapido: cosa ha funzionato, cosa migliorare domani, 1 cosa positiva. Rispondi in italiano.",
  },
];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState("");
  const tasks = useKanbanStore((s) => s.tasks);
  const abortRef = useRef<AbortController | null>(null);

  function buildPrompt(action: typeof ACTIONS[0]) {
    const taskList = tasks
      .filter((t) => t.status !== "Done")
      .map((t) => `- [${t.status}] ${t.title} (${t.category}, ${t.duration_mins}m)`)
      .join("\n");
    return `${action.system}\n${taskList}${action.suffix}`;
  }

  async function runAction(action: typeof ACTIONS[0]) {
    if (loading) { abortRef.current?.abort(); return; }
    setActiveAction(action.label);
    setResponse("");
    setLoading(true);
    abortRef.current = new AbortController();
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt(action) }),
        signal: abortRef.current.signal,
      });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setResponse((r) => r + decoder.decode(value));
      }
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError")
        setResponse("Errore nella chiamata AI. Verifica GEMINI_API_KEY in .env.local");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Trigger button — desktop bottom-left, mobile integrated in bottom area */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/15 px-4 py-2.5 text-sm text-violet-300 hover:bg-violet-500/25 transition-colors"
      >
        <Brain size={15} />
        AI Co-Pilot
      </button>
      <button
        onClick={() => setOpen(true)}
        className="fixed right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/20 md:hidden active:scale-95 transition-transform"
        style={{ bottom: "calc(192px + env(safe-area-inset-bottom, 0px))" }}
        aria-label="AI Co-Pilot"
      >
        <Brain size={20} className="text-violet-300" />
      </button>

      {/* Bottom-sheet / modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full md:max-w-lg rounded-t-3xl md:rounded-2xl border-t md:border border-white/15 bg-[hsl(222,47%,8%)] shadow-2xl max-h-[85vh] flex flex-col">
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-violet-400" />
                <span className="font-semibold text-white text-sm">AI Co-Pilot</span>
                <span className="text-[10px] text-white/30 border border-white/10 rounded px-1.5 py-0.5">Gemini 1.5 Flash</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-white/30 hover:text-white/70 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <X size={18} />
              </button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2 p-4">
              {ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => runAction(action)}
                  disabled={loading}
                  className={cn(
                    "rounded-xl border px-3 py-3.5 text-left transition-all active:scale-95 disabled:opacity-50 min-h-[60px]",
                    action.color,
                    activeAction === action.label && loading && "animate-pulse"
                  )}
                >
                  <span className="text-lg">{action.emoji}</span>
                  <p className="text-xs font-semibold mt-1">{action.label}</p>
                </button>
              ))}
            </div>

            {/* Response area */}
            {(response || loading) && (
              <div className="flex-1 overflow-y-auto px-5 pb-6 min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider">{activeAction}</span>
                  {loading && <RefreshCw size={10} className="text-violet-400 animate-spin" />}
                </div>
                <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {response}
                  {loading && <span className="inline-block w-1.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
                </div>
              </div>
            )}

            {!response && !loading && (
              <p className="px-5 pb-6 text-xs text-white/25 text-center">
                Seleziona un&apos;azione: l&apos;AI analizzerà i tuoi task attivi
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
