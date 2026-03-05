"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import BottomNav, { type NavTab } from "./components/BottomNav";
import { saveEntry } from "./lib/journal";
import namesData from "./data/names-of-allah.json";

/* ── Lazy-loaded heavy screens ── */
const SalahTimings = dynamic(() => import("./components/SalahTimings"), { ssr: false });
const Tasbeeh      = dynamic(() => import("./components/Tasbeeh"),      { ssr: false });
const Journal      = dynamic(() => import("./components/Journal"),       { ssr: false });

/* ── Types ── */
type AppPhase   = "name-input" | "greeting" | "main" | "salah" | "tasbeeh" | "journal" | "dua";
type Status     = "idle" | "loading" | "done" | "error";
type IntentMode = "feeling" | "guidance" | "dua-for";

interface HadithResult {
  header: string;
  text: string;
  refno: string;
  book: string;
  bookName: string;
  chapterName: string;
  collection: string;
  collectionDisplay?: string;
  hadithNumber: number | null;
}

interface QuranVerse {
  arabic: string;
  english: string;
  surah: string;
  surahName: string;
  ayah: number;
  ref: string;
}

interface NameEntry {
  arabic: string;
  transliteration: string;
  meaning: string;
  tags: string[];
}

interface FavoriteEntry {
  id: string;
  keyword: string;
  hadithText: string;
  reflection: string;
  timestamp: number;
}

/* ── Suggestions ── */
const SUGGESTIONS = [
  "I feel anxious about the future",
  "I'm struggling to be patient today",
  "I want to feel closer to Allah",
  "My heart feels heavy with grief",
  "I'm grateful but need direction",
  "I feel lost and uncertain",
  "I need strength to face hardship",
  "Struggling with my faith and purpose",
];

const INTENT_TABS: { id: IntentMode; label: string; placeholder: string }[] = [
  { id: "feeling",  label: "How I feel",       placeholder: "Share what's on your heart…" },
  { id: "guidance", label: "Seeking guidance",  placeholder: "What do you need guidance on…" },
  { id: "dua-for",  label: "Make du\u02BFa for", placeholder: "Who or what do you want to make du\u02BFa for…" },
];

/* ── Favorites helpers ── */
const FAVORITES_KEY = "ummah-speaks-favorites";

function getFavorites(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
  } catch { return []; }
}

function persistFavorites(items: FavoriteEntry[]): void {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(items)); } catch { /* noop */ }
}

/* ── Local Name of Allah matching ── */
function matchNameOfAllah(keyword: string): NameEntry | null {
  const lower = keyword.toLowerCase();
  const names = namesData as NameEntry[];
  return (
    names.find((n) => n.tags.some((t) => t.toLowerCase() === lower)) ??
    names.find((n) => n.tags.some((t) => t.toLowerCase().includes(lower))) ??
    null
  );
}

function getIslamicDate(): string {
  try {
    const raw = new Intl.DateTimeFormat("en-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return raw + " AH";
  } catch { return ""; }
}

/* ════════ ATOMS ════════ */

function GoldLine({ opacity = 0.2 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height: "1px",
        background: `linear-gradient(to right, transparent, var(--divider), transparent)`,
        opacity,
        flexShrink: 0,
      }}
    />
  );
}

/* Brand logo — clean, minimal */
function BrandLogo({ scaleIn = false, size = "md" }: { scaleIn?: boolean; size?: "sm" | "md" }) {
  const arabicSize = size === "sm" ? "2.2rem" : "3rem";
  const labelSize  = size === "sm" ? "0.62rem" : "0.72rem";

  return (
    <div
      className={scaleIn ? "brand-scale-in" : ""}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-amiri), serif",
          fontSize: arabicSize,
          lineHeight: 1,
          color: "var(--foreground)",
          direction: "rtl",
          fontWeight: 400,
        }}
      >
        أُمَّة
      </span>
      <span
        aria-hidden="true"
        style={{ display: "block", height: "2px", width: "28px", background: "var(--accent)", borderRadius: "2px" }}
      />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: labelSize,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "var(--foreground)",
          fontWeight: 500,
          opacity: 0.8,
          whiteSpace: "nowrap",
        }}
      >
        Ummah Speaks
      </span>
    </div>
  );
}

/* Minimal loading dots */
function LoadingDots({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} style={{ textAlign: "center", padding: "2rem 0", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      <div style={{ display: "flex", gap: "6px" }} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.5,
              animation: "fadeSlideIn 1.2s ease-in-out infinite alternate",
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--placeholder)" }}>
        {label}
      </p>
    </div>
  );
}

/* Skeleton shimmer line */
function SkeletonLine({ width = "100%", height = "10px", delay = 0 }: { width?: string; height?: string; delay?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        height,
        width,
        borderRadius: "6px",
        background: "var(--divider)",
        animation: "fadeSlideIn 1.6s ease-in-out infinite alternate",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

/* Recording pulse dot */
function RecordingPulse() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "var(--error)",
        animation: "recordPulse 1.2s ease-in-out infinite",
        verticalAlign: "middle",
      }}
    />
  );
}

