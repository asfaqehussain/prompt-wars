/**
 * API route tests for /api/coach endpoint.
 * Tests: input validation, range validation, mock roadmap generation.
 * @jest-environment node
 */

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
}));

import { POST } from "@/app/api/coach/route";
import { NextRequest } from "next/server";

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/coach", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GEMINI_API_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return 400 for missing target goal", async () => {
    const req = createRequest({ hoursPerDay: 4 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for empty target goal", async () => {
    const req = createRequest({ targetGoal: "", hoursPerDay: 4 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return 400 for hoursPerDay below minimum", async () => {
    const req = createRequest({ targetGoal: "JEE", hoursPerDay: 0 });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("between 1 and 16");
  });

  it("should return 400 for hoursPerDay above maximum", async () => {
    const req = createRequest({ targetGoal: "JEE", hoursPerDay: 20 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("should return a valid mock roadmap for valid input", async () => {
    const req = createRequest({
      prepType: "Exam",
      targetGoal: "NEET",
      skillLevel: "Beginner",
      targetDate: "2026-09-01",
      hoursPerDay: 6,
      strengths: "Biology",
      weaknesses: "Chemistry",
      notes: "",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("coachTitle");
    expect(data).toHaveProperty("summary");
    expect(data).toHaveProperty("weeklySchedule");
    expect(data).toHaveProperty("dailyRoutineSplits");
    expect(data.weeklySchedule).toHaveLength(4);
    expect(data.dailyRoutineSplits.studyHours).toBe(6);
  });

  it("should include strength and weakness in roadmap", async () => {
    const req = createRequest({
      targetGoal: "UPSC",
      hoursPerDay: 8,
      strengths: "Current Affairs",
      weaknesses: "Geography",
    });
    const res = await POST(req);
    const data = await res.json();

    expect(data.strengthMaximizer).toContain("Current Affairs");
    expect(data.weaknessMitigation).toContain("Geography");
  });

  it("should calculate appropriate break and mindfulness times", async () => {
    const req = createRequest({
      targetGoal: "GATE",
      hoursPerDay: 8,
    });
    const res = await POST(req);
    const data = await res.json();

    // For 8 hours: breaks should be ~2.4 rounded to 2, mindfulness should be 30 (>6h)
    expect(data.dailyRoutineSplits.breakHours).toBeGreaterThanOrEqual(1);
    expect(data.dailyRoutineSplits.mindfulnessMinutes).toBe(30);
  });

  it("should have wellness focus for each week", async () => {
    const req = createRequest({
      targetGoal: "CAT",
      hoursPerDay: 5,
    });
    const res = await POST(req);
    const data = await res.json();

    data.weeklySchedule.forEach((week: { wellnessFocus?: string }) => {
      expect(week.wellnessFocus).toBeDefined();
      expect(week.wellnessFocus!.length).toBeGreaterThan(0);
    });
  });
});
