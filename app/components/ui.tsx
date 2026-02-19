"use client";

/* ── BackButton ── used on Salah, Tasbeeh and Journal screens (mobile only) */
export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Return to main screen"
      className="md:hidden"
      style={{
        position: "fixed",
        top: "14px",
        left: "16px",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "var(--font-body)",
        fontSize: "0.72rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        background: "color-mix(in srgb, var(--background) 80%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid color-mix(in srgb, var(--gold) 15%, var(--divider))",
        borderRadius: "999px",
        padding: "7px 14px",
        minHeight: "44px",
        cursor: "pointer",
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--gold)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 40%, transparent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--muted)";
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 15%, var(--divider))";
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

/* ── CompactBrand ── accent-coloured mini brand shown on sub-pages */
export function CompactBrand() {
  return (
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
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.7rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontWeight: 500,
          }}
        >
          Ummah Speaks
        </span>
        <span aria-hidden="true" style={{ display: "block", height: "1px", width: "44px", background: "var(--accent)", opacity: 0.5 }} />
      </div>
    </div>
  );
}
