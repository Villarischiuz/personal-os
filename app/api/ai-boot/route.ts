import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM =
  "Act as a ruthless, highly efficient personal OS. Read the current time and the user's tasks/events. " +
  "Output ONE single, direct, imperative sentence (maximum 15 words) stating exactly what the user must execute " +
  "RIGHT NOW based on circadian logic. No greetings, no explanations, no formatting.";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "GEMINI_API_KEY non configurata" }, { status: 500 });

  const { currentTime, nextEvent, topTasks } = await req.json() as {
    currentTime: string;
    nextEvent: string | null;
    topTasks: string[];
  };

  const userPrompt = [
    `Current time: ${currentTime}`,
    nextEvent ? `Next scheduled event: ${nextEvent}` : "No upcoming events.",
    topTasks.length
      ? `Top tasks to do: ${topTasks.map((t, i) => `${i + 1}. ${t}`).join(", ")}`
      : "No pending tasks.",
  ].join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM,
  });

  try {
    const result = await model.generateContent(userPrompt);
    const text = result.response.text().trim();
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
