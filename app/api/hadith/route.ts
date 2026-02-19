import { NextRequest, NextResponse } from "next/server";

// Maps AI-returned keywords to single English search terms that work with this API
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
  collection: "bukhari" | "muslim"
): Promise<RawHadith | null> {
  const url = `${HADITH_API_BASE}/search?q=${encodeURIComponent(query)}&collection=${collection}&limit=8`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;

  // Among the results, prefer a shorter hadith for readability
  const sorted = [...data.results].sort(
    (a: RawHadith, b: RawHadith) =>
      a.hadith_english.length - b.hadith_english.length
  );

  // Skip any result whose text is extremely short (likely a title/stub)
  const suitable = sorted.find((h: RawHadith) => h.hadith_english.trim().length > 80);
  return suitable ?? sorted[0];
}

export async function POST(req: NextRequest) {
  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== "string" || keyword.trim().length === 0) {
      return NextResponse.json({ error: "Keyword is required." }, { status: 400 });
    }

    const searchQuery = KEYWORD_SEARCH_MAP[keyword.trim()] ?? keyword.toLowerCase();

    // Try Sahih Bukhari first, then Sahih Muslim
    let hadith = await searchCollection(searchQuery, "bukhari");
    if (!hadith) {
      hadith = await searchCollection(searchQuery, "muslim");
    }

    if (!hadith) {
      return NextResponse.json(
        { error: "No hadith found for this keyword." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      hadith: {
        header: hadith.header?.trim() ?? "",
        text: hadith.hadith_english?.trim() ?? "",
        refno: hadith.refno ?? "",
        book: hadith.book ?? "",
        bookName: hadith.bookName?.trim().replace(/\s+/g, " ") ?? "",
        chapterName: hadith.chapterName?.trim().replace(/\s+/g, " ") ?? "",
        collection: hadith.collection ?? "",
        hadithNumber: hadith.id ?? null,
      },
    });
  } catch (err) {
    console.error("[/api/hadith] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch hadith. Please try again." },
      { status: 500 }
    );
  }
}
