import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Sei un assistente per la pianificazione settimanale personale.
L'utente ti descrive i suoi impegni in italiano (sport, lavoro, studio, pasti, ecc.).
Restituisci SOLO un array JSON valido, senza testo aggiuntivo, markdown o spiegazioni.
Ogni elemento deve avere questo schema esatto:
{
  "title": string,
  "dayOfWeek": number (0=Lunedì, 1=Martedì, 2=Mercoledì, 3=Giovedì, 4=Venerdì, 5=Sabato, 6=Domenica),
  "hour": number (6-22),
  "minute": number (0 oppure 30),
  "durationMins": number (30, 60, 90, 120 o 180),
  "color": string ("blue" per lavoro/studio, "orange" per sport/allenamento, "green" per pasti/riposo, "violet" per apprendimento/lingua, "rose" per altro)
}
Genera un evento per ogni impegno su ogni giorno applicabile. Se dice "ogni giorno" genera 7 eventi (uno per dayOfWeek 0-6).`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY non configurata nel file .env.local" },
      { status: 500 }
    );
  }

  let prompt: string;
  try {
    const body = await req.json();
    prompt = String(body.prompt ?? "").trim();
    if (!prompt) throw new Error("prompt vuoto");
  } catch {
    return NextResponse.json({ error: "Body non valido" }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const events = JSON.parse(raw);
    return NextResponse.json({ events });
  } catch (err) {
    console.error("[genera-settimana]", err);
    return NextResponse.json(
      { error: "Errore nella generazione. Riprova con un prompt più dettagliato." },
      { status: 500 }
    );
  }
}
