"use client";
import { useState } from "react";
import { AlertTriangle, X } from "@/lib/icons";
import { checkBurnout } from "@/lib/burnout";
import { MOCK_DAILY_LOGS } from "@/lib/mock-data";

export function BurnoutBanner() {
  const status = checkBurnout(MOCK_DAILY_LOGS);
  const [dismissed, setDismissed] = useState(false);

  if (!status.warning || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex items-center gap-3 bg-red-600/95 px-4 py-3 backdrop-blur-sm md:left-56">
      <AlertTriangle size={18} className="flex-shrink-0 text-white" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-bold text-white uppercase tracking-wider mr-2">⚠ SISTEMA — RECUPERO ATTIVO</span>
        <span className="text-xs text-red-100">{status.reason}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 rounded-lg p-2 text-red-200 hover:bg-red-500/50 active:scale-95 transition-transform min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Chiudi"
      >
        <X size={16} />
      </button>
    </div>
  );
}
