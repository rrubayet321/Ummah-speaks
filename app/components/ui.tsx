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
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--muted)",
        background: "var(--background)",
        border: "1px solid var(--divider)",
        borderRadius: "999px",
        padding: "7px 14px",
        minHeight: "44px",
        cursor: "pointer",
        transition: "color 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--foreground)";
        e.currentTarget.style.borderColor = "var(--muted)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--muted)";
        e.currentTarget.style.borderColor = "var(--divider)";
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

/* ── CompactBrand ── clean mini brand shown on sub-pages */
export function CompactBrand() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-amiri), 'Scheherazade New', serif",
          fontSize: "2rem",
          lineHeight: 1.1,
          color: "var(--foreground)",
          direction: "rtl",
          fontWeight: 400,
        }}
      >
        أُمَّة
      </span>
      <span
        aria-hidden="true"
        style={{ display: "block", height: "2px", width: "24px", background: "var(--accent)", borderRadius: "2px" }}
      />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "var(--foreground)",
          fontWeight: 500,
          opacity: 0.75,
        }}
      >
        Ummah Speaks
      </span>
    </div>
  );
}
