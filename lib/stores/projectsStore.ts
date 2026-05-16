"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, startOfWeek } from "date-fns";
import type { Project, ProjectMetric, WeeklyEval } from "@/lib/types/projects";

function getWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "outreach",
    title: "Outreach Agent",
    description: "Acquisizione clienti per siti web",
    isPrimary: true,
    status: "active",
    metrics: [
      { key: "lead_trovati", label: "Lead trovati", value: 0 },
      { key: "lead_contattati", label: "Lead contattati", value: 0 },
      { key: "risposte", label: "Risposte", value: 0 },
      { key: "call_fissate", label: "Call fissate", value: 0 },
      { key: "preventivi", label: "Preventivi", value: 0 },
      { key: "clienti_paganti", label: "Clienti paganti", value: 0 },
      { key: "entrate", label: "Entrate €", value: 0 },
    ],
    weeklyEvals: [],
    notes: "",
  },
  {
    id: "skappa",
    title: "SKAPPA",
    description: "",
    isPrimary: false,
    status: "active",
    metrics: [],
    weeklyEvals: [],
    notes: "",
  },
  {
    id: "grafiche",
    title: "Grafiche",
    description: "",
    isPrimary: false,
    status: "active",
    metrics: [],
    weeklyEvals: [],
    notes: "",
  },
];

interface ProjectsStore {
  projects: Project[];

  incrementMetric: (projectId: string, metricKey: string) => void;
  setMetric: (projectId: string, metricKey: string, value: number) => void;
  addWeeklyEval: (projectId: string, produced: boolean) => void;
  updateNotes: (projectId: string, notes: string) => void;
  setPrimary: (projectId: string) => void;
  setStatus: (projectId: string, status: "active" | "paused") => void;
  addProject: (title: string, description: string) => void;
  deleteProject: (projectId: string) => void;
  hasEvalThisWeek: (projectId: string) => boolean;
  getConsecutiveNos: (projectId: string) => number;
}

let _id = 0;

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: INITIAL_PROJECTS,

      incrementMetric: (projectId, metricKey) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  metrics: p.metrics.map((m) =>
                    m.key === metricKey ? { ...m, value: m.value + 1 } : m
                  ),
                }
          ),
        })),

      setMetric: (projectId, metricKey, value) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  metrics: p.metrics.map((m) =>
                    m.key === metricKey ? { ...m, value } : m
                  ),
                }
          ),
        })),

      addWeeklyEval: (projectId, produced) => {
        const weekStart = getWeekStart();
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  weeklyEvals: [
                    ...p.weeklyEvals.filter((e) => e.weekStart !== weekStart),
                    { weekStart, produced },
                  ],
                }
          ),
        }));
      },

      updateNotes: (projectId, notes) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, notes } : p
          ),
        })),

      setPrimary: (projectId) =>
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            isPrimary: p.id === projectId,
          })),
        })),

      setStatus: (projectId, status) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, status } : p
          ),
        })),

      addProject: (title, description) =>
        set((s) => ({
          projects: [
            ...s.projects,
            {
              id: `proj-${++_id}-${Date.now()}`,
              title,
              description,
              isPrimary: false,
              status: "active",
              metrics: [],
              weeklyEvals: [],
              notes: "",
            },
          ],
        })),

      deleteProject: (projectId) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== projectId),
        })),

      hasEvalThisWeek: (projectId) => {
        const weekStart = getWeekStart();
        const project = get().projects.find((p) => p.id === projectId);
        return project?.weeklyEvals.some((e) => e.weekStart === weekStart) ?? false;
      },

      getConsecutiveNos: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return 0;
        const sorted = [...project.weeklyEvals].sort((a, b) =>
          b.weekStart.localeCompare(a.weekStart)
        );
        let count = 0;
        for (const ev of sorted) {
          if (!ev.produced) count++;
          else break;
        }
        return count;
      },
    }),
    { name: "fralife-projects" }
  )
);
