"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CrudSheet, type CrudContext } from "@/components/global/CrudSheet";
import { useStudyStore, type CardRating, type RoadmapTopic } from "@/lib/stores/studyStore";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink, GraduationCap, MoreHorizontal, Plus } from "@/lib/icons";

// ─────────────────────────────────────────────────────────────
// Roadmap Tab
// ─────────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "Fase 00",
    label: "Fase 00 — Statistica + SQL",
    color: "border-amber-500/30 bg-amber-500/5",
    accent: "text-amber-400",
    bar: "bg-amber-500",
  },
  {
    id: "Fase 01",
    label: "Fase 01 — Math + Python",
    color: "border-blue-500/30 bg-blue-500/5",
    accent: "text-blue-400",
    bar: "bg-blue-500",
  },
  {
    id: "Fase 02",
    label: "Fase 02 — ML Core",
    color: "border-violet-500/30 bg-violet-500/5",
    accent: "text-violet-400",
    bar: "bg-violet-500",
  },
  {
    id: "Fase 03",
    label: "Fase 03 — Consolidamento",
    color: "border-green-500/30 bg-green-500/5",
    accent: "text-green-400",
    bar: "bg-green-500",
  },
];

function CheckBox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
        checked ? "border-green-500 bg-green-500" : "border-white/25 bg-transparent hover:border-white/50"
      )}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function TopicRow({ topic, onDelete }: { topic: RoadmapTopic; onDelete: () => void }) {
  const { toggleTopicDone, toggleItemDone } = useStudyStore();
  const [expanded, setExpanded] = useState(false);

  const isVideoList = topic.type === "video_list" && topic.items && topic.items.length > 0;
  const itemsTotal = topic.items?.length ?? 0;
  const itemsDoneCount = topic.itemsDone.length;
  const allItemsDone = isVideoList && itemsDoneCount === itemsTotal;

  return (
    <div className="rounded-lg border border-white/8 bg-white/2 overflow-hidden">
      {/* Main row */}
      <div className="group flex items-center gap-2.5 px-3 py-2.5 min-h-[48px]">
        <CheckBox
          checked={!!(isVideoList ? allItemsDone : topic.done)}
          onToggle={() => toggleTopicDone(topic.id)}
        />
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-semibold leading-snug",
            (isVideoList ? allItemsDone : topic.done) ? "line-through text-white/30" : "text-white/85"
          )}>
            {topic.title}
          </p>
          {topic.desc && (
            <p className="text-[10px] text-white/35 mt-0.5 leading-relaxed">{topic.desc}</p>
          )}
          {isVideoList && (
            <p className="text-[10px] text-white/30 mt-0.5">{itemsDoneCount}/{itemsTotal} video</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {topic.url && !isVideoList && (
            <a
              href={topic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-white/20 hover:text-white/60 hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
          {isVideoList && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="rounded p-1.5 text-white/20 hover:text-white/60 hover:bg-white/10 transition-colors"
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded p-1.5 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100 min-h-[32px] min-w-[32px] flex items-center justify-center">
                <MoreHorizontal size={13} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-400">🗑 Elimina</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Video list expanded */}
      {isVideoList && expanded && (
        <div className="border-t border-white/6 px-3 pb-2 pt-1 space-y-1">
          {topic.items!.map((item) => {
            const done = topic.itemsDone.includes(item.title);
            return (
              <div key={item.title} className="flex items-center gap-2.5 py-1.5">
                <CheckBox
                  checked={done}
                  onToggle={() => toggleItemDone(topic.id, item.title)}
                />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-xs leading-snug", done ? "line-through text-white/25" : "text-white/70")}>
                    {item.title}
                  </p>
                  {item.dur && <span className="text-[10px] text-white/25">{item.dur}</span>}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 rounded p-1 text-white/20 hover:text-white/60 transition-colors"
                >
                  <ExternalLink size={11} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RoadmapTab() {
  const { topics, deleteTopic } = useStudyStore();
  const [open, setOpen] = useState<Record<string, boolean>>({ "Fase 00": true });
  const [search, setSearch] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();

  function matchesTopic(topic: RoadmapTopic) {
    const isCompleted =
      topic.type === "video_list" && topic.items
        ? topic.itemsDone.length === topic.items.length
        : topic.done;

    if (hideCompleted && isCompleted) return false;

    const haystack = [topic.title, topic.desc, topic.source]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return !normalizedSearch || haystack.includes(normalizedSearch);
  }

  // Overall progress: count completed topics/items
  const totalItems = topics.reduce((acc, t) => acc + (t.type === "video_list" && t.items ? t.items.length : 1), 0);
  const doneItems = topics.reduce((acc, t) => {
    if (t.type === "video_list" && t.items) return acc + t.itemsDone.length;
    return acc + (t.done ? 1 : 0);
  }, 0);
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Overall progress */}
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3">
        <GraduationCap size={18} className="text-violet-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-white/40">Completamento roadmap DSE/Polito</p>
          <p className="text-lg font-black text-white">
            {doneItems}<span className="text-sm text-white/30">/{totalItems} risorse</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-violet-400">{pct}%</p>
          <div className="mt-1 h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca risorse, descrizioni o fonti..."
            className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/40"
          />
          <button
            onClick={() => setHideCompleted((value) => !value)}
            className={cn(
              "rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
              hideCompleted
                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                : "border-white/12 bg-white/5 text-white/45 hover:bg-white/8 hover:text-white/70"
            )}
          >
            {hideCompleted ? "Mostra completate" : "Nascondi completate"}
          </button>
        </div>
      </div>

      {/* Phases */}
      {PHASES.map((phase) => {
        const phaseTopics = topics.filter((t) => t.phase === phase.id && matchesTopic(t));
        const phaseTotal = phaseTopics.reduce((acc, t) => acc + (t.type === "video_list" && t.items ? t.items.length : 1), 0);
        const phaseDone = phaseTopics.reduce((acc, t) => {
          if (t.type === "video_list" && t.items) return acc + t.itemsDone.length;
          return acc + (t.done ? 1 : 0);
        }, 0);
        const isOpen = open[phase.id] ?? false;
        const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

        return (
          <div key={phase.id} className={cn("rounded-xl border overflow-hidden", phase.color)}>
            {/* Phase header */}
            <button
              onClick={() => setOpen((o) => ({ ...o, [phase.id]: !isOpen }))}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <div className="flex-1">
                <span className={cn("text-sm font-bold", phase.accent)}>{phase.label}</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-20 rounded-full bg-white/10 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", phase.bar)} style={{ width: `${phasePct}%` }} />
                  </div>
                  <span className="text-[10px] text-white/30">{phaseDone}/{phaseTotal}</span>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp size={14} className="text-white/30 flex-shrink-0" />
              ) : (
                <ChevronDown size={14} className="text-white/30 flex-shrink-0" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-white/8 px-3 pb-3 pt-2 space-y-2">
                {phaseTopics.length === 0 && (
                  <p className="text-xs text-white/25 text-center py-4">Nessuna risorsa in questa fase.</p>
                )}
                {phaseTopics.map((topic) => (
                  <TopicRow
                    key={topic.id}
                    topic={topic}
                    onDelete={() => deleteTopic(topic.id)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {PHASES.every((phase) => topics.filter((topic) => topic.phase === phase.id && matchesTopic(topic)).length === 0) && (
        <div className="rounded-xl border border-white/8 bg-white/3 py-10 text-center">
          <p className="text-sm text-white/35">Nessuna risorsa trovata con i filtri correnti.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 4 — Flashcard Tab (Spaced Repetition)
// ─────────────────────────────────────────────────────────────

const TAG_COLOR: Record<string, string> = {
  Math: "bg-blue-500/20 text-blue-300",
  SQL:  "bg-emerald-500/20 text-emerald-300",
  ML:   "bg-violet-500/20 text-violet-300",
};

function FlashcardsTab() {
  const { cards, studied, rateCard, deleteCard, getDueCards } = useStudyStore();
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sheet, setSheet] = useState<{ open: boolean; ctx: CrudContext | null }>({ open: false, ctx: null });
  const [tagFilter, setTagFilter] = useState("all");
  const [search, setSearch] = useState("");

  const due = getDueCards();
  const tags = Array.from(new Set(cards.map((card) => card.tag))).sort((a, b) => a.localeCompare(b));
  const normalizedSearch = search.trim().toLowerCase();
  const filteredDue = due.filter((card) => tagFilter === "all" || card.tag === tagFilter);
  const visibleCards = cards.filter((card) => {
    const matchesTag = tagFilter === "all" || card.tag === tagFilter;
    const haystack = `${card.q} ${card.a} ${card.tag}`.toLowerCase();
    return matchesTag && (!normalizedSearch || haystack.includes(normalizedSearch));
  });
  const newCount = cards.filter((c) => c.rating === null).length;

  function handleRate(rating: CardRating) {
    const safeIndex = currentIdx < filteredDue.length ? currentIdx : 0;
    if (!filteredDue[safeIndex]) return;
    rateCard(filteredDue[safeIndex].id, rating);
    setFlipped(false);
    // Move to next with a tiny delay so the un-flip animation plays
    setTimeout(() => setCurrentIdx((i) => (i < filteredDue.length - 1 ? i + 1 : 0)), 120);
  }

  const safeCurrentIdx = currentIdx < filteredDue.length ? currentIdx : 0;
  const card = filteredDue[safeCurrentIdx] ?? null;

  return (
    <div className="space-y-5">
      {/* Stats header + add button */}
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-3 gap-2 flex-1">
          {[
            { label: "Nuove", value: newCount, color: "text-blue-400" },
            { label: "Da ripassare", value: due.length, color: "text-amber-400" },
            { label: "Studiate oggi", value: studied, color: "text-green-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-white/8 bg-white/3 px-3 py-3 text-center">
              <p className={cn("text-xl font-black", color)}>{value}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => setSheet({ open: true, ctx: { type: "flashcard" } })}
          className="flex-shrink-0 flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-xs font-semibold text-white/60 hover:bg-white/8 hover:text-white transition-colors min-h-[44px]"
        >
          <Plus size={13} />
        </button>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/3 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca domanda, risposta o tag..."
            className="flex-1 rounded-xl border border-white/12 bg-white/5 px-3 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-violet-500/40"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter("all")}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                tagFilter === "all"
                  ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                  : "border-white/10 bg-white/5 text-white/45 hover:bg-white/8 hover:text-white/70"
              )}
            >
              Tutti
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={cn(
                  "rounded-full border px-3 py-2 text-xs font-semibold transition-colors",
                  tagFilter === tag
                    ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                    : "border-white/10 bg-white/5 text-white/45 hover:bg-white/8 hover:text-white/70"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {card ? (
        <>
          {/* 3D Flip Card */}
          <div
            className="relative mx-auto w-full max-w-md"
            style={{ perspective: "1000px", height: "220px" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div
              className="relative h-full w-full transition-transform duration-500 cursor-pointer"
              style={{
                transformStyle: "preserve-3d",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/12 bg-[hsl(222,47%,10%)] px-6 py-6 select-none"
                style={{ backfaceVisibility: "hidden" }}
              >
                <span className={cn("mb-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold", TAG_COLOR[card.tag] ?? "bg-white/10 text-white/50")}>
                  {card.tag}
                </span>
                <p className="text-center text-base font-semibold text-white leading-snug">{card.q}</p>
                <p className="mt-4 text-[11px] text-white/25">Tocca per girare</p>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-white/12 bg-[hsl(230,40%,12%)] px-6 py-6 select-none"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <p className="text-center text-sm text-white/85 leading-relaxed whitespace-pre-line">{card.a}</p>
              </div>
            </div>
          </div>

          {/* Rating buttons — only shown when flipped */}
          <div className={cn(
            "grid grid-cols-3 gap-3 transition-opacity duration-200",
            flipped ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            {([
              { rating: "hard" as CardRating, label: "😓 Difficile", style: "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-95" },
              { rating: "ok"   as CardRating, label: "🤔 Ok",        style: "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 active:scale-95" },
              { rating: "easy" as CardRating, label: "✅ Facile",    style: "border-green-500/40 bg-green-500/10 text-green-400 hover:bg-green-500/20 active:scale-95" },
            ] as const).map(({ rating, label, style }) => (
              <button
                key={rating}
                onClick={(e) => { e.stopPropagation(); handleRate(rating); }}
                className={cn("rounded-xl border py-3.5 text-xs font-semibold transition-all min-h-[52px]", style)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/5 py-16 text-center">
          <span className="text-4xl mb-3">🎉</span>
          <p className="text-sm font-semibold text-green-400">Tutte le card revisionate!</p>
          <p className="mt-1 text-xs text-white/30">Torna domani per il prossimo ripasso.</p>
        </div>
      )}

      {/* All cards list with edit/delete */}
      {cards.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">
            Tutte le flashcard ({visibleCards.length}/{cards.length})
          </p>
          {visibleCards.map((c) => (
            <div key={c.id} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80 truncate">{c.q}</p>
                <p className="text-[10px] text-white/30 truncate">{c.tag}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-shrink-0 rounded p-1.5 text-white/20 hover:bg-white/10 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100 min-h-[32px] min-w-[32px] flex items-center justify-center">
                    <MoreHorizontal size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSheet({ open: true, ctx: { type: "flashcard", item: c } })}>✏️ Modifica</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteCard(c.id)} className="text-red-400 focus:text-red-400">🗑 Elimina</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {visibleCards.length === 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 py-6 text-center text-sm text-white/35">
              Nessuna flashcard trovata con i filtri attivi.
            </div>
          )}
        </div>
      )}

      <CrudSheet open={sheet.open} context={sheet.ctx} onClose={() => setSheet({ open: false, ctx: null })} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 5 — English Tab
// ─────────────────────────────────────────────────────────────

const DOG_WALK_ITEMS = [
  { id: "dw-1", label: "BBC 6 Minute English", sub: "bbc.co.uk/learningenglish", emoji: "🎙" },
  { id: "dw-2", label: "DataFramed Podcast", sub: "DataCamp · episodio in coda", emoji: "📊" },
];
const DOG_WALK_KEY = "study-dog-walk";

function EnglishTab() {
  const [dogWalkChecked, setDogWalkChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(DOG_WALK_KEY) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const [today] = useState(() => new Date());
  const currentYear = today.getFullYear();
  const candidateTarget = new Date(currentYear, 8, 1);
  const ieltsTarget =
    candidateTarget.getTime() > today.getTime()
      ? candidateTarget
      : new Date(currentYear + 1, 8, 1);
  const prepStart = new Date(ieltsTarget);
  prepStart.setDate(prepStart.getDate() - 180);
  const daysLeft = Math.max(
    0,
    Math.ceil((ieltsTarget.getTime() - today.getTime()) / 86400000)
  );
  const totalDays = Math.max(
    1,
    Math.ceil((ieltsTarget.getTime() - prepStart.getTime()) / 86400000)
  );
  const elapsed = totalDays - daysLeft;
  const pct = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const completedDogWalk = DOG_WALK_ITEMS.filter((item) => dogWalkChecked[item.id]).length;

  useEffect(() => {
    localStorage.setItem(DOG_WALK_KEY, JSON.stringify(dogWalkChecked));
  }, [dogWalkChecked]);

  return (
    <div className="space-y-4">
      {/* IELTS Target */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Target IELTS 5.5</CardTitle>
          <span className="text-xs text-white/30">{daysLeft} giorni rimasti</span>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between text-xs text-white/40 mb-1">
            <span>Ora (B1)</span>
            <span className="text-white font-semibold">{pct}%</span>
            <span>IELTS 5.5</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-white/8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { label: "Listening", target: "5.5", tip: "BBC 6 Min daily" },
              { label: "Reading",   target: "5.5", tip: "30 min/day" },
              { label: "Writing",   target: "5.0", tip: "1 essay/week" },
              { label: "Speaking",  target: "5.5", tip: "Burlington output" },
            ].map(({ label, target, tip }) => (
              <div key={label} className="rounded-lg border border-white/8 bg-white/3 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/70">{label}</span>
                  <span className="text-xs text-blue-400 font-mono">{target}</span>
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dog Walk Audio */}
      <Card>
        <CardHeader>
          <CardTitle>🐕 Audio da passeggio</CardTitle>
          <span className="text-xs text-white/30">
            Habit stack con la passeggiata mattutina · {completedDogWalk}/{DOG_WALK_ITEMS.length} completati
          </span>
        </CardHeader>
        <CardContent className="space-y-2">
          {DOG_WALK_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-3.5 hover:bg-white/6 active:bg-white/8 transition-colors min-h-[60px]"
            >
              <button
                onClick={() => setDogWalkChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
                className={cn(
                  "flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                  dogWalkChecked[item.id]
                    ? "border-green-500 bg-green-500"
                    : "border-white/25"
                )}
                role="checkbox"
                aria-checked={!!dogWalkChecked[item.id]}
              >
                {dogWalkChecked[item.id] && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className="text-lg flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", dogWalkChecked[item.id] ? "line-through text-white/30" : "text-white")}>{item.label}</p>
                <p className="text-[10px] text-white/30 truncate">{item.sub}</p>
              </div>
            </label>
          ))}
          <p className="text-[10px] text-white/20 text-center pt-1">
            Listening passivo = input autentico al livello target
          </p>
        </CardContent>
      </Card>

      {/* Micro-moments */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Micro-momenti</CardTitle>
          <span className="text-xs text-white/30">Sostituisci scroll passivo con input in inglese</span>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/8 px-4 py-4 mb-3">
            <p className="text-sm font-bold text-violet-300 mb-1">📱 Burlington First</p>
            <p className="text-xs text-white/50 leading-relaxed">
              Ogni volta che senti il bisogno di aprire Instagram o TikTok, apri Burlington invece.
              <br />5 minuti di lessico &gt; 5 minuti di scroll.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { emoji: "🚌", text: "In autobus/treno → Burlington vocabolario" },
              { emoji: "🍽",  text: "Pranzo da solo → YouTube canale inglese (no sottotitoli IT)" },
              { emoji: "⏳",  text: "In attesa → leggere 1 articolo BBC News" },
            ].map(({ emoji, text }) => (
              <div key={text} className="flex items-start gap-2.5 rounded-lg border border-white/6 bg-white/2 px-3 py-2.5">
                <span className="text-base flex-shrink-0">{emoji}</span>
                <p className="text-xs text-white/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────────────────────
export default function StudyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Studio</h1>
        <p className="mt-1 text-sm text-white/40">Roadmap Polito · Ripetizione spaziata · Inglese</p>
      </div>

      <Tabs defaultValue="roadmap">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="roadmap" className="flex-1 md:flex-none">📍 Roadmap</TabsTrigger>
          <TabsTrigger value="flashcards" className="flex-1 md:flex-none">🃏 Flashcard</TabsTrigger>
          <TabsTrigger value="english" className="flex-1 md:flex-none">🇬🇧 Inglese</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap"><RoadmapTab /></TabsContent>
        <TabsContent value="flashcards"><FlashcardsTab /></TabsContent>
        <TabsContent value="english"><EnglishTab /></TabsContent>
      </Tabs>
    </div>
  );
}
