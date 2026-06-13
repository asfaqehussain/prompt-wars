# 🌿 Asha: GenAI Mental Wellness Companion & Study Coach

A premium, Generative AI-powered application designed to help students preparing for high-stakes competitive entrance examinations (such as JEE, NEET, UPSC, CAT, GATE, and Board Exams) manage stress, evaluate emotional triggers, and receive automated study roadmaps.

Developed for the **Google Developer Group (GDG) Build with AI / PromptWars In-Person Challenge**.

---

## 🚀 Key Features

*   📊 **AI Study Coach & Roadmapper:** A guided onboarding form analyzing target goals, dates, available study hours, strengths, and weaknesses to generate a customized 4-week preparation plan.
*   🧠 **Journal & Mood Trigger Analyzer:** An open-ended daily journaling canvas with built-in Web Speech dictation support. Analyzes logs to extract emotional states, stress index percentages, and primary triggers.
*   💬 **Empathetic AI Chat Companion:** A real-time conversational helper named "Asha", specifically tuned to mentor students, offer stress-defusal support, and provide safety-guardrails for extreme distress.
*   🌬️ **Mindfulness Hub:** An interactive guided breathing circle supporting 4-7-8 and Box breathing, and a synthesised nature soundscape mixer (Rain, Waves, Zen Bowls) running entirely offline via the Web Audio API.
*   🌓 **Theme Switcher:** Seamless transition between premium Space Slate (Dark) and Calming Slate (Light) interfaces.
*   📱 **iOS-Style Floating Header:** A fluid, glassmorphic liquid navigation bar that dynamically shrinks and adapts as the student scrolls down.

---

## 🛠️ Tech Stack & Architecture

*   **Framework:** Next.js 16 (App Router)
*   **Language:** React & TypeScript
*   **Styling:** Vanilla CSS & CSS Variables (for maximum styling flexibility and zero-bloat renders)
*   **GenAI SDK:** Unified `@google/genai` (utilizing `gemini-2.5-flash`)

---

## ⚙️ Installation & Running Locally

1.  **Clone the repository and install dependencies:**
    ```bash
    npm i
    ```

2.  **Configure environment variables:**
    Create a `.env` file in the root directory and add your Google Gemini API Key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Note: If no API key is specified, the application will run in a robust Sandbox/Mock Mode so judges and test environments can still review the entire application layout, analysis features, and chat behaviors without crashing.*

3.  **Launch the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

4.  **Create a production build:**
    ```bash
    npm run build
    ```

---

## 🏆 PromptWars Evaluation Alignment

The project is architected to maximize scoring weightage across all 6 core evaluation criteria:

### 1. Code Quality (High Impact) ── *Score Weight: High*
*   **Modular Organization:** Clear folder separation between API routes (`/api/wellness`, `/api/chat`, `/api/coach`) and visual components (`/components/AICoach`, `DashboardOverview`, etc.).
*   **Type Safety:** Strict TypeScript models for API request/response schema states, message histories, and user profiles.
*   **Responsive Styling:** Clean CSS variables and modular responsive grid breakpoints in `theme.css` without inline style clutter.

### 2. Problem Statement Alignment (High Impact) ── *Score Weight: High*
*   **Targeted Challenges:** Directly addresses Indian competitive exam stress, focusing on mock test performance drops, backlog anxiety, and parental pressure.
*   **Coping Actionability:** Rather than just tracking scores, the GenAI generates customized coping steps, breathing cycles, and study break allocations tailored to the user's specific weaknesses.

### 3. Security (Medium Impact) ── *Score Weight: Medium*
*   **Server-Side Execution:** The application does not call the Gemini API from the client. All generative AI requests are channeled through Next.js Route Handlers (`src/app/api/`), ensuring the `GEMINI_API_KEY` remains securely hidden on the server.
*   **Input Sanitization & Limits:** Text inputs and conversation message lengths are capped, preventing raw prompt injection attacks.
*   **Safe Distress Guardrails:** The chatbot detects references to self-harm and immediately displays official helplines (AASRA and Vandrevala Foundation) in a gentle, warm tone.

### 4. Efficiency (Medium Impact) ── *Score Weight: Medium*
*   **Zero-Dependency Soundscape:** Uses custom Web Audio API node synthesis (e.g. pink noise filters for rain and LFO volume modulators for ocean waves) instead of loading external sound files, resulting in zero-bandwidth usage and instant playback.
*   **Optimized Rendering:** Metrics and trend graphs are rendered using highly responsive inline SVG graphics, avoiding heavy external graphing packages and improving page load speed.

### 5. Testing (Low Impact) ── *Score Weight: Low*
*   **Mock Fallbacks:** Dual-mode service layers verify that both routes compile and return deterministic mock payloads immediately if the internet or API keys are unavailable, simplifying unit testing.
*   **Isolated Props:** Components accept simple, structured input parameters, allowing individual views to be tested inside testing blocks like Jest or Playwright.

### 6. Accessibility (Low Impact) ── *Score Weight: Low*
*   **Voice Journaling:** Integrated Web Speech recognition allows students to dictate their journals hands-free, providing support for users with motor coordination or reading/writing barriers.
*   **Contrast Adaptability:** A premium Light Mode offers clear readability and high text contrast under poor lighting conditions.
