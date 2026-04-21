"use client";

import { useState, useEffect } from "react";
import { getCurrentBlock } from "./useCurrentBlock";

export type ContextWidget =
  | "workout"
  | "study-deep"
  | "lead-gen"
  | "review"
  | "rest"
  | "dashboard";

export interface ContextualPriority {
  widget: ContextWidget;
  title: string;
  subtitle: string;
}

// Mon=1, Wed=3, Fri=5 in JS Date.getDay()
const GYM_DAYS = new Set([1, 3, 5]);

function computePriority(): ContextualPriority {
  const block = getCurrentBlock();
  const now = new Date();
  const dow = now.getDay();
  const hour = now.getHours();

  // Gym window: Mon/Wed/Fri 11:00–14:00
  if (GYM_DAYS.has(dow) && hour >= 11 && hour < 14) {
    return {
      widget: "workout",
      title: "Sessione in Palestra",
      subtitle: "Scheda del giorno · 12:00",
    };
  }

  // Weekend or Off block: rest/recovery
  if (dow === 0 || dow === 6 || block.name === "Off") {
    return {
      widget: "rest",
      title: "Recovery Mode",
      subtitle: "Nutrizione · Recupero",
    };
  }

  if (block.name === "Peak") {
    const isTueThu = dow === 2 || dow === 4;
    return {
      widget: "study-deep",
      title: "Sessione Deep Work",
      subtitle: isTueThu ? "English Sim · Polito DS" : "Data Science · English",
    };
  }

  if (block.name === "Trough") {
    return {
      widget: "lead-gen",
      title: "Finestra Lead Gen",
      subtitle: "Email · Outreach · CRM",
    };
  }

  if (block.name === "Rebound") {
    return {
      widget: "review",
      title: "Ripasso & Review",
      subtitle: "Inglese · Flashcard · Studio",
    };
  }

  return { widget: "dashboard", title: "Centro Comando", subtitle: "Panoramica" };
}

export function useContextualPriority(): ContextualPriority {
  const [priority, setPriority] = useState<ContextualPriority>(computePriority);

  useEffect(() => {
    const id = setInterval(() => setPriority(computePriority()), 60_000);
    return () => clearInterval(id);
  }, []);

  return priority;
}
