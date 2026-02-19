"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as adhan from "adhan";
import { CITIES, City } from "../data/cities";
import { BackButton, CompactBrand } from "./ui";

/* ─── Types ─── */
interface PrayerTime {
  name: string;
  arabic: string;
  time: Date;
}

/* ─── Prayer calculation ─── */
function getPrayerTimes(city: City, date: Date): PrayerTime[] {
  const coords = new adhan.Coordinates(city.lat, city.lng);
  const params = adhan.CalculationMethod.MuslimWorldLeague();
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const times = new adhan.PrayerTimes(coords, d, params);
  return [
    { name: "Fajr",    arabic: "الفَجْر",   time: times.fajr    },
    { name: "Dhuhr",   arabic: "الظُّهْر",  time: times.dhuhr   },
    { name: "Asr",     arabic: "العَصْر",   time: times.asr     },
    { name: "Maghrib", arabic: "المَغْرِب", time: times.maghrib },
    { name: "Isha",    arabic: "العِشَاء",  time: times.isha    },
  ];
}

/* ─── Formatting helpers ─── */
function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz,
  }).format(date);
}

function formatDateLine(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: tz,
  }).format(date);
}

function getClockParts(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: tz,
  }).formatToParts(date);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "00";
  return { hour: get("hour"), minute: get("minute"), second: get("second"), ampm: get("dayPeriod") };
}

function getNextPrayer(prayers: PrayerTime[], now: Date): string | null {
  for (const p of prayers) if (p.time > now) return p.name;
  return null;
}

function getCurrentPrayer(prayers: PrayerTime[], now: Date): string | null {
  let cur: string | null = null;
  for (const p of prayers) { if (p.time <= now) cur = p.name; else break; }
  return cur;
}

/* ─── Decorative atoms ─── */
function CrescentIcon() {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      aria-hidden="true"
      style={{ color: "var(--accent)", opacity: 0.7 }}
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function AccentBar() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: "2px",
        width: "100%",
        borderRadius: "2px 2px 0 0",
        background: "linear-gradient(to right, var(--accent), var(--accent-soft), transparent)",
      }}
    />
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }} aria-hidden="true">
      <span style={{ flex: 1, height: "1px", background: "var(--divider)" }} />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.58rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--placeholder)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, height: "1px", background: "var(--divider)" }} />
    </div>
  );
}

/* ─── Clock display (symmetrical) ─── */
function ClockDisplay({ now, tz }: { now: Date; tz: string }) {
  const { hour, minute, second, ampm } = getClockParts(now, tz);
  return (
    <div
      role="timer"
      aria-label={`Current time: ${hour}:${minute} ${ampm}`}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "0",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}
    >
      {/* HH:MM — large */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "clamp(2.6rem, 10vw, 3.8rem)",
          color: "var(--foreground)",
          letterSpacing: "0.03em",
        }}
      >
        {hour}:{minute}
      </span>

      {/* :SS — medium, muted */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
          color: "var(--muted)",
          letterSpacing: "0.02em",
          alignSelf: "flex-end",
          paddingBottom: "0.28em",
          marginLeft: "3px",
        }}
      >
        :{second}
      </span>

      {/* AM/PM — small, accent */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 300,
          fontSize: "0.68rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginLeft: "8px",
          marginTop: "8px",
        }}
      >
        {ampm}
      </span>
    </div>
  );
}

/* ─── City carousel ─── */
const DEFAULT_CITY_INDEX = CITIES.findIndex(c => c.name === "Dhaka");

