import Groq from "groq-sdk";
import { rateLimitRefine } from "@/app/lib/rate-limit";
import { refineBodySchema } from "@/app/lib/validation";

const BASE_SYSTEM_PROMPT = `You are a compassionate Islamic scholar and spiritual guide specialising in du'a (supplication).

Your role is to take a user's raw, heartfelt intention and refine it into a beautiful, authentic du'a in the Prophetic tradition. Your refined du'a should:

1. Open with praise of Allah and blessings upon the Prophet ﷺ when appropriate
2. Use the spiritual context provided (Name of Allah, Quran verse, Hadith) to ground the du'a
3. Be personal and specific to the user's stated need
4. Flow naturally — not feel like a translated template
5. Close with a hopeful, trusting tone

Format your response as:
- The du'a itself (3-5 sentences, in English)
- A brief note (1 sentence) on which Name of Allah or principle grounds this du'a

Rules:
- Do NOT include Arabic transliteration unless the user asked for it
- Keep it sincere and heartfelt — not overly formal
- Never include placeholder brackets like [Name]`;

export async function POST(req: Request) {
  const rate = rateLimitRefine(req);
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

  const parsed = refineBodySchema.safeParse(body);
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

  const { userInput, nameOfAllah, hadith, quran } = parsed.data;

  const contextLines: string[] = [];
  if (nameOfAllah?.trim()) {
    contextLines.push(`Relevant Name of Allah: ${nameOfAllah.trim()}`);
  }
  if (quran?.trim()) {
    contextLines.push(`Relevant Quranic Verse:\n${quran.trim()}`);
  }
  if (hadith?.trim()) {
    contextLines.push(`Relevant Hadith:\n${hadith.trim()}`);
  }

  const contextBlock =
    contextLines.length > 0
      ? `\n\nSPIRITUAL CONTEXT (use these to ground the du'a):\n\n${contextLines.join("\n\n")}`
      : "";

  const systemMessage = BASE_SYSTEM_PROMPT + contextBlock;
  const userMessage = `MY INTENTION: "${userInput.trim()}"

Please refine this into a beautiful, personal du'a.`;

  try {
    const groq = new Groq({ apiKey });

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.65,
      max_tokens: 400,
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
      },
    });
  } catch (err) {
    console.error("[/api/refine] Error:", err);
    return new Response(JSON.stringify({ error: "Failed to refine du'a. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
