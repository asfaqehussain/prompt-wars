/**
 * API route tests for /api/wellness endpoint.
 * Tests: input validation, mock fallback, error handling.
 * @jest-environment node
 */

// Mock the GoogleGenAI module
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
}));

import { POST } from "@/app/api/wellness/route";
import { NextRequest } from "next/server";

/** Helper to create a mock NextRequest with JSON body. */
function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/wellness", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/wellness", () => {
  // Clear env to ensure mock mode
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 400 for empty journal text", async () => {
    const req = createRequest({ journalText: "" });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("cannot be empty");
  });

  it("should return 400 for missing journal text", async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for excessively long journal text", async () => {
    const req = createRequest({ journalText: "a".repeat(5001) });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("exceeds the maximum length");
  });

  it("should return mock analysis for valid input without API key", async () => {
    const req = createRequest({
      journalText: "I feel overwhelmed by my mock test scores",
      exam: "JEE",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("stressScore");
    expect(data).toHaveProperty("primaryEmotion");
    expect(data).toHaveProperty("triggers");
    expect(data).toHaveProperty("copingStrategies");
    expect(data).toHaveProperty("encouragement");
    expect(data.triggers.length).toBeGreaterThan(0);
    expect(data.copingStrategies.length).toBeLessThanOrEqual(3);
  });

  it("should detect mock test stress triggers", async () => {
    const req = createRequest({
      journalText: "My mock test score dropped again",
      exam: "NEET",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.triggers).toContain("Mock Test Performance");
    expect(data.stressScore).toBeGreaterThan(45);
  });

  it("should detect family pressure triggers", async () => {
    const req = createRequest({
      journalText: "My parents expect me to get into IIT",
      exam: "JEE",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.triggers).toContain("Family Expectations & Pressure");
  });

  it("should detect sleep/burnout triggers", async () => {
    const req = createRequest({
      journalText: "I am so exhausted I couldn't sleep last night",
      exam: "UPSC",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.triggers).toContain("Sleep Deprivation & Physical Burnout");
  });

  it("should cap stress score at 98", async () => {
    const req = createRequest({
      journalText: "I failed the mock test and I can't sleep. My parents expect too much. I have so much syllabus backlog and I fear I will fail.",
      exam: "NEET",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.stressScore).toBeLessThanOrEqual(98);
  });
});
