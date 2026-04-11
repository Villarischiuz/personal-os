"use client";

import { useState, useRef } from "react";
import { Plus, Zap } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onCapture: (title: string) => void;
}

export function QuickCapture({ onCapture }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onCapture(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-white/5 px-4 py-3 transition-all duration-200",
          focused
            ? "border-blue-500/60 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
            : "border-white/10 hover:border-white/20"
        )}
      >
        <Zap
          size={16}
          className={cn(
            "flex-shrink-0 transition-colors",
            focused ? "text-blue-400" : "text-white/30"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Cattura un'attività… (Invio per aggiungere)"
          className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
        />
        <Button
          type="submit"
          size="icon"
          variant={value.trim() ? "default" : "ghost"}
          className="h-7 w-7 flex-shrink-0"
          disabled={!value.trim()}
        >
          <Plus size={14} />
        </Button>
      </div>
      <p className="mt-1.5 px-1 text-xs text-white/20">
        I task catturati vanno in Arrivo — assegnali ai blocchi energia qui sotto
      </p>
    </form>
  );
}
