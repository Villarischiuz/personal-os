"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePhysicalStore } from "@/lib/stores/physicalStore";
import { MOCK_MACRO_LOGS } from "@/lib/mock-data";
import {
  buildOverloadTable,
  getLowStockItems,
  getDaysUntilDepletion,
} from "@/lib/computations";
import {
  TrendingUp, TrendingDown, Minus, Package, ShoppingCart,
  Trophy, Copy, Check, Plus, MoreHorizontal, Dumbbell,
} from "@/lib/icons";
import { cn, pct, today } from "@/lib/utils";
import type { InventoryItem, WorkoutEntry } from "@/lib/types";

// ─── Shared form primitives ────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
      {children}
    </label>
  );
}
function FInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors",
        className
      )}
      {...props}
    />
  );
}
function FSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="w-full rounded-xl border border-white/12 bg-[hsl(222,47%,10%)] px-3 py-3 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
      {...props}
    >
      {children}
    </select>
  );
}
function SaveBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 transition-all mt-6"
    >
      {children}
    </button>
  );
}

type WorkoutDay = "Lunedì" | "Mercoledì" | "Venerdì";

interface RoutineExercise {
  name: string;
  prescription: string;
  weight?: string;
  notes?: string;
}

interface RoutineDay {
  day: WorkoutDay;
  focus: string;
  warmup: string;
  cooldown: string;
  exercises: RoutineExercise[];
  accent: string;
  border: string;
  bg: string;
}

const WEEKLY_ROUTINE: RoutineDay[] = [
  {
    day: "Lunedì",
    focus: "Petto · Quadricipiti · Spalle · Addome",
    warmup: "Tappeto riscaldamento · 10 minuti",
    cooldown: "Tappeto defaticamento · 10-15 minuti",
    accent: "text-amber-300",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    exercises: [
      { name: "Spinte Manubri Panca 45°", prescription: "3×10", weight: "12.5 kg" },
      { name: "Chest Press", prescription: "3×12", weight: "30 kg" },
      { name: "Fly Machine", prescription: "3×15", weight: "35 kg" },
      { name: "Calf alla Macchina", prescription: "3×15", weight: "20 kg" },
      { name: "Leg Extension", prescription: "5×15", weight: "40 kg" },
      { name: "Alzate Laterali Manubri", prescription: "3×12", weight: "7.5 kg" },
      { name: "Crunch + Sit Up", prescription: "3×20" },
    ],
  },
  {
    day: "Mercoledì",
    focus: "Schiena · Posteriori coscia · Bicipiti · Core",
    warmup: "Vogatore riscaldamento · 5 minuti",
    cooldown: "Tappeto / Cyclette defaticamento · 15 minuti",
    accent: "text-sky-300",
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    exercises: [
      { name: "Stacco Rumeno Manubri", prescription: "3×10", weight: "15 kg" },
      { name: "Lat Machine Presa Media", prescription: "3×12", weight: "40 kg" },
      { name: "Pulley Largo", prescription: "3×12", weight: "30 kg" },
      { name: "Leg Curl Seduto", prescription: "3×15", weight: "45 kg" },
      { name: "Curl Bilanciere EZ", prescription: "3×10", weight: "10 kg" },
      { name: "Curl Corda al Cavo Basso", prescription: "3×15", weight: "10 kg" },
      { name: "Hyperextension", prescription: "3×12" },
      { name: "Criss Cross", prescription: "3×MAX" },
    ],
  },
  {
    day: "Venerdì",
    focus: "Gambe · Petto · Spalle · Tricipiti",
    warmup: "Air Bike riscaldamento · 5 minuti",
    cooldown: "Cyclette / Tappeto defaticamento · 20 minuti",
    accent: "text-violet-300",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    exercises: [
      { name: "Russian Twist + Mountain Climber", prescription: "1×1" },
      { name: "Affondi Dietro", prescription: "3×12", weight: "15 kg" },
      { name: "Abductor", prescription: "3×15", weight: "45 kg" },
      { name: "Chest a 30°", prescription: "3×10", weight: "15 kg" },
      { name: "Shoulder Press", prescription: "3×12" },
      { name: "Push Down Corda", prescription: "3×15" },
      { name: "French Press Manubri", prescription: "3×12" },
      { name: "Alzate Frontali Disco + Alzate Post. Manubri", prescription: "3×10" },
    ],
  },
];

