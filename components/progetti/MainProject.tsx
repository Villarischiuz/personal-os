"use client";
import { useState } from "react";
import { Plus } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useProjectsStore } from "@/lib/stores/projectsStore";
import type { Project } from "@/lib/types/projects";

export function MainProject({ project }: { project: Project }) {
  const incrementMetric = useProjectsStore((s) => s.incrementMetric);
  const setMetric = useProjectsStore((s) => s.setMetric);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function startEdit(key: string, current: number) {
    setEditingKey(key);
    setEditValue(String(current));
  }

  function commitEdit(key: string) {
    const n = parseInt(editValue, 10);
    if (!isNaN(n) && n >= 0) setMetric(project.id, key, n);
    setEditingKey(null);
  }

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-widest text-blue-400/60">
          Progetto principale
        </span>
        {project.status === "paused" && (
          <span className="text-[10px] border border-amber-500/30 bg-amber-500/10 text-amber-300 rounded-full px-2 py-0.5">
            in pausa
          </span>
        )}
      </div>
      <h2 className="text-xl font-black text-white mb-4">{project.title}</h2>
      {project.description && (
        <p className="text-xs text-white/40 mb-4">{project.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {project.metrics.map((metric) => (
          <div
            key={metric.key}
            className="rounded-lg border border-white/8 bg-white/3 p-3"
          >
            <p className="text-[10px] text-white/35 mb-1">{metric.label}</p>
            {editingKey === metric.key ? (
              <input
                autoFocus
                type="number"
                min={0}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitEdit(metric.key)}
                onKeyDown={(e) => e.key === "Enter" && commitEdit(metric.key)}
                className="w-full bg-transparent text-2xl font-black text-white outline-none"
              />
            ) : (
              <button
                onClick={() => startEdit(metric.key, metric.value)}
                className="text-2xl font-black text-white hover:text-blue-300 transition-colors"
              >
                {metric.value}
              </button>
            )}
            <button
              onClick={() => incrementMetric(project.id, metric.key)}
              className="mt-2 flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
            >
              <Plus size={9} />1
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
