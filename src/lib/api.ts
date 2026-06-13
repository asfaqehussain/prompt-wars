import type { AnalysisResult, CoachPlan, ChatMessage } from "./types";

const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(url: string, body: unknown): string {
  return `${url}:${JSON.stringify(body)}`;
}

function getFromCache<T>(key: string): T | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function setCache(key: string, data: unknown): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    /* storage full */
  }
}

async function apiRequest<T>(url: string, body: unknown): Promise<T> {
  const cacheKey = getCacheKey(url, body);
  const cached = getFromCache<T>(cacheKey);
  if (cached) return cached;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");

  setCache(cacheKey, data);
  return data as T;
}

export async function analyzeJournal(journalText: string, exam: string) {
  return apiRequest<AnalysisResult>("/api/wellness", { journalText, exam });
}

export async function sendChatMessage(messages: ChatMessage[], exam: string) {
  return apiRequest<{ role: string; content: string }>("/api/chat", { messages, exam });
}

export async function generateCoachRoadmap(formData: Record<string, unknown>) {
  return apiRequest<CoachPlan>("/api/coach", formData);
}
