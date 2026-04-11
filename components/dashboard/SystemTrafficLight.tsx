"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { computeSystemStatus } from "@/lib/computations";
import type { DailyLog } from "@/lib/types";
import { AlertTriangle, CheckCircle2, XCircle } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Props {
  todayLog: DailyLog;
}

const CONFIG = {
  green: {
    label: "Systems Optimal",
    bg: "bg-green-500",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.4)]",
    ring: "ring-green-500/40",
    text: "text-green-400",
    icon: CheckCircle2,
    pulse: "animate-pulse",
  },
  yellow: {
    label: "Monitor Closely",
    bg: "bg-yellow-500",
    glow: "shadow-[0_0_40px_rgba(234,179,8,0.4)]",
    ring: "ring-yellow-500/40",
    text: "text-yellow-400",
    icon: AlertTriangle,
    pulse: "",
  },
  red: {
    label: "Recovery Priority",
    bg: "bg-red-500",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
    ring: "ring-red-500/40",
    text: "text-red-400",
    icon: XCircle,
    pulse: "animate-pulse",
  },
} as const;

export function SystemTrafficLight({ todayLog }: Props) {
  const status = computeSystemStatus(todayLog);
  const cfg = CONFIG[status.color];
  const Icon = cfg.icon;

  return (
    <Card className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className={cn(
          "absolute inset-0 opacity-5 transition-colors duration-1000",
          status.color === "green"
            ? "bg-green-500"
            : status.color === "yellow"
              ? "bg-yellow-500"
              : "bg-red-500"
        )}
      />

      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <span className={cn("text-xs font-mono", cfg.text)}>{status.score}/100</span>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4">
          {/* Traffic light orb */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "h-16 w-16 rounded-full ring-4",
                cfg.bg,
                cfg.glow,
                cfg.ring,
                cfg.pulse
              )}
            />
          </div>

          <div>
            <div className={cn("flex items-center gap-2 text-lg font-bold", cfg.text)}>
              <Icon size={20} />
              {cfg.label}
            </div>

            {status.flags.length === 0 ? (
              <p className="mt-1 text-sm text-white/40">All metrics within target range</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {status.flags.map((flag) => (
                  <li key={flag} className="flex items-center gap-1.5 text-xs text-white/50">
                    <span className="h-1 w-1 rounded-full bg-white/30 flex-shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Three lights row */}
        <div className="mt-4 flex items-center gap-2">
          {(["green", "yellow", "red"] as const).map((c) => (
            <div
              key={c}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-all duration-500",
                status.color === c
                  ? c === "green"
                    ? "bg-green-500"
                    : c === "yellow"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  : "bg-white/10"
              )}
            />
          ))}
          <span className="ml-2 text-xs text-white/30">
            {new Date(todayLog.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