function CityCarousel({
  selectedIndex,
  onChange,
  isLoading = false,
}: {
  selectedIndex: number;
  onChange: (i: number) => void;
  isLoading?: boolean;
}) {
  const total = CITIES.length;
  const touchStartX = useRef<number | null>(null);

  const prev = () => { if (selectedIndex > 0) onChange(selectedIndex - 1); };
  const next = () => { if (selectedIndex < total - 1) onChange(selectedIndex + 1); };

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) { if (delta > 0) next(); else prev(); }
    touchStartX.current = null;
  }

  const getCity = (offset: number) => {
    const idx = selectedIndex + offset;
    return (idx >= 0 && idx < total) ? CITIES[idx] : null;
  };

  const prevCity = getCity(-1);
  const nextCity = getCity(1);

  const ArrowBtn = ({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous city" : "Next city"}
      style={{
        flexShrink: 0,
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid var(--divider)",
        borderRadius: "50%",
        background: "transparent",
        color: disabled ? "var(--divider)" : "var(--muted)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {dir === "left"
        ? <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="M5.5 1L2.5 4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true"><path d="M2.5 1L5.5 4l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      }
    </button>
  );

  return (
    <div
      role="group"
      aria-label="Select city for prayer times"
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <p
        id="city-carousel-label"
        style={{
          textAlign: "center",
          fontFamily: "var(--font-body)",
          fontSize: "0.62rem",
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "var(--placeholder)",
          margin: 0,
        }}
      >
        Select City
      </p>

      {/* Stage */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ArrowBtn dir="left" onClick={prev} disabled={selectedIndex === 0} />

        {/* Three-city view — purely visual; range slider handles keyboard/screen-reader access */}
        <div
          aria-hidden="true"
          style={{ flex: 1, display: "flex", alignItems: "center", overflow: "hidden", minHeight: "64px" }}
        >
          {/* Previous ghost */}
          <button
            onClick={prevCity ? prev : undefined}
            disabled={!prevCity}
            tabIndex={-1}
            style={{
              flex: "0 0 26%",
              textAlign: "right",
              paddingRight: "12px",
              paddingLeft: 0,
              paddingTop: 0,
              paddingBottom: 0,
              opacity: prevCity ? 0.25 : 0,
              transform: "scale(0.8)",
              transition: "opacity 0.25s, transform 0.25s",
              cursor: prevCity ? "pointer" : "default",
              userSelect: "none",
              background: "none",
              border: "none",
            }}
          >
            {prevCity && (
              <>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 400, color: "var(--foreground)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                  {prevCity.name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--muted)", margin: "2px 0 0", whiteSpace: "nowrap" }}>
                  {prevCity.country}
                </p>
              </>
            )}
          </button>

          {/* Selected — centre; live region announces city change to screen readers */}
          <div
            aria-live="polite"
            aria-atomic="true"
            style={{ flex: "0 0 48%", textAlign: "center" }}
          >
            {isLoading ? (
              <>
                <div
                  className="animate-pulse"
                  style={{ height: "1.8rem", width: "65%", borderRadius: "6px", background: "var(--divider)", margin: "0 auto 6px" }}
                />
                <div
                  className="animate-pulse"
                  style={{ height: "0.65rem", width: "40%", borderRadius: "4px", background: "var(--divider)", margin: "0 auto" }}
                />
              </>
            ) : (
              <>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.5rem, 5vw, 1.95rem)", fontWeight: 500, color: "var(--foreground)", lineHeight: 1.15, margin: 0 }}>
                  {CITIES[selectedIndex].name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", margin: "5px 0 0" }}>
                  {CITIES[selectedIndex].country}
                </p>
              </>
            )}
          </div>

          {/* Next ghost */}
          <button
            onClick={nextCity ? next : undefined}
            disabled={!nextCity}
            tabIndex={-1}
            style={{
              flex: "0 0 26%",
              textAlign: "left",
              paddingLeft: "12px",
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
              opacity: nextCity ? 0.25 : 0,
              transform: "scale(0.8)",
              transition: "opacity 0.25s, transform 0.25s",
              cursor: nextCity ? "pointer" : "default",
              userSelect: "none",
              background: "none",
              border: "none",
            }}
          >
            {nextCity && (
              <>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 400, color: "var(--foreground)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                  {nextCity.name}
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--muted)", margin: "2px 0 0", whiteSpace: "nowrap" }}>
                  {nextCity.country}
                </p>
              </>
            )}
          </button>
        </div>

        <ArrowBtn dir="right" onClick={next} disabled={selectedIndex === total - 1} />
      </div>

      {/* Slider track — primary keyboard + screen-reader interface for city selection */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={selectedIndex}
          onChange={(e) => onChange(Number(e.target.value))}
          className="city-range"
          aria-label="Select city"
          aria-valuetext={`${CITIES[selectedIndex].name}, ${CITIES[selectedIndex].country}`}
          style={{ width: "100%" }}
        />
        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.58rem", letterSpacing: "0.18em", color: "var(--placeholder)", margin: 0 }}>
          {selectedIndex + 1} of {total} cities
        </p>
      </div>
    </div>
  );
}

/* ─── Prayer row ─── */
function PrayerRow({
  prayer,
  isNext,
  isCurrent,
  isPast,
  tz,
}: {
  prayer: PrayerTime;
  isNext: boolean;
  isCurrent: boolean;
  isPast: boolean;
  tz: string;
}) {
  const status = isNext ? "up next" : isCurrent ? "current prayer" : isPast ? "completed" : "upcoming";
  const timeStr = formatTime(prayer.time, tz);

  return (
    <div
      role="listitem"
      aria-label={`${prayer.name} — ${timeStr}, ${status}`}
      aria-current={isNext || isCurrent ? "true" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(11px, 3vw, 15px) clamp(14px, 4vw, 22px)",
        borderRadius: "14px",
        background: isNext ? "var(--accent)" : "var(--surface)",
        border: isNext
          ? "1px solid var(--accent)"
          : isCurrent
          ? "1px solid var(--accent-soft)"
          : "1px solid var(--divider)",
        opacity: isPast ? 0.5 : 1,
        boxShadow: isNext ? "0 8px 28px rgba(45,90,61,0.18)" : "none",
        transition: "all 0.35s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle left accent bar for current prayer */}
      {isCurrent && !isNext && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: "20%",
            height: "60%",
            width: "3px",
            borderRadius: "0 3px 3px 0",
            background: "var(--accent-soft)",
          }}
        />
      )}

      {/* Left: names */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(1.1rem, 3.5vw, 1.3rem)",
          fontWeight: 500,
          letterSpacing: "0.03em",
          color: isNext ? "var(--background)" : "var(--foreground)",
          lineHeight: 1,
        }}>
          {prayer.name}
        </span>
        <span
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "0.92rem",
            fontStyle: "italic",
            color: isNext ? "rgba(255,255,255,0.6)" : "var(--muted)",
            lineHeight: 1,
          }}
        >
          {prayer.arabic}
        </span>
      </div>

      {/* Right: time + status */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
        <span
          className="tabular-nums"
          aria-hidden="true"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "clamp(0.95rem, 3vw, 1.1rem)",
            letterSpacing: "0.04em",
            color: isNext ? "var(--background)" : "var(--foreground)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {timeStr}
        </span>

        {isNext && (
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.56rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
          }}>
            Up Next
          </span>
        )}
        {isCurrent && (
          <span aria-hidden="true" style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.56rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "var(--accent-soft)",
          }}>
            Now
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Prayer row skeleton (shown while city is changing) ─── */
function PrayerRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(11px, 3vw, 15px) clamp(14px, 4vw, 22px)",
        borderRadius: "14px",
        background: "var(--surface)",
        border: "1px solid var(--divider)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          className="animate-pulse"
          style={{ width: "56px", height: "14px", borderRadius: "4px", background: "var(--divider)" }}
        />
        <div
          className="animate-pulse"
          style={{ width: "36px", height: "10px", borderRadius: "4px", background: "var(--divider)", opacity: 0.7 }}
        />
      </div>
      <div
        className="animate-pulse"
        style={{ width: "54px", height: "14px", borderRadius: "4px", background: "var(--divider)" }}
      />
    </div>
  );
}

