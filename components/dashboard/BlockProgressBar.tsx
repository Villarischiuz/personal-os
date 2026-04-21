"use client";

import { useState, useEffect } from "react";
import { getCurrentBlock } from "@/lib/hooks/useCurrentBlock";
import { cn } from "@/lib/utils";

const BLOCK_COLOR: Record<string, string> = {
  Peak:    "bg-blue-500",
  Trough:  "bg-amber-500",
  Rebound: "bg-violet-500",
  Off:     "bg-white/20",
};

function computeState() {
  const block = getCurrentBlock();
  if (block.name === "Off") return { block, pct: 0, remainingLabel: "" };

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = block.startH * 60;
  const endMins = block.endH * 60;
  const total = endMins - startMins;
  const elapsed = nowMins - startMins;
  const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
  const remaining = endMins - nowMins;
  const rh = Math.floor(remaining / 60);
  const rm = remaining % 60;
  const remainingLabel = rh > 0 ? `${rh}h ${rm}m rimasti` : `${rm}m rimasti`;

  return { block, pct, remainingLabel };
}

export function BlockProgressBar() {
  const [state, setState] = useState(computeState);

  useEffect(() => {
    const id = setInterval(() => setState(computeState()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { block, pct, remainingLabel } = state;
  if (block.name === "Off") return null;

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-white/70">{block.label}</span>
        <span className="text-[10px] text-white/35">{remainingLabel}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-1000", BLOCK_COLOR[block.name])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
