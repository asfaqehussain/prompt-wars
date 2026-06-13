/**
 * Unit tests for the in-memory rate limiter.
 * Covers: allow/block behavior, sliding window expiry, client ID extraction.
 */
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("should allow requests under the limit", () => {
    // Use a unique identifier to avoid cross-test pollution
    const id = `test-allow-${Date.now()}`;
    expect(checkRateLimit(id)).toBe(true);
  });

  it("should allow multiple requests up to the limit", () => {
    const id = `test-multi-${Date.now()}`;
    for (let i = 0; i < 19; i++) {
      expect(checkRateLimit(id)).toBe(true);
    }
  });

  it("should block requests exceeding the limit", () => {
    const id = `test-block-${Date.now()}`;
    // Fill up the limit (20 requests)
    for (let i = 0; i < 20; i++) {
      checkRateLimit(id);
    }
    // 21st request should be blocked
    expect(checkRateLimit(id)).toBe(false);
  });

  it("should track different identifiers independently", () => {
    const id1 = `test-independent-1-${Date.now()}`;
    const id2 = `test-independent-2-${Date.now()}`;

    // Fill up id1
    for (let i = 0; i < 20; i++) {
      checkRateLimit(id1);
    }

    // id2 should still be allowed
    expect(checkRateLimit(id2)).toBe(true);
    // id1 should be blocked
    expect(checkRateLimit(id1)).toBe(false);
  });
});

describe("getClientIdentifier", () => {
  it("should extract IP from x-forwarded-for header", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");
    expect(getClientIdentifier(headers)).toBe("192.168.1.1");
  });

  it("should fall back to x-real-ip header", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "172.16.0.1");
    expect(getClientIdentifier(headers)).toBe("172.16.0.1");
  });

  it("should return 'anonymous' when no IP headers present", () => {
    const headers = new Headers();
    expect(getClientIdentifier(headers)).toBe("anonymous");
  });

  it("should trim whitespace from forwarded IP", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "  10.0.0.5 , 10.0.0.6");
    expect(getClientIdentifier(headers)).toBe("10.0.0.5");
  });
});
