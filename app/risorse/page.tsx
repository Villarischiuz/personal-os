import { ExternalLink, BookOpen } from "@/lib/icons";

type ResourceLink = {
  label: string;
  source: string;
  href: string;
};

const IELTS_LINKS: ResourceLink[] = [
  { label: "Free Full IELTS Course", source: "English Pro Tips · 7+ ore", href: "https://www.youtube.com/watch?v=xjOM5ZZOupA" },
  { label: "Crash course IELTS in 1 ora", source: "Panoramica veloce", href: "https://www.youtube.com/watch?v=EGBPLDP_qp8" },
  { label: "British Council - Tips & Tricks", source: "Video ufficiali per skill", href: "https://takeielts.britishcouncil.org/take-ielts/prepare/videos" },
  { label: "IELTSforFREE", source: "Listening, Reading, Writing, Speaking", href: "https://www.ieltsforfree.com" },
  { label: "6-week IELTS plan - IDP", source: "Schema settimanale adattabile", href: "https://ieltsidpindia.com/ielts/6-week-study-plan-for-ielts" },
  { label: "Band 9 Prep study plans", source: "Varianti di pianificazione", href: "https://band9prep.com/blog/ielts-study-plans-complete-guide" },
  { label: "Cambridge B2 First preparation", source: "Materiali allineati al target IELTS 5.5–6.0", href: "https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/preparation/" },
  { label: "Cambridge score comparison", source: "Cambridge scale vs IELTS", href: "https://www.cambridgeenglish.org/Images/461626-cambridge-english-qualifications-comparing-scores-to-ielts.pdf" },
  { label: "Polito DSE — Regolamento didattico", source: "Usa come reading tecnico avanzato", href: "https://www.polito.it/sites/default/files/2023-08/Regolamento_didattico_LM_DATA%20SCIENCE%20AND%20ENGINEERING_2023_2024.pdf" },
];

const MAGISTRALE_LINKS: { phase: string; links: ResourceLink[] }[] = [
  {
    phase: "Fase 00 — Python + Algoritmi",
    links: [
      { label: "CS50P — Introduction to Programming with Python", source: "Harvard CS50P", href: "https://cs50.harvard.edu/python" },
      { label: "CS50x Week 5 — Data Structures", source: "Harvard CS50x", href: "https://cs50.harvard.edu/x/weeks/5/" },
      { label: "OOP in Python — project based course", source: "Codecademy", href: "https://www.codecademy.com/learn/learn-object-oriented-programming-with-python" },
    ],
  },
  {
    phase: "Fase 01 — Algebra + Prob/Stat",
    links: [
      { label: "3Blue1Brown — Essence of Linear Algebra", source: "3Blue1Brown", href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
      { label: "MIT 18.06 — Linear Algebra", source: "MIT OCW", href: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/" },
      { label: "Math for ML (Deisenroth)", source: "MML Book", href: "https://mml-book.com" },
      { label: "MIT 18.05 — Probability and Statistics", source: "MIT OCW", href: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/" },
      { label: "StatQuest — Probability and Statistics", source: "StatQuest", href: "https://statquest.org/video_index.html" },
    ],
  },
  {
    phase: "Fase 02 — Data Analysis + SQL",
    links: [
      { label: "Python for Data Analysis (McKinney)", source: "Wes McKinney", href: "https://wesmckinney.com/book/" },
      { label: "Mode SQL Tutorial", source: "Mode", href: "https://mode.com/sql-tutorial/sql-in-mode/index.html" },
      { label: "SQL Window Functions Tutorial", source: "ThoughtSpot", href: "https://www.thoughtspot.com/sql-tutorial/sql-window-functions" },
    ],
  },
  {
    phase: "Fase 03 — ML Core",
    links: [
      { label: "An Introduction to Statistical Learning (ISLR)", source: "ISLR", href: "https://www.statlearning.com" },
      { label: "Machine Learning Specialization (Andrew Ng)", source: "Coursera", href: "https://www.coursera.org/specializations/machine-learning-introduction" },
      { label: "StatQuest — Machine Learning", source: "StatQuest", href: "https://statquest.org/video_index.html" },
    ],
  },
  {
    phase: "Fase 04 — Big Data + Distributed",
    links: [
      { label: "Spark: The Definitive Guide", source: "O'Reilly", href: "https://www.oreilly.com/library/view/spark-the-definitive/9781491912201/" },
      { label: "Hadoop: The Definitive Guide", source: "O'Reilly", href: "https://www.oreilly.com/library/view/hadoop-the-definitive/9781491901687/" },
    ],
  },
];

function LinkRow({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/3 px-4 py-3 hover:bg-white/6 transition-colors group"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/85 group-hover:text-white transition-colors">{link.label}</p>
        <p className="text-xs text-white/35 mt-0.5">{link.source}</p>
      </div>
      <ExternalLink size={13} className="text-white/25 group-hover:text-white/60 transition-colors shrink-0 mt-1" />
    </a>
  );
}

export default function RisorsePage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Risorse studio</h1>
        <p className="text-sm text-white/40 mt-1">Link salvati dal vecchio sistema.</p>
      </div>

      {/* IELTS */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-violet-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">IELTS</h2>
        </div>
        <div className="space-y-2">
          {IELTS_LINKS.map((link) => (
            <LinkRow key={link.href} link={link} />
          ))}
        </div>
      </section>

      {/* Magistrale */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-blue-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">Magistrale — DSE</h2>
        </div>
        {MAGISTRALE_LINKS.map(({ phase, links }) => (
          <div key={phase} className="space-y-2">
            <p className="text-xs text-white/30 font-medium">{phase}</p>
            {links.map((link) => (
              <LinkRow key={link.href} link={link} />
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}
