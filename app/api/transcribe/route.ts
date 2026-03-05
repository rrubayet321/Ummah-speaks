import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { rateLimitTranscribe } from "@/app/lib/rate-limit";

export async function POST(req: Request) {
  const rate = rateLimitTranscribe(req);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: rate.retryAfter },
      { status: 429, headers: rate.retryAfter ? { "Retry-After": String(rate.retryAfter) } : undefined }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  // Validate file size (max 25 MB — Groq's Whisper limit)
  if (audioFile.size > 25 * 1024 * 1024) {
    return NextResponse.json({ error: "Audio file too large (max 25 MB)." }, { status: 413 });
  }

  try {
    const groq = new Groq({ apiKey });

    const file = new File([audioFile], "recording.webm", { type: audioFile.type || "audio/webm" });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "en",
    });

    const text = transcription.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Could not transcribe audio." }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("[/api/transcribe] Error:", err);
    return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
  }
}
