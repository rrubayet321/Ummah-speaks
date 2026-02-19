"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import BottomNav, { type NavTab } from "./components/BottomNav";
import { saveEntry } from "./lib/journal";

/* ── Lazy-loaded heavy screens ── */
const SalahTimings = dynamic(() => import("./components/SalahTimings"), { ssr: false });
const Tasbeeh      = dynamic(() => import("./components/Tasbeeh"),      { ssr: false });
const Journal      = dynamic(() => import("./components/Journal"),       { ssr: false });

/* ── Types ── */
type AppPhase = "name-input" | "greeting" | "main" | "salah" | "tasbeeh" | "journal";
type Status = "idle" | "loading" | "done" | "error";
type HadithStatus = "idle" | "loading" | "done" | "error";
type ReflectionStatus = "idle" | "loading" | "done" | "error";

interface HadithResult {
  header: string;
  text: string;
  refno: string;
  book: string;
  bookName: string;
  chapterName: string;
  collection: string;
  hadithNumber: number | null;
}

function getIslamicDate(): string {
  try {
    const raw = new Intl.DateTimeFormat("en-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
    return raw + " AH";
  } catch {
    return "";
  }
}

/* ── Ornament divider ── */
function OrnamentDivider() {
  return (
    <div
      aria-hidden="true"
      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "4px 0" }}
    >
      <span style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, var(--gold))", opacity: 0.35 }} />
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 1.5L10.4 7.6L16.5 9L10.4 10.4L9 16.5L7.6 10.4L1.5 9L7.6 7.6Z"
          stroke="var(--gold)"
          strokeWidth="0.9"
          fill="none"
          opacity="0.75"
        />
        <circle cx="9" cy="9" r="1.6" fill="var(--gold-soft)" opacity="0.55" />
      </svg>
      <span style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, var(--gold))", opacity: 0.35 }} />
    </div>
  );
}

