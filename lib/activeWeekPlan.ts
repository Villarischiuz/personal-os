import type { DatedEvent, EventColor, EventTag } from "./types";

export interface ActiveWeekRange {
  start: string;
  end: string;
}

export const DEFAULT_ACTIVE_WEEK_RANGE: ActiveWeekRange = {
  start: "2026-04-23",
  end: "2026-04-27",
};

export const DEFAULT_ACTIVE_WEEK_EVENTS: DatedEvent[] = [
  {
    id: "aw-2026-04-23-1",
    title: "Studio Magistrale: CS50P",
    date: "2026-04-23",
    hour: 9,
    minute: 0,
    durationMins: 120,
    color: "violet",
    tag: "Deep",
    notes: "Blocco mattutino gia trascorso.",
    locked: true,
  },
  {
    id: "aw-2026-04-23-2",
    title: "Outreach Agent - Daily check",
    date: "2026-04-23",
    hour: 14,
    minute: 0,
    durationMins: 45,
    color: "blue",
    notes: "Telegram + dashboard + pipeline.",
    locked: true,
  },
  {
    id: "aw-2026-04-23-3",
    title: "Fix Claude Code: logger.py PermissionError",
    date: "2026-04-23",
    hour: 14,
    minute: 45,
    durationMins: 60,
    color: "blue",
    tag: "Deep",
    notes: "Bloccante: iniziare da qui.",
    locked: true,
  },
  {
    id: "aw-2026-04-23-4",
    title: "Pausa pre-parrucchiere",
    date: "2026-04-23",
    hour: 15,
    minute: 45,
    durationMins: 15,
    color: "green",
    tag: "Rest",
    locked: true,
  },
  {
    id: "aw-2026-04-23-5",
    title: "Parrucchiere",
    date: "2026-04-23",
    hour: 16,
    minute: 0,
    durationMins: 60,
    color: "orange",
    notes: "Impegno fisso.",
    locked: true,
  },
  {
    id: "aw-2026-04-23-6",
    title: "Modella - Ricerca setup LoRA",
    date: "2026-04-23",
    hour: 17,
    minute: 0,
    durationMins: 120,
    color: "violet",
    tag: "Creative",
    notes: "Riprendere dopo il parrucchiere.",
    locked: true,
  },
  {
    id: "aw-2026-04-24-1",
    title: "Studio Magistrale: CS50P - Functions + File I/O",
    date: "2026-04-24",
    hour: 9,
    minute: 0,
    durationMins: 120,
    color: "violet",
    tag: "Deep",
    locked: true,
  },
  {
    id: "aw-2026-04-24-2",
    title: "Palestra",
    date: "2026-04-24",
    hour: 11,
    minute: 0,
    durationMins: 45,
    color: "orange",
    tag: "Rest",
    locked: true,
  },
  {
    id: "aw-2026-04-24-3",
    title: "Outreach Agent - Daily check",
    date: "2026-04-24",
    hour: 14,
    minute: 0,
    durationMins: 45,
    color: "blue",
    locked: true,
  },
  {
    id: "aw-2026-04-24-4",
    title: "Fix Claude Code: invertire fallback enricher",
    date: "2026-04-24",
    hour: 14,
    minute: 45,
    durationMins: 20,
    color: "blue",
    tag: "Deep",
    locked: true,
  },
  {
    id: "aw-2026-04-24-5",
    title: "Outreach Agent - Registrazione Loom",
    date: "2026-04-24",
    hour: 15,
    minute: 5,
    durationMins: 90,
    color: "blue",
    locked: true,
  },
  {
    id: "aw-2026-04-24-6",
    title: "Modella - Setup ambiente LoRA",
    date: "2026-04-24",
    hour: 16,
    minute: 35,
    durationMins: 145,
    color: "violet",
    tag: "Creative",
    locked: true,
  },
  {
    id: "aw-2026-04-25-1",
    title: "Studio Magistrale: CS50P - Regex + OOP base",
    date: "2026-04-25",
    hour: 9,
    minute: 0,
    durationMins: 120,
    color: "violet",
    tag: "Deep",
    locked: true,
  },
  {
    id: "aw-2026-04-25-2",
    title: "Outreach Agent - Daily check",
    date: "2026-04-25",
    hour: 14,
    minute: 0,
    durationMins: 45,
    color: "blue",
    locked: true,
  },
  {
    id: "aw-2026-04-25-3",
    title: "Scappa - Banner sponsor 1x2m",
    date: "2026-04-25",
    hour: 14,
    minute: 45,
    durationMins: 105,
    color: "rose",
    tag: "Creative",
    locked: true,
  },
  {
    id: "aw-2026-04-25-4",
    title: "Riposo / tempo libero",
    date: "2026-04-25",
    hour: 16,
    minute: 30,
    durationMins: 150,
    color: "green",
    tag: "Rest",
    locked: true,
  },
  {
    id: "aw-2026-04-26-1",
    title: "Riposo completo",
    date: "2026-04-26",
    hour: 9,
    minute: 0,
    durationMins: 720,
    color: "green",
    tag: "Rest",
    notes: "Nessun lavoro. Giornata di ricarica totale.",
    locked: true,
  },
  {
    id: "aw-2026-04-27-1",
    title: "Studio Magistrale: CS50P - OOP avanzato + esercizi",
    date: "2026-04-27",
    hour: 9,
    minute: 0,
    durationMins: 120,
    color: "violet",
    tag: "Deep",
    locked: true,
  },
  {
    id: "aw-2026-04-27-2",
    title: "Palestra",
    date: "2026-04-27",
    hour: 11,
    minute: 30,
    durationMins: 45,
    color: "orange",
    tag: "Rest",
    locked: true,
  },
  {
    id: "aw-2026-04-27-3",
    title: "Outreach Agent - Daily check",
    date: "2026-04-27",
    hour: 14,
    minute: 0,
    durationMins: 45,
    color: "blue",
    locked: true,
  },
  {
    id: "aw-2026-04-27-4",
    title: "Outreach Agent - Disattiva DRAFT_MODE",
    date: "2026-04-27",
    hour: 14,
    minute: 45,
    durationMins: 30,
    color: "blue",
    tag: "Deep",
    notes: "Verifica invio dei 49 lead pronti.",
    locked: true,
  },
  {
    id: "aw-2026-04-27-5",
    title: "Modella - Primo training LoRA",
    date: "2026-04-27",
    hour: 15,
    minute: 15,
    durationMins: 225,
    color: "violet",
    tag: "Creative",
    notes: "Dataset + primo run completo.",
    locked: true,
  },
];

