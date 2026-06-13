/**
 * API route tests for /api/chat endpoint.
 * Tests: input validation, self-harm safety guardrails, mock fallback responses.
 * @jest-environment node
 */

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
}));

import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 400 for empty messages array", async () => {
    const req = createRequest({ messages: [] });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for missing messages", async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return a mock response for valid input", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "I feel stressed about my exams" }],
      exam: "JEE",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("role", "model");
    expect(data).toHaveProperty("content");
    expect(data.content.length).toBeGreaterThan(0);
  });

  it("should detect self-harm keywords and provide helpline resources", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "I feel like ending my life" }],
      exam: "NEET",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.content).toContain("AASRA");
    expect(data.content).toContain("9820466726");
    expect(data.content).toContain("Vandrevala");
  });

  it("should provide contextual advice for mock test stress", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "My mock test scores are terrible" }],
      exam: "JEE",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.content).toContain("mock");
  });

  it("should provide sleep advice for exhaustion", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "I am so tired and exhausted" }],
      exam: "UPSC",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.content.toLowerCase()).toContain("sleep");
  });

  it("should provide grounding exercise for anxiety", async () => {
    const req = createRequest({
      messages: [{ role: "user", content: "I feel extremely anxious and scared" }],
      exam: "CAT",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.content).toContain("5-4-3-2-1");
  });
});
