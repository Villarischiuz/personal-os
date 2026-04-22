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
import { getLowStockItems, getDaysUntilDepletion } from "@/lib/computations";
import {
  Package, ShoppingCart, Copy, Check, Plus, MoreHorizontal, Dumbbell,
  ChevronUp, ChevronDown, Edit3, Trash2,
} from "@/lib/icons";
import { cn, pct } from "@/lib/utils";
import type { InventoryItem, RoutineExercise, WeightLog } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────
function weightSince(
  exerciseName: string,
  weightNum: number | undefined,
  weightUnit: string,
  weightLogs: WeightLog[]
): string | null {
  if (!weightNum) return null;
  const logs = weightLogs
    .filter((l) => l.exerciseName === exerciseName)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!logs.length) return null;

  let sinceDate = logs[0].date;
  for (const log of logs) {
    if (log.weightNum === weightNum && log.weightUnit === weightUnit) {
      sinceDate = log.date;
    } else {
      break;
    }
  }

  const days = Math.floor((Date.now() - new Date(sinceDate).getTime()) / 86400000);
  if (days === 0) return "da oggi";
  if (days === 1) return "da ieri";
  if (days < 7) return `da ${days} gg`;
  return `da ${Math.floor(days / 7)} sett.`;
}

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

// ─── Meal Plan ────────────────────────────────────────────────
type MealKey = "colazione" | "spuntino_mattina" | "pranzo" | "spuntino_pomeriggio" | "cena";

interface MealGroup { label: string; options: string[] }
interface MealData {
  label: string;
  emoji: string;
  timeRange: string;
  note?: string;
  supplements?: string[];
  groups: MealGroup[];
}

const MEAL_PLAN: Record<MealKey, MealData> = {
  colazione: {
    label: "Colazione",
    emoji: "☀️",
    timeRange: "Prima delle 11:00",
    note: "15 min prima: 2 bicchieri acqua essenziale",
    supplements: ["1 cps Multivitaminico", "1 cps Omega 3", "5g Creatina in 300ml acqua"],
    groups: [
      {
        label: "Carboidrati — scegli 1",
        options: [
          "30g Fette Biscottate Integrali",
          "30g Flakes di Mais",
          "50g Pan Bauletto Integrale tostato",
          "30g Farina d'Avena Aromatizzata",
          "30g Crema di Riso Aromatizzata",
        ],
      },
      {
        label: "Proteine — scegli 1",
        options: [
          "200ml Albume",
          "200g Yogurt Greco",
          "25g Whey Isolate + 200ml Bevanda Vegetale (zero zuccheri)",
        ],
      },
      {
        label: "Extra",
        options: ["1 Uovo", "10g Frutta Secca pelata (senza sale)", "Marmellata Hero Light o Top Zero Kcal"],
      },
    ],
  },
  spuntino_mattina: {
    label: "Spuntino Mattina",
    emoji: "⚡",
    timeRange: "11:00 – 13:00",
    groups: [
      {
        label: "Snack",
        options: ["15g Frutta Secca (senza sale)", "300ml Acqua Oligominerale"],
      },
    ],
  },
  pranzo: {
    label: "Pranzo",
    emoji: "🥗",
    timeRange: "13:00 – 16:00",
    supplements: ["1 cps Omega 3"],
    groups: [
      {
        label: "Carboidrati — scegli 1",
        options: [
          "80g Pasta Integrale",
          "80g Riso Basmati",
          "150g Pane Integrale",
          "350g Patate",
          "80g Cous Cous",
        ],
      },
      {
        label: "Proteine — scegli 1",
        options: [
          "150g Petto di Pollo",
          "150g Petto di Tacchino",
          "150g Lonza di Maiale",
          "250g Pesce Bianco",
          "120g Fesa di Tacchino",
          "120g Tonno al Naturale",
        ],
      },
      {
        label: "Extra",
        options: ["200g Verdure", "10g Olio EVO a crudo", "1g Sale a crudo", "600ml Acqua Oligominerale"],
      },
    ],
  },
  spuntino_pomeriggio: {
    label: "Spuntino / Post-Workout",
    emoji: "🏋️",
    timeRange: "16:00 – 19:00",
    note: "Giorni palestra (Lun/Mer/Ven): salta spuntino → fai solo Post-Workout",
    groups: [
      {
        label: "Post-Workout — giorni palestra",
        options: ["25g Whey Isolate", "30g Gallette di Riso o Mais"],
      },
      {
        label: "Carboidrati — scegli 1 (no palestra)",
        options: ["30g Wasa", "50g Pane Integrale", "30g Gallette di Riso o Mais"],
      },
      {
        label: "Proteine — scegli 1 (no palestra)",
        options: ["80g Fesa di Tacchino", "50g Bresaola", "150g Kefir", "25g Whey Isolate"],
      },
      {
        label: "Extra (no palestra)",
        options: ["10g Frutta Secca / 10g Cioccolato Fondente 80%", "300ml Acqua Oligominerale"],
      },
    ],
  },
  cena: {
    label: "Cena",
    emoji: "🌙",
    timeRange: "19:00 – 23:00",
    supplements: ["1 cps Omega 3"],
    groups: [
      {
        label: "Carboidrati — scegli 1",
        options: [
          "300g Patate",
          "70g Cous Cous Integrale",
          "100g Piadina Integrale",
          "70g Pasta Integrale",
          "70g Gallette di Riso o Mais",
        ],
      },
      {
        label: "Proteine — scegli 1",
        options: [
          "250g Pesce Bianco",
          "150g Petto di Pollo",
          "150g Lonza di Maiale",
          "150g Filetto Bovino Magro (max 2×/sett.)",
          "250g Albume",
        ],
      },
      {
        label: "Extra",
        options: ["200g Verdure", "10g Olio EVO a crudo + 1 Uovo", "1.5g Sale a crudo", "600ml Acqua Oligominerale"],
      },
    ],
  },
};

