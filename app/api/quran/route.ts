import { NextResponse } from "next/server";
import { rateLimitQuran } from "@/app/lib/rate-limit";
import { quranBodySchema } from "@/app/lib/validation";

// Curated keyword → ayah reference mappings (surah:ayah)
// Each maps to an ayah that speaks directly to the emotional theme
const KEYWORD_AYAH_MAP: Record<string, string[]> = {
  Sabr:        ["2:153", "2:155", "39:10"],
  Dua:         ["2:186", "40:60", "27:62"],
  Tawakkul:    ["3:159", "65:3", "9:51"],
  Shukr:       ["14:7", "2:152", "31:12"],
  Tawbah:      ["39:53", "4:110", "2:222"],
  Dhikr:       ["13:28", "33:41", "2:152"],
  Iman:        ["49:15", "2:285", "57:21"],
  Ikhlas:      ["98:5", "112:1", "39:2"],
  Loneliness:  ["94:5", "65:3", "2:186"],
  Anxiety:     ["94:5", "2:286", "13:28"],
  Grief:       ["94:5", "94:6", "2:155"],
  Hope:        ["39:53", "3:139", "94:5"],
  Gratitude:   ["14:7", "2:152", "55:13"],
  Purpose:     ["51:56", "2:201", "3:185"],
  Forgiveness: ["39:53", "4:110", "3:133"],
  Love:        ["3:31", "2:165", "5:54"],
  Anger:       ["3:134", "42:43", "7:199"],
  Fear:        ["2:286", "3:175", "65:3"],
  Depression:  ["94:5", "94:6", "39:53"],
  Contentment: ["13:28", "9:59", "39:10"],
};

interface AlQuranAyah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
  };
  numberInSurah: number;
}

interface AlQuranResponse {
  data: AlQuranAyah;
}

async function fetchAyah(ref: string): Promise<{ arabic: string; english: string; surah: string; surahName: string; ayah: number } | null> {
  try {
    const [arabic, english] = await Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${ref}/ar.alafasy`, { cache: "no-store" }),
      fetch(`https://api.alquran.cloud/v1/ayah/${ref}/en.sahih`, { cache: "no-store" }),
    ]);

    if (!arabic.ok || !english.ok) return null;

    const [arData, enData] = await Promise.all([
      arabic.json() as Promise<AlQuranResponse>,
      english.json() as Promise<AlQuranResponse>,
    ]);

    if (!arData.data || !enData.data) return null;

    return {
      arabic:   arData.data.text,
      english:  enData.data.text,
      surah:    enData.data.surah.englishName,
      surahName: arData.data.surah.name,
      ayah:     enData.data.numberInSurah,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const rate = rateLimitQuran(req);
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

  const parsed = quranBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid request.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { keyword } = parsed.data;
  const refs = KEYWORD_AYAH_MAP[keyword.trim()] ?? KEYWORD_AYAH_MAP["Hope"];

  // Try each reference in the list until one succeeds
  for (const ref of refs) {
    const ayah = await fetchAyah(ref);
    if (ayah) {
      return NextResponse.json({
        verse: {
          arabic:    ayah.arabic,
          english:   ayah.english,
          surah:     ayah.surah,
          surahName: ayah.surahName,
          ayah:      ayah.ayah,
          ref,
        },
      });
    }
  }

  return NextResponse.json({ error: "Could not fetch Quran verse." }, { status: 404 });
}
