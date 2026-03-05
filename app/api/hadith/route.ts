import { NextResponse } from "next/server";
import { rateLimitHadith } from "@/app/lib/rate-limit";
import { hadithBodySchema } from "@/app/lib/validation";

const KEYWORD_SEARCH_MAP: Record<string, string> = {
  Sabr: "patience",
  Dua: "supplication",
  Tawakkul: "trust",
  Shukr: "gratitude",
  Tawbah: "repentance",
  Dhikr: "remembrance",
  Iman: "faith",
  Ikhlas: "intention",
  Loneliness: "alone",
  Anxiety: "worry",
  Grief: "grief",
  Hope: "hope",
  Gratitude: "gratitude",
  Purpose: "deeds",
  Forgiveness: "forgiveness",
  Love: "love",
  Anger: "anger",
  Fear: "fear",
  Depression: "sadness",
  Contentment: "contentment",
};

// Ordered fallback chain: most authentic first
const ALL_COLLECTIONS = [
  "bukhari",
  "muslim",
  "abudawud",
  "tirmidhi",
  "nasai",
  "ibnmajah",
  "malik",
  "nawawi",
  "qudsi",
] as const;

type Collection = (typeof ALL_COLLECTIONS)[number];

const COLLECTION_DISPLAY: Record<Collection, string> = {
  bukhari:  "Sahih al-Bukhari",
  muslim:   "Sahih Muslim",
  abudawud: "Sunan Abu Dawud",
  tirmidhi: "Jami at-Tirmidhi",
  nasai:    "Sunan an-Nasai",
  ibnmajah: "Sunan Ibn Majah",
  malik:    "Muwatta Malik",
  nawawi:   "Forty Hadith Nawawi",
  qudsi:    "Forty Hadith Qudsi",
};

const HADITH_API_BASE = "https://hadithapi.pages.dev/api";

interface RawHadith {
  id: number;
  header: string;
  hadith_english: string;
  book: string;
  refno: string;
  bookName: string;
  chapterName: string;
  collection: string;
}

async function searchCollection(
  query: string,
  collection: Collection
): Promise<RawHadith | null> {
  try {
    const url = `${HADITH_API_BASE}/search?q=${encodeURIComponent(query)}&collection=${collection}&limit=8`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    const sorted = [...data.results].sort(
      (a: RawHadith, b: RawHadith) => a.hadith_english.length - b.hadith_english.length
    );
    const suitable = sorted.find((h: RawHadith) => h.hadith_english.trim().length > 80);
    return suitable ?? sorted[0] ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const rate = rateLimitHadith(req);
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

  const parsed = hadithBodySchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.flatten().formErrors[0] ?? "Invalid request.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { keyword, collection: preferredCollection } = parsed.data;
  const searchQuery = KEYWORD_SEARCH_MAP[keyword.trim()] ?? keyword.toLowerCase();

  // Build the collections list: preferred first, then the rest
  let collectionsToTry: Collection[] = [...ALL_COLLECTIONS];
  if (preferredCollection && ALL_COLLECTIONS.includes(preferredCollection as Collection)) {
    const preferred = preferredCollection as Collection;
    collectionsToTry = [preferred, ...ALL_COLLECTIONS.filter((c) => c !== preferred)];
  }

  try {
    for (const col of collectionsToTry) {
      const hadith = await searchCollection(searchQuery, col);
      if (hadith) {
        const collectionKey = hadith.collection as Collection;
        return NextResponse.json({
          hadith: {
            header:       hadith.header?.trim() ?? "",
            text:         hadith.hadith_english?.trim() ?? "",
            refno:        hadith.refno ?? "",
            book:         hadith.book ?? "",
            bookName:     hadith.bookName?.trim().replace(/\s+/g, " ") ?? "",
            chapterName:  hadith.chapterName?.trim().replace(/\s+/g, " ") ?? "",
            collection:   hadith.collection ?? col,
            collectionDisplay: COLLECTION_DISPLAY[collectionKey] ?? hadith.collection,
            hadithNumber: hadith.id ?? null,
          },
        });
      }
    }

    return NextResponse.json({ error: "No hadith found for this keyword." }, { status: 404 });
  } catch (err) {
    console.error("[/api/hadith] Error:", err);
    return NextResponse.json({ error: "Failed to fetch hadith. Please try again." }, { status: 500 });
  }
}
