import type { MoodLog } from "./types";

export function calculateAverageStress(logs: MoodLog[]): number {
  if (logs.length === 0) return 0;
  return Math.round(logs.reduce((acc, l) => acc + l.stressScore, 0) / logs.length);
}

export function getStressLevel(score: number): { label: string; color: string; advice: string } {
  if (score > 75) return {
    label: "High Stress / Burnout Danger",
    color: "var(--stress-high)",
    advice: "Your body is showing signs of extreme fatigue. Please prioritize rest today.",
  };
  if (score > 45) return {
    label: "Moderate Exam Anxiety",
    color: "var(--stress-med)",
    advice: "Slightly elevated stress. Perfect time for a brief 5-minute breathing session.",
  };
  return {
    label: "Balanced",
    color: "var(--stress-low)",
    advice: "You are maintaining a great balance. Keep doing what you are doing!",
  };
}

export function getReadinessScore(logs: MoodLog[]): number {
  if (logs.length < 1) return 85;
  const recent = logs.slice(0, 3);
  const avgStress = calculateAverageStress(recent);
  return Math.max(20, Math.min(100, 100 - avgStress + 15));
}

export function getStressColor(score: number): string {
  if (score > 75) return "var(--stress-high)";
  if (score > 45) return "var(--stress-med)";
  return "var(--stress-low)";
}
