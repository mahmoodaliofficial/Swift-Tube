// ============================================================
//  Simple in-memory rate limiter (token bucket per IP)
// ============================================================

interface BucketEntry {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, BucketEntry>();

// Config
const MAX_TOKENS = 10;          // max requests in window
const REFILL_RATE = 10;         // tokens per window
const WINDOW_MS = 60 * 1000;    // 1 minute window

function getOrCreateBucket(ip: string): BucketEntry {
  if (!buckets.has(ip)) {
    buckets.set(ip, { tokens: MAX_TOKENS, lastRefill: Date.now() });
  }
  return buckets.get(ip)!;
}

function refillBucket(bucket: BucketEntry): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= WINDOW_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const bucket = getOrCreateBucket(ip);
  refillBucket(bucket);

  const resetIn = Math.max(0, WINDOW_MS - (Date.now() - bucket.lastRefill));

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return { allowed: true, remaining: bucket.tokens, resetIn };
  }

  return { allowed: false, remaining: 0, resetIn };
}

// Clean up stale entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const staleThreshold = Date.now() - WINDOW_MS * 2;
  for (const [ip, bucket] of buckets.entries()) {
    if (bucket.lastRefill < staleThreshold) {
      buckets.delete(ip);
    }
  }
}, 5 * 60 * 1000);