const MEAL_ORDER: MealKey[] = ["colazione", "spuntino_mattina", "pranzo", "spuntino_pomeriggio", "cena"];
const MEAL_COLORS: Record<MealKey, { border: string; bg: string; text: string; sup: string }> = {
  colazione:           { border: "border-amber-500/25",  bg: "bg-amber-500/5",  text: "text-amber-300",  sup: "border-amber-500/20 bg-amber-500/8 text-amber-200" },
  spuntino_mattina:    { border: "border-lime-500/25",   bg: "bg-lime-500/5",   text: "text-lime-300",   sup: "border-lime-500/20 bg-lime-500/8 text-lime-200" },
  pranzo:              { border: "border-blue-500/25",   bg: "bg-blue-500/5",   text: "text-blue-300",   sup: "border-cyan-500/20 bg-cyan-500/8 text-cyan-200" },
  spuntino_pomeriggio: { border: "border-orange-500/25", bg: "bg-orange-500/5", text: "text-orange-300", sup: "border-orange-500/20 bg-orange-500/8 text-orange-200" },
  cena:                { border: "border-violet-500/25", bg: "bg-violet-500/5", text: "text-violet-300", sup: "border-violet-500/20 bg-violet-500/8 text-violet-200" },
};

function getMealKey(hour: number): MealKey {
  if (hour < 11) return "colazione";
  if (hour < 13) return "spuntino_mattina";
  if (hour < 16) return "pranzo";
  if (hour < 20) return "spuntino_pomeriggio";
  return "cena";
}

