/**
 * TokenBucketQueue — hand-rolled rate limiter, no npm dependencies, browser-safe.
 *
 * Uses a token bucket pattern: starts full, refills 1 token every
 * (1000 / requestsPerSecond) ms. Queued functions execute as tokens become
 * available. The setInterval runs for the lifetime of the SPA session.
 */
export class TokenBucketQueue {
  private readonly queue: Array<() => void> = [];
  private tokens: number;
  private readonly maxTokens: number;

  constructor(requestsPerSecond: number) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;

    setInterval(() => {
      this.tokens = Math.min(this.tokens + 1, this.maxTokens);
      this.flush();
    }, 1000 / requestsPerSecond);
  }

  private flush(): void {
    while (this.tokens > 0 && this.queue.length > 0) {
      const next = this.queue.shift()!;
      this.tokens--;
      next();
    }
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => fn().then(resolve).catch(reject));
      this.flush();
    });
  }
}
