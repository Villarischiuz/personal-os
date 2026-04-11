import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DailyLog, MacroLog } from "@/lib/types";
import { Moon, Heart, Zap, Target, Droplets, Brain } from "@/lib/icons";
import { cn, pct } from "@/lib/utils";

interface Props {
  log: DailyLog;
  macros: MacroLog;
}

interface MetricRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  status?: "ok" | "warn" | "bad";
}

function MetricRow({ icon, label, value, sub, status }: MetricRowProps) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="text-white/40 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        {sub && <p className="text-[11px] text-white/25">{sub}</p>}
      </div>
      <span
        className={cn(
          "font-mono text-sm font-semibold",
          status === "ok"
            ? "text-green-400"
            : status === "warn"
              ? "text-yellow-400"
              : status === "bad"
                ? "text-red-400"
                : "text-white"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DailySnapshot({ log, macros }: Props) {
  const sleepOk = log.sleep_hours >= 7;
  const rhrOk = log.rhr < 60;
  const proteinPct = pct(macros.protein_g_actual, macros.protein_g_target);
  const calPct = pct(macros.calories_actual, macros.calories_target);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Biometrics card */}
      <Card>
        <CardHeader>
          <CardTitle>Biometria di Oggi</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricRow
            icon={<Moon size={16} />}
            label="Sonno"
            value={`${log.sleep_hours}h`}
            status={sleepOk ? "ok" : "bad"}
          />
          <MetricRow
            icon={<Heart size={16} />}
            label="FC Riposo"
            sub="bpm"
            value={`${log.rhr}`}
            status={rhrOk ? "ok" : "warn"}
          />
          {log.hrv && (
            <MetricRow
              icon={<Zap size={16} />}
              label="HRV"
              sub="ms"
              value={`${log.hrv}`}
              status={log.hrv > 60 ? "ok" : "warn"}
            />
          )}
          <MetricRow
            icon={<Target size={16} />}
            label="RPE Allenamento"
            sub="0 = giorno riposo"
            value={log.training_rpe === 0 ? "Riposo" : `${log.training_rpe}/10`}
            status={
              log.training_rpe === 0
                ? undefined
                : log.training_rpe <= 7
                  ? "ok"
                  : "warn"
            }
          />
          {log.water_ml && (
            <MetricRow
              icon={<Droplets size={16} />}
              label="Idratazione"
              sub="ml"
              value={`${log.water_ml}`}
              status={log.water_ml >= 2500 ? "ok" : "warn"}
            />
          )}
          <MetricRow
            icon={<Brain size={16} />}
            label="Pomodori"
            value={`${log.pomodoros_completed}`}
            status={log.pomodoros_completed >= 6 ? "ok" : log.pomodoros_completed >= 3 ? "warn" : "bad"}
          />
        </CardContent>
      </Card>

      {/* Macros card */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrizione</CardTitle>
          <span className={cn("text-xs font-semibold", log.macros_hit ? "text-green-400" : "text-yellow-400")}>
            {log.macros_hit ? "✓ Obiettivi raggiunti" : "In corso"}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Calorie</span>
              <span className="font-mono text-white/70">
                {macros.calories_actual} / {macros.calories_target} kcal
              </span>
            </div>
            <Progress
              value={calPct}
              barClassName={calPct > 105 ? "bg-red-500" : "bg-blue-500"}
            />
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Proteine</span>
              <span className="font-mono text-white/70">
                {macros.protein_g_actual}g / {macros.protein_g_target}g
              </span>
            </div>
            <Progress
              value={proteinPct}
              barClassName={proteinPct >= 95 ? "bg-green-500" : "bg-orange-500"}
            />
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Carboidrati</span>
              <span className="font-mono text-white/70">
                {macros.carbs_g_actual}g / {macros.carbs_g_target}g
              </span>
            </div>
            <Progress
              value={pct(macros.carbs_g_actual, macros.carbs_g_target)}
              barClassName="bg-yellow-500"
            />
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/50">Grassi</span>
              <span className="font-mono text-white/70">
                {macros.fat_g_actual}g / {macros.fat_g_target}g
              </span>
            </div>
            <Progress
              value={pct(macros.fat_g_actual, macros.fat_g_target)}
              barClassName="bg-purple-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
