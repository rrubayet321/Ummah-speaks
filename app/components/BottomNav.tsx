"use client";

export type NavTab = "reflect" | "salah" | "tasbeeh" | "journal";

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
        {/* Prayer beads circle */}
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
    <nav
      aria-label="Main navigation"
      className="bottom-nav-blur md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "color-mix(in srgb, var(--background) 88%, transparent)",
        borderTop: "1px solid var(--divider)",
        padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          maxWidth: "440px",
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
                gap: "3px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "6px 12px",
                borderRadius: "12px",
                minWidth: "60px",
                minHeight: "44px",
                justifyContent: "center",
                color: isActive ? "var(--accent)" : "var(--placeholder)",
                transition: "color 0.2s, background 0.2s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Icon */}
              <span
                style={{
                  transition: "transform 0.2s",
                  transform: isActive ? "translateY(-1px)" : "translateY(0)",
                  display: "flex",
                }}
              >
                {tab.icon}
              </span>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-lato)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: isActive ? 400 : 300,
                  lineHeight: 1,
                  transition: "opacity 0.2s",
                }}
              >
                {tab.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    opacity: 0.7,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
