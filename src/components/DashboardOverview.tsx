"use client";

import { useMemo, useCallback, memo } from "react";
import type { MoodLog, CoachPlan } from "@/lib/types";
import { calculateAverageStress, getStressLevel, getReadinessScore } from "@/lib/utils";

interface DashboardOverviewProps {
  exam: string;
  setExam: (exam: string) => void;
  logs: MoodLog[];
  onNavigateToTab: (tab: string) => void;
  activePlan?: CoachPlan | null;
}

const exams = ["JEE Main/Advanced", "NEET", "UPSC Civil Services", "CAT (IIMs)", "GATE", "Board Exams (10th/12th)", "General Studies"] as const;
const SVG_WIDTH = 500;
const SVG_HEIGHT = 150;
const SVG_PADDING = 30;
const EMPTY_LOGS: MoodLog[] = [];

const QUICK_ACTIONS = [
  { icon: "🌬️", title: "4-7-8 Breathing", desc: "Instant calming in 60s.", tab: "mindfulness" },
  { icon: "💬", title: "Talk with Asha", desc: "Share self-doubt secretly.", tab: "chat" },
  { icon: "🎵", title: "Calming Soundscapes", desc: "Study beat ambient mixer.", tab: "mindfulness" },
] as const;

function DashboardOverview({
  exam,
  setExam,
  logs = EMPTY_LOGS,
  onNavigateToTab,
  activePlan,
}: DashboardOverviewProps) {
  const averageStress = useMemo(() => calculateAverageStress(logs), [logs]);
  const stressLevel = useMemo(() => getStressLevel(averageStress), [averageStress]);
  const readinessScore = useMemo(() => getReadinessScore(logs), [logs]);

  const points = useMemo(() => {
    if (logs.length === 0) return [];
    return logs.slice().reverse().map((log, index) => {
      const x = SVG_PADDING + (index * (SVG_WIDTH - SVG_PADDING * 2)) / Math.max(logs.length - 1, 1);
      const y = SVG_HEIGHT - SVG_PADDING - (log.stressScore * (SVG_HEIGHT - SVG_PADDING * 2)) / 100;
      return { x, y, score: log.stressScore, date: log.date };
    });
  }, [logs]);

  const pathD = useMemo(() => {
    if (points.length <= 1) return "";
    return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
  }, [points]);

  const handleNav = useCallback((tab: string) => () => onNavigateToTab(tab), [onNavigateToTab]);

  const latestEmotion = logs[0]?.emotion;
  const latestDate = logs[0]?.date;
  const activeTitle = activePlan?.coachTitle;
  const studyHours = activePlan?.dailyRoutineSplits?.studyHours || 4;

  const totalMilestones = activePlan?.weeklySchedule?.reduce((acc, w) => acc + (w.milestones?.length || 0), 0) || 0;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            aria-label="Select target exam"
            style={{ padding: "10px", fontSize: "14px" }}
          >
            {exams.map((ex) => (
              <option key={ex} value={ex} style={{ background: "#0b0d19", color: "#fff" }}>{ex}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
          <h3 style={{ alignSelf: "flex-start", marginBottom: "16px", fontSize: "18px" }}>Stress Index Meter</h3>
          <div style={{ position: "relative", width: "160px", height: "160px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={`Stress score: ${averageStress} percent`}>
              <circle cx="80" cy="80" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle cx="80" cy="80" r="65" fill="none" stroke={stressLevel.color} strokeWidth="10"
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
          <h4 style={{ color: stressLevel.color, fontSize: "16px", marginBottom: "8px" }}>{stressLevel.label}</h4>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "260px" }}>{stressLevel.advice}</p>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "18px" }}>Readiness Score</h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "10px 0" }}>
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Readiness score: ${readinessScore} percent`}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={readinessScore > 60 ? "var(--stress-low)" : "var(--stress-med)"} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - readinessScore / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease", transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                />
              </svg>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-display)" }}>{readinessScore}%</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
              {readinessScore > 70
                ? "You're in good shape. Keep balancing study and rest."
                : "Consider more rest and mindfulness to boost readiness."}
            </p>
          </div>
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "18px" }}>Latest Emotional Diagnosis</h3>
          {latestEmotion ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🧘</div>
                  <div>
                    <h4 style={{ fontSize: "15px" }}>Primary State</h4>
                    <p style={{ color: "var(--primary)", fontWeight: "500", fontSize: "14px" }}>{latestEmotion}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📅</div>
                  <div>
                    <h4 style={{ fontSize: "15px" }}>Logged On</h4>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{latestDate}</p>
                  </div>
                </div>
              </div>
              <button id="dashboard-log-entry-btn" className="premium-btn" onClick={handleNav("journal")}
                style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "flex-start", marginTop: "16px" }}
                aria-label="Log a new journal entry">
                Log New Entry
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", textAlign: "center", padding: "20px 0", gap: "12px" }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No wellness log logged today. Write in your stress journal to analyze triggers!</p>
              <button className="premium-btn" onClick={handleNav("journal")} style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "center" }}>
                Write First Log
              </button>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>AI Study Coach & Planner</h3>
            {activePlan ? (
              <div>
                <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: "500", marginBottom: "6px" }}>
                  🎯 Active: {activeTitle}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  Your study budget: <strong>{studyHours}h/day</strong> &middot; {totalMilestones} milestones across {activePlan.weeklySchedule?.length || 0} weeks.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                Analyze your target dates, daily schedule, and strengths/weaknesses to get a personalized weekly roadmap and daily time budget splits.
              </p>
            )}
          </div>
          <button id="dashboard-coach-btn" className="premium-btn" onClick={handleNav("coach")}
            style={{ padding: "10px 16px", fontSize: "13px", alignSelf: "flex-start" }}>
            {activePlan ? "View Active Roadmap" : "Start Analysis"}
          </button>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Stress Trend &bull; Weekly Progress</h3>
        {logs.length > 1 ? (
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "500px", position: "relative" }}>
              <svg width="100%" height={SVG_HEIGHT} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} role="img" aria-label="Stress level trend chart over recent logs">
                <line x1={SVG_PADDING} y1={SVG_PADDING} x2={SVG_WIDTH - SVG_PADDING} y2={SVG_PADDING} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1={SVG_PADDING} y1={SVG_HEIGHT / 2} x2={SVG_WIDTH - SVG_PADDING} y2={SVG_HEIGHT / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1={SVG_PADDING} y1={SVG_HEIGHT - SVG_PADDING} x2={SVG_WIDTH - SVG_PADDING} y2={SVG_HEIGHT - SVG_PADDING} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                <text x={SVG_PADDING - 10} y={SVG_PADDING + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">100%</text>
                <text x={SVG_PADDING - 10} y={SVG_HEIGHT / 2 + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">50%</text>
                <text x={SVG_PADDING - 10} y={SVG_HEIGHT - SVG_PADDING + 4} fill="var(--text-muted)" fontSize="10" textAnchor="end">0%</text>
                {pathD && <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                {points.map((p, i) => (
                  <g key={i}>
                    <circle cx={p.x} cy={p.y} r="5" fill="var(--accent)" stroke="var(--bg-gradient-start)" strokeWidth="2" />
                    <text x={p.x} y={p.y - 12} fill="var(--text-primary)" fontSize="10" fontWeight="bold" textAnchor="middle">{p.score}%</text>
                    <text x={p.x} y={SVG_HEIGHT - 10} fill="var(--text-secondary)" fontSize="9" textAnchor="middle">{p.date}</text>
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

        {activePlan && (
          <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "10px" }}>Roadmap Milestone Progress</h4>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {activePlan.weeklySchedule?.map((week, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px", padding: "12px", flex: "1 1 180px", fontSize: "13px"
                }}>
                  <strong style={{ color: "var(--primary)", display: "block", marginBottom: "4px" }}>{week.week}</strong>
                  <span style={{ color: "var(--text-muted)" }}>{week.milestones?.length || 0} milestones</span>
                  {week.wellnessFocus && (
                    <p style={{ color: "var(--stress-low)", fontSize: "11px", marginTop: "4px" }}>🧘 {week.wellnessFocus}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Instant Anxiety Defuser</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          {QUICK_ACTIONS.map((item) => (
            <div
              key={item.tab + item.title}
              className="glass-card glass-card-interactive"
              onClick={handleNav(item.tab)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNavigateToTab(item.tab); } }}
              style={{ padding: "16px", display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-label={`${item.title}: ${item.desc}`}
            >
              <span style={{ fontSize: "24px" }}>{item.icon}</span>
              <div>
                <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>{item.title}</h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(DashboardOverview);
