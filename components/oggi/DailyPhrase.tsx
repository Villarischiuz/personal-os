"use client";
import { getPhraseForToday } from "@/lib/seeds/phrases";

export function DailyPhrase() {
  const phrase = getPhraseForToday();
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 px-5 py-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">oggi</p>
      <p className="text-base font-semibold text-white/80 leading-relaxed italic">
        "{phrase}"
      </p>
    </div>
  );
}
