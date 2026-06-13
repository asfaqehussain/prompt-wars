import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { validateTextInput, INPUT_LIMITS } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(getClientIdentifier(req.headers))) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const { journalText, exam = "General Competitive Exams" } = await req.json();

    if (!journalText || journalText.trim().length === 0) {
      return NextResponse.json({ error: "Journal entry cannot be empty" }, { status: 400 });
    }

    const textValidation = validateTextInput(journalText, "Journal entry", INPUT_LIMITS.JOURNAL_TEXT);
    if (!textValidation.valid) {
      return NextResponse.json({ error: textValidation.error }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return highly realistic mock data tailored to the text if API key is not present
      const mockResult = generateMockAnalysis(journalText, exam);
      return NextResponse.json(mockResult);
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a professional student wellness counselor and stress analyzer. 
Analyze the student's daily journal entry. 
Identify the primary emotion, the stress level (0 to 100), hidden stress triggers (such as Mock mock tests, time management, expectations, syllabus weightage), and provide 3 highly actionable, empathetic coping strategies.
Return your response ONLY in JSON format matching the following schema structure:
{
  "stressScore": number,
  "primaryEmotion": "string",
  "triggers": ["string"],
  "copingStrategies": ["string"],
  "encouragement": "string"
}
Ensure the encouragement is deeply empathetic, recognizing their hard work towards their target exam (${exam}) and encouraging them.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Student Journal entry for exam ${exam}:\n"${journalText}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Error communicating with AI. Falling back to safe analysis.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Empathy-driven fallback sandbox generator
function generateMockAnalysis(text: string, exam: string) {
  const lower = text.toLowerCase();
  let stressScore = 45;
  let primaryEmotion = "Determined but Anxious";
  const triggers: string[] = [];
  const copingStrategies: string[] = [];

  // Match keyword triggers
  if (lower.includes("mock") || lower.includes("test") || lower.includes("score") || lower.includes("marks")) {
    stressScore += 25;
    triggers.push("Mock Test Performance");
    copingStrategies.push("Isolate low scores as diagnostic tools, not predictions of success. Focus on reviewing wrong answers rather than worrying about the total score.");
  }
  if (lower.includes("parent") || lower.includes("expect") || lower.includes("father") || lower.includes("mother") || lower.includes("family")) {
    stressScore += 15;
    triggers.push("Family Expectations & Pressure");
    copingStrategies.push("Remind yourself that your family wants you to succeed because they care about you, but your worth is not tied to a test score. Consider sharing your feelings with them.");
  }
  if (lower.includes("time") || lower.includes("schedule") || lower.includes("backlog") || lower.includes(" syllabus") || lower.includes("hours")) {
    stressScore += 20;
    triggers.push("Syllabus Load & Backlog Stress");
    copingStrategies.push("Divide your study schedule into tiny 25-minute Pomodoro sprints. Tackle one topic at a time instead of viewing the entire syllabus at once.");
  }
  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("burn") || lower.includes("night")) {
    stressScore += 15;
    triggers.push("Sleep Deprivation & Physical Burnout");
    copingStrategies.push("Enforce a hard cut-off time for studies. Try to get at least 6.5 hours of continuous sleep to let your brain consolidate what you've learned.");
  }
  if (lower.includes("fail") || lower.includes("can't do") || lower.includes("give up") || lower.includes("worry") || lower.includes("fear")) {
    stressScore += 25;
    triggers.push("Imposter Syndrome / Fear of Failure");
    copingStrategies.push("Keep a 'win journal' of small topics you've mastered this week. Challenge negative self-talk by listing concrete concepts you know well.");
  }

  // Base triggers if none matched
  if (triggers.length === 0) {
    triggers.push("Exam Preparation Intensity");
    copingStrategies.push("Designate 30 minutes of screen-free winding-down time before going to sleep.");
    copingStrategies.push("Break revision into small chunks using micro-goals.");
  }

  // Cap stress score
  stressScore = Math.min(stressScore, 98);
  if (stressScore > 75) {
    primaryEmotion = "Exhausted / High Stress";
  } else if (stressScore > 50) {
    primaryEmotion = "Stressed and Overwhelmed";
  } else if (stressScore > 35) {
    primaryEmotion = "Mild Exam Anxiety";
  } else {
    primaryEmotion = "Calm and Focused";
    copingStrategies.push("Maintain your current flow. You are keeping stress levels well-balanced.");
  }

  // Top off coping strategies list to ensure we always have 3
  if (copingStrategies.length < 3) {
    copingStrategies.push("Take a brisk 10-minute walk outside or practice 4-7-8 deep breathing during study breaks to reset your focus.");
  }
  if (copingStrategies.length < 3) {
    copingStrategies.push("Stay hydrated and limit excessive caffeine intake, which can mimic and heighten physical symptoms of anxiety.");
  }

  // Tailored encouragement
  let encouragement = `You are carrying a heavy responsibility preparing for ${exam}, and it is completely normal to feel stressed. Your dedication is clear in your writing. Remember, the journey towards this goal builds resilience that goes far beyond any single exam day. Take it one day, one concept at a time. We are in this together.`;

  if (stressScore > 75) {
    encouragement = `Please pause and take a deep breath. Preparing for ${exam} is a marathon, not a sprint. The high stress you are feeling right now is a signal from your body that it needs rest. Give yourself permission to shut down the books for the next few hours. Resting is active preparation too. You are capable and you are not alone in this.`;
  } else if (stressScore < 40) {
    encouragement = `You are maintaining an excellent, balanced mindset towards your ${exam} preparation! Keep up this healthy approach. Remember to celebrate small milestones along the way. You're doing great.`;
  }

  return {
    stressScore,
    primaryEmotion,
    triggers,
    copingStrategies: copingStrategies.slice(0, 3),
    encouragement
  };
}
