import Groq from "groq-sdk";
import { rateLimitReflection } from "@/app/lib/rate-limit";
import { reflectionBodySchema } from "@/app/lib/validation";

/* Tone instruction varies based on why the user opened the app */
const INTENT_INSTRUCTION: Record<string, string> = {
  feeling:
    "The user is sharing an emotional state or inner struggle. Your tone should be warm, empathetic, and validating — like a caring friend who truly sees them.",
  guidance:
    "The user is actively seeking Islamic guidance. Your tone should be grounding and clear, offering practical wisdom rooted in the hadith without being preachy.",
  "dua-for":
    "The user wants to make du'a for someone or something dear to them. Your tone should be intercessory and hope-filled, acknowledging both their love and their trust in Allah.",
};

const BASE_SYSTEM_PROMPT = `You are a warm, compassionate Islamic spiritual guide.

You will be given:
1. The user's name.
2. The user's personal feeling, struggle, or intention in their own words.
3. An Islamic theme (keyword) extracted from what they shared.
4. A hadith (saying of the Prophet Muhammad ﷺ) relevant to their situation.
5. Optionally: a Name of Allah and a Quranic verse that relate to their context.

Your task is to write a "Message of Light" — two to three sentences — that:
- Opens by gently acknowledging the user's specific situation (not a generic opener)
- Weaves the spirit of the hadith, Name of Allah, or Quranic verse naturally into the message
- Addresses the user warmly by their first name exactly once, placed naturally mid-message or near the end
- Closes with a sincere word of comfort, hope, or encouragement tailored to their exact situation
- Feels personal and distinct every time — not a template

Rules:
- Write ONLY the message. No greetings, headers, labels, or meta-commentary.
- Do NOT quote the hadith or Quran directly — reflect their spirit in your own words.
- Each message must feel meaningfully different based on the person and their specific context.
- Vary your sentence length and structure — avoid the same rhythm each time.`;

export async function POST(req: Request) {
  const rate = rateLimitReflection(req);
  if (!rate.ok) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later.", retryAfter: rate.retryAfter }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...(rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : {}),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = reflectionBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid request.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Service unavailable." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { feeling, hadithText, name, intentMode, keyword, nameOfAllah, quranVerse } = parsed.data;
  const displayName = name?.trim() || "friend";

  /* Dynamic tone instruction based on what the user is seeking */
  const intentInstruction = INTENT_INSTRUCTION[intentMode ?? "feeling"] ?? INTENT_INSTRUCTION.feeling;

  /* Build optional spiritual context block */
  const contextLines: string[] = [];
  if (keyword?.trim())      contextLines.push(`Islamic theme: ${keyword.trim()}`);
  if (nameOfAllah?.trim())  contextLines.push(`Relevant Name of Allah: ${nameOfAllah.trim()}`);
  if (quranVerse?.trim())   contextLines.push(`Relevant Quranic verse: "${quranVerse.trim()}"`);

  const contextBlock = contextLines.length > 0
    ? `\n\nAdditional spiritual context:\n${contextLines.join("\n")}`
    : "";

  const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nIntent context: ${intentInstruction}`;

  const userPrompt = `User's name: "${displayName}"

What the user shared: "${feeling}"

Hadith for this moment: "${hadithText}"${contextBlock}

Write the personalised Message of Light now, addressing ${displayName} by name once.`;

  try {
    const groq = new Groq({ apiKey });

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
      temperature: 0.82,
      max_tokens: 200,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[/api/reflection] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate reflection. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
