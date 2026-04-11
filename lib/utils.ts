import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function pct(actual: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((actual / target) * 100));
}