/* ─── Main page ─── */
export default function SalahTimings({ onBack }: { onBack: () => void }) {
  const defaultIndex = DEFAULT_CITY_INDEX >= 0 ? DEFAULT_CITY_INDEX : 0;
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [now, setNow] = useState(() => new Date());
  const [prayers, setPrayers] = useState<PrayerTime[]>(() =>
    getPrayerTimes(CITIES[defaultIndex], new Date())
  );
  const [isChangingCity, setIsChangingCity] = useState(false);

  const selectedCity = CITIES[selectedIndex];

  const recalculate = useCallback((city: City, date: Date) => {
    setPrayers(getPrayerTimes(city, date));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNow(n);
      if (n.getHours() === 0 && n.getMinutes() === 0 && n.getSeconds() === 0) {
        recalculate(selectedCity, n);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [selectedCity, recalculate]);

  /* Show skeleton briefly when city changes, then recalculate */
  useEffect(() => {
    setIsChangingCity(true);
    const id = setTimeout(() => {
      recalculate(CITIES[selectedIndex], now);
      setIsChangingCity(false);
    }, 280);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex]);

  const nextPrayer    = getNextPrayer(prayers, now);
  const currentPrayer = getCurrentPrayer(prayers, now);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start px-5 py-10 sm:py-14 has-bottom-nav md:pt-20"
      aria-label={`Prayer times for ${selectedCity.name}`}
    >
      {/* ── Fixed back button (mobile only — desktop uses top nav) ── */}
      <BackButton onClick={onBack} />

      <div className="w-full max-w-xl flex flex-col gap-7 fade-slide-in">

        {/* ── Header ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          {/* Brand logo */}
          <CompactBrand />

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CrescentIcon />
            <h1 style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(1.45rem, 4vw, 1.85rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "var(--foreground)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              Prayer Times
            </h1>
          </div>
        </div>

        {/* ── Live clock card ── */}
        <section
          aria-label={`Live clock for ${selectedCity.name}, ${selectedCity.country}`}
          style={{
            borderRadius: "18px",
            overflow: "hidden",
            background: "var(--surface)",
            border: "1px solid var(--divider)",
            boxShadow: "0 2px 20px rgba(45,90,61,0.06)",
          }}
        >
          <AccentBar />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "28px 24px 24px" }}>

            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.64rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "0 0 8px",
            }}>
              {isChangingCity ? (
                <span
                  className="animate-pulse"
                  style={{ display: "inline-block", width: "120px", height: "0.64rem", borderRadius: "4px", background: "var(--divider)", verticalAlign: "middle" }}
                />
              ) : (
                `${selectedCity.name}, ${selectedCity.country}`
              )}
            </p>

            <ClockDisplay now={now} tz={selectedCity.timezone} />

            <p style={{
              fontFamily: "var(--font-body)",
              fontWeight: 300,
              fontSize: "0.72rem",
              letterSpacing: "0.05em",
              color: "var(--muted)",
              margin: "6px 0 0",
            }}>
              {formatDateLine(now, selectedCity.timezone)}
            </p>

            {/* Thin divider */}
            <div aria-hidden="true" style={{ width: "40px", height: "1px", background: "var(--divider)", margin: "10px 0 4px" }} />

            {/* Next prayer badge — live region so screen readers announce changes */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {nextPrayer ? (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  background: "var(--accent)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--background)",
                }}>
                  <span aria-hidden="true" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--background)", opacity: 0.7, flexShrink: 0 }} />
                  Next &nbsp;·&nbsp; {nextPrayer}
                </div>
              ) : (
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 18px",
                  borderRadius: "999px",
                  border: "1px solid var(--divider)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}>
                  All prayers complete
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── City picker ── */}
        <div style={{
          borderRadius: "18px",
          overflow: "hidden",
          background: "var(--surface)",
          border: "1px solid var(--divider)",
        }}>
          <AccentBar />
          <div style={{ padding: "20px 18px 22px" }}>
            <CityCarousel
              selectedIndex={selectedIndex}
              onChange={setSelectedIndex}
              isLoading={isChangingCity}
            />
          </div>
        </div>

        {/* ── Five prayers ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionDivider label="Five Daily Prayers" />

          <div
            role="list"
            aria-label="Five daily prayers"
            aria-busy={isChangingCity}
            style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}
          >
            {isChangingCity
              ? [0, 1, 2, 3, 4].map((i) => <PrayerRowSkeleton key={i} />)
              : prayers.map((prayer) => {
                  const isNext    = prayer.name === nextPrayer;
                  const isCurrent = prayer.name === currentPrayer && !isNext;
                  const isPast    = prayer.time < now && !isCurrent && !isNext;
                  return (
                    <PrayerRow
                      key={prayer.name}
                      prayer={prayer}
                      isNext={isNext}
                      isCurrent={isCurrent}
                      isPast={isPast}
                      tz={selectedCity.timezone}
                    />
                  );
                })
            }
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px", paddingTop: "4px" }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.62rem",
            letterSpacing: "0.12em",
            color: "var(--placeholder)",
            margin: 0,
          }}>
            Muslim World League calculation method
          </p>

          <div aria-hidden="true" style={{ width: "100%", height: "1px", background: "var(--divider)" }} />

          {/* ── Sheikh Assim Al Hakim — Learn to Pray card ── */}
          <a
            href="https://youtu.be/vx1rz-28HNk?si=65_KfjDcK38wAh4i"
            target="_blank"
            rel="noopener noreferrer"
            className="sheikh-card"
            aria-label="Learn how to pray Salah with Sheikh Assim Al Hakim — opens YouTube in a new tab"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              width: "100%",
              textDecoration: "none",
              borderRadius: "18px",
              overflow: "hidden",
              background: "var(--surface)",
              border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)",
              padding: "0",
              cursor: "pointer",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.opacity = "0.92"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.opacity = "1"; }}
          >
            {/* Accent gradient top bar */}
            <div aria-hidden="true" style={{
              height: "3px",
              width: "100%",
              background: "linear-gradient(to right, var(--accent), var(--accent-soft), transparent)",
            }} />

            <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Hook line */}
              <div aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  opacity: 0.75,
                }}>
                  New to Salah?
                </span>
                <span style={{ flex: 1, height: "1px", background: "var(--divider)" }} />
              </div>

              {/* Main call-to-action */}
              <p style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                fontWeight: 500,
                fontStyle: "italic",
                color: "var(--foreground)",
                margin: 0,
                lineHeight: 1.3,
              }}>
                Learn how to pray Salah, step by step.
              </p>

              {/* Sheikh attribution */}
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.75rem",
                fontWeight: 300,
                color: "var(--muted)",
                margin: 0,
                lineHeight: 1.5,
              }}>
                A clear, beginner-friendly guide by{" "}
                <span style={{ color: "var(--accent)", fontWeight: 400 }}>
                  Sheikh Assim Al Hakim
                </span>
                {" "}— covering every position, recitation and intention of the prayer.
              </p>

              {/* CTA row */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "4px",
              }}>
                {/* Play icon */}
                <span aria-hidden="true" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2.5 1.5L8 5 2.5 8.5V1.5z" fill="var(--background)" />
                  </svg>
                </span>
                <span style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  fontWeight: 400,
                }}>
                  Watch Free on YouTube
                </span>
                <span aria-hidden="true" style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.65rem",
                  color: "var(--muted)",
                  marginLeft: "auto",
                  opacity: 0.6,
                }}>
                  →
                </span>
              </div>
            </div>
          </a>

        </div>

      </div>

      <style>{`
        .city-range {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 2px;
          background: var(--divider);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .city-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--surface);
          cursor: pointer;
          box-shadow: 0 1px 6px rgba(45,90,61,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .city-range::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 2px 10px rgba(45,90,61,0.35);
        }
        .city-range:focus-visible {
          outline: 2px solid var(--accent);
          outline-offset: 4px;
          border-radius: 2px;
        }
        .city-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--surface);
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
