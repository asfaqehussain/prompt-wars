"use client";

import { useState, useEffect, useCallback, lazy, Suspense, memo } from "react";
import type { CoachPlan, MoodLog } from "@/lib/types";

const DashboardOverview = lazy(() => import("../components/DashboardOverview"));
const JournalAnalyzer = lazy(() => import("../components/JournalAnalyzer"));
const ZenChat = lazy(() => import("../components/ZenChat"));
const MindfulnessHub = lazy(() => import("../components/MindfulnessHub"));
const AICoach = lazy(() => import("../components/AICoach"));

const FALLBACK = (
  <div role="status" aria-label="Loading section" style={{ display: "flex", justifyContent: "center", padding: "60px", color: "var(--text-secondary)" }}>
    Loading...
  </div>
);

const NAV_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "coach", label: "AI Study Coach" },
  { id: "journal", label: "AI Journal Analyzer" },
  { id: "chat", label: "Asha Chat Companion" },
  { id: "mindfulness", label: "Mindfulness Hub" },
] as const;

function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [exam, setExam] = useState("JEE Main/Advanced");
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("asha_theme");
      if (saved === "light") {
        document.documentElement.classList.add("light-theme");
        document.body.classList.add("light-theme");
        return "light";
      }
    }
    return "dark";
  });
  const [activePlan, setActivePlan] = useState<CoachPlan | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("asha_coach_plan");
        return saved ? (JSON.parse(saved) as CoachPlan) : null;
      } catch { /* ignore */ }
    }
    return null;
  });
  const [scrolled, setScrolled] = useState(false);

  const [logs, setLogs] = useState<MoodLog[]>([
    { date: "Jun 12", stressScore: 78, emotion: "Overwhelmed by Physics backlog" },
    { date: "Jun 11", stressScore: 62, emotion: "Anxious about Mock Test scores" },
    { date: "Jun 10", stressScore: 40, emotion: "Calmer after mindfulness session" },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSetActivePlan = useCallback((plan: CoachPlan | null) => {
    setActivePlan(plan);
    if (typeof window !== "undefined") {
      if (plan) {
        localStorage.setItem("asha_coach_plan", JSON.stringify(plan));
      } else {
        localStorage.removeItem("asha_coach_plan");
      }
    }
  }, []);

  const handleNewAnalysis = useCallback((newLog: MoodLog) => {
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  const navigateToTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      if (nextTheme === "light") {
        document.documentElement.classList.add("light-theme");
        document.body.classList.add("light-theme");
      } else {
        document.documentElement.classList.remove("light-theme");
        document.body.classList.remove("light-theme");
      }
      localStorage.setItem("asha_theme", nextTheme);
    }
  }, [theme]);

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            exam={exam}
            setExam={setExam}
            logs={logs}
            onNavigateToTab={navigateToTab}
            activePlan={activePlan}
          />
        );
      case "coach":
        return <AICoach activePlan={activePlan} setActivePlan={handleSetActivePlan} />;
      case "journal":
        return <JournalAnalyzer exam={exam} onAnalysisSuccess={handleNewAnalysis} />;
      case "chat":
        return <ZenChat exam={exam} />;
      case "mindfulness":
        return <MindfulnessHub />;
      default:
        return null;
    }
  }, [activeTab, exam, logs, activePlan, handleSetActivePlan, handleNewAnalysis, navigateToTab]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header className={`liquid-navbar ${scrolled ? "liquid-navbar-scrolled" : ""}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => navigateToTab("dashboard")}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "bold", color: "#000" }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: "18px", margin: 0, fontWeight: "800", letterSpacing: "0.5px" }} className="gradient-text">Asha</h1>
            <span style={{ fontSize: "10px", color: "var(--text-secondary)", display: "block" }}>GenAI Student Companion</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <nav style={{ display: "flex", gap: "8px" }} aria-label="Main navigation">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => navigateToTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "16px",
              color: "var(--text-primary)",
              transition: "var(--transition-smooth)",
            }}
            aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main id="main-content" className="main-content" aria-live="polite" aria-label="Main application content" style={{ flex: 1, maxWidth: "1200px", width: "100%", marginLeft: "auto", marginRight: "auto", padding: "24px 16px" }}>
        <Suspense fallback={FALLBACK}>
          {renderTab()}
        </Suspense>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "20px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "12px",
          marginTop: "40px",
        }}
      >
        <p>© 2026 Asha Mental Wellness. Proudly developed for the Google Prompt Wars Challenge.</p>
      </footer>
    </div>
  );
}

export default memo(Home);
