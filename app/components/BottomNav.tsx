"use client";

export type NavTab = "reflect" | "salah" | "tasbeeh" | "journal" | "dua";

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface TabConfig {
  id: NavTab;
  label: string;
  arabicLabel: string;
  icon: React.ReactNode;
}

const TABS: TabConfig[] = [
  {
    id: "reflect",
    label: "Reflect",
    arabicLabel: "تأمّل",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 3C6.13 3 3 6.13 3 10s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M7 10.5c.5 1.2 1.7 2 3 2s2.5-.8 3-2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="8" cy="8.5" r="0.8" fill="currentColor" />
        <circle cx="12" cy="8.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "dua",
    label: "Du'a",
    arabicLabel: "دعاء",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {/* Open hands / supplication gesture */}
        <path
          d="M5 14 C5 11 6.5 9 8 8.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M15 14 C15 11 13.5 9 12 8.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M7 8 C7 5.5 8.5 4.5 10 4.5 C11.5 4.5 13 5.5 13 8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="10" cy="16" r="1.2" fill="currentColor" opacity="0.7" />
        <path d="M8 14.8 C8.5 15.5 9 16 10 16 C11 16 11.5 15.5 12 14.8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    id: "salah",
    label: "Salah",
    arabicLabel: "الصلاة",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M16 9.5A6 6 0 1 1 9.5 3 4.7 4.7 0 0 0 16 9.5z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="15" cy="5" r="1.2" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: "tasbeeh",
    label: "Tasbeeh",
    arabicLabel: "تسبيح",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2.2" />
        <circle cx="10" cy="3.5" r="1.3" fill="currentColor" opacity="0.8" />
        <line x1="10" y1="1" x2="10" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="10" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    ),
  },
  {
    id: "journal",
    label: "Journal",
    arabicLabel: "مذكّرة",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <>
      {/* ── Mobile bottom bar (hidden on md+) ── */}
      <nav
        aria-label="Main navigation"
        className="bottom-nav-blur md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--background)",
          borderTop: "1px solid var(--divider)",
          padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label} — ${tab.arabicLabel}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  minWidth: "52px",
                  minHeight: "44px",
                  justifyContent: "center",
                  color: isActive ? "var(--gold)" : "var(--placeholder)",
                  transition: "color 0.25s",
                  WebkitTapHighlightColor: "transparent",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transform: isActive ? "translateY(-1px) scale(1.05)" : "translateY(0) scale(1)",
                    opacity: isActive ? 1 : 0.55,
                  }}
                >
                  {tab.icon}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: 1,
                    opacity: isActive ? 1 : 0.55,
                    transition: "opacity 0.25s",
                  }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: "3px",
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      background: "var(--gold)",
                      opacity: 0.9,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop top bar (hidden below md) ── */}
      <nav
        aria-label="Main navigation"
        className="bottom-nav-blur hidden md:flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--background)",
          borderBottom: "1px solid var(--divider)",
          padding: "0 32px",
          height: "54px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{ fontFamily: "var(--font-amiri), serif", fontSize: "1.3rem", color: "var(--foreground)", direction: "rtl", lineHeight: 1 }}
            aria-hidden="true"
          >
            أُمَّة
          </span>
          <span aria-hidden="true" style={{ display: "block", height: "14px", width: "2px", background: "var(--accent)", borderRadius: "2px" }} />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.68rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--foreground)",
              fontWeight: 500,
              opacity: 0.75,
            }}
          >
            Ummah Speaks
          </span>
        </div>

        {/* Tab buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-label={`${tab.label} — ${tab.arabicLabel}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: isActive ? "var(--surface-2)" : "none",
                  border: isActive ? "1px solid var(--divider)" : "1px solid transparent",
                  borderRadius: "999px",
                  cursor: "pointer",
                  padding: "6px 14px",
                  color: isActive ? "var(--gold)" : "var(--placeholder)",
                  transition: "color 0.2s, background 0.2s, border-color 0.2s",
                  opacity: isActive ? 1 : 0.6,
                }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "var(--muted)"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.opacity = "0.6"; e.currentTarget.style.color = "var(--placeholder)"; } }}
              >
                <span style={{ display: "flex", flexShrink: 0 }}>{tab.icon}</span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
