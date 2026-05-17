"use client";
import { useState } from "react";
import { useProjectsStore } from "@/lib/stores/projectsStore";
import { MainProject } from "@/components/progetti/MainProject";
import { SecondaryProject } from "@/components/progetti/SecondaryProject";
import { WeeklyEvalPrompt } from "@/components/progetti/WeeklyEvalPrompt";
import { Plus, X } from "@/lib/icons";

export default function ProgettiPage() {
  const projects = useProjectsStore((s) => s.projects);
  const addProject = useProjectsStore((s) => s.addProject);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const primary = projects.find((p) => p.isPrimary);
  const secondary = projects.filter((p) => !p.isPrimary);

  function handleAdd() {
    if (!newTitle.trim()) return;
    addProject(newTitle.trim(), newDesc.trim());
    setNewTitle("");
    setNewDesc("");
    setShowAdd(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-white">Progetti</h1>

      {/* Regola visiva */}
      <p className="text-xs text-white/30 italic border-l-2 border-white/10 pl-3">
        I secondari non rubano tempo al principale, a meno che portino soldi subito.
      </p>

      {/* Progetto principale */}
      {primary && (
        <div className="space-y-3">
          <MainProject project={primary} />
          <WeeklyEvalPrompt projectId={primary.id} />
        </div>
      )}

      {/* Secondari */}
      {secondary.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/30">Secondari</p>
          {secondary.map((p) => (
            <div key={p.id} className="space-y-2">
              <SecondaryProject project={p} />
              <WeeklyEvalPrompt projectId={p.id} />
            </div>
          ))}
        </div>
      )}

      {/* Aggiungi progetto */}
      <div>
        {showAdd ? (
          <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white/60">Nuovo progetto secondario</p>
              <button onClick={() => setShowAdd(false)}>
                <X size={14} className="text-white/30" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nome progetto"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
            />
            <input
              type="text"
              placeholder="Descrizione (opzionale)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="w-full rounded-lg bg-blue-600 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Aggiungi
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <Plus size={13} />
            Aggiungi progetto secondario
          </button>
        )}
      </div>
    </div>
  );
}