// ─── Inventory Sheet ───────────────────────────────────────────
type InventorySheetState =
  | { open: false }
  | { open: true; item: InventoryItem | null };

type WorkoutSheetState =
  | { open: false }
  | { open: true; item: WorkoutEntry | null };

function InventorySheet({
  state,
  onClose,
}: {
  state: InventorySheetState;
  onClose: () => void;
}) {
  const { addInventoryItem, updateInventoryItem } = usePhysicalStore();
  const existing = state.open ? state.item : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [category, setCategory] = useState<InventoryItem["category"]>(
    existing?.category ?? "Supplement"
  );
  const [unit, setUnit] = useState(existing?.unit ?? "pills");
  const [stock, setStock] = useState(String(existing?.current_stock ?? ""));
  const [threshold, setThreshold] = useState(String(existing?.threshold ?? ""));
  const [dailyUsage, setDailyUsage] = useState(String(existing?.daily_usage ?? ""));
  const [autoReorder, setAutoReorder] = useState(existing?.auto_reorder ?? false);

  // reset when item changes
  function resetAndClose() {
    setName(""); setCategory("Supplement"); setUnit("pills");
    setStock(""); setThreshold(""); setDailyUsage(""); setAutoReorder(false);
    onClose();
  }

  function save() {
    if (!name.trim()) return;
    const payload: Omit<InventoryItem, "id"> = {
      name: name.trim(),
      category,
      unit,
      current_stock: Number(stock) || 0,
      threshold: Number(threshold) || 0,
      daily_usage: Number(dailyUsage) || 1,
      auto_reorder: autoReorder,
    };
    if (existing) {
      updateInventoryItem(existing.id, payload);
    } else {
      addInventoryItem(payload);
    }
    resetAndClose();
  }

  return (
    <Sheet open={state.open} onOpenChange={(v) => !v && resetAndClose()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{existing ? "Modifica prodotto" : "Nuovo prodotto"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Nome *</Label>
            <FInput
              placeholder="es. Creatina, Uova..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Categoria</Label>
              <FSelect
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryItem["category"])}
              >
                <option value="Supplement">Supplement</option>
                <option value="Food">Food</option>
              </FSelect>
            </div>
            <div>
              <Label>Unità</Label>
              <FInput
                placeholder="pills / g / units"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Scorta</Label>
              <FInput
                type="number" min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
            <div>
              <Label>Soglia</Label>
              <FInput
                type="number" min={0}
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <div>
              <Label>Uso/giorno</Label>
              <FInput
                type="number" min={0}
                value={dailyUsage}
                onChange={(e) => setDailyUsage(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => setAutoReorder((v) => !v)}
            className={cn(
              "w-full rounded-xl border py-3 text-sm font-semibold transition-all",
              autoReorder
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : "border-white/12 bg-white/5 text-white/40"
            )}
          >
            {autoReorder ? "✓ Auto-riordino attivo" : "Auto-riordino disattivo"}
          </button>
          <SaveBtn onClick={save}>{existing ? "Salva modifiche" : "Aggiungi prodotto"}</SaveBtn>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Workout Sheet ─────────────────────────────────────────────
function WorkoutSheet({
  state,
  onClose,
}: {
  state: WorkoutSheetState;
  onClose: () => void;
}) {
  const { addWorkoutEntry, updateWorkoutEntry } = usePhysicalStore();
  const todayISO = today();
  const existing = state.open ? state.item : null;

  const [date, setDate] = useState(existing?.date ?? todayISO);
  const [exercise, setExercise] = useState(existing?.exercise ?? "");
  const [muscleGroup, setMuscleGroup] = useState(existing?.muscle_group ?? "");
  const [weight, setWeight] = useState(String(existing?.weight ?? ""));
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(existing?.weight_unit ?? "kg");
  const [reps, setReps] = useState(String(existing?.reps ?? ""));
  const [sets, setSets] = useState(String(existing?.sets ?? "3"));
  const [overload, setOverload] = useState(existing?.progressive_overload_achieved ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function reset() {
    setDate(todayISO); setExercise(""); setMuscleGroup("");
    setWeight(""); setWeightUnit("kg"); setReps(""); setSets("3");
    setOverload(false); setNotes("");
  }

  function save() {
    if (!exercise.trim() || !weight || !reps) return;
    const entry: Omit<WorkoutEntry, "id"> = {
      date,
      exercise: exercise.trim(),
      muscle_group: muscleGroup.trim() || "—",
      weight: Number(weight),
      weight_unit: weightUnit,
      reps: Number(reps),
      sets: Number(sets) || 3,
      progressive_overload_achieved: overload,
      notes: notes.trim() || undefined,
    };
    if (existing) {
      updateWorkoutEntry(existing.id, entry);
    } else {
      addWorkoutEntry(entry);
    }
    reset();
    onClose();
  }

  return (
    <Sheet open={state.open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{existing ? "Modifica esercizio" : "Registra esercizio"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Data</Label>
            <FInput
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className="[color-scheme:dark]"
            />
          </div>
          <div>
            <Label>Esercizio *</Label>
            <FInput
              placeholder="es. Bench Press, Squat..."
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label>Gruppo muscolare</Label>
            <FInput
              placeholder="es. Petto, Gambe..."
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Peso *</Label>
              <FInput
                type="number" min={0} step={0.5}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <Label>Unità</Label>
              <FSelect
                value={weightUnit}
                onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}
              >
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </FSelect>
            </div>
            <div>
              <Label>Serie</Label>
              <FInput
                type="number" min={1} max={10}
                value={sets}
                onChange={(e) => setSets(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Reps *</Label>
            <FInput
              type="number" min={1}
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
          </div>
          <button
            onClick={() => setOverload((v) => !v)}
            className={cn(
              "w-full rounded-xl border py-3 text-sm font-semibold transition-all",
              overload
                ? "border-green-500/40 bg-green-500/10 text-green-400"
                : "border-white/12 bg-white/5 text-white/40"
            )}
          >
            {overload ? "✓ Overload progressivo raggiunto" : "Overload non raggiunto"}
          </button>
          <div>
            <Label>Note (opzionale)</Label>
            <FInput
              placeholder="es. Manubri per lato..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <SaveBtn onClick={save}>{existing ? "Salva modifiche" : "Aggiungi esercizio"}</SaveBtn>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function PhysicalPage() {
  const { inventory, workoutEntries, deleteInventoryItem, deleteWorkoutEntry } =
    usePhysicalStore();
  const [copied, setCopied] = useState(false);
  const [invSheet, setInvSheet] = useState<InventorySheetState>({ open: false });
  const [workoutSheet, setWorkoutSheet] = useState<WorkoutSheetState>({ open: false });

  const overloadRows = buildOverloadTable(workoutEntries);
  const lowStock = getLowStockItems(inventory);
  const todayMacros = MOCK_MACRO_LOGS[MOCK_MACRO_LOGS.length - 1];
  const totalRoutineExercises = WEEKLY_ROUTINE.reduce((sum, day) => sum + day.exercises.length, 0);
  const todayLabel = new Date().toLocaleDateString("it-IT", { weekday: "long" });

  // find the most recent workout entry ID for a given exercise name
  function latestEntry(exerciseName: string): WorkoutEntry | null {
    const matches = workoutEntries
      .filter((e) => e.exercise === exerciseName)
      .sort((a, b) => b.date.localeCompare(a.date));
    return matches[0] ?? null;
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Piano Fisico</h1>
        <p className="mt-1 text-sm text-white/40">
          Overload progressivo · Inventario · Macro
        </p>
      </div>

      <Card>
        <CardHeader className="flex-wrap gap-3">
          <CardTitle>Scheda Settimanale</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">3 giorni</Badge>
            <span className="text-xs text-white/30">
              {totalRoutineExercises} esercizi totali · oggi {todayLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {WEEKLY_ROUTINE.map((session) => (
              <div
                key={session.day}
                className={cn("rounded-2xl border p-4", session.bg, session.border)}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className={cn("text-lg font-black", session.accent)}>{session.day}</p>
                    <p className="mt-1 text-xs text-white/40">{session.focus}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Volume</p>
                    <p className="mt-1 font-mono text-sm font-bold text-white">
                      {session.exercises.length} esercizi
                    </p>
                  </div>
                </div>

                <div className="mb-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300/80">Riscaldamento</p>
                  <p className="mt-1 text-sm font-semibold text-blue-200">{session.warmup}</p>
                </div>

                <div className="space-y-2">
                  {session.exercises.map((exercise) => (
                    <div
                      key={`${session.day}-${exercise.name}`}
                      className="rounded-xl border border-white/8 bg-black/10 px-3 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-white/30">
                          <Dumbbell size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold leading-snug text-white/90">
                            {exercise.name}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-lime-300">
                              {exercise.prescription}
                            </span>
                            {exercise.weight && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
                                {exercise.weight}
                              </span>
                            )}
                          </div>
                          {exercise.notes && (
                            <p className="mt-2 text-[11px] text-white/35">{exercise.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-white/8 bg-white/5 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Defaticamento</p>
                  <p className="mt-1 text-sm font-medium text-white/70">{session.cooldown}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Overload Table ─────────────────────────────────── */}
      <Card>
        <CardHeader className="flex-wrap gap-3">
          <CardTitle>Overload Progressivo</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-white/30">Sessione precedente → attuale</span>
            <button
              onClick={() => setWorkoutSheet({ open: true, item: null })}
              className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/8 hover:text-white transition-colors"
            >
              <Plus size={11} /> Aggiungi
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-xs text-white/35">
                  <th className="pb-3 pr-4 font-medium">Esercizio</th>
                  <th className="pb-3 pr-4 font-medium">Gruppo</th>
                  <th className="pb-3 pr-4 font-medium text-right">Prec.</th>
                  <th className="pb-3 pr-4 font-medium text-right">Attuale</th>
                  <th className="pb-3 font-medium text-center">Trend</th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {overloadRows.map((row) => {
                  const prev =
                    row.prev_weight !== null
                      ? `${row.prev_weight}${row.weight_unit} × ${row.prev_reps}r`
                      : "—";
                  const curr =
                    row.curr_weight !== null
                      ? `${row.curr_weight}${row.weight_unit} × ${row.curr_reps}r`
                      : "—";

                  return (
                    <tr key={row.exercise} className="group border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          {row.exercise}
                          {row.is_pr && (
                            <Trophy
                              size={12}
                              className="text-yellow-500"
                              aria-label="Personal Record"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-white/50">
                          {row.muscle_group}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-white/40">
                        {prev}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-xs text-white">
                        {curr}
                      </td>
                      <td className="py-3 text-center">
                        {row.overload_achieved ? (
                          <TrendingUp size={16} className="mx-auto text-green-400" />
                        ) : row.prev_weight === null ? (
                          <Minus size={16} className="mx-auto text-white/20" />
                        ) : (
                          <TrendingDown size={16} className="mx-auto text-yellow-400" />
                        )}
                      </td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex min-h-[32px] min-w-[32px] items-center justify-center rounded p-1.5 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/60 md:opacity-0 md:group-hover:opacity-100">
                              <MoreHorizontal size={13} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const entry = latestEntry(row.exercise);
                                if (entry) {
                                  setWorkoutSheet({ open: true, item: entry });
                                }
                              }}
                            >
                              Modifica
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                const entry = latestEntry(row.exercise);
                                if (entry) deleteWorkoutEntry(entry.id);
                              }}
                              className="text-red-400 focus:text-red-400"
                            >
                              Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ─── Low Stock Alert ─────────────────────────────── */}
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <CardTitle>Scorte in Esaurimento</CardTitle>
            {lowStock.length > 0 && (
              <Badge variant="danger">{lowStock.length} da ordinare</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-3 overflow-x-auto">
            {lowStock.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/30">
                Tutte le scorte sono ok.
              </p>
            ) : (
              <>
                {lowStock.map((item) => {
                  const days = getDaysUntilDepletion(item);
                  return (
                    <div
                      key={item.id}
                      className="group min-w-[280px] rounded-lg border border-red-500/20 bg-red-500/5 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-red-400" />
                          <span className="text-sm font-medium text-white">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-400">
                            {days === Infinity ? "∞" : `~${days}gg`}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="rounded p-1 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/60 md:opacity-0 md:group-hover:opacity-100">
                                <MoreHorizontal size={12} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setInvSheet({ open: true, item })
                                }
                              >
                                Modifica
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteInventoryItem(item.id)}
                                className="text-red-400 focus:text-red-400"
                              >
                                Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
                        <span>
                          {item.current_stock} {item.unit} rimasti
                        </span>
                        <span>
                          soglia: {item.threshold} {item.unit}
                        </span>
                      </div>
                      <Progress
                        value={pct(item.current_stock, item.threshold)}
                        barClassName="bg-red-500"
                      />
                    </div>
                  );
                })}
                {/* Copy grocery list */}
                <button
                  onClick={() => {
                    const text = lowStock
                      .map(
                        (i) =>
                          `• ${i.name} (${i.current_stock} ${i.unit} rimasti)`
                      )
                      .join("\n");
                    navigator.clipboard
                      .writeText(`Lista spesa:\n${text}`)
                      .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      });
                  }}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all active:scale-95",
                    copied
                      ? "border-green-500/40 bg-green-500/10 text-green-400"
                      : "border-white/15 bg-white/5 text-white/60 hover:bg-white/8 hover:text-white"
                  )}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Lista copiata!" : "Copia lista spesa"}
                </button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ─── Full Inventory ──────────────────────────────── */}
        <Card>
          <CardHeader className="flex-wrap gap-3">
            <CardTitle>Inventario Completo</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/30">
                {inventory.length} prodotti tracciati
              </span>
              <button
                onClick={() => setInvSheet({ open: true, item: null })}
                className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-white/60 hover:bg-white/8 hover:text-white transition-colors"
              >
                <Plus size={10} /> Aggiungi
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 overflow-x-auto">
            {inventory.map((item) => {
              const stockPct = pct(item.current_stock, item.threshold * 2);
              const isLow = item.current_stock <= item.threshold;
              return (
                <div
                  key={item.id}
                  className="group flex min-w-[280px] items-center gap-3 border-b border-white/5 py-1.5 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white truncate">
                        {item.name}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isLow ? "text-red-400" : "text-white/40"
                        )}
                      >
                        {item.current_stock} {item.unit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stockPct, 100)}
                      barClassName={isLow ? "bg-red-500" : "bg-emerald-500"}
                    />
                  </div>
                  {item.auto_reorder && (
                    <ShoppingCart
                      size={12}
                      className="flex-shrink-0 text-white/20"
                      aria-label="Auto-riordino attivo"
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex min-h-[28px] min-w-[28px] flex-shrink-0 items-center justify-center rounded p-1 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/60 md:opacity-0 md:group-hover:opacity-100">
                        <MoreHorizontal size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setInvSheet({ open: true, item })}
                      >
                        Modifica
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteInventoryItem(item.id)}
                        className="text-red-400 focus:text-red-400"
                      >
                        Elimina
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ─── Macros Today ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Macro di Oggi</CardTitle>
          <span
            className={cn(
              "text-xs font-semibold",
              todayMacros &&
                pct(todayMacros.protein_g_actual, todayMacros.protein_g_target) >= 90
                ? "text-green-400"
                : "text-yellow-400"
            )}
          >
            {todayMacros
              ? `${todayMacros.calories_actual} / ${todayMacros.calories_target} kcal`
              : "—"}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              {
                label: "Calorie",
                actual: todayMacros.calories_actual,
                target: todayMacros.calories_target,
                unit: "kcal",
                color: "bg-blue-500",
              },
              {
                label: "Proteine",
                actual: todayMacros.protein_g_actual,
                target: todayMacros.protein_g_target,
                unit: "g",
                color: "bg-green-500",
              },
              {
                label: "Carboidrati",
                actual: todayMacros.carbs_g_actual,
                target: todayMacros.carbs_g_target,
                unit: "g",
                color: "bg-yellow-500",
              },
              {
                label: "Grassi",
                actual: todayMacros.fat_g_actual,
                target: todayMacros.fat_g_target,
                unit: "g",
                color: "bg-purple-500",
              },
            ].map(({ label, actual, target, unit, color }) => {
              const p = pct(actual, target);
              return (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/3 p-3"
                >
                  <p className="mb-1 text-xs text-white/40">{label}</p>
                  <p className="mb-2 font-mono text-lg font-bold text-white">
                    {actual}
                    <span className="text-sm text-white/30">
                      /{target}
                      {unit}
                    </span>
                  </p>
                  <Progress value={p} barClassName={color} />
                  <p className="mt-1 text-right text-[10px] text-white/30">
                    {Math.round(p)}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─── Sheets ──────────────────────────────────────────── */}
      <InventorySheet
        key={`inventory-${invSheet.open ? invSheet.item?.id ?? "new" : "closed"}`}
        state={invSheet}
        onClose={() => setInvSheet({ open: false })}
      />
      <WorkoutSheet
        key={`workout-${workoutSheet.open ? workoutSheet.item?.id ?? "new" : "closed"}`}
        state={workoutSheet}
        onClose={() => setWorkoutSheet({ open: false })}
      />
    </div>
  );
}