const COLOR_KEYWORDS: { keywords: string[]; color: EventColor }[] = [
  { keywords: ["allenamento", "palestra", "sport", "corsa", "nuoto", "ciclismo", "yoga", "parrucchiere"], color: "orange" },
  { keywords: ["lavoro", "deep work", "riunione", "meeting", "call", "progetto", "coding", "sviluppo", "lead gen", "outreach", "crm", "follow-up", "fix", "loom"], color: "blue" },
  { keywords: ["pranzo", "cena", "colazione", "pasto", "meal prep", "riposo", "pausa", "relax", "passeggiata", "riposo completo"], color: "green" },
  { keywords: ["studio", "inglese", "lingua", "lettura", "corso", "apprendimento", "libro", "data science", "polito", "simulazioni", "graphic", "grafica", "foto", "photo", "editing", "model", "lora", "modella"], color: "violet" },
];

const TAG_SUFFIX_RE = /\s*\[(Deep|Creative|Rest)\]\s*$/i;

function guessColor(title: string): EventColor {
  const lower = title.toLowerCase();
  for (const { keywords, color } of COLOR_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return color;
    }
  }
  return "rose";
}

function extractTag(rawTitle: string): { title: string; tag?: EventTag } {
  const match = rawTitle.match(TAG_SUFFIX_RE);
  if (!match) {
    return { title: rawTitle.trim() };
  }

  return {
    title: rawTitle.slice(0, -match[0].length).trim(),
    tag: match[1] as EventTag,
  };
}

function parseDuration(raw: string): number {
  const hourMin = raw.match(/(\d+)h(\d+)m?/);
  if (hourMin) return parseInt(hourMin[1], 10) * 60 + parseInt(hourMin[2], 10);

  const hours = raw.match(/(\d+(?:\.\d+)?)h/);
  if (hours) return Math.round(parseFloat(hours[1]) * 60);

  const mins = raw.match(/(\d+)m/);
  if (mins) return parseInt(mins[1], 10);

  return 60;
}

export function buildActiveWeekLabel(range: ActiveWeekRange) {
  const start = new Date(`${range.start}T00:00:00`);
  const end = new Date(`${range.end}T00:00:00`);

  const startLabel = start.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const endLabel = end.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return `Settimana attiva | ${startLabel} - ${endLabel}`;
}

export function buildActiveWeekSubtitle(range: ActiveWeekRange) {
  return `Piano datato modificabile in app dal ${range.start} al ${range.end}.`;
}

export function parseActiveWeekBatchInput(text: string): Omit<DatedEvent, "id">[] {
  const events: Omit<DatedEvent, "id">[] = [];
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#") || line.startsWith("//")) {
      continue;
    }

    const match = line.match(
      /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2})[:.](\d{2})\s+(.+?)\s+((?:\d+h\d*m?|\d+m|\d+(?:\.\d+)?h))(?:\s*\|\s*(.+))?$/i
    );

    if (!match) {
      continue;
    }

    const [, date, rawHour, rawMinute, rawTitle, rawDuration, rawNotes] = match;
    const { title, tag } = extractTag(rawTitle);

    events.push({
      title,
      date,
      hour: parseInt(rawHour, 10),
      minute: parseInt(rawMinute, 10),
      durationMins: parseDuration(rawDuration),
      color: guessColor(title),
      tag,
      notes: rawNotes?.trim() || undefined,
      locked: true,
    });
  }

  return events;
}

function formatDuration(durationMins: number) {
  if (durationMins % 60 === 0) {
    return `${durationMins / 60}h`;
  }

  if (durationMins > 60) {
    return `${Math.floor(durationMins / 60)}h${durationMins % 60}m`;
  }

  return `${durationMins}m`;
}

export function stringifyActiveWeekEvents(events: DatedEvent[]) {
  return [...events]
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.hour * 60 + a.minute - (b.hour * 60 + b.minute);
    })
    .map((event) => {
      const time = `${String(event.hour).padStart(2, "0")}:${String(event.minute).padStart(2, "0")}`;
      const tag = event.tag ? ` [${event.tag}]` : "";
      const notes = event.notes ? ` | ${event.notes}` : "";
      return `${event.date} ${time} ${event.title}${tag} ${formatDuration(event.durationMins)}${notes}`;
    })
    .join("\n");
}
