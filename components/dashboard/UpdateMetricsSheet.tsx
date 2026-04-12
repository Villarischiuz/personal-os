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

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-colors",
        "placeholder-white/25 focus:border-blue-500/50 focus:bg-white/8",
        className
      )}
      {...props}
    />
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UpdateMetricsSheet({ open, onClose }: Props) {
  const { todayLog, todayMacros, updateTodayMetrics } = useBiometricStore();

  const [sleep, setSleep] = useState(String(todayLog.sleep_hours));
  const [rhr, setRhr] = useState(String(todayLog.rhr));
  const [rpe, setRpe] = useState(String(todayLog.training_rpe));
  const [hrv, setHrv] = useState(String(todayLog.hrv ?? ""));
  const [water, setWater] = useState(String(todayLog.water_ml ?? ""));
  const [pomodoros, setPomodoros] = useState(String(todayLog.pomodoros_completed));
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(todayLog.mood ?? 3);
  const [calories, setCalories] = useState(String(todayMacros.calories_actual));
  const [protein, setProtein] = useState(String(todayMacros.protein_g_actual));
  const [carbs, setCarbs] = useState(String(todayMacros.carbs_g_actual));
  const [fat, setFat] = useState(String(todayMacros.fat_g_actual));

  function save() {
    updateTodayMetrics({
      logPatch: {
        sleep_hours: Math.max(0, Math.min(12, Number(sleep) || 0)),
        rhr: Math.max(30, Math.min(120, Number(rhr) || 55)),
        training_rpe: Math.max(0, Math.min(10, Number(rpe) || 0)),
        hrv: hrv ? Number(hrv) : undefined,
        water_ml: water ? Number(water) : undefined,
        pomodoros_completed: Math.max(0, Number(pomodoros) || 0),
        mood,
      },
      macroPatch: {
        calories_actual: Math.max(0, Number(calories) || 0),
        protein_g_actual: Math.max(0, Number(protein) || 0),
        carbs_g_actual: Math.max(0, Number(carbs) || 0),
        fat_g_actual: Math.max(0, Number(fat) || 0),
      },
    });

    onClose();
  }

  const moods: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ];

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Aggiorna Metriche di Oggi</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
              Recovery
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sonno (h)</Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={sleep}
                  onChange={(event) => setSleep(event.target.value)}
                />
              </div>
              <div>
                <Label>RHR (bpm)</Label>
                <Input
                  type="number"
                  min={30}
                  max={120}
                  value={rhr}
                  onChange={(event) => setRhr(event.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>RPE (0-10)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={rpe}
                  onChange={(event) => setRpe(event.target.value)}
                />
              </div>
              <div>
                <Label>HRV (ms)</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  placeholder="es. 65"
                  value={hrv}
                  onChange={(event) => setHrv(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
              Daily Output
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pomodori</Label>
                <Input
                  type="number"
                  min={0}
                  max={24}
                  value={pomodoros}
                  onChange={(event) => setPomodoros(event.target.value)}
                />
              </div>
              <div>
                <Label>Acqua (ml)</Label>
                <Input
                  type="number"
                  min={0}
                  max={5000}
                  step={100}
                  value={water}
                  onChange={(event) => setWater(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/35">
                Macros
              </p>
              <span className="text-[11px] text-white/30">
                Target fissi: {todayMacros.calories_target} kcal ·{" "}
                {todayMacros.protein_g_target}P · {todayMacros.carbs_g_target}C ·{" "}
                {todayMacros.fat_g_target}F
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Calorie</Label>
                <Input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(event) => setCalories(event.target.value)}
                />
              </div>
              <div>
                <Label>Proteine (g)</Label>
                <Input
                  type="number"
                  min={0}
                  value={protein}
                  onChange={(event) => setProtein(event.target.value)}
                />
              </div>
              <div>
                <Label>Carbo (g)</Label>
                <Input
                  type="number"
                  min={0}
                  value={carbs}
                  onChange={(event) => setCarbs(event.target.value)}
                />
              </div>
              <div>
                <Label>Grassi (g)</Label>
                <Input
                  type="number"
                  min={0}
                  value={fat}
                  onChange={(event) => setFat(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Umore</Label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setMood(value)}
                  className={cn(
                    "rounded-xl border py-3 text-sm font-semibold transition-all",
                    mood === value
                      ? "border-blue-500/50 bg-blue-500/15 text-white"
                      : "border-white/8 bg-white/3 text-white/45 hover:text-white/70"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={save}
            className="mt-2 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            Salva metriche
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
