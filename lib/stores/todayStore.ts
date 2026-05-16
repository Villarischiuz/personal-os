"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { today } from "@/lib/utils";
import { DEFAULT_CARD_TASKS, IELTS_POST_BOOKING } from "@/lib/seeds/cardTasks";
import type { Energy, Mood, CardArea, CardTask, TodayEntry } from "@/lib/types/today";

const TIMER_SECONDS = 40 * 60;
const CARD_AREAS: CardArea[] = ["corpo", "ielts", "outreach", "autonomia", "vita"];

function freshCards(): Record<CardArea, CardTask[]> {
  return Object.fromEntries(
    CARD_AREAS.map((area) => [
      area,
      DEFAULT_CARD_TASKS[area].map((t) => ({ ...t, done: false })),
    ])
  ) as Record<CardArea, CardTask[]>;
}

function resetDoneState(cards: Record<CardArea, CardTask[]>): Record<CardArea, CardTask[]> {
  return Object.fromEntries(
    CARD_AREAS.map((area) => [
      area,
      cards[area].map((t) => ({ ...t, done: false, text: t.isFree ? "" : t.text })),
    ])
  ) as Record<CardArea, CardTask[]>;
}

interface TodayStore {
  currentDate: string;
  energy: Energy | null;
  mood: Mood | null;
  priorities: [string, string, string];
  cards: Record<CardArea, CardTask[]>;
  timerSecondsLeft: number;
  timerRunning: boolean;
  eveningNote: { good: string; change: string } | null;
  closed: boolean;
  ieltsBooked: boolean;
  history: TodayEntry[];

  setEnergy: (e: Energy) => void;
  setMood: (m: Mood) => void;
  setPriority: (index: 0 | 1 | 2, value: string) => void;
  toggleTask: (area: CardArea, taskId: string) => void;
  setFreeTask: (area: CardArea, text: string) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setEveningNote: (note: { good: string; change: string }) => void;
  closeDay: () => void;
  setIeltsBooked: (booked: boolean) => void;
  checkAndReset: () => void;
}

export const useTodayStore = create<TodayStore>()(
  persist(
    (set, get) => ({
      currentDate: today(),
      energy: null,
      mood: null,
      priorities: ["", "", ""],
      cards: freshCards(),
      timerSecondsLeft: TIMER_SECONDS,
      timerRunning: false,
      eveningNote: null,
      closed: false,
      ieltsBooked: false,
      history: [],

      setEnergy: (e) => set({ energy: e }),
      setMood: (m) => set({ mood: m }),
      setPriority: (index, value) =>
        set((s) => {
          const p = [...s.priorities] as [string, string, string];
          p[index] = value;
          return { priorities: p };
        }),

      toggleTask: (area, taskId) =>
        set((s) => ({
          cards: {
            ...s.cards,
            [area]: s.cards[area].map((t) =>
              t.id === taskId ? { ...t, done: !t.done } : t
            ),
          },
        })),

      setFreeTask: (area, text) =>
        set((s) => ({
          cards: {
            ...s.cards,
            [area]: s.cards[area].map((t) =>
              t.isFree ? { ...t, text } : t
            ),
          },
        })),

      startTimer: () => set({ timerRunning: true }),
      pauseTimer: () => set({ timerRunning: false }),
      resetTimer: () => set({ timerRunning: false, timerSecondsLeft: TIMER_SECONDS }),

      tickTimer: () =>
        set((s) => {
          if (s.timerSecondsLeft <= 0) return { timerRunning: false, timerSecondsLeft: 0 };
          return { timerSecondsLeft: s.timerSecondsLeft - 1 };
        }),

      setEveningNote: (note) => set({ eveningNote: note }),

      closeDay: () =>
        set((s) => {
          const entry: TodayEntry = {
            date: s.currentDate,
            energy: s.energy,
            mood: s.mood,
            priorities: s.priorities,
            cards: s.cards,
            eveningNote: s.eveningNote,
            closed: true,
          };
          return {
            closed: true,
            history: [...s.history, entry],
          };
        }),

      setIeltsBooked: (booked) =>
        set((s) => ({
          ieltsBooked: booked,
          cards: {
            ...s.cards,
            ielts: booked
              ? IELTS_POST_BOOKING.map((t) => ({ ...t, done: false }))
              : DEFAULT_CARD_TASKS.ielts.map((t) => ({ ...t, done: false })),
          },
        })),

      checkAndReset: () => {
        const s = get();
        const todayStr = today();
        if (s.currentDate === todayStr) return;

        const entry: TodayEntry = {
          date: s.currentDate,
          energy: s.energy,
          mood: s.mood,
          priorities: s.priorities,
          cards: s.cards,
          eveningNote: s.eveningNote,
          closed: s.closed,
        };

        set({
          currentDate: todayStr,
          energy: null,
          mood: null,
          priorities: ["", "", ""],
          cards: resetDoneState(s.cards),
          timerSecondsLeft: TIMER_SECONDS,
          timerRunning: false,
          eveningNote: null,
          closed: false,
          history: [...s.history, entry],
        });
      },
    }),
    { name: "fralife-today" }
  )
);
