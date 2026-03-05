import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { rateLimitChat } from "@/app/lib/rate-limit";
import { chatBodySchema } from "@/app/lib/validation";

const ISLAMIC_KEYWORDS = [
  "Sabr", "Dua", "Tawakkul", "Shukr", "Tawbah", "Dhikr", "Iman",
  "Ikhlas", "Loneliness", "Anxiety", "Grief", "Hope", "Gratitude",
  "Purpose", "Forgiveness", "Love", "Anger", "Fear", "Depression", "Contentment",
];

const SYSTEM_PROMPT = `You are a compassionate Islamic emotional wellness assistant.

A user has shared how they are feeling. Your task is to read their message, identify the core emotion or struggle, and return exactly ONE search keyword from the list below that best matches their emotional state from an Islamic perspective.

Allowed keywords:
${ISLAMIC_KEYWORDS.join(", ")}

Rules:
- Return ONLY the single keyword — no punctuation, no explanation, no extra words.
- If the emotion is complex, choose the most dominant theme.
- Always pick from the allowed list above.`;

export async function POST(req: Request) {
  const rate = rateLimitChat(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: rate.retryAfter },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid request.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  try {
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: parsed.data.message },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const matched = ISLAMIC_KEYWORDS.find((k) => k.toLowerCase() === raw.toLowerCase());
    const keyword = matched ?? "Sabr";

    return NextResponse.json({ keyword });
  } catch (err) {
    console.error("[/api/chat] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
