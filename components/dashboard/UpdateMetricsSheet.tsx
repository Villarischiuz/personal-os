"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBiometricStore } from "@/lib/stores/biometricStore";
import { cn } from "@/lib/utils";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}

interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display?: string;
}

function Stepper({ value, onChange, min, max, step, display }: StepperProps) {
  function decr() { onChange(Math.max(min, parseFloat((value - step).toFixed(2)))); }
  function incr() { onChange(Math.min(max, parseFloat((value + step).toFixed(2)))); }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={decr}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-white/70 hover:bg-white/10 active:scale-95 transition-all"
      >
        −
      </button>
      <div className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-center text-base font-bold text-white">
        {display ?? value}
      </div>
      <button
        onClick={incr}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-bold text-white/70 hover:bg-white/10 active:scale-95 transition-all"
      >
        +
      </button>
    </div>
  );
}

const MOOD_EMOJI: Record<number, string> = { 1: "😞", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UpdateMetricsSheet({ open, onClose }: Props) {
  const { todayLog, todayMacros, updateTodayMetrics } = useBiometricStore();

  const [sleep, setSleep] = useState(todayLog.sleep_hours);
  const [rhr, setRhr] = useState(todayLog.rhr);
  const [rpe, setRpe] = useState(todayLog.training_rpe);
  const [pomodoros, setPomodoros] = useState(todayLog.pomodoros_completed);
  const [water, setWater] = useState(todayLog.water_ml ?? 0);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(todayLog.mood ?? 3);
  const [calories, setCalories] = useState(todayMacros.calories_actual);
  const [protein, setProtein] = useState(todayMacros.protein_g_actual);
  const [carbs, setCarbs] = useState(todayMacros.carbs_g_actual);
  const [fat, setFat] = useState(todayMacros.fat_g_actual);

  function save() {
    updateTodayMetrics({
      logPatch: {
        sleep_hours: sleep,
        rhr,
        training_rpe: rpe,
        water_ml: water || undefined,
        pomodoros_completed: pomodoros,
        mood,
      },
      macroPatch: {
        calories_actual: calories,
        protein_g_actual: protein,
        carbs_g_actual: carbs,
        fat_g_actual: fat,
      },
    });
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Aggiorna Metriche di Oggi</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          {/* Recovery */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Recovery</p>
            <div>
              <Label>Sonno (h) · {sleep}h</Label>
              <Stepper value={sleep} onChange={setSleep} min={0} max={12} step={0.5} display={`${sleep}h`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>RHR (bpm)</Label>
                <Stepper value={rhr} onChange={setRhr} min={30} max={120} step={1} />
              </div>
              <div>
                <Label>RPE (0-10)</Label>
                <Stepper value={rpe} onChange={setRpe} min={0} max={10} step={1} />
              </div>
            </div>
          </div>

          {/* Daily Output */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Daily Output</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pomodori</Label>
                <Stepper value={pomodoros} onChange={setPomodoros} min={0} max={24} step={1} />
              </div>
              <div>
                <Label>Acqua (ml)</Label>
                <Stepper value={water} onChange={setWater} min={0} max={4000} step={250} display={`${water}ml`} />
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">Macros</p>
              <span className="text-[11px] text-white/30">
                Target: {todayMacros.calories_target} kcal · {todayMacros.protein_g_target}P
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Calorie</Label>
                <Stepper value={calories} onChange={setCalories} min={0} max={5000} step={50} />
              </div>
              <div>
                <Label>Proteine (g)</Label>
                <Stepper value={protein} onChange={setProtein} min={0} max={400} step={5} />
              </div>
              <div>
                <Label>Carbo (g)</Label>
                <Stepper value={carbs} onChange={setCarbs} min={0} max={600} step={10} />
              </div>
              <div>
                <Label>Grassi (g)</Label>
                <Stepper value={fat} onChange={setFat} min={0} max={200} step={5} />
              </div>
            </div>
          </div>

          {/* Mood */}
          <div>
            <Label>Umore</Label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setMood(v)}
                  className={cn(
                    "rounded-xl border py-3 text-center transition-all active:scale-95",
                    mood === v
                      ? "border-blue-500/50 bg-blue-500/15"
                      : "border-white/8 bg-white/3 hover:bg-white/8"
                  )}
                >
                  <span className="text-lg">{MOOD_EMOJI[v]}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            Salva metriche
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
