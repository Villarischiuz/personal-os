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
  // ── FASE 00 · PYTHON + ALGORITMI ───────────────────────────
  {
    id: "t-f00-01", phase: "Fase 00", type: "theory",
    title: "CS50P - Introduction to Programming with Python",
    desc: "Corso principale per funzioni, moduli, file I/O, eccezioni e OOP. Base tecnica pulita per il ponte DSE.",
    url: "https://cs50.harvard.edu/python",
    source: "Harvard CS50P", done: false, itemsDone: [],
  },
  {
    id: "t-f00-02", phase: "Fase 00", type: "video_list",
    title: "CS50P - Lezioni core da completare",
    desc: "Sequenza minima consigliata per arrivare pronto a coding, automazione e studio tecnico in Python.",
    source: "Harvard CS50P", done: false, itemsDone: [],
    items: [
      { title: "Functions, Variables", url: "https://cs50.harvard.edu/python/2022/weeks/0/", dur: "~2h" },
      { title: "Conditionals", url: "https://cs50.harvard.edu/python/2022/weeks/1/", dur: "~1h" },
      { title: "Loops", url: "https://cs50.harvard.edu/python/2022/weeks/2/", dur: "~1h" },
      { title: "Exceptions", url: "https://cs50.harvard.edu/python/2022/weeks/3/", dur: "~1h" },
      { title: "Libraries", url: "https://cs50.harvard.edu/python/2022/weeks/4/", dur: "~1h" },
      { title: "File I/O", url: "https://cs50.harvard.edu/python/2022/weeks/6/", dur: "~1h" },
      { title: "OOP", url: "https://cs50.harvard.edu/python/2022/weeks/8/", dur: "~1.5h" },
    ],
  },
  {
    id: "t-f00-03", phase: "Fase 00", type: "video_list",
    title: "CS50x Week 5 - Data Structures",
    desc: "Concetti fondamentali da riusare in Python: liste, stack, queue, trees, hash table, complessita.",
    source: "Harvard CS50x", done: false, itemsDone: [],
    items: [
      { title: "Lecture + notes", url: "https://cs50.harvard.edu/x/weeks/5/", dur: "~2h" },
      { title: "Rivedi Big-O e trade-off", url: "https://cs50.harvard.edu/x/weeks/3/", dur: "~1h" },
      { title: "Esercizi base LeetCode/HackerRank", url: "https://leetcode.com/", dur: "30-45m" },
    ],
  },
  {
    id: "t-f00-04", phase: "Fase 00", type: "link",
    title: "OOP in Python - project based course",
    desc: "Ripasso operativo delle classi e del design object-oriented, utile dopo CS50P.",
    url: "https://www.codecademy.com/learn/learn-object-oriented-programming-with-python",
    source: "Codecademy", done: false, itemsDone: [],
  },
  {
    id: "t-f00-05", phase: "Fase 00", type: "link",
    title: "Checklist competenze Python",
    desc: "Funzioni, moduli, eccezioni, classi, file I/O e scripting: tutto prima di passare al blocco matematico.",
    url: "https://cs50.harvard.edu/python",
    source: "Self-check", done: false, itemsDone: [],
  },

  // ── FASE 01 · ALGEBRA + PROB/STAT ──────────────────────────
  {
    id: "t-f01-01", phase: "Fase 01", type: "link",
    title: "3Blue1Brown - Essence of Linear Algebra",
    desc: "Playlist visuale per fissare geometricamente vettori, matrici, trasformazioni, autovalori e basi.",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
    source: "3Blue1Brown", done: false, itemsDone: [],
  },
  {
    id: "t-f01-02", phase: "Fase 01", type: "video_list",
    title: "MIT 18.06 - Linear Algebra",
    desc: "Corso universitario completo da affiancare a 3Blue1Brown per rigore ed esercizi.",
    source: "MIT OCW", done: false, itemsDone: [],
    items: [
      { title: "Vectors and spaces", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", dur: "module" },
      { title: "Matrix methods and decompositions", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", dur: "module" },
      { title: "Eigenvalues, eigenvectors, SVD", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", dur: "module" },
    ],
  },
  {
    id: "t-f01-03", phase: "Fase 01", type: "link",
    title: "Math for ML (Deisenroth)",
    desc: "Testo ponte tra algebra, probabilita, calcolo e machine learning. Usalo per capitoli selezionati.",
    url: "https://mml-book.com",
    source: "MML Book", done: false, itemsDone: [],
  },
  {
    id: "t-f01-04", phase: "Fase 01", type: "link",
    title: "MIT 18.05 - Probability and Statistics",
    desc: "Probabilita, distribuzioni, inferenza e regressione con taglio universitario.",
    url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/",
    source: "MIT OCW", done: false, itemsDone: [],
  },
  {
    id: "t-f01-05", phase: "Fase 01", type: "link",
    title: "StatQuest - Probability and Statistics index",
    desc: "Playlist ponte per chiarire distribuzioni, test, regressione, ANOVA e concetti base.",
    url: "https://statquest.org/video_index.html",
    source: "StatQuest", done: false, itemsDone: [],
  },
  {
    id: "t-f01-06", phase: "Fase 01", type: "link",
    title: "Statistics full course for Data Science",
    desc: "Corso video lungo per consolidare statistica applicata a ML dopo i fondamenti.",
    url: "https://www.youtube.com/watch?v=E084OFp59O4",
    source: "YouTube", done: false, itemsDone: [],
  },

  // ── FASE 02 · DATA ANALYSIS + SQL ──────────────────────────
  {
    id: "t-f02-01", phase: "Fase 02", type: "link",
    title: "Python for Data Analysis (McKinney)",
    desc: "Libro open access per NumPy, Pandas, data wrangling e analisi dati in Python.",
    url: "https://wesmckinney.com/book/",
    source: "Wes McKinney", done: false, itemsDone: [],
  },
  {
    id: "t-f02-02", phase: "Fase 02", type: "link",
    title: "Mode SQL Tutorial",
    desc: "Percorso progressivo browser-based da SELECT e JOIN fino a query piu strutturate.",
    url: "https://mode.com/sql-tutorial/sql-in-mode/index.html",
    source: "Mode", done: false, itemsDone: [],
  },
  {
    id: "t-f02-03", phase: "Fase 02", type: "link",
    title: "SQL Window Functions Tutorial",
    desc: "ROW_NUMBER, LAG/LEAD, NTILE e analisi avanzata dei dataset tabellari.",
    url: "https://www.thoughtspot.com/sql-tutorial/sql-window-functions",
    source: "ThoughtSpot", done: false, itemsDone: [],
  },
  {
    id: "t-f02-04", phase: "Fase 02", type: "link",
    title: "Theory check - Relational model and normalization",
    desc: "Tieni il ponte con teoria relazionale, E-R e normalizzazione come supporto ai corsi di data management.",
    url: "https://www.youtube.com/watch?v=GFQaEYEc8_8",
    source: "Theory recap", done: false, itemsDone: [],
  },

  // ── FASE 03 · ML CORE ──────────────────────────────────────
  {
    id: "t-f03-01", phase: "Fase 03", type: "link",
    title: "An Introduction to Statistical Learning (ISLR)",
    desc: "Testo base consigliato per regressione, classificazione, resampling e valutazione.",
    url: "https://www.statlearning.com",
    source: "ISLR", done: false, itemsDone: [],
  },
  {
    id: "t-f03-02", phase: "Fase 03", type: "link",
    title: "Machine Learning Specialization (Andrew Ng)",
    desc: "Specialization auditabile gratis per teoria e pratica guidata su ML classico.",
    url: "https://www.coursera.org/specializations/machine-learning-introduction",
    source: "Coursera", done: false, itemsDone: [],
  },
  {
    id: "t-f03-03", phase: "Fase 03", type: "link",
    title: "StatQuest - Machine Learning index",
    desc: "Playlist per bias-variance, logistic regression, tree, random forest e metriche.",
    url: "https://statquest.org/video_index.html",
    source: "StatQuest", done: false, itemsDone: [],
  },
  {
    id: "t-f03-04", phase: "Fase 03", type: "link",
    title: "Mini progetto ML end-to-end",
    desc: "Dataset, pulizia, EDA, modello, metriche e breve write-up. Serve per consolidare davvero il ponte.",
    url: "https://github.com/",
    source: "Hands-on", done: false, itemsDone: [],
  },

  // ── FASE 04 · BIG DATA + DISTRIBUTED ──────────────────────
  {
    id: "t-f04-01", phase: "Fase 04", type: "link",
    title: "Big Data Essentials: HDFS, MapReduce and Spark RDD",
    desc: "Corso auditabile per capire fondamenta Hadoop/Spark prima della magistrale.",
    url: "https://www.coursera.org/learn/big-data-essentials",
    source: "Coursera / Yandex", done: false, itemsDone: [],
  },
  {
    id: "t-f04-02", phase: "Fase 04", type: "link",
    title: "Apache Spark basics",
    desc: "Introduzione semplificata a Spark, streaming e MLlib per primo orientamento.",
    url: "https://www.simplilearn.com/learn-apache-spark-basics-free-course-skillup",
    source: "Simplilearn", done: false, itemsDone: [],
  },
  {
    id: "t-f04-03", phase: "Fase 04", type: "link",
    title: "PySpark from Basics to Advanced",
    desc: "Tutorial passo-passo su DataFrame, SQL e flusso pratico in stile Databricks.",
    url: "https://www.youtube.com/watch?v=1J7qZ5SNGaQ",
    source: "YouTube", done: false, itemsDone: [],
  },
  {
    id: "t-f04-04", phase: "Fase 04", type: "link",
    title: "PySpark tutorial for beginners",
    desc: "Articolo operativo con concetti chiave e best practice da data engineering.",
    url: "https://dataengineeracademy.com/blog/pyspark-tutorial-for-beginners/",
    source: "Data Engineer Academy", done: false, itemsDone: [],
  },
  {
    id: "t-f04-05", phase: "Fase 04", type: "link",
    title: "Distributed Systems for Practitioners",
    desc: "Percorso concettuale su replica, consistenza, latenze e trade-off dei sistemi distribuiti.",
    url: "https://www.educative.io/courses/distributed-systems-practitioners",
    source: "Educative", done: false, itemsDone: [],
  },
  {
    id: "t-f04-06", phase: "Fase 04", type: "link",
    title: "Distributed Systems and Web Services (facoltativo)",
    desc: "Approfondimento facoltativo auditabile su web services, REST e infrastrutture distribuite.",
    url: "https://www.coursera.org/learn/distributed-systems-and-web-services",
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

function mergeSeedTopics(existing: RoadmapTopic[] | undefined, seed: RoadmapTopic[]) {
  const byId = new Map((existing ?? []).map((topic) => [topic.id, topic]));
  const mergedSeed = seed.map((topic) => {
    const previous = byId.get(topic.id);
    if (!previous) {
      return topic;
    }

    return {
      ...topic,
      done: previous.done,
      itemsDone: previous.itemsDone ?? [],
    };
  });

  const customTopics = (existing ?? []).filter(
    (topic) => !seed.some((seedTopic) => seedTopic.id === topic.id)
  );

  return [...mergedSeed, ...customTopics];
}

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
    {
      name: "personal-os-study",
      version: 2,
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<StudyStore> | undefined;
        if (!state) {
          return {
            topics: SEED_TOPICS,
            cards: SEED_CARDS,
            studied: 0,
            tasks: [],
          };
        }

        if (version < 2) {
          return {
            ...state,
            topics: mergeSeedTopics(state.topics, SEED_TOPICS),
            cards: state.cards ?? SEED_CARDS,
            studied: state.studied ?? 0,
            tasks: state.tasks ?? [],
          };
        }

        return {
          ...state,
          topics: mergeSeedTopics(state.topics, SEED_TOPICS),
          cards: state.cards ?? SEED_CARDS,
          studied: state.studied ?? 0,
          tasks: state.tasks ?? [],
        };
      },
    }
  )
);
