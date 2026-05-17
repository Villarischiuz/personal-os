"use client";
import { cn } from "@/lib/utils";
import { useTodayStore } from "@/lib/stores/todayStore";

export function PriorityInput() {
  const priorities = useTodayStore((s) => s.priorities);
  const setPriority = useTodayStore((s) => s.setPriority);

  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Priorità del giorno</p>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/8 px-3 py-2.5 flex items-center gap-3">
        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest w-4 shrink-0">#1</span>
        <input
          type="text"
          placeholder="priorità principale di oggi..."
          value={priorities[0]}
          onChange={(e) => setPriority(0, e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold text-white placeholder:text-white/25 outline-none"
        />
      </div>

      <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2.5 flex items-center gap-3">
        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest w-4 shrink-0">#2</span>
        <input
          type="text"
          placeholder="seconda priorità..."
          value={priorities[1]}
          onChange={(e) => setPriority(1, e.target.value)}
          className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none"
        />
      </div>

      <div className="rounded-lg border border-white/8 bg-white/3 px-3 py-2.5 flex items-center gap-3">
        <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest w-4 shrink-0">#3</span>
        <input
          type="text"
          placeholder="terza priorità..."
          value={priorities[2]}
          onChange={(e) => setPriority(2, e.target.value)}
          className="flex-1 bg-transparent text-sm text-white/70 placeholder:text-white/20 outline-none"
        />
      </div>
    </div>
  );
}
