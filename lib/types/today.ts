export type Energy = "low" | "medium" | "high";
export type Mood = "low" | "medium" | "high";

export type CardArea = "corpo" | "ielts" | "outreach" | "autonomia" | "vita";

export type CardTask = {
  id: string;
  text: string;
  done: boolean;
  isFree?: boolean;
};

export type TodayEntry = {
  date: string;
  energy: Energy | null;
  mood: Mood | null;
  priorities: [string, string, string];
  cards: Record<CardArea, CardTask[]>;
  eveningNote: { good: string; change: string } | null;
  closed: boolean;
};
