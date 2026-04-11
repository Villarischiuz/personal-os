import { SystemTrafficLight } from "@/components/dashboard/SystemTrafficLight";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { StreakCounter } from "@/components/dashboard/StreakCounter";
import { DailySnapshot } from "@/components/dashboard/DailySnapshot";
import { MOCK_DAILY_LOGS, MOCK_TASKS, MOCK_MACRO_LOGS } from "@/lib/mock-data";
import {
  buildPerformanceData,
  computeStreak,
  getTasksByStatus,
} from "@/lib/computations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CheckCircle, Clock, Loader2 } from "@/lib/icons";

export default function CommandCenter() {
  // Derive all data server-side (pure computation, no DB yet)
  const sortedLogs = [...MOCK_DAILY_LOGS].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
  const todayLog = sortedLogs[0];
  const todayMacros = MOCK_MACRO_LOGS[MOCK_MACRO_LOGS.length - 1];
  const performanceData = buildPerformanceData(MOCK_DAILY_LOGS);
  const streak = computeStreak(MOCK_DAILY_LOGS);

  const inboxTasks = getTasksByStatus(MOCK_TASKS, "Inbox");
  const inProgressTasks = getTasksByStatus(MOCK_TASKS, "InProgress");
  const doneTasks = getTasksByStatus(MOCK_TASKS, "Done");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Centro Comando
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {new Date().toLocaleDateString("it-IT", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="muted">Dati Mock</Badge>
          <Badge variant="blue">v1.0</Badge>
        </div>
      </div>

      {/* Riga 1: Semaforo + Streak + Pipeline */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SystemTrafficLight todayLog={todayLog} />
        <StreakCounter streak={streak} />

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Attività</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <ClipboardList size={15} className="text-white/30" />
                In Arrivo
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {inboxTasks.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-500/10 px-3 py-2 border border-blue-500/20">
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Loader2 size={15} />
                In Corso
              </div>
              <span className="font-mono text-sm font-bold text-blue-400">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 px-3 py-2 border border-green-500/20">
              <div className="flex items-center gap-2 text-sm text-green-400">
                <CheckCircle size={15} />
                Completati oggi
              </div>
              <span className="font-mono text-sm font-bold text-green-400">
                {doneTasks.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock size={15} className="text-white/30" />
                Minuti focus oggi
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {todayLog.pomodoros_completed * 25}m
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riga 2: Grafico performance */}
      <div>
        <PerformanceChart data={performanceData} />
      </div>

      {/* Riga 3: Biometria + Macro */}
      <DailySnapshot log={todayLog} macros={todayMacros} />
    </div>
  );
}
