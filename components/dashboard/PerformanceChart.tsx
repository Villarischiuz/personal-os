"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { PerformanceDataPoint } from "@/lib/types";

interface Props {
  data: PerformanceDataPoint[];
}

const COLORS = {
  sleep: "#3b82f6",
  productivity: "#22c55e",
  rpe: "#eab308",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1117] p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-white/70">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-white/50 capitalize">{entry.name}:</span>
          <span className="font-mono text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function PerformanceChart({ data }: Props) {
  return (
    <Card>
      <CardHeader className="flex-wrap gap-3">
        <CardTitle>Performance Olistica — Ultimi 7 Giorni</CardTitle>
        <div className="flex flex-wrap gap-3">
          {[
            { color: COLORS.sleep, label: "Sonno (h)" },
            { color: COLORS.productivity, label: "Produttività" },
            { color: COLORS.rpe, label: "RPE Allenamento" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Left Y-axis: Sleep hours */}
              <YAxis
                yAxisId="sleep"
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              {/* Right Y-axis: Score 0–10 */}
              <YAxis
                yAxisId="score"
                orientation="right"
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />

              {/* Sleep threshold reference line */}
              <ReferenceLine
                yAxisId="sleep"
                y={7}
                stroke="rgba(59,130,246,0.3)"
                strokeDasharray="4 4"
                label={{ value: "7h min", position: "insideTopLeft", fill: "rgba(59,130,246,0.5)", fontSize: 10 }}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Sleep bars */}
              <Bar
                yAxisId="sleep"
                dataKey="sleep_hours"
                name="sonno"
                fill={COLORS.sleep}
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />

              {/* Productivity line */}
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="productivity_score"
                name="produttività"
                stroke={COLORS.productivity}
                strokeWidth={2.5}
                dot={{ fill: COLORS.productivity, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: COLORS.productivity }}
              />

              {/* Training RPE line */}
              <Line
                yAxisId="score"
                type="monotone"
                dataKey="training_rpe"
                name="RPE allenamento"
                stroke={COLORS.rpe}
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={{ fill: COLORS.rpe, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: COLORS.rpe }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
