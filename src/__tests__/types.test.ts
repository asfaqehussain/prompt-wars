/**
 * Unit tests for shared TypeScript type definitions.
 * Validates that type interfaces are structurally correct by testing
 * object conformance at runtime.
 */
import type {
  MoodLog,
  AnalysisResult,
  ChatMessage,
  CoachFormData,
  CoachPlan,
  DailyRoutineSplits,
  WeeklySchedule,
} from "@/lib/types";

describe("Type Definitions", () => {
  it("should create a valid MoodLog", () => {
    const log: MoodLog = {
      date: "Jun 12",
      stressScore: 72,
      emotion: "Anxious about mock tests",
    };
    expect(log.date).toBe("Jun 12");
    expect(log.stressScore).toBe(72);
    expect(log.emotion).toContain("Anxious");
  });

  it("should create a valid AnalysisResult", () => {
    const result: AnalysisResult = {
      stressScore: 65,
      primaryEmotion: "Stressed and Overwhelmed",
      triggers: ["Mock Test Performance", "Family Pressure"],
      copingStrategies: ["Take a walk", "Practice breathing", "Sleep early"],
      encouragement: "You are doing great!",
    };
    expect(result.triggers).toHaveLength(2);
    expect(result.copingStrategies).toHaveLength(3);
    expect(result.stressScore).toBeGreaterThanOrEqual(0);
    expect(result.stressScore).toBeLessThanOrEqual(100);
  });

  it("should create valid ChatMessage objects", () => {
    const userMsg: ChatMessage = { role: "user", content: "I feel stressed" };
    const botMsg: ChatMessage = { role: "model", content: "I hear you" };
    expect(userMsg.role).toBe("user");
    expect(botMsg.role).toBe("model");
  });

  it("should create a valid CoachFormData", () => {
    const form: CoachFormData = {
      prepType: "Exam",
      targetGoal: "NEET",
      skillLevel: "Intermediate",
      targetDate: "2026-08-01",
      hoursPerDay: "6",
      strengths: "Biology concepts",
      weaknesses: "Time management",
      notes: "",
    };
    expect(form.prepType).toBe("Exam");
    expect(form.targetGoal).toBe("NEET");
  });

  it("should create a valid CoachPlan with weekly schedule", () => {
    const week: WeeklySchedule = {
      week: "Week 1: Foundations",
      milestones: ["Complete diagnostic test", "Draft summary sheets"],
      wellnessFocus: "Practice 4-7-8 breathing",
    };

    const splits: DailyRoutineSplits = {
      studyHours: 6,
      breakHours: 2,
      mindfulnessMinutes: 15,
      outline: ["Block 1: Theory", "Block 2: Practice"],
    };

    const plan: CoachPlan = {
      coachTitle: "NEET Preparation Roadmap",
      summary: "A balanced 4-week plan",
      weeklySchedule: [week],
      strengthMaximizer: "Leverage your biology strength",
      weaknessMitigation: "Use micro-goals for time management",
      dailyRoutineSplits: splits,
    };

    expect(plan.weeklySchedule).toHaveLength(1);
    expect(plan.dailyRoutineSplits.studyHours).toBe(6);
    expect(plan.coachTitle).toContain("NEET");
  });
});
