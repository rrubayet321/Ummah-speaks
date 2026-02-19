import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a warm, compassionate Islamic spiritual guide.

You will be given:
1. A user's name.
2. A user's personal feeling or struggle, written in their own words.
3. A hadith (saying of the Prophet Muhammad ﷺ) that relates to their situation.

Your task is to write exactly TWO sentences — a "Message of Light" — that:
- Gently connects the hadith's wisdom to the user's specific feeling
- Offers sincere comfort, hope, or encouragement rooted in that hadith
- Addresses the user warmly by their name once, naturally within the message
- Feels like a heartfelt note from a caring friend, not a lecture

Rules:
- Write ONLY the two sentences. No greetings, no labels, no extra text.
- Do not quote the hadith directly — reflect its spirit instead.
- Keep each sentence meaningful but concise.`;

export async function POST(req: NextRequest) {
  try {
    const { feeling, hadithText, name } = await req.json();

    if (!feeling || !hadithText) {
      return NextResponse.json(
        { error: "Both feeling and hadithText are required." },
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

    const userPrompt = `The user's name: "${name ? name.trim() : "friend"}"

The user shared: "${feeling.trim()}"

The hadith: "${hadithText.trim()}"

Write the two-sentence Message of Light, addressing the user by their name naturally once.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 120,
    });

    const message = completion.choices[0]?.message?.content?.trim() ?? "";

    if (!message) {
      return NextResponse.json(
        { error: "Could not generate a reflection." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message });
  } catch (err) {
    console.error("[/api/reflection] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate reflection. Please try again." },
      { status: 500 }
    );
  }
}
