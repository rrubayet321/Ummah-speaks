"use client";

import { useState, useEffect, useCallback } from "react";
import { getEntries, clearEntries, formatRelativeTime, type JournalEntry } from "../lib/journal";
import { BackButton, CompactBrand } from "./ui";

/* ── Favorite types ── */
const FAVORITES_KEY = "ummah-speaks-favorites";

interface FavoriteEntry {
  id: string;
  keyword: string;
  hadithText: string;
  reflection: string;
  timestamp: number;
}

function getFavorites(): FavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
  } catch { return []; }
}

function removeFavorite(id: string): FavoriteEntry[] {
  const current = getFavorites().filter((f) => f.id !== id);
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(current)); } catch { /* noop */ }
  return current;
}

interface JournalProps {
  onBack: () => void;
}

/* ── Favourite card ── */
function FavouriteCard({ entry, onRemove }: { entry: FavoriteEntry; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="journal-card"
      style={{
        borderRadius: "14px",
        background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        overflow: "hidden",
      }}
    >
      {/* Accent stripe */}
      <div aria-hidden="true" style={{ height: "2px", background: "var(--accent)" }} />

      <div style={{ padding: "14px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                fontWeight: 400,
                color: "var(--accent)",
                lineHeight: 1.2,
              }}
            >
              {entry.keyword}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--placeholder)" }}>
              {formatRelativeTime(entry.timestamp)}
            </span>
          </div>

          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
            {/* Remove favourite */}
            <button
              onClick={onRemove}
              aria-label="Remove from favourites"
              title="Remove from favourites"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: "28px", height: "28px", borderRadius: "50%",
                background: "none",
                border: "1px solid var(--divider)",
                color: "var(--accent)",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--divider)"; }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="M2 2h10v10.5L7 10 2 12.5V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Expand */}
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse" : "Expand"}
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
                transition: "transform 0.25s",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.88rem",
            fontWeight: 300,
            color: "var(--foreground)",
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            opacity: 0.88,
          }}
        >
          {entry.reflection}
        </p>

        {expanded && (
          <div
            className="fade-slide-in"
            style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--divider)", display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--muted)" }}>
              Hadith
            </span>
            <blockquote
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 300,
                lineHeight: 1.75,
                color: "var(--foreground)",
                borderLeft: "2px solid var(--accent-soft)",
                paddingLeft: "14px",
                margin: 0,
                opacity: 0.88,
              }}
            >
              {entry.hadithText}
            </blockquote>
          </div>
        )}
      </div>
    </article>
  );
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
          opacity: 0.2,
          direction: "rtl",
        }}
      >
        ❧
      </span>
      <div className="flex flex-col gap-2">
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "1.2rem",
            color: "var(--foreground)",
            opacity: 0.7,
          }}
        >
          Your journal is empty
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 300,
            color: "var(--muted)",
            lineHeight: 1.6,
          }}
        >
          Share how you feel to receive a hadith &amp; reflection.
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
        borderRadius: "14px",
        background: "var(--surface)",
        border: "1px solid var(--divider)",
        overflow: "hidden",
      }}
    >
      {/* Top accent stripe */}
      <div
        aria-hidden="true"
        style={{ height: "2px", width: "100%", background: "var(--accent)" }}
      />

      <div style={{ padding: "16px 20px 18px" }}>
        {/* Header row */}
        <div
          style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "1.15rem",
                fontWeight: 400,
                color: "var(--accent)",
                lineHeight: 1.2,
              }}
            >
              {entry.keyword}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
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
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            fontWeight: 300,
            color: "var(--foreground)",
            lineHeight: 1.65,
            display: "-webkit-box",
            WebkitLineClamp: expanded ? "unset" : "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            opacity: 0.88,
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
                fontFamily: "var(--font-body)",
                fontSize: "0.6rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Guidance from the Sunnah
            </span>
            <blockquote
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 300,
                lineHeight: 1.75,
                color: "var(--foreground)",
                borderLeft: "2px solid var(--accent-soft)",
                paddingLeft: "14px",
                margin: 0,
                opacity: 0.88,
              }}
            >
              {entry.hadith.text}
            </blockquote>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  fontWeight: 500,
                  letterSpacing: "0.12em",
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
                    fontFamily: "var(--font-body)",
                    fontSize: "0.65rem",
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
                  fontFamily: "var(--font-body)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.18em",
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
                  fontFamily: "var(--font-body)",
                  fontSize: "0.82rem",
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
  const [entries, setEntries]         = useState<JournalEntry[]>([]);
  const [favorites, setFavorites]     = useState<FavoriteEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadEntries = useCallback(() => {
    setEntries(getEntries());
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  function handleRemoveFavourite(id: string) {
    setFavorites(removeFavorite(id));
  }

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
      <BackButton onClick={onBack} />

      <div className="w-full max-w-xl flex flex-col gap-6 fade-slide-in">

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <CompactBrand />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.6rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--foreground)",
              margin: "8px 0 0",
              letterSpacing: "0.02em",
            }}
          >
            Your Journal
          </h1>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.78rem",
              fontWeight: 300,
              letterSpacing: "0.08em",
              color: "var(--muted)",
              margin: 0,
            }}
          >
            Last {Math.min(entries.length || 0, 10)} reflections
          </p>
        </div>

        {/* ── Favourites section ── */}
        {favorites.length > 0 && (
          <section aria-label="Your favourites">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ flex: 1, height: "1px", background: "var(--divider)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="var(--accent)" aria-hidden="true">
                  <path d="M2 2h10v10.5L7 10 2 12.5V2z" stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--accent)" }}>
                  Favourites
                </p>
              </div>
              <span style={{ flex: 1, height: "1px", background: "var(--divider)" }} />
            </div>

            <div role="list" aria-label="Saved favourites" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {favorites.map((fav) => (
                <div role="listitem" key={fav.id}>
                  <FavouriteCard entry={fav} onRemove={() => handleRemoveFavourite(fav.id)} />
                </div>
              ))}
            </div>

            <div aria-hidden="true" style={{ height: "1px", background: "var(--divider)", margin: "20px 0 4px" }} />
          </section>
        )}

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
                fontFamily: "var(--font-body)",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
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

      </div>
    </main>
  );
}