/* GitHub footer */
function GitHubFooter() {
  return (
    <footer
      style={{
        textAlign: "center",
        paddingTop: "24px",
        paddingBottom: "8px",
      }}
    >
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "var(--placeholder)", letterSpacing: "0.06em" }}>
        Built by{" "}
        <a
          href="https://github.com/rrubayet321"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)", textDecoration: "none", borderBottom: "1px solid var(--divider)", transition: "color 0.2s" }}
          onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "var(--muted)"; }}
        >
          Rubayet Hassan
        </a>
        {" · "}
        <a
          href="https://github.com/rrubayet321/Ummah-speaks"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--muted)", textDecoration: "none", borderBottom: "1px solid var(--divider)", transition: "color 0.2s" }}
          onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = "var(--foreground)"; }}
          onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = "var(--muted)"; }}
        >
          GitHub ↗
        </a>
      </p>
    </footer>
  );
}

/* ════════════════════════════════════════
   ROOT COMPONENT
   ════════════════════════════════════════ */
export default function Home() {
  const [appPhase, setAppPhase]   = useState<AppPhase>("name-input");
  const [userName, setUserName]   = useState("");
  const [nameInput, setNameInput] = useState("");
  const [greetingVisible, setGreetingVisible] = useState(true);

  /* Reflect screen */
  const [text, setText]             = useState("");
  const [keyword, setKeyword]       = useState("");
  const [status, setStatus]         = useState<Status>("idle");
  const [errorMsg, setErrorMsg]     = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");

  /* Intent mode + suggestions */
  const [intentMode, setIntentMode]     = useState<IntentMode>("feeling");
  const [suggestionIdx, setSuggestionIdx] = useState(0);

  const [hadith, setHadith]             = useState<HadithResult | null>(null);
  const [hadithStatus, setHadithStatus] = useState<Status>("idle");

  const [quranVerse, setQuranVerse]     = useState<QuranVerse | null>(null);
  const [quranStatus, setQuranStatus]   = useState<Status>("idle");

  const [nameOfAllah, setNameOfAllah] = useState<NameEntry | null>(null);

  const [reflection, setReflection]             = useState("");
  const [reflectionStatus, setReflectionStatus] = useState<Status>("idle");
  const [isStreaming, setIsStreaming]            = useState(false);

  /* Voice input */
  const [isRecording, setIsRecording]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<Blob[]>([]);

  /* Du'a refinement */
  const [duaText, setDuaText]           = useState("");
  const [duaResult, setDuaResult]       = useState("");
  const [duaStatus, setDuaStatus]       = useState<Status>("idle");
  const [isDuaStreaming, setIsDuaStreaming] = useState(false);

  /* Favorites */
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);

  const islamicDate   = useMemo(() => getIslamicDate(), []);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadRef   = useRef<HTMLDivElement>(null);

  /* Cycle suggestions every 3 seconds */
  useEffect(() => {
    const id = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* Load favorites from localStorage on mount */
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  /* Favorite toggle */
  function toggleFavorite() {
    if (!hadith || !keyword) return;
    const current = getFavorites();
    const isFav = current.some(
      (f) => f.keyword === keyword && f.hadithText === hadith.text
    );
    const updated = isFav
      ? current.filter((f) => !(f.keyword === keyword && f.hadithText === hadith.text))
      : [{ id: `${Date.now()}`, keyword, hadithText: hadith.text, reflection, timestamp: Date.now() }, ...current];
    persistFavorites(updated);
    setFavorites(updated);
  }

  const isFavorited = favorites.some(
    (f) => f.keyword === keyword && hadith && f.hadithText === hadith.text
  );

  /* Tab navigation */
  const handleTabChange = useCallback((tab: NavTab) => {
    const phaseMap: Record<NavTab, AppPhase> = {
      reflect: "main", salah: "salah", tasbeeh: "tasbeeh", journal: "journal", dua: "dua",
    };
    setAppPhase(phaseMap[tab]);
  }, []);

  const activeTab: NavTab =
    appPhase === "salah"   ? "salah"   :
    appPhase === "tasbeeh" ? "tasbeeh" :
    appPhase === "journal" ? "journal" :
    appPhase === "dua"     ? "dua"     : "reflect";

  /* Name submit */
  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setGreetingVisible(true);
    setAppPhase("greeting");
    setTimeout(() => setGreetingVisible(false), 2200);
    setTimeout(() => setAppPhase("main"), 2800);
  }

  /* Voice recording */
  async function toggleRecording() {
    if (isRecording) { mediaRecorderRef.current?.stop(); return; }
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsTranscribing(true);
        try {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const fd   = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res  = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (res.ok && data.text) setText((p) => (p ? p + " " + data.text : data.text));
        } finally { setIsTranscribing(false); }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch { /* mic denied */ }
  }

  /* Main submit */
  async function handleSubmit() {
    if (!text.trim() || status === "loading") return;

    setStatus("loading");
    setKeyword(""); setErrorMsg(""); setHadith(null);
    setHadithStatus("idle"); setQuranVerse(null); setQuranStatus("idle");
    setNameOfAllah(null); setReflection(""); setReflectionStatus("idle");
    setIsStreaming(false);

    try {
      /* 1. Extract keyword */
      const chatRes  = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const chatData = await chatRes.json();
      if (!chatRes.ok) throw new Error(chatData.error ?? "Unexpected error.");

      const fetchedKeyword: string = chatData.keyword;
      setKeyword(fetchedKeyword);
      setStatus("done");
      setNameOfAllah(matchNameOfAllah(fetchedKeyword));

      /* 2. Hadith + Quran verse in parallel */
      setHadithStatus("loading");
      setQuranStatus("loading");

      const [hadithRes, quranRes] = await Promise.all([
        fetch("/api/hadith", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: fetchedKeyword, collection: selectedCollection }),
        }),
        fetch("/api/quran", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: fetchedKeyword }),
        }),
      ]);

      const [hadithData, quranData] = await Promise.all([hadithRes.json(), quranRes.json()]);

      if (!hadithRes.ok || !hadithData.hadith) { setHadithStatus("error"); return; }
      const fetchedHadith: HadithResult = hadithData.hadith;
      setHadith(fetchedHadith);
      setHadithStatus("done");

      if (quranRes.ok && quranData.verse) setQuranVerse(quranData.verse);
      setQuranStatus("done");

      /* 3. Reflection — streaming, with full context for personalisation */
      setReflectionStatus("loading");
      const matchedName = matchNameOfAllah(fetchedKeyword);
      const reflRes = await fetch("/api/reflection", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeling:     text,
          hadithText:  fetchedHadith.text,
          name:        userName,
          intentMode,
          keyword:     fetchedKeyword,
          nameOfAllah: matchedName
            ? `${matchedName.transliteration} — ${matchedName.meaning}`
            : "",
          quranVerse:  quranData?.verse?.english ?? "",
        }),
      });

      if (!reflRes.ok || !reflRes.body) { setReflectionStatus("error"); return; }

      setReflectionStatus("done");
      setIsStreaming(true);

      const reader  = reflRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setReflection(fullText);
      }

      setIsStreaming(false);
      saveEntry({
        islamicDate, name: userName, feeling: text, keyword: fetchedKeyword,
        hadith: {
          text: fetchedHadith.text,
          collection: fetchedHadith.collection,
          bookName: fetchedHadith.bookName,
          chapterName: fetchedHadith.chapterName,
          hadithNumber: fetchedHadith.hadithNumber,
        },
        reflection: fullText,
      });

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleReset() {
    setText(""); setKeyword(""); setStatus("idle"); setErrorMsg("");
    setHadith(null); setHadithStatus("idle"); setQuranVerse(null); setQuranStatus("idle");
    setNameOfAllah(null); setReflection(""); setReflectionStatus("idle"); setIsStreaming(false);
  }

  /* Share / Download */
  async function handleShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Ummah Speaks", text: `${keyword}\n\n"${hadith?.text}"\n\n${reflection}`, url: window.location.href });
        return;
      } catch { /* cancelled */ }
    }
    handleDownload();
  }

  async function handleDownload() {
    if (!downloadRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(downloadRef.current, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      const link   = document.createElement("a");
      link.download = `ummah-speaks-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally { setIsDownloading(false); }
  }

  /* Du'a refinement submit */
  async function handleDuaSubmit() {
    if (!duaText.trim() || duaStatus === "loading") return;
    setDuaStatus("loading"); setDuaResult(""); setIsDuaStreaming(false);

    try {
      const res = await fetch("/api/refine", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput:    duaText,
          nameOfAllah:  nameOfAllah ? `${nameOfAllah.transliteration} — ${nameOfAllah.meaning}` : "",
          hadith:       hadith?.text ?? "",
          quran:        quranVerse?.english ?? "",
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Failed.");
      }

      setDuaStatus("done"); setIsDuaStreaming(true);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setDuaResult(full);
      }
      setIsDuaStreaming(false);
    } catch (err) {
      setDuaStatus("error");
      setDuaResult(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const canSubmit   = text.trim().length > 0 && status !== "loading" && !isRecording;
  const showResults = status === "loading" || status === "done" || status === "error";

  /* Current intent tab config */
  const currentIntent = INTENT_TABS.find((t) => t.id === intentMode) ?? INTENT_TABS[0];
  /* Three visible suggestion chips cycling */
  const visibleSuggestions = [0, 1, 2].map((i) => SUGGESTIONS[(suggestionIdx + i) % SUGGESTIONS.length]);

  /* ════════ NAME-INPUT SCREEN ════════ */
  if (appPhase === "name-input") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
        aria-label="Welcome — enter your name to begin"
      >
        <div className="w-full max-w-sm flex flex-col gap-10 fade-slide-in" style={{ position: "relative", zIndex: 1 }}>

          {/* Bismillah */}
          <p
            aria-label="Bismillah ir-Rahman ir-Rahim"
            style={{
              fontFamily: "var(--font-amiri), serif",
              fontSize: "1.1rem",
              color: "var(--foreground)",
              direction: "rtl",
              opacity: 0.5,
              letterSpacing: "0.04em",
              textAlign: "center",
            }}
          >
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>

          <BrandLogo scaleIn />

          {/* Quick link */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setAppPhase("salah")}
              aria-label="View salah prayer times"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontFamily: "var(--font-body)",
                fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--muted)", background: "none",
                border: "1px solid var(--divider)", borderRadius: "999px",
                padding: "8px 18px", cursor: "pointer", minHeight: "40px",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.borderColor = "var(--muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--divider)"; }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                <path d="M5 2.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
              Salah Times
            </button>
          </div>

          {/* Heading */}
          <header className="text-center" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
                fontStyle: "italic",
                fontWeight: 400,
                color: "var(--foreground)",
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              What shall I call you?
            </h1>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted)", fontWeight: 300 }}>
              I am here to listen.
            </p>
          </header>

          <GoldLine />

          {/* Name input */}
          <label htmlFor="name-input" className="sr-only">Your name</label>
          <input
            id="name-input"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleNameSubmit(); }}
            placeholder="Your name…"
            autoFocus
            autoComplete="given-name"
            aria-required="true"
            style={{
              width: "100%", background: "transparent", border: "none",
              fontSize: "1.4rem", textAlign: "center", fontWeight: 300,
              fontFamily: "var(--font-body)", color: "var(--foreground)",
              caretColor: "var(--accent)", outline: "none", lineHeight: 1.6,
            }}
          />

          <GoldLine />

          {/* Begin */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem", letterSpacing: "0.28em", textTransform: "uppercase",
                padding: "13px 42px", borderRadius: "999px",
                background: nameInput.trim() ? "var(--accent)" : "var(--surface-2)",
                color: nameInput.trim() ? "#ffffff" : "var(--placeholder)",
                border: "none", cursor: nameInput.trim() ? "pointer" : "not-allowed",
                minHeight: "46px", fontWeight: 500,
                transition: "background 0.3s, color 0.3s",
              }}
            >
              Begin
            </button>
          </div>
        </div>

        <GitHubFooter />
      </main>
    );
  }

  /* ════════ SALAH / TASBEEH / JOURNAL ════════ */
  if (appPhase === "salah")   return (<><SalahTimings onBack={() => setAppPhase("main")} /><BottomNav activeTab="salah"   onTabChange={handleTabChange} /></>);
  if (appPhase === "tasbeeh") return (<><Tasbeeh      onBack={() => setAppPhase("main")} /><BottomNav activeTab="tasbeeh" onTabChange={handleTabChange} /></>);
  if (appPhase === "journal") return (<><Journal       onBack={() => setAppPhase("main")} /><BottomNav activeTab="journal" onTabChange={handleTabChange} /></>);

  /* ════════ GREETING ════════ */
  if (appPhase === "greeting") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div
          style={{
            opacity: greetingVisible ? 1 : 0,
            transform: greetingVisible ? "translateY(0)" : "translateY(-12px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
            textAlign: "center", display: "flex", flexDirection: "column", gap: "8px",
          }}
        >
          <p
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-amiri), serif",
              fontSize: "1.2rem", color: "var(--accent)",
              direction: "rtl", opacity: 0.5, marginBottom: "8px",
            }}
          >
            بِسْمِ ٱللَّٰهِ
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.5rem, 5vw, 2.2rem)", color: "var(--accent)", lineHeight: 1.3 }}>
            As-salamu alaykum,
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(2.2rem, 7vw, 3.4rem)", color: "var(--foreground)", lineHeight: 1.2 }}>
            {userName}
          </p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted)", marginTop: "8px" }}>
            I am here to listen.
          </p>
        </div>
      </main>
    );
  }

  /* ════════ DU'A REFINEMENT SCREEN ════════ */
  if (appPhase === "dua") {
    const hasContext = hadith || quranVerse || nameOfAllah;
    return (
      <main className="min-h-screen flex flex-col items-center px-5 sm:px-6 py-10 has-bottom-nav" aria-label="Du'a refinement">
        <div className="w-full max-w-xl flex flex-col gap-10 fade-slide-in">

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", paddingTop: "8px" }}>
            <BrandLogo size="sm" />
            {islamicDate && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--placeholder)", opacity: 0.7 }}>
                {islamicDate}
              </p>
            )}
          </div>

          {duaStatus === "idle" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              <header style={{ textAlign: "center" }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(1.9rem, 6vw, 2.8rem)", color: "var(--foreground)", lineHeight: 1.25, margin: 0 }}>
                  Craft your du&apos;a
                </h1>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted)", marginTop: "10px" }}>
                  Share your intention and I will help shape it into a heartfelt supplication.
                </p>
              </header>

              <GoldLine />

              {hasContext && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "var(--surface)",
                    border: "1px solid var(--divider)",
                    display: "flex", flexDirection: "column", gap: "6px",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--placeholder)" }}>
                    Context from your reflection
                  </p>
                  {nameOfAllah && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--accent)", fontWeight: 500 }}>
                      {nameOfAllah.transliteration} · {nameOfAllah.meaning}
                    </p>
                  )}
                  {hadith && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.82rem", color: "var(--placeholder)", fontStyle: "italic", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      &ldquo;{hadith.text}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <label htmlFor="dua-input" className="sr-only">Your du'a intention</label>
              <div className="reflection-input">
                <textarea
                  id="dua-input"
                  value={duaText}
                  onChange={(e) => setDuaText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDuaSubmit(); }}
                  placeholder="What do you wish to ask of Allah today…"
                  rows={5}
                  autoFocus
                  style={{
                    width: "100%", resize: "none", background: "transparent", border: "none",
                    fontSize: "1rem", lineHeight: 1.75, fontWeight: 300,
                    fontFamily: "var(--font-body)", color: "var(--foreground)",
                    caretColor: "var(--accent-soft)", outline: "none",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--divider)", paddingTop: "12px", marginTop: "4px" }}>
                  <button
                    onClick={handleDuaSubmit}
                    disabled={!duaText.trim()}
                    style={{
                      fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.22em", textTransform: "uppercase",
                      padding: "10px 24px", borderRadius: "999px",
                      background: duaText.trim() ? "var(--accent)" : "var(--surface-2)",
                      color: duaText.trim() ? "#ffffff" : "var(--placeholder)",
                      border: "none", cursor: duaText.trim() ? "pointer" : "not-allowed",
                      minHeight: "42px", fontWeight: 500,
                      transition: "background 0.25s",
                    }}
                  >
                    Refine Du&apos;a
                  </button>
                </div>
              </div>
            </div>
          )}

          {duaStatus === "loading" && <LoadingDots label="Composing your du'a…" />}

          {duaStatus !== "idle" && duaStatus !== "loading" && duaResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                className="mihrab-frame fade-slide-in"
                style={{ padding: "clamp(24px, 6vw, 44px) clamp(16px, 5vw, 32px) clamp(22px, 5vw, 36px)" }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ display: "block", height: "1px", width: "32px", background: "var(--accent-soft)", opacity: 0.5 }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--accent-soft)" }}>
                      Your Du&apos;a
                    </p>
                    <span style={{ display: "block", height: "1px", width: "32px", background: "var(--accent-soft)", opacity: 0.5 }} />
                  </div>
                  <p
                    aria-live="polite"
                    className={isDuaStreaming ? "streaming-cursor" : ""}
                    style={{
                      fontFamily: "var(--font-body)", fontWeight: 300,
                      fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                      lineHeight: 1.85, color: "var(--foreground)",
                      textAlign: "left", whiteSpace: "pre-wrap", maxWidth: "52ch",
                    }}
                  >
                    {duaResult}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--divider)" }}>
                <button
                  onClick={() => { setDuaText(""); setDuaResult(""); setDuaStatus("idle"); setIsDuaStreaming(false); }}
                  style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", minHeight: "44px" }}
                >
                  Try again
                </button>
                {!isDuaStreaming && (
                  <button
                    onClick={() => navigator.clipboard?.writeText(duaResult)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.18em", textTransform: "uppercase",
                      color: "var(--muted)", background: "none",
                      border: "1px solid var(--divider)", borderRadius: "999px",
                      padding: "8px 18px", cursor: "pointer", minHeight: "40px",
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M3 8H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Copy
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <BottomNav activeTab="dua" onTabChange={handleTabChange} />
      </main>
    );
  }

  /* ════════ MAIN REFLECT SCREEN ════════ */
  return (
    <main
      className="min-h-screen flex flex-col items-center px-5 sm:px-6 py-10 has-bottom-nav"
      aria-label="Ummah Speaks — share how you feel"
    >
      <div className="w-full max-w-2xl flex flex-col gap-10 fade-slide-in">

        {/* Brand + date */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", paddingTop: "8px" }}>
          <BrandLogo />
          {islamicDate && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--placeholder)", opacity: 0.7 }}>
              {islamicDate}
            </p>
          )}
        </div>

        {/* ── INPUT VIEW ── */}
        {!showResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <header style={{ textAlign: "center" }}>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 6.5vw, 3.4rem)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--foreground)",
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                How are you feeling today,&nbsp;{userName}?
              </h1>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", color: "var(--muted)", marginTop: "12px" }}>
                I am here to listen.
              </p>
            </header>

            {/* Intent mode tabs */}
            <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
              {INTENT_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setIntentMode(tab.id)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.04em",
                    padding: "7px 16px",
                    borderRadius: "999px",
                    background: intentMode === tab.id ? "var(--surface-2)" : "none",
                    border: `1px solid ${intentMode === tab.id ? "var(--accent)" : "var(--divider)"}`,
                    color: intentMode === tab.id ? "var(--accent)" : "var(--muted)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontWeight: intentMode === tab.id ? 500 : 400,
                    minHeight: "34px",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Collection selector */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <label htmlFor="collection-select" className="sr-only">Hadith collection preference</label>
              <select
                id="collection-select"
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.72rem", letterSpacing: "0.04em",
                  color: "var(--muted)", background: "var(--surface)",
                  border: "1px solid var(--divider)", borderRadius: "10px",
                  padding: "6px 12px", cursor: "pointer", outline: "none",
                }}
              >
                <option value="">Any collection</option>
                <option value="bukhari">Sahih al-Bukhari</option>
                <option value="muslim">Sahih Muslim</option>
                <option value="abudawud">Sunan Abu Dawud</option>
                <option value="tirmidhi">Jami at-Tirmidhi</option>
                <option value="nasai">Sunan an-Nasai</option>
                <option value="ibnmajah">Sunan Ibn Majah</option>
                <option value="malik">Muwatta Malik</option>
                <option value="nawawi">Forty Hadith Nawawi</option>
                <option value="qudsi">Forty Hadith Qudsi</option>
              </select>
            </div>

            <label htmlFor="feeling-input" className="sr-only">Share how you are feeling</label>
            <div className="reflection-input">
              <textarea
                id="feeling-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                placeholder={currentIntent.placeholder}
                rows={6}
                aria-required="true"
                aria-describedby="feeling-hint"
                autoFocus
                style={{
                  width: "100%", resize: "none", background: "transparent", border: "none",
                  fontSize: "1.05rem", lineHeight: 1.8, fontWeight: 300,
                  fontFamily: "var(--font-body)", color: "var(--foreground)",
                  caretColor: "var(--accent)", outline: "none",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--divider)", paddingTop: "10px", marginTop: "4px", gap: "8px" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {text.length > 0 && (
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--placeholder)" }}>
                      {text.length}
                    </span>
                  )}

                  {/* Mic button */}
                  <button
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    aria-label={isRecording ? "Stop recording" : "Record voice input"}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      background: isRecording ? "var(--surface-2)" : "none",
                      border: `1px solid ${isRecording ? "var(--error)" : "var(--divider)"}`,
                      borderRadius: "999px", padding: "5px 11px",
                      cursor: isTranscribing ? "wait" : "pointer",
                      color: isRecording ? "var(--error)" : "var(--placeholder)",
                      minHeight: "30px", transition: "all 0.2s",
                    }}
                  >
                    {isTranscribing ? (
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>…</span>
                    ) : isRecording ? (
                      <><RecordingPulse /><span style={{ fontFamily: "var(--font-body)", fontSize: "0.7rem", letterSpacing: "0.1em" }}>Stop</span></>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <rect x="4.5" y="1" width="5" height="7.5" rx="2.5" stroke="currentColor" strokeWidth="1.1" />
                        <path d="M2 7.5a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        <line x1="7" y1="12.5" x2="7" y2="14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    fontFamily: "var(--font-body)", fontSize: "0.75rem", letterSpacing: "0.22em", textTransform: "uppercase",
                    padding: "10px 26px", borderRadius: "999px",
                    background: canSubmit ? "var(--accent)" : "var(--surface-2)",
                    color: canSubmit ? "#ffffff" : "var(--placeholder)",
                    border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
                    minHeight: "42px", fontWeight: 500,
                    transition: "background 0.25s, color 0.25s",
                  }}
                >
                  Share
                </button>
              </div>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
              {visibleSuggestions.map((sug, i) => (
                <button
                  key={`${suggestionIdx}-${i}`}
                  className="chip-fade-in"
                  onClick={() => setText(sug)}
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.8rem",
                    padding: "8px 16px",
                    borderRadius: "999px",
                    background: "var(--surface)",
                    border: "1px solid var(--divider)",
                    color: "var(--muted)",
                    cursor: "pointer",
                    transition: "border-color 0.2s, color 0.2s",
                    animationDelay: `${i * 0.08}s`,
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--foreground)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--divider)"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  {sug}
                </button>
              ))}
            </div>

            <span id="feeling-hint" className="sr-only">Press Ctrl+Enter or click Share to receive guidance.</span>
          </div>
        )}

        {/* ── RESULTS VIEW ── */}
        {showResults && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              ref={downloadRef}
              role="region"
              aria-label="Your guidance"
              aria-live="polite"
              aria-busy={status === "loading" || hadithStatus === "loading" || reflectionStatus === "loading"}
              style={{ display: "flex", flexDirection: "column", gap: "24px", background: "var(--background)", padding: "2px" }}
            >

              {/* Keyword loading */}
              {status === "loading" && !keyword && <LoadingDots label="Listening…" />}

              {/* Keyword + Name of Allah */}
              {status === "done" && keyword && (
                <div
                  className="fade-slide-in"
                  style={{ textAlign: "center", padding: "28px 16px", display: "flex", flexDirection: "column", gap: "16px", borderBottom: "1px solid var(--divider)" }}
                >
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--muted)" }}>
                    A theme for reflection
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 400,
                      fontSize: "clamp(2.6rem, 8vw, 4.2rem)",
                      color: "var(--accent)",
                      lineHeight: 1,
                      margin: 0,
                    }}
                  >
                    {keyword}
                  </p>

                  {/* Name of Allah */}
                  {nameOfAllah && (
                    <div
                      className="name-reveal"
                      aria-label={`Allah is ${nameOfAllah.transliteration} — ${nameOfAllah.meaning}`}
                      style={{
                        display: "inline-flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        margin: "0 auto",
                        padding: "10px 20px",
                        borderRadius: "12px",
                        background: "var(--surface)",
                        border: "1px solid var(--divider)",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: "var(--font-amiri), serif",
                          fontSize: "1.5rem",
                          color: "var(--foreground)",
                          direction: "rtl",
                          lineHeight: 1.3,
                        }}
                      >
                        {nameOfAllah.arabic}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--accent)", letterSpacing: "0.06em", fontWeight: 500 }}>
                        {nameOfAllah.transliteration}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--muted)" }}>
                        {nameOfAllah.meaning}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Loading skeleton */}
              {(hadithStatus === "loading" || quranStatus === "loading") && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "20px", borderRadius: "14px", background: "var(--surface)", border: "1px solid var(--divider)" }}>
                  <SkeletonLine width="45%" height="8px" delay={0} />
                  <SkeletonLine width="100%" height="8px" delay={80} />
                  <SkeletonLine width="88%" height="8px" delay={160} />
                  <SkeletonLine width="72%" height="8px" delay={240} />
                  <SkeletonLine width="95%" height="8px" delay={320} />
                  <SkeletonLine width="60%" height="8px" delay={400} />
                  <span className="sr-only">Loading guidance…</span>
                </div>
              )}

              {/* Quran verse */}
              {quranVerse && quranStatus === "done" && (
                <div className="quran-verse-card fade-slide-in" style={{ padding: "clamp(20px, 5vw, 32px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <span style={{ flex: 1, height: "1px", background: "var(--accent-soft)", opacity: 0.4 }} />
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--accent-soft)" }}>
                      Quranic Guidance
                    </p>
                    <span style={{ flex: 1, height: "1px", background: "var(--accent-soft)", opacity: 0.4 }} />
                  </div>

                  <p
                    dir="rtl"
                    style={{
                      fontFamily: "var(--font-amiri), serif",
                      fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
                      color: "var(--foreground)",
                      lineHeight: 2,
                      textAlign: "right",
                      marginBottom: "16px",
                    }}
                  >
                    {quranVerse.arabic}
                  </p>

                  <blockquote
                    style={{
                      margin: 0,
                      paddingLeft: "1rem",
                      borderLeft: "2px solid var(--accent)",
                      fontFamily: "var(--font-body)",
                      fontSize: "1rem",
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: "var(--foreground)",
                      lineHeight: 1.75,
                      marginBottom: "16px",
                    }}
                  >
                    {quranVerse.english}
                  </blockquote>

                  <div style={{ borderTop: "1px solid var(--divider)", paddingTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--accent)" }}>
                      {quranVerse.surah}
                    </span>
                    <span style={{ color: "var(--divider)" }}>·</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--placeholder)" }}>
                      {quranVerse.ref} &nbsp;|&nbsp; {quranVerse.surahName}
                    </span>
                  </div>
                </div>
              )}

              {/* Hadith card */}
              {hadithStatus === "done" && hadith && (
                <div className="manuscript-card fade-slide-in">

                  {/* Emerald top accent */}
                  <div aria-hidden="true" style={{ height: "2px", background: "var(--accent)", borderRadius: "2px 2px 0 0" }} />

                  <div style={{ padding: "clamp(18px, 5vw, 32px)", display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Section label + bookmark */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                        <span aria-hidden="true" style={{ fontFamily: "var(--font-amiri)", fontSize: "1.2rem", color: "var(--muted)", opacity: 0.5, direction: "rtl" }}>﷽</span>
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--muted)" }}>
                          Guidance from the Sunnah
                        </p>
                      </div>

                      {/* Bookmark / favorite button */}
                      <button
                        onClick={toggleFavorite}
                        aria-label={isFavorited ? "Remove from favourites" : "Save to favourites"}
                        title={isFavorited ? "Remove from favourites" : "Save to favourites"}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: "34px", height: "34px", borderRadius: "50%",
                          background: isFavorited ? "color-mix(in srgb, var(--accent) 15%, transparent)" : "none",
                          border: `1px solid ${isFavorited ? "var(--accent)" : "var(--divider)"}`,
                          color: isFavorited ? "var(--accent)" : "var(--placeholder)",
                          cursor: "pointer", flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { if (!isFavorited) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; } }}
                        onMouseLeave={(e) => { if (!isFavorited) { e.currentTarget.style.borderColor = "var(--divider)"; e.currentTarget.style.color = "var(--placeholder)"; } }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill={isFavorited ? "currentColor" : "none"} aria-hidden="true">
                          <path d="M2 2h10v10.5L7 10 2 12.5V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>

                    {hadith.header && (
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 300, fontStyle: "italic", color: "var(--muted)", lineHeight: 1.6 }}>
                        {hadith.header}
                      </p>
                    )}

                    {/* Blockquote */}
                    <blockquote
                      style={{
                        margin: 0, paddingLeft: "1.25rem",
                        borderLeft: "2px solid var(--accent)",
                        fontFamily: "var(--font-body)", fontWeight: 300,
                        fontSize: "clamp(0.95rem, 2.2vw, 1.05rem)",
                        color: "var(--foreground)", lineHeight: 1.85,
                      }}
                    >
                      {hadith.text}
                    </blockquote>

                    {/* Reference */}
                    <div style={{ borderTop: "1px solid var(--divider)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)" }}>
                          {hadith.collectionDisplay ?? hadith.collection}
                        </span>
                        {hadith.hadithNumber != null && (
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.72rem", color: "var(--muted)" }}>
                            #{hadith.hadithNumber}
                          </span>
                        )}
                      </div>
                      {hadith.bookName && (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>
                          {hadith.bookName}
                        </p>
                      )}
                      {hadith.chapterName && (
                        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--placeholder)", fontStyle: "italic" }}>
                          {hadith.chapterName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reflection loading */}
              {reflectionStatus === "loading" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", opacity: 0.35 }}>
                    <span style={{ height: "1px", width: "32px", background: "var(--accent-soft)", display: "block" }} />
                    <SkeletonLine width="120px" height="7px" />
                    <span style={{ height: "1px", width: "32px", background: "var(--accent-soft)", display: "block" }} />
                  </div>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    {[["75%", 0], ["92%", 60], ["68%", 120], ["85%", 180]].map(([w, d], i) => (
                      <SkeletonLine key={i} width={w as string} height="9px" delay={d as number} />
                    ))}
                  </div>
                  <span className="sr-only">Composing your reflection…</span>
                </div>
              )}

              {/* Reflection card */}
              {reflectionStatus === "done" && reflection && (
                <div
                  className="mihrab-frame fade-slide-in"
                  style={{ padding: "clamp(28px, 7vw, 48px) clamp(18px, 5vw, 36px) clamp(24px, 5vw, 40px)" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ display: "block", height: "1px", width: "32px", background: "var(--accent-soft)", opacity: 0.5 }} />
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--accent-soft)" }}>
                        A Message of Light
                      </p>
                      <span style={{ display: "block", height: "1px", width: "32px", background: "var(--accent-soft)", opacity: 0.5 }} />
                    </div>

                    <p
                      aria-live="polite"
                      className={isStreaming ? "streaming-cursor" : ""}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontWeight: 400,
                        fontSize: "clamp(1.15rem, 3.5vw, 1.6rem)",
                        color: "var(--foreground)",
                        lineHeight: 1.7,
                        maxWidth: "48ch",
                      }}
                    >
                      {reflection}
                    </p>

                    {!isStreaming && reflection && (
                      <button
                        onClick={() => setAppPhase("dua")}
                        style={{
                          fontFamily: "var(--font-body)", fontSize: "0.72rem",
                          letterSpacing: "0.14em", textTransform: "uppercase",
                          color: "var(--accent-soft)", background: "none", border: "none",
                          cursor: "pointer", opacity: 0.7, marginTop: "4px",
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                      >
                        Refine as du&apos;a →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.95rem", color: "var(--error)" }}>
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Action row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "8px", borderTop: "1px solid var(--divider)" }}>
              <button
                onClick={handleReset}
                style={{
                  fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--placeholder)", background: "none", border: "none",
                  cursor: "pointer", minHeight: "44px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--placeholder)"; }}
              >
                Start over
              </button>

              {reflectionStatus === "done" && reflection && !isStreaming && (
                <button
                  onClick={handleShare}
                  disabled={isDownloading}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    fontFamily: "var(--font-body)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--muted)", background: "none",
                    border: "1px solid var(--divider)", borderRadius: "999px",
                    padding: "8px 18px", cursor: isDownloading ? "wait" : "pointer",
                    minHeight: "40px",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--muted)"; e.currentTarget.style.color = "var(--foreground)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--divider)"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 1l3 3-3 3M11 4H5a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isDownloading ? "Saving…" : "Share"}
                </button>
              )}
            </div>
          </div>
        )}

        <GitHubFooter />
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
