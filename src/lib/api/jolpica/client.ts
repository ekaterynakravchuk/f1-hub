import { TokenBucketQueue } from "@/lib/api/rate-limiter";

// Rate limit: 4 req/s burst, 500 req/hour sustained (per Jolpica docs)
const queue = new TokenBucketQueue(4);

export const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";

/**
 * Rate-limited fetch wrapper for the Jolpica F1 API.
 *
 * All requests are queued through a 4 req/s token bucket. Callers receive a
 * Promise that resolves when the request completes. The rate limiter is
 * transparent to callers — they see normal loading latency, not queue delay.
 */
export async function jolpikaFetch<T>(path: string): Promise<T> {
  return queue.enqueue(async () => {
    const res = await fetch(`${JOLPICA_BASE_URL}${path}`);
    if (res.status === 429) {
      throw new Error("JOLPIKA_RATE_LIMIT");
    }
    if (!res.ok) {
      throw new Error(`JOLPIKA_HTTP_${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}
