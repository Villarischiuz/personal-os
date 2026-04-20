"use client";

import { useState, useEffect } from "react";

export type BlockName = "Peak" | "Trough" | "Rebound" | "Off";

export interface Block {
  name: BlockName;
  label: string;
  description: string;
  startH: number;
  endH: number;
}

const BLOCKS: Block[] = [
  { name: "Peak",    startH: 6,  endH: 12, label: "Peak — Lavoro Profondo",    description: "Focus cognitivo massimo. Studio & sviluppo." },
  { name: "Trough",  startH: 13, endH: 15, label: "Trough — Admin & Outreach", description: "Energia bassa. Email, task admin, outreach." },
  { name: "Rebound", startH: 17, endH: 21, label: "Rebound — Studio & Review", description: "Energia media. Inglese, revisione, flashcard." },
];

const OFF: Block = { name: "Off", startH: 21, endH: 6, label: "Riposo", description: "Fuori orario produttivo. Recupera." };

export function getCurrentBlock(): Block {
  const h = new Date().getHours();
  return BLOCKS.find((b) => h >= b.startH && h < b.endH) ?? OFF;
}

export function useCurrentBlock(): Block {
  const [block, setBlock] = useState<Block>(getCurrentBlock);

  useEffect(() => {
    const id = setInterval(() => setBlock(getCurrentBlock()), 60_000);
    return () => clearInterval(id);
  }, []);

  return block;
}
