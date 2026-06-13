import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prepType = "Exam",
      targetGoal,
      skillLevel = "Intermediate",
      targetDate = "",
      hoursPerDay = 4,
      strengths = "",
      weaknesses = "",
      notes = ""
    } = body;

    if (!targetGoal || targetGoal.trim().length === 0) {
      return NextResponse.json({ error: "Target goal is required" }, { status: 400 });
    }

    const hoursNum = Number(hoursPerDay);
    if (hoursNum < 1 || hoursNum > 16) {
      return NextResponse.json({ error: "Hours per day must be between 1 and 16" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return high-fidelity sandbox mock data customized to their exact form choices!
      const mockResult = generateMockRoadmap(body);
      return NextResponse.json(mockResult);
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a professional academic mentor, agile study coach, and student stress manager.
Analyze the student's preparation profile and generate a comprehensive study roadmap.
You MUST output your response ONLY in JSON format matching the following schema:
{
  "coachTitle": "string (e.g. Personalized UPSC Preparation Roadmap)",
  "summary": "string (a warm, encouraging, and highly specific summary paragraph)",
  "weeklySchedule": [
    {
      "week": "string (e.g., Week 1-2: Foundations)",
      "milestones": ["string (3-4 milestones)"],
      "wellnessFocus": "string (a mindfulness advice specific to this week's goals)"
    }
  ],
  "strengthMaximizer": "string (how they can leverage their strengths)",
  "weaknessMitigation": "string (concrete ways to overcome their weaknesses)",
  "dailyRoutineSplits": {
    "studyHours": number,
    "breakHours": number,
    "mindfulnessMinutes": number,
    "outline": ["string (e.g., 9:00 AM - 11:00 AM: Focus study block)"]
  }
}
Provide a 4-week weeklySchedule breakdown. Ratios of dailyRoutineSplits should reflect their available hours per day (${hoursPerDay}) plus suggest adequate breaks and mindfulness.`;

    const userPrompt = `Student Profile for Coach Analysis:
- Preparing for: ${prepType}
- Target Goal/Role: ${targetGoal}
- Current Skill Level: ${skillLevel}
- Target Completion Date: ${targetDate}
- Available Study Hours/Day: ${hoursPerDay} hours
- Strengths: ${strengths}
- Weaknesses: ${weaknesses}
- Additional Notes: ${notes}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
  } catch (error: unknown) {
    console.error("AI Coach API Error:", error);
    return NextResponse.json(
      { error: "Error communicating with AI Coach.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Generates highly tailored simulated study roadmaps
function generateMockRoadmap(body: Record<string, unknown>) {
  const prepType = (body.prepType as string) || "Exam";
  const targetGoal = (body.targetGoal as string) || "UPSC";
  const skillLevel = (body.skillLevel as string) || "Intermediate";
  const hoursPerDay = (body.hoursPerDay as number) || 4;
  const strengths = (body.strengths as string) || "Determination";
  const weaknesses = (body.weaknesses as string) || "Time management";

  const study = Number(hoursPerDay);
  // Recommend breaks and mindfulness based on study hours
  const mindfulness = study > 6 ? 30 : 15;
  const breaks = Math.max(1, Math.round(study * 0.3));

  const coachTitle = `Personalized ${targetGoal} ${prepType} Strategy`;
  const summary = `Welcome to your AI Coach portal! Preparing for your ${targetGoal} ${prepType.toLowerCase()} as a ${skillLevel.toLowerCase()} is an exciting milestone. With an average of ${study} study hours available daily, we have created a balanced, sustainable path that prioritizes both high-yield learning and burnout prevention. We've structured this specifically to leverage your strength in "${strengths || "commitment"}" while putting concrete systems in place to tackle your blocker of "${weaknesses || "exam pressure"}".`;

  const weeklySchedule = [
    {
      week: "Week 1: Baseline Audit & Foundations",
      milestones: [
        `Complete a full syllabus diagnostic mock test to isolate high-yield subjects.`,
        `Draft core summary sheets for basic concepts (Focus: 60% theory, 40% practice).`,
        `Set up daily Pomodoro logs to monitor focus levels.`
      ],
      wellnessFocus: "Establish a hard cut-off study time. Practice 4-7-8 breathing when starting your study blocks to clear background thoughts."
    },
    {
      week: "Week 2: Deep Dives & Targeted Weakness Sprints",
      milestones: [
        `Dedicate 1.5 hours of your daily study budget to address "${weaknesses || "complex topics"}".`,
        `Master high-weightage topics and compile short revision notes.`,
        `Solve 15-20 subject-specific practice questions every evening.`
      ],
      wellnessFocus: "Introduce 10 minutes of silent walking in nature between your major morning and evening study sessions to digest what you've read."
    },
    {
      week: "Week 3: Practice Endurance & Active Recall",
      milestones: [
        `Run simulated time-bound tests matching the format of ${targetGoal}.`,
        `Use active recall (Feynman technique) to explain difficult formulas or templates to yourself.`,
        `Audit weak topics discovered during weekly tests and refine notes.`
      ],
      wellnessFocus: "Mock score anxiety might peak this week. Remember mock test marks are diagnostic, not final indicators of your worth."
    },
    {
      week: "Week 4: Revision Refinements & Mental Tapering",
      milestones: [
        `Review only condensed formula files, summary sheets, and weak subjects.`,
        `Avoid starting new, heavy chapters. Focus entirely on consolidating known material.`,
        `Complete one gentle, untimed baseline quiz to build active confidence.`
      ],
      wellnessFocus: "Reduce study hours by 20% in the last 3 days. Focus heavily on sleep hygiene (7+ hours) to ensure peak cognitive performance on exam day."
    }
  ];

  const strengthMaximizer = `Your key strength in **"${strengths || "Determination"}"** is your greatest asset. You can maximize this by starting each study day with your most challenging topic, when your cognitive willpower is highest.`;
  const weaknessMitigation = `To overcome your weakness of **"${weaknesses || "Time management"}"**, use strict micro-goals rather than open-ended study schedules. Set a timer for 45 minutes, turn off all notification distractions, and focus solely on completing one sub-section.`;

  const dailyOutline = [
    `Block 1 (${Math.round(study * 0.6)}h): High-focus learning sprint (Theory & weak subjects)`,
    `Break (${Math.round(breaks * 0.5)}h): Screen-free hydration & physical stretch break`,
    `Block 2 (${Math.round(study * 0.4)}h): Active revision & question solving`,
    `Wellness (${mindfulness}m): Empathetic breathing exercise or meditation session`
  ];

  return {
    coachTitle,
    summary,
    weeklySchedule,
    strengthMaximizer,
    weaknessMitigation,
    dailyRoutineSplits: {
      studyHours: study,
      breakHours: breaks,
      mindfulnessMinutes: mindfulness,
      outline: dailyOutline
    }
  };
}
