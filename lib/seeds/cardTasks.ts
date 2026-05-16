import type { CardArea, CardTask } from "@/lib/types/today";

export const DEFAULT_CARD_TASKS: Record<CardArea, CardTask[]> = {
  corpo: [
    { id: "corpo-1", text: "Piano nutrizionale 80%", done: false },
    { id: "corpo-2", text: "Allenamento / camminata", done: false },
    { id: "corpo-3", text: "Acqua 2L", done: false },
    { id: "corpo-free", text: "", done: false, isFree: true },
  ],
  ielts: [
    { id: "ielts-1", text: "Prenota esame", done: false },
    { id: "ielts-2", text: "Writing Task 2 — 40 min", done: false },
    { id: "ielts-3", text: "Grammatica — 20 min", done: false },
    { id: "ielts-4", text: "Error log", done: false },
  ],
  outreach: [
    { id: "outreach-1", text: "Contatta 10 lead", done: false },
    { id: "outreach-2", text: "Prepara offerta sito 300/400€", done: false },
    { id: "outreach-3", text: "Segui up su risposte aperte", done: false },
    { id: "outreach-free", text: "", done: false, isFree: true },
  ],
  autonomia: [
    { id: "autonomia-1", text: "Segna spese di oggi", done: false },
    { id: "autonomia-2", text: "10 min ambiente", done: false },
    { id: "autonomia-3", text: "Una cosa in ordine", done: false },
    { id: "autonomia-free", text: "", done: false, isFree: true },
  ],
  vita: [
    { id: "vita-1", text: "Danza 20 min", done: false },
    { id: "vita-2", text: "Momento senza schermo", done: false },
    { id: "vita-3", text: "Contatto reale (messaggio o chiamata)", done: false },
    { id: "vita-free", text: "", done: false, isFree: true },
  ],
};

export const IELTS_POST_BOOKING: CardTask[] = [
  { id: "ielts-1", text: "Writing Task 2", done: false },
  { id: "ielts-2", text: "Reading / Listening", done: false },
  { id: "ielts-3", text: "Error log", done: false },
  { id: "ielts-4", text: "Simulazione", done: false },
];
