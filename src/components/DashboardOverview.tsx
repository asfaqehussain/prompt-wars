"use client";

import type { MoodLog, CoachPlan } from "@/lib/types";

interface DashboardOverviewProps {
  exam: string;
  setExam: (exam: string) => void;
  logs: MoodLog[];
  onNavigateToTab: (tab: string) => void;
  activePlan?: CoachPlan | null;
}

export default function DashboardOverview({
  exam,
  setExam,
  logs,
  onNavigateToTab,
  activePlan,
}: DashboardOverviewProps) {
  // Calculate average stress score
  const latestLog = logs[0];
  const averageStress = logs.length > 0
    ? Math.round(logs.reduce((acc, l) => acc + l.stressScore, 0) / logs.length)
    : 0;

  // Stress Level categorization details
  let stressLevelLabel = "Balanced";
  let stressColor = "var(--stress-low)";
  let stressAdvice = "You are maintaining a great balance. Keep doing what you are doing!";

  if (averageStress > 75) {
    stressLevelLabel = "High Stress / Burnout Danger";
    stressColor = "var(--stress-high)";
    stressAdvice = "Your body is showing signs of extreme fatigue. Please prioritize rest today.";
  } else if (averageStress > 45) {
    stressLevelLabel = "Moderate Exam Anxiety";
    stressColor = "var(--stress-med)";
    stressAdvice = "Slightly elevated stress. Perfect time for a brief 5-minute breathing session.";
  }

  // Predefined exam options
  const exams = ["JEE Main/Advanced", "NEET", "UPSC Civil Services", "CAT (IIMs)", "GATE", "Board Exams (10th/12th)", "General Studies"];

  // SVG dimensions for history graph
  const width = 500;
  const height = 150;
  const padding = 30;

  // Generate SVG coordinates for history graph
  const points = logs
    .slice()
    .reverse()
    .map((log, index) => {
      if (logs.length === 0) return { x: 0, y: 0 };
      const x = padding + (index * (width - padding * 2)) / Math.max(logs.length - 1, 1);
      // y-axis is inverted: 0 is at top, height is at bottom. Stress score 100 should be near the top (y=20), score 0 near bottom (y=height-padding)
      const y = height - padding - (log.stressScore * (height - padding * 2)) / 100;
      return { x, y, score: log.stressScore, date: log.date };
    });

  // Create SVG path string
  const pathD = points.length > 1
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
    : "";

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Profile / Exam Target Config */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "14px", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>Wellness Companion</span>
          <h2 style={{ fontSize: "28px", marginTop: "4px" }}>Welcome Back, <span className="gradient-text">Aspirant</span></h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>Let&apos;s balance your preparation stress and mental focus.</p>
        </div>
        <div style={{ minWidth: "200px" }}>
          <label htmlFor="exam-select" style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>Select your target exam</label>
          <select
            id="exam-select"
            className="glass-input"
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            style={{ padding: "10px", fontSize: "14px" }}
          >
            {exams.map((ex) => (
              <option key={ex} value={ex} style={{ background: "#0b0d19", color: "#fff" }}>{ex}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stats Widgets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Stress Meter Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
          <h3 style={{ alignSelf: "flex-start", marginBottom: "16px", fontSize: "18px" }}>Stress index Meter</h3>
          
          <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            {/* SVG Arc Gauge */}
              <svg width="160" height="160" viewBox="0 0 160 160" aria-label="Stress trend chart">
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="10"
              />
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke={stressColor}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 65}`}
                strokeDashoffset={`${2 * Math.PI * 65 * (1 - averageStress / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
              />
            </svg>
            <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "36px", fontWeight: "800", fontFamily: "var(--font-display)" }}>{averageStress}%</span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px" }}>Stress Score</span>
            </div>
          </div>

          <h4 style={{ color: stressColor, fontSize: "16px", marginBottom: "8px" }}>{stressLevelLabel}</h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "260px" }}>{stressAdvice}</p>
        </div>

        {/* Emotion / Current State Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "18px" }}>Latest Emotional Diagnosis</h3>
          {latestLog ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    🧘
                  </div>
                  <div>
                    <h4 style={{ fontSize: "15px" }}>Primary State</h4>
                    <p style={{ color: "var(--primary)", fontWeight: "500", fontSize: "14px" }}>{latestLog.emotion}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    📅
                  </div>
                  <div>
                    <h4 style={{ fontSize: "15px" }}>Logged On</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{latestLog.date}</p>
                  </div>
                </div>
              </div>
              <button 
                id="dashboard-log-entry-btn"
                className="premium-btn" 
                onClick={() => onNavigateToTab("journal")}
                style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "flex-start", marginTop: "16px" }}
                aria-label="Log a new journal entry"
              >
                Log New Entry
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", justifySelf: "center", textAlign: "center", padding: "20px 0", gap: "12px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No wellness log logged today. Write in your stress journal to analyze triggers!</p>
              <button 
                className="premium-btn" 
                onClick={() => onNavigateToTab("journal")}
                style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "center" }}
              >
                Write First Log
              </button>
            </div>
          )}
        </div>

        {/* AI Preparation Coach Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>AI Study Coach & Planner</h3>
            {activePlan ? (
              <div>
                <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: "500", marginBottom: "6px" }}>
                  🎯 Active: {activePlan.coachTitle}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Your study budget is set to **{activePlan.dailyRoutineSplits?.studyHours || 4} hours/day**. 
                  Open the coach view to check weekly milestones.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Analyze your target dates, daily schedule, and strengths/weaknesses to get a personalized weekly roadmap and daily time budget splits.
              </p>
            )}
          </div>
          <button 
            id="dashboard-coach-btn"
            className="premium-btn" 
            onClick={() => onNavigateToTab("coach")}
            style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "flex-start" }}
          >
            {activePlan ? "View Active Roadmap" : "Start Analysis"}
          </button>
        </div>
      </div>

      {/* Mood/Stress History Visualizer (SVG) */}
      <div className="glass-card">
        <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>5-Log Stress Trend</h3>
        {logs.length > 1 ? (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "500px", position: "relative" }}>
              <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
                {/* Horizontal reference grid lines */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x={padding - 10} y={padding + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">100%</text>
                <text x={padding - 10} y={height / 2 + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">50%</text>
                <text x={padding - 10} y={height - padding + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">0%</text>

                {/* Trend line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data points */}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="var(--accent)"
                      stroke="var(--bg-gradient-start)"
                      strokeWidth="2"
                    />
                    {/* Tooltip score label */}
                    <text
                      x={p.x}
                      y={p.y - 12}
                      fill="var(--text-primary)"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      style={{ background: "#000" }}
                    >
                      {p.score}%
                    </text>
                    {/* Date X-axis label */}
                    <text
                      x={p.x}
                      y={height - 10}
                      fill="var(--text-secondary)"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {p.date}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
            Log journal entries across multiple days to visualize your exam stress trends.
          </p>
        )}
      </div>

      {/* Guided Quick Stress Reliever Cards */}
      <div className="glass-card">
        <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Instant Anxiety Defuser</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div 
            className="glass-card glass-card-interactive" 
            onClick={() => onNavigateToTab("mindfulness")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateToTab("mindfulness"); } }}
            style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }}
            aria-label="Start 4-7-8 Breathing exercise"
            role="button"
            tabIndex={0}
          >
            <span style={{ fontSize: "24px" }}>🌬️</span>
            <div>
              <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>4-7-8 Breathing</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Instant calming in 60s.</p>
            </div>
          </div>
          <div 
            className="glass-card glass-card-interactive" 
            onClick={() => onNavigateToTab("chat")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateToTab("chat"); } }}
            style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label="Talk with Asha"
          >
            <span style={{ fontSize: "24px" }}>💬</span>
            <div>
              <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>Talk with Asha</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Share self-doubt secretly.</p>
            </div>
          </div>
          <div 
            className="glass-card glass-card-interactive" 
            onClick={() => onNavigateToTab("mindfulness")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateToTab("mindfulness"); } }}
            style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label="Open calming soundscapes"
          >
            <span style={{ fontSize: "24px" }}>🎵</span>
            <div>
              <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>Calming Soundscapes</h4>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Study beat ambient mixer.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
