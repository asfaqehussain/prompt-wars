"use client";

import { useState, useEffect } from "react";
import DashboardOverview from "../components/DashboardOverview";
import JournalAnalyzer from "../components/JournalAnalyzer";
import ZenChat from "../components/ZenChat";
import MindfulnessHub from "../components/MindfulnessHub";
import AICoach from "../components/AICoach";
import type { CoachPlan, MoodLog } from "@/lib/types";

export default function Home() {
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
  
  // Pre-populate with realistic mock logs representing JEE/NEET prep stress
  const [logs, setLogs] = useState<MoodLog[]>([
    { date: "Jun 12", stressScore: 78, emotion: "Overwhelmed by Physics backlog" },
    { date: "Jun 11", stressScore: 62, emotion: "Anxious about Mock Test scores" },
    { date: "Jun 10", stressScore: 40, emotion: "Calmer after mindfulness session" },
  ]);

  // Listen to window scroll to adjust floating navbar opacity/scale
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const handleSetActivePlan = (plan: CoachPlan | null) => {
    setActivePlan(plan);
    if (typeof window !== "undefined") {
      if (plan) {
        localStorage.setItem("asha_coach_plan", JSON.stringify(plan));
      } else {
        localStorage.removeItem("asha_coach_plan");
      }
    }
  };

  const handleNewAnalysis = (newLog: MoodLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleTheme = () => {
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
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Premium Top Navigation Bar */}
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

        {/* Right Nav Container */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Desktop Tab Links */}
          <nav style={{ display: "flex", gap: "8px" }} aria-label="Main navigation">
            <button
              id="nav-tab-dashboard"
              className={`tab-button ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => navigateToTab("dashboard")}
              aria-current={activeTab === "dashboard" ? "page" : undefined}
            >
              Dashboard
            </button>
            <button
              id="nav-tab-coach"
              className={`tab-button ${activeTab === "coach" ? "active" : ""}`}
              onClick={() => navigateToTab("coach")}
              aria-current={activeTab === "coach" ? "page" : undefined}
            >
              AI Study Coach
            </button>
            <button
              id="nav-tab-journal"
              className={`tab-button ${activeTab === "journal" ? "active" : ""}`}
              onClick={() => navigateToTab("journal")}
              aria-current={activeTab === "journal" ? "page" : undefined}
            >
              AI Journal Analyzer
            </button>
            <button
              id="nav-tab-chat"
              className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => navigateToTab("chat")}
              aria-current={activeTab === "chat" ? "page" : undefined}
            >
              Asha Chat Companion
            </button>
            <button
              id="nav-tab-mindfulness"
              className={`tab-button ${activeTab === "mindfulness" ? "active" : ""}`}
              onClick={() => navigateToTab("mindfulness")}
              aria-current={activeTab === "mindfulness" ? "page" : undefined}
            >
              Mindfulness Hub
            </button>
          </nav>

          {/* Theme Toggle Button */}
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
              transition: "var(--transition-smooth)"
            }}
            aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main id="main-content" className="main-content" style={{ flex: 1, maxWidth: "1200px", width: "100%", marginLeft: "auto", marginRight: "auto", padding: "24px 16px" }}>
        {activeTab === "dashboard" && (
          <DashboardOverview
            exam={exam}
            setExam={setExam}
            logs={logs}
            onNavigateToTab={navigateToTab}
            activePlan={activePlan}
          />
        )}
        {activeTab === "coach" && (
          <AICoach
            activePlan={activePlan}
            setActivePlan={handleSetActivePlan}
          />
        )}
        {activeTab === "journal" && (
          <JournalAnalyzer
            exam={exam}
            onAnalysisSuccess={handleNewAnalysis}
          />
        )}
        {activeTab === "chat" && (
          <ZenChat
            exam={exam}
          />
        )}
        {activeTab === "mindfulness" && (
          <MindfulnessHub />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "20px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "12px",
          marginTop: "40px"
        }}
      >
        <p>© 2026 Asha Mental Wellness. Proudly developed for the Google Prompt Wars Challenge.</p>
      </footer>
    </div>
  );
}
