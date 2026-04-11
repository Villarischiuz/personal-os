import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function Progress({ value, className, barClassName, showLabel }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName ?? "bg-blue-500")}
        style={{ width: `${clamped}%` }}
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-white/50">{clamped}%</span>
      )}
    </div>
  );
}
