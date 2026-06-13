import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { validateTextInput, INPUT_LIMITS } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    if (!checkRateLimit(getClientIdentifier(req.headers))) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const { messages, exam = "Competitive Exams" } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Message history cannot be empty" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1].content;

    const msgValidation = validateTextInput(lastUserMessage, "Message", INPUT_LIMITS.CHAT_MESSAGE);
    if (!msgValidation.valid) {
      return NextResponse.json({ error: msgValidation.error }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback sandbox chatbot responses
      const botResponse = generateMockChatResponse(lastUserMessage, exam);
      return NextResponse.json({ role: "model", content: botResponse });
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are "Asha" (hope), a warm, supportive, and deeply empathetic mental wellness companion for students preparing for high-stakes competitive examinations in India (like JEE, NEET, UPSC, CAT, GATE, Board Exams). 
The student is sharing their feelings and exam preparation stress with you.
Guidelines:
1. Be encouraging, warm, non-judgmental, and validating. Talk to them like a supportive mentor/senior.
2. Keep responses brief (1-3 paragraphs) and readable. Use markdown bullet points if giving advice.
3. Suggest small, practical mindfulness tricks (like deep breathing, stretching, walking) when they are overwhelmed.
4. Target exam: ${exam}. Tailor your advice contextually.
5. Safety: If the student speaks of self-harm, immediately provide resources like:
   - AASRA (91-9820466726)
   - Vandrevala Foundation (91-9999666555)
   State this gently, warmly, and express care.`;

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    const text = response.text || "I'm here for you. Tell me more about what's going on.";

    return NextResponse.json({ role: "model", content: text });
  } catch (error: unknown) {
    console.error("Gemini Chat API Error:", error);
    return NextResponse.json(
      { error: "Error communicating with chatbot.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Empathy-driven fallback chat responder
function generateMockChatResponse(message: string, exam: string): string {
  const lower = message.toLowerCase();

  // Self-harm check (safety fallback)
  if (lower.includes("suicide") || lower.includes("kill myself") || lower.includes("ending my life") || lower.includes("harm myself")) {
    return `Please know that I care about you deeply, and you do not have to carry this heavy burden alone. You are valuable, and your life is worth so much more than any exam or rank. 

Please reach out to people who can help you right now:
* **AASRA Helpline:** +91-9820466726 (24/7, Free and Confidential)
* **Vandrevala Foundation:** +91-9999666555

Please talk to your parents, a trusted friend, or a teacher, or contact these helplines immediately. I'm sending you all my support.`;
  }

  // Keywords logic
  if (lower.includes("mock") || lower.includes("test") || lower.includes("score") || lower.includes("marks")) {
    return `Mock test scores can be incredibly disheartening, but please remember: **mock tests are diagnostic, not predictive.** 

Their purpose is simply to point out what gaps you need to fill. In a mock test, a wrong answer is actually a gift—it shows you exactly what concept to fix before the actual ${exam} day. 

For the next 24 hours, try not to look at your mock percentile. Focus on analyzing just **three specific questions** you got wrong and master those concepts. You are growing with every mistake! How does that sound?`;
  }

  if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted") || lower.includes("concentration") || lower.includes("focus")) {
    return `Exam exhaustion is very real. When we skip sleep, the brain's prefrontal cortex (responsible for logical reasoning and recall) starts slowing down. Trying to study JEE/NEET concepts when sleep-deprived is like trying to drive a car with no fuel.

Here is a quick challenge for you:
1. Take a 15-minute break right now. Go drink a cold glass of water and stretch your shoulders.
2. Commit to shutting down your books by 11:00 PM tonight. 

Your brain consolidates memory during sleep. Rest is not waste; it is part of your preparation. Shall we try setting a sleep boundary tonight?`;
  }

  if (lower.includes("parent") || lower.includes("expect") || lower.includes("pressure") || lower.includes("father") || lower.includes("mother")) {
    return `Family expectations can feel like a heavy weight on your chest. Often, parents push us because they fear for our future security, but they might not realize how much pressure that creates for competitive exams like ${exam}.

It is completely valid to feel stressed by this. Remember, your exams will determine *where* you go next, but they do *not* define *who* you are or how much you are worth as a person. 

If you feel comfortable, you might say to them, *"I am working really hard for my exam, but sometimes when we talk about ranks, I get very anxious and it makes it harder to focus. I just need your support."* 

No matter what, I am in your corner. Let's take a slow, deep breath together. Inhale for 4 seconds... and exhale.`;
  }

  if (lower.includes("syllabus") || lower.includes("backlog") || lower.includes("forgot") || lower.includes("can't remember")) {
    return `Syllabus anxiety is one of the biggest stress triggers. When you look at the entire mountain of topics for ${exam}, it's easy to freeze up.

Let's break the mountain into stepping stones:
* **Create a 'Micro-Schedule':** Instead of thinking about the whole chapter, decide to master just *one sub-topic* or *5 previous year questions (PYQs)* in the next hour.
* **Stop active study and do a 2-minute dump:** Grab a blank page and scribble down everything you remember about a topic. This boosts active recall and builds confidence.

Which specific small topic or formula would you like to review next? Let's keep it small!`;
  }

  if (lower.includes("anxious") || lower.includes("scared") || lower.includes("panic") || lower.includes("fear")) {
    return `I hear you, and it is completely okay to feel anxious. Anxiety is just your body's survival mechanism firing up because it knows this exam is important to you. But we can help calm your nervous system.

Let's do a quick **5-4-3-2-1 grounding exercise** right where you are sitting:
1. Name **5 things** you can see in your room.
2. Name **4 things** you can physically feel (e.g., your feet on the floor, the chair beneath you).
3. Name **3 things** you can hear (e.g., the hum of the fan, traffic outside).
4. Name **2 things** you can smell.
5. Name **1 thing** you can taste or positive thought you can tell yourself.

This brings your brain back to the present moment, away from the future exam. How do you feel after doing that?`;
  }

  // Base empathetic response
  return `Thank you for sharing that with me. Preparing for ${exam} is one of the most intense times in a student's life, and you are doing an incredible job just by showing up every day. 

It is completely normal to doubt yourself sometimes, but don't forget to look back at how much you've already learned. 

I'm here to support you. What part of your studies is stressing you out the most today? We can break it down together.`;
}
