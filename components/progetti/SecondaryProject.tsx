"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useProjectsStore } from "@/lib/stores/projectsStore";
import type { Project } from "@/lib/types/projects";

export function SecondaryProject({ project }: { project: Project }) {
  const setStatus = useProjectsStore((s) => s.setStatus);
  const updateNotes = useProjectsStore((s) => s.updateNotes);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        project.status === "paused"
          ? "border-white/8 bg-white/2 opacity-60"
          : "border-white/10 bg-white/3"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">{project.title}</h3>
          <span
            className={cn(
              "text-[10px] border rounded-full px-2 py-0.5",
              project.status === "active"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-white/10 bg-white/5 text-white/30"
            )}
          >
            {project.status === "active" ? "attivo" : "in pausa"}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
        >
          {expanded ? "chiudi" : "apri"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          {project.description && (
            <p className="text-xs text-white/50">{project.description}</p>
          )}
          <textarea
            value={project.notes}
            onChange={(e) => updateNotes(project.id, e.target.value)}
            placeholder="note..."
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 placeholder:text-white/20 outline-none resize-none"
          />
          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                setStatus(
                  project.id,
                  project.status === "active" ? "paused" : "active"
                )
              }
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              {project.status === "active" ? "metti in pausa" : "riattiva"}
            </button>
            <button
              onClick={() => {
                if (confirm(`Eliminare "${project.title}"?`)) deleteProject(project.id);
              }}
              className="text-[10px] text-red-400/40 hover:text-red-400 transition-colors underline underline-offset-2"
            >
              elimina
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
