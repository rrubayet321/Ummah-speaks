export interface JournalEntry {
  id: string;
  timestamp: number;
  islamicDate: string;
  name: string;
  feeling: string;
  keyword: string;
  hadith: {
    text: string;
    collection: string;
    bookName: string;
    chapterName?: string;
    hadithNumber: number | null;
  };
  reflection: string;
}

const STORAGE_KEY = "ummah-speaks-journal";
const MAX_ENTRIES = 10;

export function saveEntry(entry: Omit<JournalEntry, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const entries = getEntries();
    const newEntry: JournalEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...entries].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JournalEntry[];
  } catch {
    return [];
  }
}

export function clearEntries(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
