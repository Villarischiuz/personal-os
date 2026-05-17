"use client";
import { useEffect } from "react";
import { useTodayStore } from "@/lib/stores/todayStore";
import { DailyPhrase } from "@/components/oggi/DailyPhrase";
import { CheckIn } from "@/components/oggi/CheckIn";
import { PriorityInput } from "@/components/oggi/PriorityInput";
import { AreaCard } from "@/components/oggi/AreaCard";
import { AntiPhoneBlock } from "@/components/oggi/AntiPhoneBlock";
import { FocusTimer } from "@/components/oggi/FocusTimer";
import { EveningClose } from "@/components/oggi/EveningClose";
import type { CardArea } from "@/lib/types/today";

const CARD_AREAS: CardArea[] = ["corpo", "ielts", "outreach", "autonomia", "vita"];

export default function OggiPage() {
  const checkAndReset = useTodayStore((s) => s.checkAndReset);
  const priorities = useTodayStore((s) => s.priorities);
  const hasP1 = priorities[0].trim().length > 0;

  useEffect(() => {
    checkAndReset();
  }, [checkAndReset]);

  const dateLabel = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-black text-white capitalize">{dateLabel}</h1>
      <DailyPhrase />
      <CheckIn />
      <PriorityInput />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARD_AREAS.map((area) => (
          <AreaCard key={area} area={area} dimmed={!hasP1} />
        ))}
      </div>
      <AntiPhoneBlock />
      <FocusTimer />
      <EveningClose />
    </div>
  );
}
