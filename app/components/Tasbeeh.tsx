"use client";

import { useState, useEffect, useRef } from "react";
import { BackButton, CompactBrand } from "./ui";

interface DhikrPhase {
  arabic: string;
  transliteration: string;
  translation: string;
  limit: number;
}

const DHIKR_SEQUENCE: DhikrPhase[] = [
  {
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhanallah",
    translation: "Glory be to Allah",
    limit: 33,
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is to Allah",
    limit: 33,
  },
  {
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    limit: 34,
  },
];

const STORAGE_KEY = "ummah-speaks-tasbeeh";

interface TasbeehState {
  phaseIndex: number;
  count: number;
  completedCycles: number;
}

function loadState(): TasbeehState {
  if (typeof window === "undefined")
    return { phaseIndex: 0, count: 0, completedCycles: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as TasbeehState;
  } catch {
    // noop
  }
  return { phaseIndex: 0, count: 0, completedCycles: 0 };
}

function saveState(state: TasbeehState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // noop
  }
}

interface TasbeehProps {
  onBack: () => void;
}

export default function Tasbeeh({ onBack }: TasbeehProps) {
  const [state, setState] = useState<TasbeehState>(() => loadState());
  const [tapAnim, setTapAnim] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const counterRef = useRef<HTMLButtonElement>(null);

  const currentPhase = DHIKR_SEQUENCE[state.phaseIndex];
  const progress = state.count / currentPhase.limit;

  useEffect(() => {
    saveState(state);
  }, [state]);

  function handleTap() {
    if (allComplete) return;

    // Vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }

    // Tap animation
    setTapAnim(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setTapAnim(true));
    });
    setTimeout(() => setTapAnim(false), 200);

    const newCount = state.count + 1;

    if (newCount >= currentPhase.limit) {
      const nextPhaseIndex = state.phaseIndex + 1;

      if (nextPhaseIndex >= DHIKR_SEQUENCE.length) {
        // Full cycle complete
        const newCycles = state.completedCycles + 1;
        setState({ phaseIndex: 0, count: 0, completedCycles: newCycles });
        setAllComplete(true);
        setPhaseComplete(false);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([50, 50, 100]);
        }
        setTimeout(() => setAllComplete(false), 2200);
      } else {
        // Phase complete, advance
        setPhaseComplete(true);
        setTimeout(() => {
          setState((prev) => ({
            phaseIndex: nextPhaseIndex,
            count: 0,
            completedCycles: prev.completedCycles,
          }));
          setPhaseComplete(false);
        }, 700);
      }
    } else {
      setState((prev) => ({ ...prev, count: newCount }));
    }
  }

  function handleReset() {
    setState({ phaseIndex: 0, count: 0, completedCycles: state.completedCycles });
    setAllComplete(false);
    setPhaseComplete(false);
  }

  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference * (1 - progress);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-5 has-bottom-nav"
      style={{ paddingTop: "3rem" }}

      aria-label="Tasbeeh — dhikr counter"
    >
      {/* ── Fixed back button (mobile only — desktop uses top nav) ── */}
      <BackButton onClick={onBack} />

      <div className="w-full max-w-sm flex flex-col gap-8 fade-slide-in">

        {/* Brand */}
        <CompactBrand />

        {/* Title */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.7rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--foreground)",
              margin: "0 0 4px",
            }}
          >
            Tasbeeh
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.7rem",
              fontWeight: 300,
              letterSpacing: "0.16em",
              color: "var(--muted)",
            }}
          >
            {state.completedCycles > 0
              ? `${state.completedCycles} cycle${state.completedCycles > 1 ? "s" : ""} completed`
              : "Post-salah remembrance"}
          </p>
        </div>

        {/* Phase tabs */}
        <div
          role="tablist"
          aria-label="Dhikr phases"
          style={{ display: "flex", gap: "6px", justifyContent: "center" }}
        >
          {DHIKR_SEQUENCE.map((phase, i) => (
            <div
              key={phase.transliteration}
              role="tab"
              aria-selected={i === state.phaseIndex}
              aria-label={`${phase.transliteration}: ${i < state.phaseIndex ? "completed" : i === state.phaseIndex ? "current" : "upcoming"}`}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background:
                  i < state.phaseIndex
                    ? "var(--accent)"
                    : i === state.phaseIndex
                    ? "var(--accent-soft)"
                    : "var(--divider)",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Main counter */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {/* SVG ring + button */}
          <div style={{ position: "relative", width: "clamp(160px, 52vw, 200px)", height: "clamp(160px, 52vw, 200px)" }}>
            {/* Background ring */}
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 120 120"
              style={{ position: "absolute", inset: 0 }}
              aria-hidden="true"
            >
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--divider)"
                strokeWidth="3"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.25s ease" }}
              />
            </svg>

            {/* Tap button — fills the ring */}
            <button
              ref={counterRef}
              onClick={handleTap}
              disabled={allComplete}
              aria-label={`${currentPhase.transliteration} — count ${state.count} of ${currentPhase.limit}. Tap to increment.`}
              aria-live="polite"
              className={tapAnim ? "tasbeeh-tap" : phaseComplete ? "tasbeeh-complete" : ""}
              style={{
                position: "absolute",
                inset: "14px",
                borderRadius: "50%",
                background: allComplete
                  ? "color-mix(in srgb, var(--gold) 14%, var(--surface))"
                  : phaseComplete
                  ? "color-mix(in srgb, var(--gold) 10%, var(--surface))"
                  : "var(--surface)",
                border: "none",
                cursor: allComplete ? "default" : "pointer",
                overflow: "visible",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "background 0.3s ease",
                userSelect: "none",
                WebkitUserSelect: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {allComplete ? (
                <span
                  style={{
                    fontFamily: "var(--font-amiri)",
                    fontSize: "2rem",
                    color: "var(--accent)",
                    direction: "rtl",
                    lineHeight: 1,
                  }}
                >
                  ✓
                </span>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 300,
                      fontSize: "2.4rem",
                      color: "var(--foreground)",
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                    }}
                  >
                    {state.count}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--muted)",
                    }}
                  >
                    / {currentPhase.limit}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Arabic phrase + translation */}
          <div
            style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {allComplete ? (
              <>
                <p
                  className="fade-slide-in"
                  style={{
                    fontFamily: "var(--font-amiri)",
                    fontSize: "1.6rem",
                    color: "var(--accent)",
                    direction: "rtl",
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  اللَّهُمَّ بَارِكْ
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontStyle: "italic",
                    fontSize: "1rem",
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  Cycle complete — Alhamdulillah
                </p>
              </>
            ) : (
              <>
                <p
                  className="fade-slide-in"
                  style={{
                    fontFamily: "var(--font-amiri)",
                    fontSize: "2rem",
                    color: "var(--accent)",
                    direction: "rtl",
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  {currentPhase.arabic}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "1.05rem",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: "var(--foreground)",
                    margin: 0,
                  }}
                >
                  {currentPhase.transliteration}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.75rem",
                    fontWeight: 300,
                    color: "var(--muted)",
                    margin: 0,
                  }}
                >
                  {currentPhase.translation}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Remaining dhikr previews */}
        {!allComplete && state.phaseIndex < DHIKR_SEQUENCE.length - 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              padding: "12px 0",
              borderTop: "1px solid var(--divider)",
              borderBottom: "1px solid var(--divider)",
            }}
            aria-hidden="true"
          >
            {DHIKR_SEQUENCE.slice(state.phaseIndex + 1).map((phase) => (
              <span
                key={phase.transliteration}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--placeholder)",
                  opacity: 0.6,
                }}
              >
                {phase.transliteration} ×{phase.limit}
              </span>
            ))}
          </div>
        )}

        {/* Reset button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={handleReset}
            aria-label="Reset dhikr counter to beginning"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.62rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 16px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Reset
          </button>
        </div>


      </div>
    </main>
  );
}
