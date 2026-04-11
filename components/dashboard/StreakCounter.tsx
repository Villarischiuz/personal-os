"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { StreakData } from "@/lib/types";
import { Flame, Trophy, CalendarX } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/utils";

interface Props {
  streak: StreakData;
}

export function StreakCounter({ streak }: Props) {
  const isOnFire = streak.current_streak >= 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adherence Streak</CardTitle>
        <span className="text-xs text-white/30">Sleep ≥7h + Macros hit</span>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {/* Current streak */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black transition-all",
                isOnFire
                  ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30"
                  : streak.current_streak > 0
                    ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30"
                    : "bg-white/5 text-white/30"
              )}
            >
              {streak.current_streak}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                {isOnFire && <Flame size={14} className="text-orange-400" />}
                <span className="text-sm font-semibold text-white">
                  {streak.current_streak === 1
                    ? "1 day"
                    : `${streak.current_streak} days`}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-0.5">current streak</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-10 w-px bg-white/10" />

          {/* Best streak */}
          <div className="flex items-center gap-3">
            <Trophy size={20} className="text-yellow-500/70 flex-shrink-0" />
            <div>
              <span className="text-sm font-semibold text-white">
                {streak.longest_streak} days
              </span>
              <p className="text-xs text-white/40 mt-0.5">personal best</p>
            </div>
          </div>

          {/* Last broken */}
          {streak.last_broken && (
            <>
              <div className="h-10 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <CalendarX size={16} className="text-white/30 flex-shrink-0" />
                <div>
                  <span className="text-xs text-white/50">
                    {formatShortDate(streak.last_broken)}
                  </span>
                  <p className="text-xs text-white/30">last broken</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Streak dots visualisation */}
        <div className="mt-4 flex gap-1.5 flex-wrap">
          {Array.from({ length: 14 }).map((_, i) => {
            const daysBack = 13 - i;
            const isStreakDay = daysBack < streak.current_streak;
            return (
              <div
                key={i}
                title={`${daysBack} days ago`}
                className={cn(
                  "h-2.5 w-2.5 rounded-sm transition-all",
                  isStreakDay
                    ? isOnFire
                      ? "bg-orange-500"
                      : "bg-blue-500"
                    : "bg-white/10"
                )}
              />
            );
          })}
          <span className="ml-1 self-center text-xs text-white/25">14 days</span>
        </div>
      </CardContent>
    </Card>
  );
}