function MealPlanCard() {
  const hour = new Date().getHours();
  const mealKey = getMealKey(hour);
  const meal = MEAL_PLAN[mealKey];
  const currentIdx = MEAL_ORDER.indexOf(mealKey);
  const nextKey = MEAL_ORDER[(currentIdx + 1) % MEAL_ORDER.length];
  const nextMeal = MEAL_PLAN[nextKey];
  const colors = MEAL_COLORS[mealKey];

  return (
    <Card>
      <CardHeader className="flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none">{meal.emoji}</span>
          <div>
            <CardTitle>{meal.label}</CardTitle>
            <p className="text-xs text-white/30 mt-0.5">{meal.timeRange}</p>
          </div>
        </div>
        <Badge variant="blue">Piano Nutrizionale Apr 2026</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {meal.note && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
            <p className="text-xs text-amber-300/80">{meal.note}</p>
          </div>
        )}

        {meal.supplements && meal.supplements.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">Supplementi</p>
            <div className="flex flex-wrap gap-2">
              {meal.supplements.map((s, i) => (
                <span key={i} className={cn("rounded-lg border px-2.5 py-1 text-xs font-medium", colors.sup)}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {meal.groups.map((group, gi) => (
          <div key={gi} className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-white/35 font-semibold">{group.label}</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {group.options.map((opt, oi) => (
                <div key={oi} className={cn("rounded-xl border px-3 py-2.5", colors.border, colors.bg)}>
                  <p className={cn("text-sm font-medium leading-snug", colors.text)}>{opt}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2 border-t border-white/8">
          <p className="text-xs text-white/25">
            Prossimo pasto:{" "}
            <span className="text-white/45 font-medium">
              {nextMeal.emoji} {nextMeal.label} ({nextMeal.timeRange})
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Inventory Sheet ───────────────────────────────────────────
type InventorySheetState =
  | { open: false }
  | { open: true; item: InventoryItem | null };

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
              <FInput type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div>
              <Label>Soglia</Label>
              <FInput type="number" min={0} value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </div>
            <div>
              <Label>Uso/giorno</Label>
              <FInput type="number" min={0} value={dailyUsage} onChange={(e) => setDailyUsage(e.target.value)} />
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

// ─── Routine Exercise Sheet ────────────────────────────────────
type ExerciseSheetState =
  | { open: false }
  | { open: true; day: string; exercise: RoutineExercise | null };

function RoutineExerciseSheet({
  state,
  onClose,
  weightLogs,
}: {
  state: ExerciseSheetState;
  onClose: () => void;
  weightLogs: WeightLog[];
}) {
  const { addRoutineExercise, updateRoutineExercise, logWeight } = usePhysicalStore();
  const existing = state.open ? state.exercise : null;
  const day = state.open ? state.day : "";

  const [name, setName] = useState(existing?.name ?? "");
  const [prescription, setPrescription] = useState(existing?.prescription ?? "");
  const [weightNum, setWeightNum] = useState(String(existing?.weightNum ?? ""));
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(existing?.weightUnit ?? "kg");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  function close() {
    setName(""); setPrescription(""); setWeightNum(""); setWeightUnit("kg"); setNotes("");
    onClose();
  }

  function save() {
    if (!name.trim() || !prescription.trim()) return;
    const wNum = weightNum ? Number(weightNum) : undefined;
    const payload: Omit<RoutineExercise, "id"> = {
      name: name.trim(),
      prescription: prescription.trim(),
      weightNum: wNum,
      weightUnit,
      notes: notes.trim() || undefined,
    };
    if (existing) {
      updateRoutineExercise(day, existing.id, payload);
    } else {
      addRoutineExercise(day, payload);
      if (wNum && wNum > 0) logWeight(name.trim(), wNum, weightUnit);
    }
    close();
  }

  const history = state.open && existing
    ? weightLogs
        .filter((l) => l.exerciseName === existing.name)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8)
    : [];

  return (
    <Sheet open={state.open} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{existing ? "Modifica esercizio" : "Nuovo esercizio"}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Nome *</Label>
            <FInput
              placeholder="es. Bench Press, Squat..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label>Serie × Reps *</Label>
            <FInput
              placeholder="es. 3×10"
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Peso</Label>
              <FInput
                type="number"
                min={0}
                step={0.5}
                placeholder="es. 12.5"
                value={weightNum}
                onChange={(e) => setWeightNum(e.target.value)}
              />
            </div>
            <div>
              <Label>Unità</Label>
              <FSelect value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as "kg" | "lbs")}>
                <option value="kg">kg</option>
                <option value="lbs">lbs</option>
              </FSelect>
            </div>
          </div>
          <div>
            <Label>Note (opzionale)</Label>
            <FInput
              placeholder="es. Manubri per lato..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <SaveBtn onClick={save}>{existing ? "Salva modifiche" : "Aggiungi esercizio"}</SaveBtn>

          {history.length > 0 && (
            <div className="mt-2 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Storico pesi
              </p>
              <div className="space-y-2">
                {history.map((log, i) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-mono text-xs font-bold",
                        i === 0 ? "text-lime-300" : "text-white/50"
                      )}
                    >
                      {log.weightNum} {log.weightUnit}
                      {i === 0 && (
                        <span className="ml-2 text-[10px] text-white/30 font-normal">attuale</span>
                      )}
                    </span>
                    <span className="text-[11px] text-white/30">{log.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function PhysicalPage() {
  const {
    inventory,
    weeklyRoutine,
    weightLogs,
    deleteInventoryItem,
    deleteRoutineExercise,
    moveRoutineExercise,
  } = usePhysicalStore();

  const [copied, setCopied] = useState(false);
  const [invSheet, setInvSheet] = useState<InventorySheetState>({ open: false });
  const [exSheet, setExSheet] = useState<ExerciseSheetState>({ open: false });
  const [editingDay, setEditingDay] = useState<string | null>(null);

  const lowStock = getLowStockItems(inventory);
  const todayMacros = MOCK_MACRO_LOGS[MOCK_MACRO_LOGS.length - 1];
  const totalExercises = weeklyRoutine.reduce((sum, d) => sum + d.exercises.length, 0);
  const todayLabel = new Date().toLocaleDateString("it-IT", { weekday: "long" });

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Piano Fisico</h1>
        <p className="mt-1 text-sm text-white/40">
          Piano nutrizionale · Scheda settimanale · Inventario · Macro
        </p>
      </div>

      {/* ─── Piano Nutrizionale ──────────────────────────── */}
      <MealPlanCard />

      {/* ─── Scheda Settimanale ──────────────────────────── */}
      <Card>
        <CardHeader className="flex-wrap gap-3">
          <CardTitle>Scheda Settimanale</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue">3 giorni</Badge>
            <span className="text-xs text-white/30">
              {totalExercises} esercizi totali · oggi {todayLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {weeklyRoutine.map((session) => {
              const isEditing = editingDay === session.day;
              return (
                <div
                  key={session.day}
                  className={cn("rounded-2xl border p-4", session.bg, session.border)}
                >
                  {/* Day header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className={cn("text-lg font-black", session.accent)}>{session.day}</p>
                      <p className="mt-1 text-xs text-white/40">{session.focus}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-2 text-right">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Volume</p>
                        <p className="mt-1 font-mono text-sm font-bold text-white">
                          {session.exercises.length} esercizi
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingDay(isEditing ? null : session.day)}
                        className={cn(
                          "rounded-xl border px-3 py-2 text-xs font-bold transition-all whitespace-nowrap",
                          isEditing
                            ? "border-green-500/40 bg-green-500/10 text-green-400"
                            : "border-white/15 bg-white/5 text-white/50 hover:text-white hover:bg-white/8"
                        )}
                      >
                        {isEditing ? "✓ Fatto" : "Modifica"}
                      </button>
                    </div>
                  </div>

                  {/* Warmup */}
                  <div className="mb-3 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300/80">
                      Riscaldamento
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-200">{session.warmup}</p>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    {session.exercises.map((exercise, idx) => {
                      const since = weightSince(
                        exercise.name,
                        exercise.weightNum,
                        exercise.weightUnit,
                        weightLogs
                      );
                      return (
                        <div
                          key={exercise.id}
                          className="rounded-xl border border-white/8 bg-black/10 px-3 py-3"
                        >
                          <div className="flex items-start gap-2">
                            {/* Reorder arrows */}
                            {isEditing && (
                              <div className="flex flex-col gap-0.5 pt-0.5 flex-shrink-0">
                                <button
                                  onClick={() => moveRoutineExercise(session.day, idx, idx - 1)}
                                  disabled={idx === 0}
                                  className="rounded p-0.5 text-white/30 disabled:opacity-20 hover:text-white/70 transition-colors"
                                >
                                  <ChevronUp size={13} />
                                </button>
                                <button
                                  onClick={() =>
                                    moveRoutineExercise(session.day, idx, idx + 1)
                                  }
                                  disabled={idx === session.exercises.length - 1}
                                  className="rounded p-0.5 text-white/30 disabled:opacity-20 hover:text-white/70 transition-colors"
                                >
                                  <ChevronDown size={13} />
                                </button>
                              </div>
                            )}

                            <div className="mt-0.5 rounded-lg bg-white/5 p-2 text-white/30 flex-shrink-0">
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
                                {exercise.weightNum ? (
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/55">
                                    {exercise.weightNum} {exercise.weightUnit}
                                  </span>
                                ) : null}
                                {since && (
                                  <span className="text-[10px] text-white/30 italic">{since}</span>
                                )}
                              </div>
                              {exercise.notes && (
                                <p className="mt-2 text-[11px] text-white/35">{exercise.notes}</p>
                              )}
                            </div>

                            {/* Edit/delete in edit mode, kebab in normal mode */}
                            {isEditing ? (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={() =>
                                    setExSheet({ open: true, day: session.day, exercise })
                                  }
                                  className="rounded p-1.5 text-white/30 hover:bg-white/10 hover:text-white/70 transition-colors"
                                  title="Modifica"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteRoutineExercise(session.day, exercise.id)
                                  }
                                  className="rounded p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                  title="Elimina"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="flex min-h-[32px] min-w-[32px] flex-shrink-0 items-center justify-center rounded p-1.5 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/60 md:opacity-0 md:group-hover:opacity-100">
                                    <MoreHorizontal size={13} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setExSheet({ open: true, day: session.day, exercise })
                                    }
                                  >
                                    Modifica
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      deleteRoutineExercise(session.day, exercise.id)
                                    }
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add exercise button — only in edit mode */}
                  {isEditing && (
                    <button
                      onClick={() => setExSheet({ open: true, day: session.day, exercise: null })}
                      className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs font-semibold text-white/40 hover:border-white/35 hover:text-white/60 transition-colors"
                    >
                      <Plus size={12} /> Aggiungi esercizio
                    </button>
                  )}

                  {/* Cooldown */}
                  <div className="mt-3 rounded-xl border border-white/8 bg-white/5 px-3 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                      Defaticamento
                    </p>
                    <p className="mt-1 text-sm font-medium text-white/70">{session.cooldown}</p>
                  </div>
                </div>
              );
            })}
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
                          <span className="text-sm font-medium text-white">{item.name}</span>
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
                              <DropdownMenuItem onClick={() => setInvSheet({ open: true, item })}>
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
                        <span>{item.current_stock} {item.unit} rimasti</span>
                        <span>soglia: {item.threshold} {item.unit}</span>
                      </div>
                      <Progress value={pct(item.current_stock, item.threshold)} barClassName="bg-red-500" />
                    </div>
                  );
                })}
                <button
                  onClick={() => {
                    const text = lowStock
                      .map((i) => `• ${i.name} (${i.current_stock} ${i.unit} rimasti)`)
                      .join("\n");
                    navigator.clipboard.writeText(`Lista spesa:\n${text}`).then(() => {
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
              <span className="text-xs text-white/30">{inventory.length} prodotti tracciati</span>
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
                      <span className="text-xs font-medium text-white truncate">{item.name}</span>
                      <span className={cn("text-[10px] font-mono", isLow ? "text-red-400" : "text-white/40")}>
                        {item.current_stock} {item.unit}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(stockPct, 100)}
                      barClassName={isLow ? "bg-red-500" : "bg-emerald-500"}
                    />
                  </div>
                  {item.auto_reorder && (
                    <ShoppingCart size={12} className="flex-shrink-0 text-white/20" aria-label="Auto-riordino attivo" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex min-h-[28px] min-w-[28px] flex-shrink-0 items-center justify-center rounded p-1 text-white/20 opacity-100 transition-colors hover:bg-white/10 hover:text-white/60 md:opacity-0 md:group-hover:opacity-100">
                        <MoreHorizontal size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setInvSheet({ open: true, item })}>
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
              { label: "Calorie", actual: todayMacros.calories_actual, target: todayMacros.calories_target, unit: "kcal", color: "bg-blue-500" },
              { label: "Proteine", actual: todayMacros.protein_g_actual, target: todayMacros.protein_g_target, unit: "g", color: "bg-green-500" },
              { label: "Carboidrati", actual: todayMacros.carbs_g_actual, target: todayMacros.carbs_g_target, unit: "g", color: "bg-yellow-500" },
              { label: "Grassi", actual: todayMacros.fat_g_actual, target: todayMacros.fat_g_target, unit: "g", color: "bg-purple-500" },
            ].map(({ label, actual, target, unit, color }) => {
              const p = pct(actual, target);
              return (
                <div key={label} className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <p className="mb-1 text-xs text-white/40">{label}</p>
                  <p className="mb-2 font-mono text-lg font-bold text-white">
                    {actual}
                    <span className="text-sm text-white/30">/{target}{unit}</span>
                  </p>
                  <Progress value={p} barClassName={color} />
                  <p className="mt-1 text-right text-[10px] text-white/30">{Math.round(p)}%</p>
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
      <RoutineExerciseSheet
        key={`ex-${exSheet.open ? `${exSheet.day}-${exSheet.exercise?.id ?? "new"}` : "closed"}`}
        state={exSheet}
        onClose={() => setExSheet({ open: false })}
        weightLogs={weightLogs}
      />
    </div>
  );
}
