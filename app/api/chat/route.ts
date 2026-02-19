import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const ISLAMIC_KEYWORDS = [
  "Sabr",
  "Dua",
  "Tawakkul",
  "Shukr",
  "Tawbah",
  "Dhikr",
  "Iman",
  "Ikhlas",
  "Loneliness",
  "Anxiety",
  "Grief",
  "Hope",
  "Gratitude",
  "Purpose",
  "Forgiveness",
  "Love",
  "Anger",
  "Fear",
  "Depression",
  "Contentment",
];

const SYSTEM_PROMPT = `You are a compassionate Islamic emotional wellness assistant.

A user has shared how they are feeling. Your task is to read their message, identify the core emotion or struggle, and return exactly ONE search keyword from the list below that best matches their emotional state from an Islamic perspective.

Allowed keywords:
${ISLAMIC_KEYWORDS.join(", ")}

Rules:
- Return ONLY the single keyword — no punctuation, no explanation, no extra words.
- If the emotion is complex, choose the most dominant theme.
- Always pick from the allowed list above.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key is not configured." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message.trim() },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";

    // Validate the returned keyword is from the allowed list (case-insensitive)
    const matched = ISLAMIC_KEYWORDS.find(
      (k) => k.toLowerCase() === raw.toLowerCase()
    );
    const keyword = matched ?? "Sabr"; // safe fallback

    return NextResponse.json({ keyword });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