/* ── Manuscript card corner ornaments — illuminated gold ── */
function CornerOrnament({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const flipX = position === "tr" || position === "br";
  const flipY = position === "bl" || position === "br";
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      aria-hidden="true"
      style={{
        position: "absolute",
        top: position.startsWith("t") ? "4px" : "auto",
        bottom: position.startsWith("b") ? "4px" : "auto",
        left: position.endsWith("l") ? "4px" : "auto",
        right: position.endsWith("r") ? "4px" : "auto",
        transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`,
        opacity: 0.7,
        zIndex: 1,
      }}
    >
      {/* Outer L-shaped bracket */}
      <path
        d="M2 40 L2 7 Q2 2 7 2 L40 2"
        stroke="var(--gold)"
        strokeWidth="1.2"
        fill="none"
      />
      {/* Inner bracket */}
      <path
        d="M5 34 L5 10 Q5 5 10 5 L34 5"
        stroke="var(--gold-soft)"
        strokeWidth="0.7"
        fill="none"
        opacity="0.5"
      />
      {/* Arabesque arm along top edge */}
      <path
        d="M10 2 C14 2 16 5 18 2"
        stroke="var(--gold)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M22 2 C26 2 28 5 30 2"
        stroke="var(--gold)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />
      {/* Arabesque arm along left edge */}
      <path
        d="M2 10 C2 14 5 16 2 18"
        stroke="var(--gold)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M2 22 C2 26 5 28 2 30"
        stroke="var(--gold)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.4"
      />
      {/* 8-pointed star (rub el hizb) at corner tip */}
      <polygon
        points="5,2 5.9,4.6 8.5,4.6 6.4,6.2 7.2,8.8 5,7.2 2.8,8.8 3.6,6.2 1.5,4.6 4.1,4.6"
        fill="var(--gold)"
        opacity="0.85"
      />
      {/* Dot accent */}
      <circle cx="5" cy="5" r="1" fill="var(--gold-soft)" opacity="0.9" />
    </svg>
  );
}

/* ── Brand logo block (shared across screens) ── */
function BrandLogo({ scaleIn = false }: { scaleIn?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <span
        className={`brand-arabic${scaleIn ? " brand-scale-in" : ""}`}
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-amiri), 'Scheherazade New', serif",
          fontSize: "3.6rem",
          lineHeight: 1.1,
          color: "var(--gold)",
          direction: "rtl",
        }}
      >
        أُمَّة
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span aria-hidden="true" style={{ display: "block", height: "1px", width: "68px", background: "linear-gradient(to right, transparent, var(--gold))", opacity: 0.6 }} />
        <span
          className="brand-wordmark"
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "0.82rem",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "var(--foreground)",
            fontWeight: 400,
          }}
        >
          Ummah Speaks
        </span>
        <span aria-hidden="true" style={{ display: "block", height: "1px", width: "68px", background: "linear-gradient(to left, transparent, var(--gold))", opacity: 0.6 }} />
      </div>
    </div>
  );
}

/* ── Loading dots ── */
function LoadingDots({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="text-center py-8 flex flex-col gap-3">
      <div className="flex gap-1.5 justify-center" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--accent-soft)", animationDelay: `${i * 200}ms`, opacity: 0.7 }}
          />
        ))}
      </div>
      <p
        className="text-xs tracking-[0.25em] uppercase"
        style={{ color: "var(--placeholder)", fontFamily: "var(--font-body)" }}
      >
        {label}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════ */
export default function Home() {
  const [appPhase, setAppPhase] = useState<AppPhase>("name-input");
  const [userName, setUserName]   = useState("");
  const [nameInput, setNameInput] = useState("");
  const [greetingVisible, setGreetingVisible] = useState(true);

  const [text, setText]     = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [hadith, setHadith]           = useState<HadithResult | null>(null);
  const [hadithStatus, setHadithStatus] = useState<HadithStatus>("idle");

  const [reflection, setReflection]               = useState("");
  const [reflectionStatus, setReflectionStatus]   = useState<ReflectionStatus>("idle");
  const [isStreaming, setIsStreaming]              = useState(false);

  const islamicDate = useMemo(() => getIslamicDate(), []);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadRef = useRef<HTMLDivElement>(null);

  /* ── Tab navigation helper ── */
  const handleTabChange = useCallback((tab: NavTab) => {
    const phaseMap: Record<NavTab, AppPhase> = {
      reflect: "main",
      salah:   "salah",
      tasbeeh: "tasbeeh",
      journal: "journal",
    };
    setAppPhase(phaseMap[tab]);
  }, []);

  const activeTab: NavTab =
    appPhase === "salah"   ? "salah"   :
    appPhase === "tasbeeh" ? "tasbeeh" :
    appPhase === "journal" ? "journal" : "reflect";

  /* ── Name submit ── */
  function handleNameSubmit() {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setGreetingVisible(true);
    setAppPhase("greeting");
    setTimeout(() => setGreetingVisible(false), 2200);
    setTimeout(() => setAppPhase("main"), 2800);
  }

  /* ── Main submit ── */
  async function handleSubmit() {
    if (!text.trim() || status === "loading") return;

    setStatus("loading");
    setKeyword("");
    setErrorMsg("");
    setHadith(null);
    setHadithStatus("idle");
    setReflection("");
    setReflectionStatus("idle");
    setIsStreaming(false);

    try {
      /* 1. Extract keyword */
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unexpected error.");

      const fetchedKeyword: string = data.keyword;
      setKeyword(fetchedKeyword);
      setStatus("done");

      /* 2. Fetch hadith */
      setHadithStatus("loading");
      const hadithRes = await fetch("/api/hadith", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: fetchedKeyword }),
      });
      const hadithData = await hadithRes.json();
      if (!hadithRes.ok || !hadithData.hadith) {
        setHadithStatus("error");
        return;
      }
      const fetchedHadith: HadithResult = hadithData.hadith;
      setHadith(fetchedHadith);
      setHadithStatus("done");

      /* 3. Generate reflection */
      setReflectionStatus("loading");
      const reflectionRes = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeling: text, hadithText: fetchedHadith.text, name: userName }),
      });
      const reflectionData = await reflectionRes.json();

      if (reflectionRes.ok && reflectionData.message) {
        const full: string = reflectionData.message;
        setReflectionStatus("done");
        setIsStreaming(true);

        /* Character-by-character calligrapher animation */
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setReflection(full.slice(0, i));
          if (i >= full.length) {
            clearInterval(interval);
            setIsStreaming(false);
            /* Save to journal */
            saveEntry({
              islamicDate,
              name: userName,
              feeling: text,
              keyword: fetchedKeyword,
              hadith: {
                text: fetchedHadith.text,
                collection: fetchedHadith.collection,
                bookName: fetchedHadith.bookName,
                chapterName: fetchedHadith.chapterName,
                hadithNumber: fetchedHadith.hadithNumber,
              },
              reflection: full,
            });
          }
        }, 16);
      } else {
        setReflectionStatus("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function handleReset() {
    setText("");
    setKeyword("");
    setStatus("idle");
    setErrorMsg("");
    setHadith(null);
    setHadithStatus("idle");
    setReflection("");
    setReflectionStatus("idle");
    setIsStreaming(false);
  }

  /* ── Download / Share ── */
  async function handleShare() {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      try {
        await navigator.share({
          title: "Ummah Speaks — A Message of Light",
          text: `${keyword}\n\n"${hadith?.text}"\n\n${reflection}`,
          url: window.location.href,
        });
        return;
      } catch {
        /* User cancelled — fall through to download */
      }
    }
    /* Fallback: download image */
    handleDownload();
  }

  async function handleDownload() {
    if (!downloadRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `ummah-speaks-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsDownloading(false);
    }
  }

  const canSubmit  = text.trim().length > 0 && status !== "loading";
  const showResults = status === "loading" || status === "done" || status === "error";

  /* ════════════ NAME-INPUT SCREEN ════════════ */
  if (appPhase === "name-input") {
    return (
      <main
        className="arabesque-bg min-h-screen flex flex-col items-center justify-center px-6 py-20 md:pt-24"
        aria-label="Welcome to Ummah Speaks — enter your name to begin"
      >
        <div className="w-full max-w-md flex flex-col gap-10 fade-slide-in" style={{ position: "relative", zIndex: 1 }}>

          {/* Bismillah */}
          <div style={{ textAlign: "center" }}>
            <span
              aria-label="Bismillah ir-Rahman ir-Rahim"
              style={{
                fontFamily: "var(--font-amiri), serif",
                fontSize: "1.15rem",
                color: "var(--gold)",
                direction: "rtl",
                opacity: 0.6,
                letterSpacing: "0.04em",
                display: "block",
              }}
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
            </span>
          </div>

          {/* Brand */}
          <BrandLogo scaleIn />

          {/* Salah shortcut */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setAppPhase("salah")}
              aria-label="View salah prayer times"
              className="flex items-center gap-1.5 text-xs font-light tracking-widest uppercase px-4 py-2 rounded-full transition-all duration-200 hover:opacity-80"
              style={{
                fontFamily: "var(--font-body)",
                border: "1px solid var(--divider)",
                color: "var(--muted)",
                letterSpacing: "0.18em",
                minHeight: "44px",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1" />
                <path d="M5.5 3v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Salah Times
            </button>
          </div>

          {/* Header */}
          <header className="text-center flex flex-col gap-3">
            <h1
              className="text-3xl sm:text-4xl leading-snug"
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--foreground)",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              What shall I call you?
            </h1>
            <p
              className="text-base font-light tracking-wide"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              I am here to listen.
            </p>
          </header>

          <OrnamentDivider />

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
            aria-describedby="name-hint"
            className="w-full bg-transparent border-none text-xl text-center leading-8 font-light"
            style={{
              color: "var(--foreground)",
              caretColor: "var(--accent-soft)",
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          />
          <span id="name-hint" className="sr-only">Press Enter or click Begin to continue.</span>

          <div aria-hidden="true" className="w-full h-px" style={{ background: "linear-gradient(to right, transparent, var(--gold), transparent)", opacity: 0.3 }} />

          {/* Begin button */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleNameSubmit}
              disabled={!nameInput.trim()}
              aria-disabled={!nameInput.trim()}
              aria-label={nameInput.trim() ? `Begin as ${nameInput.trim()}` : "Enter your name to begin"}
              className={`text-xs font-light tracking-widest uppercase px-10 py-3 rounded-full transition-all duration-300${nameInput.trim() ? " begin-btn-active" : ""}`}
              style={{
                fontFamily: "var(--font-body)",
                background: nameInput.trim() ? "var(--gold)" : "var(--divider)",
                color: nameInput.trim() ? "var(--background)" : "var(--placeholder)",
                cursor: nameInput.trim() ? "pointer" : "not-allowed",
                letterSpacing: "0.22em",
                minHeight: "44px",
              }}
            >
              Begin
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ════════════ SALAH SCREEN ════════════ */
  if (appPhase === "salah") {
    return (
      <>
        <SalahTimings onBack={() => setAppPhase("main")} />
        <BottomNav activeTab="salah" onTabChange={handleTabChange} />
      </>
    );
  }

  /* ════════════ TASBEEH SCREEN ════════════ */
  if (appPhase === "tasbeeh") {
    return (
      <>
        <Tasbeeh onBack={() => setAppPhase("main")} />
        <BottomNav activeTab="tasbeeh" onTabChange={handleTabChange} />
      </>
    );
  }

  /* ════════════ JOURNAL SCREEN ════════════ */
  if (appPhase === "journal") {
    return (
      <>
        <Journal onBack={() => setAppPhase("main")} />
        <BottomNav activeTab="journal" onTabChange={handleTabChange} />
      </>
    );
  }

  /* ════════════ GREETING SCREEN ════════════ */
  if (appPhase === "greeting") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 md:pt-24">
        <div
          className="w-full max-w-md flex flex-col items-center gap-4 text-center"
          style={{
            opacity: greetingVisible ? 1 : 0,
            transform: greetingVisible ? "translateY(0)" : "translateY(-10px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Bismillah */}
          <p
            aria-hidden="true"
            style={{
              fontFamily: "var(--font-amiri), 'Scheherazade New', serif",
              fontSize: "1.3rem",
              color: "var(--accent)",
              direction: "rtl",
              opacity: 0.6,
              letterSpacing: "0.04em",
              marginBottom: "4px",
            }}
          >
            بِسْمِ ٱللَّٰهِ
          </p>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--accent)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              lineHeight: 1.3,
            }}
          >
            As-salamu alaykum,
          </p>
          <p
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--foreground)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(2.25rem, 7vw, 3.5rem)",
              lineHeight: 1.2,
            }}
          >
            {userName}
          </p>
          <p
            className="mt-2 text-base font-light tracking-wide"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            I am here to listen.
          </p>
        </div>
      </main>
    );
  }

  /* ════════════ MAIN APP SCREEN ════════════ */
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 sm:px-6 py-10 has-bottom-nav"
      aria-label="Ummah Speaks — share how you feel"
    >
      <div className="w-full max-w-2xl flex flex-col gap-8 fade-slide-in">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-2">
          <BrandLogo />
          {islamicDate && (
            <p
              className="text-xs tracking-[0.2em] uppercase mt-1"
              style={{ color: "var(--placeholder)", fontFamily: "var(--font-body)", opacity: 0.75 }}
            >
              {islamicDate}
            </p>
          )}
        </div>

        {/* ── INPUT VIEW ── */}
        {!showResults && (
          <div className="flex flex-col gap-7">
            <header className="text-center">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl leading-tight"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--foreground)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  textShadow: "0 0 40px color-mix(in srgb, var(--gold) 18%, transparent)",
                }}
              >
                How are you feeling today, {userName}?
              </h1>
              <p
                className="mt-4 text-base font-light tracking-wide"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                I am here to listen.
              </p>
            </header>

            <OrnamentDivider />

            <label htmlFor="feeling-input" className="sr-only">Share how you are feeling today</label>
            <div className="reflection-input">
              <textarea
                id="feeling-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
                }}
                placeholder="Begin whenever you are ready…"
                rows={6}
                aria-required="true"
                aria-describedby="feeling-hint"
                className="w-full resize-none bg-transparent border-none text-base leading-8 font-light"
                style={{
                  color: "var(--foreground)",
                  caretColor: "var(--accent-soft)",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                }}
                autoFocus
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTop: "1px solid var(--divider)",
                  paddingTop: "12px",
                  marginTop: "4px",
                }}
              >
                <span
                  aria-live="polite"
                  className="text-xs font-light tracking-wide select-none"
                  style={{
                    color: "var(--placeholder)",
                    fontFamily: "var(--font-body)",
                    opacity: text.length > 0 ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  {text.length} {text.length === 1 ? "char" : "chars"}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  aria-disabled={!canSubmit}
                  aria-label={canSubmit ? "Share your feelings and receive guidance" : "Write something to share"}
                  className="text-xs font-light tracking-widest uppercase px-6 py-2.5 rounded-full transition-all duration-300"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: canSubmit ? "var(--gold)" : "var(--divider)",
                    color: canSubmit ? "var(--background)" : "var(--placeholder)",
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    letterSpacing: "0.2em",
                    minHeight: "44px",
                  }}
                >
                  Share
                </button>
              </div>
            </div>
            <span id="feeling-hint" className="sr-only">
              Press Ctrl+Enter or Cmd+Enter, or click Share, to receive a hadith and reflection.
            </span>
          </div>
        )}

        {/* ── RESULTS VIEW ── */}
        {showResults && (
          <div className="flex flex-col gap-6">

            {/* Capturable area for download */}
            <div
              ref={downloadRef}
              role="region"
              aria-label="Your guidance"
              aria-live="polite"
              aria-busy={status === "loading" || hadithStatus === "loading" || reflectionStatus === "loading"}
              className="flex flex-col gap-6"
              style={{ background: "var(--background)", padding: "0.25rem" }}
            >
              {/* Keyword */}
              {status === "loading" && !keyword && (
                <LoadingDots label="Listening…" />
              )}

              {status === "done" && keyword && (
                <div
                  className="text-center py-6 flex flex-col gap-3 fade-slide-in"
                  style={{ borderBottom: "1px solid var(--divider)" }}
                  aria-label={`Your theme for reflection: ${keyword}`}
                >
                  <p
                    className="text-xs tracking-[0.3em] uppercase"
                    aria-hidden="true"
                    style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                  >
                    A theme for reflection
                  </p>
                  <p
                    className="text-3xl sm:text-4xl"
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "var(--accent)",
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    {keyword}
                  </p>
                </div>
              )}

              {/* Hadith loading skeleton */}
              {hadithStatus === "loading" && (
                <div
                  role="status"
                  aria-label="Loading hadith…"
                  className="rounded-2xl px-8 py-8 flex flex-col gap-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--divider)" }}
                >
                  <div aria-hidden="true" className="h-3 w-40 rounded-full mx-auto animate-pulse" style={{ background: "var(--divider)" }} />
                  <div aria-hidden="true" className="flex flex-col gap-2 mt-2">
                    {["100%", "83%", "67%", "100%", "75%"].map((w, i) => (
                      <div key={i} className="h-2.5 rounded-full animate-pulse" style={{ background: "var(--divider)", width: w }} />
                    ))}
                  </div>
                  <span className="sr-only">Loading a relevant hadith for you…</span>
                </div>
              )}

              {/* ── Hadith manuscript card ── */}
              {hadithStatus === "done" && hadith && (
                <div
                  className="manuscript-card vine-border fade-slide-in"
                  style={{ position: "relative" }}
                >
                  {/* Inner double-border ring */}
                  <div className="inner-border" aria-hidden="true" />

                  {/* Corner ornaments */}
                  <CornerOrnament position="tl" />
                  <CornerOrnament position="tr" />
                  <CornerOrnament position="bl" />
                  <CornerOrnament position="br" />

                  {/* Gradient top stripe in gold */}
                  <div
                    aria-hidden="true"
                    style={{
                      height: "3px",
                      width: "100%",
                      background: "linear-gradient(to right, var(--gold), var(--gold-soft), transparent)",
                      position: "relative",
                      zIndex: 2,
                    }}
                  />

                  <div className="px-4 py-5 sm:px-8 sm:py-8 flex flex-col gap-4 sm:gap-6" style={{ position: "relative", zIndex: 2 }}>
                    {/* Header ornament */}
                    <div className="flex flex-col items-center gap-2">
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: "var(--font-amiri)",
                          fontSize: "1.4rem",
                          color: "var(--accent-soft)",
                          opacity: 0.5,
                          direction: "rtl",
                          lineHeight: 1,
                        }}
                      >
                        ﷽
                      </span>
                      <span
                        className="text-xs tracking-[0.28em] uppercase whitespace-nowrap"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                      >
                        Guidance from the Sunnah
                      </span>
                    </div>

                    {hadith.header && (
                      <p
                        className="text-sm font-light leading-relaxed"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic" }}
                      >
                        {hadith.header}
                      </p>
                    )}

                    {/* Blockquote */}
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: "var(--font-playfair)",
                          color: "var(--accent-soft)",
                          fontSize: "3.8rem",
                          lineHeight: 1,
                          position: "absolute",
                          top: "-0.7rem",
                          left: "-0.3rem",
                          opacity: 0.2,
                          fontStyle: "italic",
                          userSelect: "none",
                        }}
                      >
                        &ldquo;
                      </span>
                      <blockquote
                        className="text-base leading-8 font-light"
                        style={{
                          color: "var(--foreground)",
                          fontFamily: "var(--font-body)",
                          borderLeft: "2px solid var(--gold)",
                          paddingLeft: "1.25rem",
                          margin: 0,
                        }}
                      >
                        {hadith.text}
                      </blockquote>
                    </div>

                    {/* Reference */}
                    <div className="flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid var(--divider)" }}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="text-xs font-semibold tracking-widest uppercase"
                          style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                        >
                          {hadith.collection === "bukhari"
                            ? "Sahih al-Bukhari"
                            : hadith.collection === "muslim"
                            ? "Sahih Muslim"
                            : hadith.collection}
                        </span>
                        {hadith.hadithNumber != null && (
                          <span
                            className="text-xs font-semibold tracking-wide whitespace-nowrap"
                            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                          >
                            Hadith {hadith.hadithNumber}
                          </span>
                        )}
                      </div>
                      {hadith.bookName && (
                        <p className="text-xs font-light leading-relaxed" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                          {hadith.bookName}
                        </p>
                      )}
                      {hadith.chapterName && (
                        <p className="text-xs font-light leading-relaxed" style={{ color: "var(--placeholder)", fontFamily: "var(--font-body)", fontStyle: "italic" }}>
                          {hadith.chapterName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Reflection loading skeleton */}
              {reflectionStatus === "loading" && (
                <div
                  role="status"
                  aria-label="Composing your personal reflection…"
                  className="fade-slide-in flex flex-col items-center gap-5 py-6 px-4"
                >
                  <div aria-hidden="true" className="flex items-center gap-3" style={{ opacity: 0.4 }}>
                    <span className="block h-px w-10" style={{ background: "var(--accent-soft)" }} />
                    <div className="h-2.5 w-28 rounded-full animate-pulse" style={{ background: "var(--divider)" }} />
                    <span className="block h-px w-10" style={{ background: "var(--accent-soft)" }} />
                  </div>
                  <div aria-hidden="true" className="w-full max-w-xl flex flex-col items-center gap-2.5">
                    {["75%", "92%", "68%", "85%", "55%"].map((w, i) => (
                      <div key={i} className="h-3 rounded-full animate-pulse" style={{ background: "var(--divider)", width: w, animationDelay: `${i * 80}ms` }} />
                    ))}
                  </div>
                  <span className="sr-only">Composing a personal reflection for you…</span>
                </div>
              )}

              {/* ── Mihrab reflection frame ── */}
              {reflectionStatus === "done" && reflection && (
                <div
                  className="mihrab-frame fade-slide-in"
                  style={{ padding: "clamp(20px, 6vw, 40px) clamp(14px, 5vw, 28px) clamp(18px, 5vw, 32px)" }}
                >
                  {/* Inner accent arch line */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: "7px",
                      left: "7px",
                      right: "7px",
                      height: "3px",
                      borderRadius: "120px 120px 0 0 / 3px 3px 0 0",
                      background: "linear-gradient(to right, transparent, var(--accent-soft), transparent)",
                      opacity: 0.4,
                    }}
                  />

                  <div className="flex flex-col items-center gap-5 text-center">
                    <div className="flex items-center gap-3" style={{ opacity: 0.55 }}>
                      <span className="block h-px w-10" style={{ background: "var(--accent-soft)" }} />
                      <span
                        className="text-xs tracking-[0.3em] uppercase"
                        style={{ color: "var(--accent-soft)", fontFamily: "var(--font-body)" }}
                      >
                        A Message of Light
                      </span>
                      <span className="block h-px w-10" style={{ background: "var(--accent-soft)" }} />
                    </div>

                    <p
                      aria-live="polite"
                      className={`text-base sm:text-xl leading-8 sm:leading-9 max-w-xl${isStreaming ? " streaming-cursor" : ""}`}
                      style={{
                        fontFamily: "var(--font-playfair)",
                        color: "var(--foreground)",
                        fontStyle: "italic",
                        fontWeight: 400,
                      }}
                    >
                      {reflection}
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}
              {status === "error" && (
                <p className="text-center text-sm font-light" style={{ color: "#b45252", fontFamily: "var(--font-body)" }}>
                  {errorMsg}
                </p>
              )}
            </div>

            {/* ── Bottom action row ── */}
            <div className="flex items-center justify-between gap-3 pt-2 flex-wrap" style={{ borderTop: "1px solid var(--divider)" }}>
              <button
                onClick={handleReset}
                aria-label="Start over and write a new reflection"
                className="text-xs font-light tracking-widest uppercase transition-opacity duration-200 hover:opacity-60 py-2"
                style={{
                  color: "var(--muted)",
                  fontFamily: "var(--font-body)",
                  minHeight: "44px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Start over
              </button>

              {reflectionStatus === "done" && reflection && !isStreaming && (
                <button
                  onClick={handleShare}
                  disabled={isDownloading}
                  aria-disabled={isDownloading}
                  aria-label={isDownloading ? "Saving…" : "Share or download this reflection"}
                  className="flex items-center gap-2 text-xs font-light tracking-widest uppercase px-5 py-2 rounded-full transition-all duration-300 hover:opacity-75"
                  style={{
                    fontFamily: "var(--font-body)",
                    border: "1px solid var(--divider)",
                    color: "var(--muted)",
                    letterSpacing: "0.2em",
                    cursor: isDownloading ? "wait" : "pointer",
                    minHeight: "44px",
                    background: "none",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 1l3 3-3 3M11 4H5a4 4 0 0 0-4 4v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {isDownloading ? "Saving…" : "Share"}
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </main>
  );
}
