"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { format, startOfWeek } from "date-fns";
import type { Review, ReviewAnswers, ReviewObjectives } from "@/lib/types/review";

function getWeekStart(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

const EMPTY_ANSWERS: ReviewAnswers = {
  whatWorked: "",
  whereDispersed: "",
  bestBlock: "",
  whatToCut: "",
  topPriority: "",
  dispersingProject: "",
  bestHabit: "",
  whatToEliminate: "",
};

const EMPTY_OBJECTIVES: ReviewObjectives = {
  corpo: "",
  ielts: "",
  outreach: "",
  autonomia: "",
  vita: "",
};

interface ReviewStore {
  reviews: Review[];
  draft: { answers: ReviewAnswers; objectives: ReviewObjectives };

  setDraftAnswer: (key: keyof ReviewAnswers, value: string) => void;
  setDraftObjective: (key: keyof ReviewObjectives, value: string) => void;
  saveReview: () => void;
  resetDraft: () => void;
}

export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      draft: { answers: EMPTY_ANSWERS, objectives: EMPTY_OBJECTIVES },

      setDraftAnswer: (key, value) =>
        set((s) => ({
          draft: { ...s.draft, answers: { ...s.draft.answers, [key]: value } },
        })),

      setDraftObjective: (key, value) =>
        set((s) => ({
          draft: {
            ...s.draft,
            objectives: { ...s.draft.objectives, [key]: value },
          },
        })),

      saveReview: () => {
        const { draft, reviews } = get();
        const weekStart = getWeekStart();
        const review: Review = {
          id: `review-${Date.now()}`,
          weekStart,
          savedAt: new Date().toISOString(),
          answers: draft.answers,
          objectives: draft.objectives,
        };
        set({
          reviews: [...reviews.filter((r) => r.weekStart !== weekStart), review],
          draft: { answers: EMPTY_ANSWERS, objectives: EMPTY_OBJECTIVES },
        });
      },

      resetDraft: () =>
        set({ draft: { answers: EMPTY_ANSWERS, objectives: EMPTY_OBJECTIVES } }),
    }),
    { name: "fralife-reviews" }
  )
);
