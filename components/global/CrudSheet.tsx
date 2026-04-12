"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useKanbanStore } from "@/lib/stores/workStore";
import { useStudyStore } from "@/lib/stores/studyStore";
import { cn } from "@/lib/utils";
import type { Task, TaskCategory, TaskStatus } from "@/lib/types";
import type { Flashcard, RoadmapTask } from "@/lib/stores/studyStore";

// ─── Context types ─────────────────────────────────────────────
export type CrudContext =
  | { type: "task"; item?: Task; defaultDate?: string }
  | { type: "flashcard"; item?: Flashcard }
  | { type: "roadmap"; item?: RoadmapTask };

interface Props {
  open: boolean;
  context: CrudContext | null;
  onClose: () => void;
}

// ─── Reusable field components ─────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">{children}</label>;
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none",
        "focus:border-blue-500/50 focus:bg-white/8 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={cn(
        "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none resize-none",
        "focus:border-blue-500/50 focus:bg-white/8 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-white/12 bg-[hsl(222,47%,10%)] px-3 py-3 text-sm text-white outline-none",
        "focus:border-blue-500/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function SaveBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 transition-all mt-6"
    >
      {children}
    </button>
  );
}

// ─── Task form ──────────────────────────────────────────────────
const CATEGORIES: TaskCategory[] = ["Work", "Study", "Admin"];
const STATUSES: TaskStatus[] = ["Inbox", "Todo", "InProgress", "Done"];

function TaskForm({ item, defaultDate, onDone }: { item?: Task; defaultDate?: string; onDone: () => void }) {
  const { addFull, updateTask } = useKanbanStore();
  const [title, setTitle] = useState(item?.title ?? "");
  const [category, setCategory] = useState<TaskCategory>(item?.category ?? "Work");
  const [status, setStatus] = useState<TaskStatus>(item?.status ?? "Inbox");
  const [duration, setDuration] = useState(String(item?.duration_mins ?? 30));
  const [energy, setEnergy] = useState(String(item?.energy_required ?? 2));
  const [date, setDate] = useState(item?.date ?? defaultDate ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");

  function save() {
    if (!title.trim()) return;
    if (item) {
      updateTask(item.id, {
        title, category, status,
        duration_mins: Number(duration),
        energy_required: Number(energy) as Task["energy_required"],
        date: date || undefined,
        notes,
      });
    } else {
      addFull({
        title, category, status,
        duration_mins: Number(duration),
        energy_required: Number(energy) as Task["energy_required"],
        date: date || undefined,
        notes,
      });
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Titolo *</Label>
        <Input placeholder="Descrizione del task" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Categoria</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label>Stato</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Durata (min)</Label>
          <Input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
        <div>
          <Label>Energia (1–5)</Label>
          <Input type="number" min={1} max={5} value={energy} onChange={(e) => setEnergy(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Data (opzionale)</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="[color-scheme:dark]" />
      </div>
      <div>
        <Label>Note</Label>
        <Textarea placeholder="Dettagli opzionali..." value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <SaveBtn onClick={save}>{item ? "Salva modifiche" : "Aggiungi task"}</SaveBtn>
    </div>
  );
}

// ─── Flashcard form ─────────────────────────────────────────────
function FlashcardForm({ item, onDone }: { item?: Flashcard; onDone: () => void }) {
  const { addCard, updateCard } = useStudyStore();
  const [q, setQ] = useState(item?.q ?? "");
  const [a, setA] = useState(item?.a ?? "");
  const [tag, setTag] = useState(item?.tag ?? "ML");

  function save() {
    if (!q.trim() || !a.trim()) return;
    if (item) {
      updateCard(item.id, { q, a, tag });
    } else {
      addCard({ q, a, tag });
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Domanda *</Label>
        <Textarea placeholder="Inserisci la domanda..." value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      </div>
      <div>
        <Label>Risposta *</Label>
        <Textarea placeholder="Inserisci la risposta..." rows={4} value={a} onChange={(e) => setA(e.target.value)} />
      </div>
      <div>
        <Label>Tag</Label>
        <Input placeholder="es. Math, SQL, ML..." value={tag} onChange={(e) => setTag(e.target.value)} />
      </div>
      <SaveBtn onClick={save}>{item ? "Salva modifiche" : "Aggiungi flashcard"}</SaveBtn>
    </div>
  );
}

// ─── Roadmap task form ──────────────────────────────────────────
const PHASES = ["Fase 00", "Fase 01", "Fase 02", "Fase 03"];

function RoadmapForm({ item, onDone }: { item?: RoadmapTask; onDone: () => void }) {
  const { addRoadmapTask, updateRoadmapTask } = useStudyStore();
  const [title, setTitle] = useState(item?.title ?? "");
  const [phase, setPhase] = useState(item?.phase ?? "Fase 00");

  function save() {
    if (!title.trim()) return;
    if (item) {
      updateRoadmapTask(item.id, { title, phase });
    } else {
      addRoadmapTask({ title, phase });
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Titolo risorsa *</Label>
        <Input placeholder="es. CS50P Settimana 3" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>
      <div>
        <Label>Fase</Label>
        <Select value={phase} onChange={(e) => setPhase(e.target.value)}>
          {PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>
      <SaveBtn onClick={save}>{item ? "Salva modifiche" : "Aggiungi alla roadmap"}</SaveBtn>
    </div>
  );
}

// ─── Main Sheet ─────────────────────────────────────────────────
const TITLES: Record<CrudContext["type"], { add: string; edit: string }> = {
  task:     { add: "Nuovo Task",        edit: "Modifica Task" },
  flashcard:{ add: "Nuova Flashcard",   edit: "Modifica Flashcard" },
  roadmap:  { add: "Nuova Risorsa",     edit: "Modifica Risorsa" },
};

export function CrudSheet({ open, context, onClose }: Props) {
  // Use bottom sheet on mobile, right side on desktop
  // We detect via CSS (always render bottom, override with md class via conditional)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!context) return null;

  const hasItem = !!(
    (context.type === "task" && context.item) ||
    (context.type === "flashcard" && context.item) ||
    (context.type === "roadmap" && context.item)
  );

  const title = hasItem ? TITLES[context.type].edit : TITLES[context.type].add;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side={isMobile ? "bottom" : "right"}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {context.type === "task" && (
          <TaskForm item={context.item} defaultDate={(context as Extract<CrudContext, {type:"task"}>).defaultDate} onDone={onClose} />
        )}
        {context.type === "flashcard" && (
          <FlashcardForm item={context.item} onDone={onClose} />
        )}
        {context.type === "roadmap" && (
          <RoadmapForm item={context.item} onDone={onClose} />
        )}
      </SheetContent>
    </Sheet>
  );
}
