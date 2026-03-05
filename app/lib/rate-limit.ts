interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function check(
  req: Request,
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfter?: number } {
  const ip = getIp(req);
  const storeKey = `${key}:${ip}`;
  const now = Date.now();
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { ok: false, retryAfter };
  }

  entry.count++;
  return { ok: true };
}

// 20 req/min for lightweight routes, 10 req/min for LLM-heavy routes
export const rateLimitChat        = (req: Request) => check(req, "chat",       20, 60_000);
export const rateLimitHadith      = (req: Request) => check(req, "hadith",     20, 60_000);
export const rateLimitReflection  = (req: Request) => check(req, "reflection", 10, 60_000);
export const rateLimitRefine      = (req: Request) => check(req, "refine",     10, 60_000);
export const rateLimitTranscribe  = (req: Request) => check(req, "transcribe", 20, 60_000);
export const rateLimitQuran       = (req: Request) => check(req, "quran",      20, 60_000);
