import { format, parseISO } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function localDateString(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function parseLocalDate(isoDate: string): Date {
  return parseISO(isoDate);
}

export function formatDate(isoDate: string): string {
  return parseLocalDate(isoDate).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatShortDate(isoDate: string): string {
  return parseLocalDate(isoDate).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export function today(): string {
  return localDateString();
}

export function pct(actual: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}
