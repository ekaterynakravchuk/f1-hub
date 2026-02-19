// OpenF1 hooks are deferred to later phases. This client is the base infrastructure.
import { TokenBucketQueue } from "@/lib/api/rate-limiter";

// Rate limit: 3 req/s, 30 req/min (free tier, from openf1.org)
const queue = new TokenBucketQueue(3);

export const OPENF1_BASE_URL = "https://api.openf1.org/v1";

/**
 * Rate-limited fetch wrapper for the OpenF1 API.
 *
 * Unlike Jolpica, OpenF1 returns JSON arrays directly (no MRData wrapper).
 * Rate limited to 3 req/s via token bucket queue.
 *
 * Note: Most OpenF1 endpoints require a session_key parameter.
 * Live session data requires a paid-tier auth token.
 */
export async function openf1Fetch<T>(path: string): Promise<T> {
  return queue.enqueue(async () => {
    const res = await fetch(`${OPENF1_BASE_URL}${path}`);
    if (res.status === 429) {
      throw new Error("OPENF1_RATE_LIMIT");
    }
    if (!res.ok) {
      throw new Error(`OPENF1_HTTP_${res.status}`);
    }
    return res.json() as Promise<T>;
  });
}
