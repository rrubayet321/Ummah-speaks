"use client";

import { useState, useEffect, useCallback } from "react";
import { getEntries, clearEntries, formatRelativeTime, type JournalEntry } from "../lib/journal";

interface JournalProps {
  onBack: () => void;
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center gap-5 py-16 px-6 text-center fade-slide-in"
      aria-label="No reflections yet"
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-amiri)",
          fontSize: "3rem",
          color: "var(--accent)",
          opacity: 0.25,
          direction: "rtl",
        }}
      >
        ❧
      </span>
      <div className="flex flex-col gap-2">
        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontStyle: "italic",
            fontSize: "1.15rem",
            color: "var(--foreground)",
            opacity: 0.7,
          }}
        >
          Your journal is empty
        </p>
        <p
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "0.82rem",
            fontWeight: 300,
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          Share how you feel to receive a hadith & reflection.
          <br />
          Your entries will be saved here privately.
        </p>
      </div>
    </div>
  );
}

function EntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="journal-card"
      style={{
        borderRadius: "16px",
        background: "var(--surface)",
        border: "1px solid var(--divider)",
        overflow: "hidden",
      }}
    >
      {/* Top accent stripe */}
      <div
        aria-hidden="true"
        style={{
          height: "2px",
          width: "100%",
          background: "linear-gradient(to right, var(--accent), var(--accent-soft), transparent)",
        }}
      />

      <div style={{ padding: "16px 20px 18px" }}>
        {/* Header row */}
        <div
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span
              style={{
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                fontSize: "1.2rem",
                fontWeight: 400,
                color: "var(--accent)",
                lineHeight: 1.2,
              }}
            >
              {entry.keyword}
            </span>
            <span
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                color: "var(--placeholder)",
              }}
            >
              {formatRelativeTime(entry.timestamp)}
              {entry.islamicDate ? ` · ${entry.islamicDate}` : ""}
            </span>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse entry" : "Expand entry"}
            style={{
              background: "none",
              border: "1px solid var(--divider)",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--muted)",
              flexShrink: 0,
              transition: "transform 0.25s",
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Reflection preview */}
        <p
          style={{
            fontFamily: "var(--font-lato)",
            fontSize: "0.85rem",
            fontWeight: 300,
            color: "var(--foreground)",
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            opacity: 0.85,
          }}
        >
          {entry.reflection}
        </p>

        {/* Expanded: full hadith */}
        {expanded && (
          <div
            className="fade-slide-in"
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--divider)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "0.6rem",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Guidance from the Sunnah
            </span>
            <blockquote
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "0.82rem",
                fontWeight: 300,
                lineHeight: 1.75,
                color: "var(--foreground)",
                borderLeft: "2px solid var(--accent-soft)",
                paddingLeft: "14px",
                margin: 0,
              }}
            >
              {entry.hadith.text}
            </blockquote>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                {entry.hadith.collection === "bukhari"
                  ? "Sahih al-Bukhari"
                  : entry.hadith.collection === "muslim"
                  ? "Sahih Muslim"
                  : entry.hadith.collection}
              </span>
              {entry.hadith.hadithNumber != null && (
                <span
                  style={{
                    fontFamily: "var(--font-lato)",
                    fontSize: "0.62rem",
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  #{entry.hadith.hadithNumber}
                </span>
              )}
            </div>

            {/* Feeling snippet */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                background: "var(--background)",
                border: "1px solid var(--divider)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--placeholder)",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                You wrote
              </span>
              <p
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  color: "var(--muted)",
                  margin: 0,
                  lineHeight: 1.6,
                  display: "-webkit-box",
                  WebkitLineClamp: "3",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {entry.feeling}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Journal({ onBack }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadEntries = useCallback(() => {
    setEntries(getEntries());
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    clearEntries();
    setEntries([]);
    setConfirmClear(false);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-5 has-bottom-nav"
      style={{ paddingTop: "3rem" }}
      aria-label="Your reflection journal"
    >
      <div className="w-full max-w-xl flex flex-col gap-6 fade-slide-in">

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          {/* Brand logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <span
              className="brand-arabic"
              aria-hidden="true"
              style={{
                fontFamily: "var(--font-amiri), 'Scheherazade New', serif",
                fontSize: "2rem",
                lineHeight: 1.1,
                color: "var(--accent)",
                direction: "rtl",
              }}
            >
              أُمَّة
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span aria-hidden="true" style={{ display: "block", height: "1px", width: "44px", background: "var(--accent)", opacity: 0.5 }} />
              <span
                className="brand-wordmark"
                style={{ fontFamily: "var(--font-lato)", fontSize: "0.7rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 500 }}
              >
                Ummah Speaks
              </span>
              <span aria-hidden="true" style={{ display: "block", height: "1px", width: "44px", background: "var(--accent)", opacity: 0.5 }} />
            </div>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.6rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--foreground)",
              margin: "8px 0 0",
              letterSpacing: "0.03em",
            }}
          >
            Your Journal
          </h1>
          <p
            style={{
              fontFamily: "var(--font-lato)",
              fontSize: "0.72rem",
              fontWeight: 300,
              letterSpacing: "0.1em",
              color: "var(--muted)",
              margin: 0,
            }}
          >
            Last {Math.min(entries.length || 0, 10)} reflections
          </p>
        </div>

        {/* Entry list */}
        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            role="list"
            aria-label="Your reflection entries"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {entries.map((entry) => (
              <div role="listitem" key={entry.id}>
                <EntryCard entry={entry} />
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        {entries.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "8px",
              paddingBottom: "4px",
              borderTop: "1px solid var(--divider)",
            }}
          >
            <button
              onClick={handleClear}
              aria-label={confirmClear ? "Tap again to confirm clear all" : "Clear all journal entries"}
              style={{
                fontFamily: "var(--font-lato)",
                fontSize: "0.62rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: confirmClear ? "#b45252" : "var(--placeholder)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 16px",
                transition: "color 0.2s",
              }}
            >
              {confirmClear ? "Tap again to clear all" : "Clear journal"}
            </button>
          </div>
        )}

        {/* Desktop back button */}
        <div className="hidden md:flex justify-center pb-6">
          <button
            onClick={onBack}
            aria-label="Return to main screen"
            style={{
              fontFamily: "var(--font-lato)",
              fontSize: "0.62rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            ← Back
          </button>
        </div>
      </div>
    </main>
  );
}
