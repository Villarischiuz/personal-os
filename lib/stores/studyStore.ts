"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────
export type CardRating = "hard" | "ok" | "easy";
export type TopicType = "video_list" | "link" | "theory";

export interface VideoItem {
  title: string;
  url: string;
  dur?: string;
}

export interface RoadmapTopic {
  id: string;
  phase: string;
  title: string;
  desc?: string;
  url?: string;
  source: string;
  type: TopicType;
  items?: VideoItem[];
  done: boolean;           // for link/theory/whole topic
  itemsDone: string[];     // titles of completed video items
}

// Legacy simple task kept for CrudSheet add-new-task flow
export interface RoadmapTask {
  id: string;
  phase: string;
  title: string;
  done: boolean;
}

export interface Flashcard {
  id: string;
  q: string;
  a: string;
  tag: string;
  rating: CardRating | null;
  lastRated: number | null;
}

const INTERVALS: Record<CardRating, number> = { hard: 0, ok: 2, easy: 4 };
function isDue(c: Flashcard) {
  if (!c.lastRated || !c.rating) return true;
  return Date.now() >= c.lastRated + INTERVALS[c.rating] * 86400000;
}

// ─── Real seed data ──────────────────────────────────────────
const SEED_TOPICS: RoadmapTopic[] = [
  // ── FASE 00 ────────────────────────────────────────────────
  {
    id: "t-f00-01", phase: "Fase 00", type: "theory",
    title: "Teoria Relazionale e Normalizzazione DB",
    desc: "Fondamentale per Ingegneria Gestionale → DSE. Forme normali (1NF, 2NF, 3NF), Algebra Relazionale.",
    url: "https://www.youtube.com/watch?v=GFQaEYEc8_8",
    source: "Teoria", done: false, itemsDone: [],
  },
  {
    id: "t-f00-02", phase: "Fase 00", type: "video_list",
    title: "Statistica descrittiva — StatQuest",
    desc: "🛑 Fermati dopo questi 5 video.",
    source: "StatQuest", done: false, itemsDone: [],
    items: [
      { title: "Histograms, Clearly Explained", url: "https://www.youtube.com/watch?v=qBigTkBLU6g", dur: "5 min" },
      { title: "What is a statistical distribution?", url: "https://www.youtube.com/watch?v=oI3hZJqXJuc", dur: "5 min" },
      { title: "The Normal Distribution", url: "https://www.youtube.com/watch?v=rzFX5NWojp0", dur: "5 min" },
      { title: "The Mean, Variance and Standard Deviation", url: "https://www.youtube.com/watch?v=SzZ6GpcfoQY", dur: "6 min" },
      { title: "Boxplots, Clearly Explained", url: "https://www.youtube.com/watch?v=fHLhBnmwUM0", dur: "7 min" },
    ],
  },
  {
    id: "t-f00-03", phase: "Fase 00", type: "video_list",
    title: "Probabilità, p-value e correlazione",
    desc: "🛑 Fermati dopo questi 6 video.",
    source: "StatQuest", done: false, itemsDone: [],
    items: [
      { title: "Probability vs Likelihood", url: "https://www.youtube.com/watch?v=pYxNSUDSFH4", dur: "5 min" },
      { title: "p-values: What they are", url: "https://www.youtube.com/watch?v=vemZtEM63GY", dur: "12 min" },
      { title: "Statistical Power", url: "https://www.youtube.com/watch?v=Rsc5znwR5FA", dur: "8 min" },
      { title: "Covariance and Correlation Part 1", url: "https://www.youtube.com/watch?v=qtaqvPAeEJY", dur: "9 min" },
      { title: "Covariance and Correlation Part 2", url: "https://www.youtube.com/watch?v=xZ_z8KWkhXE", dur: "9 min" },
      { title: "Confidence Intervals", url: "https://www.youtube.com/watch?v=TqOeMYtOc1w", dur: "8 min" },
    ],
  },
  {
    id: "t-f00-04", phase: "Fase 00", type: "video_list",
    title: "Regressione lineare — StatQuest",
    source: "StatQuest", done: false, itemsDone: [],
    items: [
      { title: "Fitting a Line to Data", url: "https://www.youtube.com/watch?v=PaFPbb66DxQ", dur: "9 min" },
      { title: "Linear Regression, Clearly Explained", url: "https://www.youtube.com/watch?v=7ArmBVF2dCs", dur: "27 min" },
      { title: "R-squared", url: "https://www.youtube.com/watch?v=2AQKmw14mHM", dur: "11 min" },
    ],
  },
  {
    id: "t-f00-05", phase: "Fase 00", type: "link",
    title: "SQL base & Avanzato",
    desc: "sqlzoo.net (fino a SUM/COUNT) → mode.com (Window Functions, Subqueries)",
    url: "https://sqlzoo.net/",
    source: "Interactive", done: false, itemsDone: [],
  },
  // ── FASE 01 ────────────────────────────────────────────────
  {
    id: "t-f01-01", phase: "Fase 01", type: "link",
    title: "Algoritmi e Strutture Dati",
    desc: "Big-O, Liste concatenate, Alberi, Grafi. Colma il gap di informatica.",
    url: "https://cs50.harvard.edu/x/2023/weeks/3/",
    source: "CS50 / Grokking Algorithms", done: false, itemsDone: [],
  },
  {
    id: "t-f01-02", phase: "Fase 01", type: "video_list",
    title: "Algebra lineare — 3Blue1Brown",
    desc: "Primi 9 video. Obbligatorio per Deep Learning.",
    source: "3B1B", done: false, itemsDone: [],
    items: [
      { title: "Vectors, what even are they?", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", dur: "9 min" },
      { title: "Linear combinations, span, basis", url: "https://www.youtube.com/watch?v=k7RM-ot2NWY", dur: "10 min" },
      { title: "Linear transformations and matrices", url: "https://www.youtube.com/watch?v=kYB8IZa5AuE", dur: "10 min" },
      { title: "Matrix multiplication", url: "https://www.youtube.com/watch?v=XkY2DOUCWMU", dur: "10 min" },
      { title: "The determinant", url: "https://www.youtube.com/watch?v=Ip3X9LOh2dk", dur: "10 min" },
      { title: "Inverse matrices, column/null space", url: "https://www.youtube.com/watch?v=uQhTuRlWMxw", dur: "12 min" },
      { title: "Nonsquare matrices", url: "https://www.youtube.com/watch?v=v8VSDg_WQlA", dur: "5 min" },
      { title: "Dot products and duality", url: "https://www.youtube.com/watch?v=LyGKycYT2v0", dur: "10 min" },
      { title: "Cross products", url: "https://www.youtube.com/watch?v=eu6i7WJeinw", dur: "9 min" },
    ],
  },
  {
    id: "t-f01-03", phase: "Fase 01", type: "video_list",
    title: "CS50P Harvard — Python da zero",
    desc: "Lezioni 0→6.",
    source: "Harvard", done: false, itemsDone: [],
    items: [
      { title: "Lecture 0 — Functions, Variables", url: "https://cs50.harvard.edu/python/2022/weeks/0/", dur: "~2h" },
      { title: "Lecture 1 — Conditionals", url: "https://cs50.harvard.edu/python/2022/weeks/1/", dur: "~1h" },
      { title: "Lecture 2 — Loops", url: "https://cs50.harvard.edu/python/2022/weeks/2/", dur: "~1h" },
      { title: "Lecture 3 — Exceptions", url: "https://cs50.harvard.edu/python/2022/weeks/3/", dur: "~1h" },
      { title: "Lecture 4 — Libraries", url: "https://cs50.harvard.edu/python/2022/weeks/4/", dur: "~1h" },
      { title: "Lecture 5 — File I/O", url: "https://cs50.harvard.edu/python/2022/weeks/6/", dur: "~1h" },
      { title: "Lecture 6 — OOP", url: "https://cs50.harvard.edu/python/2022/weeks/8/", dur: "~1.5h" },
    ],
  },
  {
    id: "t-f01-04", phase: "Fase 01", type: "link",
    title: "Math for ML (Deisenroth)",
    desc: "Cap 2, 3, 4, 5",
    url: "https://mml-book.github.io/",
    source: "PDF", done: false, itemsDone: [],
  },
  {
    id: "t-f01-05", phase: "Fase 01", type: "link",
    title: "Python for Data Analysis (McKinney)",
    desc: "Cap 1-5 — NumPy, Pandas",
    url: "https://wesmckinney.com/book/",
    source: "O'Reilly", done: false, itemsDone: [],
  },
  {
    id: "t-f01-06", phase: "Fase 01", type: "link",
    title: "Kaggle Learn",
    desc: "Python → Pandas → Data Viz",
    url: "https://www.kaggle.com/learn",
    source: "Kaggle", done: false, itemsDone: [],
  },
  // ── FASE 02 ────────────────────────────────────────────────
  {
    id: "t-f02-01", phase: "Fase 02", type: "link",
    title: "Probabilità e Statistica (Blitzstein & Hwang)",
    desc: "Focus su catene di Markov.",
    url: "https://probabilitybook.net/",
    source: "Harvard", done: false, itemsDone: [],
  },
  {
    id: "t-f02-02", phase: "Fase 02", type: "video_list",
    title: "ML Intro Teorica — StatQuest",
    source: "StatQuest", done: false, itemsDone: [],
    items: [
      { title: "Gentle Intro to ML", url: "https://www.youtube.com/watch?v=Gv9_4yMHFhI", dur: "8 min" },
      { title: "Bias and Variance", url: "https://www.youtube.com/watch?v=EuBBz3bI-aA", dur: "6 min" },
      { title: "Cross Validation", url: "https://www.youtube.com/watch?v=fSytzGwwBVw", dur: "6 min" },
      { title: "Confusion Matrix", url: "https://www.youtube.com/watch?v=Kdsp6soqA7o", dur: "6 min" },
      { title: "ROC and AUC", url: "https://www.youtube.com/watch?v=4jRBRDbJemM", dur: "16 min" },
    ],
  },
  {
    id: "t-f02-03", phase: "Fase 02", type: "link",
    title: "Machine Learning Specialization (Andrew Ng)",
    desc: "Tutti e 3 i corsi — Audit gratuito",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    source: "Coursera", done: false, itemsDone: [],
  },
  {
    id: "t-f02-04", phase: "Fase 02", type: "link",
    title: "Intro to Statistical Learning (ISLR)",
    desc: "Cap. 2–6 in ordine.",
    url: "https://www.statlearning.com/",
    source: "Book", done: false, itemsDone: [],
  },
  {
    id: "t-f02-05", phase: "Fase 02", type: "link",
    title: "Databases and SQL for DS (IBM)",
    desc: "Audit gratuito",
    url: "https://www.coursera.org/learn/sql-data-science",
    source: "Coursera", done: false, itemsDone: [],
  },
  // ── FASE 03 ────────────────────────────────────────────────
  {
    id: "t-f03-01", phase: "Fase 03", type: "link",
    title: "Deep Learning Specialization (Andrew Ng)",
    desc: "Primi 2 corsi su 5.",
    url: "https://www.coursera.org/specializations/deep-learning",
    source: "Coursera", done: false, itemsDone: [],
  },
  {
    id: "t-f03-02", phase: "Fase 03", type: "link",
    title: "Progetto Pratico End-to-End",
    desc: "Raccolta, Pulizia, EDA, Modello predittivo. FONDAMENTALE.",
    url: "https://github.com/",
    source: "GitHub", done: false, itemsDone: [],
  },
  {
    id: "t-f03-03", phase: "Fase 03", type: "link",
    title: "Big Data Essentials (Yandex)",
    desc: "Hadoop, Spark, RDD — Audit gratuito.",
    url: "https://www.coursera.org/learn/big-data-essentials",
    source: "Coursera", done: false, itemsDone: [],
  },
];

const SEED_CARDS: Flashcard[] = [
  { id: "fc-1", tag: "Math", rating: null, lastRated: null,
    q: "Qual è la derivata di f(x) = x²?",
    a: "f'(x) = 2x  →  la pendenza della tangente raddoppia linearmente." },
  { id: "fc-2", tag: "SQL", rating: null, lastRated: null,
    q: "Differenza tra INNER JOIN e LEFT JOIN?",
    a: "INNER: solo righe con corrispondenza in entrambe le tabelle.\nLEFT: tutte le righe sinistra, NULL dove manca corrispondenza." },
  { id: "fc-3", tag: "ML", rating: null, lastRated: null,
    q: "Cos'è l'overfitting e come si previene?",
    a: "Il modello memorizza il training set. Prevenzione: L1/L2, dropout, più dati, early stopping." },
  { id: "fc-4", tag: "Math", rating: null, lastRated: null,
    q: "Cosa misura la deviazione standard?",
    a: "La dispersione media attorno alla media. σ = √(Σ(xᵢ-μ)²/n)" },
  { id: "fc-5", tag: "SQL", rating: null, lastRated: null,
    q: "A cosa serve GROUP BY?",
    a: "Raggruppa righe con stesso valore; permette aggregazioni per gruppo (COUNT, SUM, AVG)." },
];

// ─── Store ────────────────────────────────────────────────────
interface StudyStore {
  topics: RoadmapTopic[];
  cards: Flashcard[];
  studied: number;
  // Topic CRUD + progress
  toggleTopicDone: (id: string) => void;
  toggleItemDone: (topicId: string, itemTitle: string) => void;
  addTopic: (topic: Omit<RoadmapTopic, "id" | "done" | "itemsDone">) => void;
  updateTopic: (id: string, patch: Partial<Omit<RoadmapTopic, "id">>) => void;
  deleteTopic: (id: string) => void;
  // Flashcard CRUD
  addCard: (card: Omit<Flashcard, "id" | "rating" | "lastRated">) => void;
  updateCard: (id: string, patch: Partial<Omit<Flashcard, "id">>) => void;
  deleteCard: (id: string) => void;
  rateCard: (id: string, rating: CardRating) => void;
  resetSession: () => void;
  getDueCards: () => Flashcard[];
  // Legacy compat
  tasks: RoadmapTask[];
  toggleTask: (id: string) => void;
  addRoadmapTask: (task: Omit<RoadmapTask, "id" | "done">) => void;
  updateRoadmapTask: (id: string, patch: Partial<Omit<RoadmapTask, "id">>) => void;
  deleteRoadmapTask: (id: string) => void;
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      topics: SEED_TOPICS,
      cards: SEED_CARDS,
      studied: 0,
      // Keep legacy tasks array for CrudSheet compat
      tasks: [],

      toggleTopicDone: (id) =>
        set((s) => ({
          topics: s.topics.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),

      toggleItemDone: (topicId, itemTitle) =>
        set((s) => ({
          topics: s.topics.map((t) => {
            if (t.id !== topicId) return t;
            const already = t.itemsDone.includes(itemTitle);
            return {
              ...t,
              itemsDone: already
                ? t.itemsDone.filter((x) => x !== itemTitle)
                : [...t.itemsDone, itemTitle],
            };
          }),
        })),

      addTopic: (topic) =>
        set((s) => ({
          topics: [...s.topics, { ...topic, id: `t-${Date.now()}`, done: false, itemsDone: [] }],
        })),

      updateTopic: (id, patch) =>
        set((s) => ({ topics: s.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

      deleteTopic: (id) =>
        set((s) => ({ topics: s.topics.filter((t) => t.id !== id) })),

      addCard: (card) =>
        set((s) => ({
          cards: [...s.cards, { ...card, id: `fc-${Date.now()}`, rating: null, lastRated: null }],
        })),
      updateCard: (id, patch) =>
        set((s) => ({ cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      rateCard: (id, rating) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, rating, lastRated: Date.now() } : c)),
          studied: s.studied + 1,
        })),
      resetSession: () => set({ studied: 0 }),
      getDueCards: () => get().cards.filter(isDue),

      // Legacy
      toggleTask: (id) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      addRoadmapTask: (task) =>
        set((s) => ({ tasks: [...s.tasks, { ...task, id: `rt-${Date.now()}`, done: false }] })),
      updateRoadmapTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteRoadmapTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    { name: "personal-os-study" }
  )
);
