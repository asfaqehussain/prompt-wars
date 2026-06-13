"use client";

import { useState, useEffect, useCallback, memo } from "react";
import type { CoachPlan } from "@/lib/types";
import { generateCoachRoadmap } from "@/lib/api";

interface AICoachProps {
  activePlan: CoachPlan | null;
  setActivePlan: (plan: CoachPlan | null) => void;
}

function AICoach({ activePlan, setActivePlan }: AICoachProps) {
  // Form onboarding state
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    prepType: "Exam",
    targetGoal: "",
    skillLevel: "Intermediate",
    targetDate: "",
    hoursPerDay: "4",
    strengths: "",
    weaknesses: "",
    notes: ""
  });

  const [loading, setLoading] = useState(false);
  const [loadingStatusText, setLoadingStatusText] = useState("Assessing core profile...");
  const [error, setError] = useState("");
  const [completedMilestones, setCompletedMilestones] = useState<Record<string, boolean>>({});

  // Loading text cycler
  useEffect(() => {
    if (!loading) return;
    const phrases = [
      "Analyzing strengths & experience gaps...",
      "Dividing syllabus into weekly digestible chunks...",
      "Mapping active recall and mock test intervals...",
      "Formulating custom stress-mitigation breaks...",
      "Finalizing your digital roadmap..."
    ];
    let idx = 0;
    const interval = setInterval(() => {
      setLoadingStatusText(phrases[idx]);
      idx = (idx + 1) % phrases.length;
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  // Handle milestone checkbox triggers
  const toggleMilestone = (id: string) => {
    setCompletedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.targetGoal.trim()) {
      setError("Please specify your target goal or exam name.");
      return;
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await generateCoachRoadmap(formData as unknown as Record<string, unknown>);
      setActivePlan(data);
      setCompletedMilestones({});
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong creating your coach roadmap.");
    } finally {
      setLoading(false);
    }
  }, [formData, setActivePlan]);

  const handleReset = () => {
    if (confirm("Are you sure you want to delete your current roadmap and start analysis again?")) {
      setActivePlan(null);
      setActiveStep(0);
      setFormData({
        prepType: "Exam",
        targetGoal: "",
        skillLevel: "Intermediate",
        targetDate: "",
        hoursPerDay: "4",
        strengths: "",
        weaknesses: "",
        notes: ""
      });
      setCompletedMilestones({});
    }
  };

  // Onboarding Wizard Renders
  if (loading) {
    return (
      <div className="glass-card animate-fade-in" role="status" aria-live="polite" aria-label="AI Coach is generating your roadmap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center", gap: "24px" }}>
        <div className="spinner" style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--card-border)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <div>
          <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>GenAI Coach Analysing...</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", transition: "var(--transition-smooth)" }}>{loadingStatusText}</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="glass-card animate-fade-in" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>AI Coach Strategy</span>
          <h2 style={{ fontSize: "24px", marginTop: "4px" }}>Start Preparation Analysis</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "6px" }}>
            Answer a few quick questions about your targets so we can generate your daily splits and milestone roadmap.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="step-indicator">
          <div className={`step-dot ${activeStep === 0 ? "active" : ""} ${activeStep > 0 ? "completed" : ""}`}>1</div>
          <div className={`step-dot ${activeStep === 1 ? "active" : ""} ${activeStep > 1 ? "completed" : ""}`}>2</div>
          <div className={`step-dot ${activeStep === 2 ? "active" : ""}`}>3</div>
        </div>

        {/* Form Wizard Pages */}
        {activeStep === 0 && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label>What are you preparing for?</label>
              <select
                className="glass-input"
                value={formData.prepType}
                onChange={(e) => setFormData({ ...formData, prepType: e.target.value })}
              >
                <option value="Exam" style={{ background: "#0b0d19", color: "#fff" }}>Competitive Exam (NEET, JEE, UPSC, Board, etc.)</option>
                <option value="Interview" style={{ background: "#0b0d19", color: "#fff" }}>Job Interview (React Dev, Product Manager, etc.)</option>
                <option value="Certification" style={{ background: "#0b0d19", color: "#fff" }}>Professional Certification (AWS, PMP, Google Cloud)</option>
                <option value="Presentation" style={{ background: "#0b0d19", color: "#fff" }}>Keynote / Major Presentation</option>
                <option value="Custom" style={{ background: "#0b0d19", color: "#fff" }}>Other / Custom Goal</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Role / Goal Name:</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g., UPSC Prelims, React Native Developer, AWS Cloud Practitioner"
                value={formData.targetGoal}
                onChange={(e) => { setFormData({ ...formData, targetGoal: e.target.value }); setError(""); }}
              />
            </div>

            <div className="form-group">
              <label>Your Current Skill Level:</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`premium-btn ${formData.skillLevel === level ? "" : "premium-btn-secondary"}`}
                    onClick={() => setFormData({ ...formData, skillLevel: level })}
                    style={{ flex: 1, padding: "10px", fontSize: "13px" }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label>Target Date / Deadline:</label>
              <input
                type="date"
                className="glass-input"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Available Study Hours per Day:</label>
              <input
                type="number"
                min={1}
                max={16}
                className="glass-input"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                Be realistic. Consistent quality blocks beat continuous exhausted hours.
              </span>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label>Your Main Strengths:</label>
              <textarea
                className="glass-input"
                rows={2}
                placeholder="e.g., Logical math reasoning, writing quickly, coding logic"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Your Key Weaknesses / Burnout Triggers:</label>
              <textarea
                className="glass-input"
                rows={2}
                placeholder="e.g., Time management, test anxiety, peer pressure, lack of sleep"
                value={formData.weaknesses}
                onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Additional Notes (Optional):</label>
              <textarea
                className="glass-input"
                rows={2}
                placeholder="Share any topics you finished or specific things your AI coach should address..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {error && (
          <p role="alert" style={{ color: "var(--stress-high)", fontSize: "13px", marginBottom: "16px" }}>⚠️ {error}</p>
        )}

        {/* Wizard Footer controls */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", marginTop: "20px" }}>
          {activeStep > 0 ? (
            <button className="premium-btn premium-btn-secondary" onClick={handleBack}>
              Back
            </button>
          ) : (
            <div />
          )}

          {activeStep < 2 ? (
            <button className="premium-btn" onClick={handleNext}>
              Next Step
            </button>
          ) : (
            <button className="premium-btn" onClick={handleSubmit}>
              Generate AI Roadmap
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Plan Dashboard Render
  const splits = activePlan.dailyRoutineSplits || { studyHours: 4, breakHours: 2, mindfulnessMinutes: 15, outline: [] };
  const totalBarHours = splits.studyHours + splits.breakHours + (splits.mindfulnessMinutes / 60);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Coach Header Summary */}
      <div className="glass-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Active Roadmapper Plan</span>
          <h2 style={{ fontSize: "26px", marginTop: "4px" }} className="gradient-text">{activePlan.coachTitle}</h2>
          <p style={{ color: "var(--text-primary)", fontSize: "14px", lineHeight: "1.6", marginTop: "10px" }}>{activePlan.summary}</p>
        </div>
        <button className="premium-btn premium-btn-secondary" onClick={handleReset} style={{ padding: "10px 16px", fontSize: "13px" }}>
          🔄 Reset Plan Analysis
        </button>
      </div>

      <div className="roadmap-grid">
        {/* Left Column: Weekly Roadmap Milestones */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {activePlan.weeklySchedule?.map((schedule: { week: string; milestones: string[]; wellnessFocus?: string }, weekIdx: number) => (
            <div key={weekIdx} className="glass-card">
              <h4 style={{ fontSize: "16px", color: "var(--primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", marginBottom: "14px" }}>
                {schedule.week}
              </h4>
              
              {/* Checklist items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {schedule.milestones?.map((milestone: string, mileIdx: number) => {
                  const itemKey = `${weekIdx}-${mileIdx}`;
                  const isDone = !!completedMilestones[itemKey];
                  return (
                    <div
                      key={mileIdx}
                      onClick={() => toggleMilestone(itemKey)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMilestone(itemKey); } }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        background: isDone ? "rgba(129, 199, 132, 0.04)" : "rgba(255, 255, 255, 0.01)",
                        border: isDone ? "1px dashed rgba(129, 199, 132, 0.2)" : "1px solid transparent",
                        transition: "var(--transition-smooth)"
                      }}
                      role="checkbox"
                      aria-checked={isDone}
                      tabIndex={0}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleMilestone(itemKey)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ marginTop: "3px" }}
                        aria-label={milestone}
                      />
                      <span style={{
                        fontSize: "14px",
                        color: isDone ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: isDone ? "line-through" : "none",
                        lineHeight: "1.5"
                      }}>
                        {milestone}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Weekly stress check */}
              {schedule.wellnessFocus && (
                <div style={{
                  background: "rgba(76, 201, 240, 0.04)",
                  border: "1px solid rgba(76, 201, 240, 0.15)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#cbd5e1"
                }}>
                  <strong style={{ color: "var(--accent)" }}>🧘 Week {weekIdx + 1} Wellness Guideline: </strong>
                  {schedule.wellnessFocus}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Column: Daily Routine split & advice block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Daily Splits Chart */}
          <div className="glass-card">
            <h3 style={{ fontSize: "16px", marginBottom: "10px" }}>Daily Allocation Budget</h3>
            
            {/* Visual Bar Splits */}
            <div className="routine-bar">
              <div
                className="routine-bar-segment"
                style={{
                  width: `${(splits.studyHours / totalBarHours) * 100}%`,
                  background: "var(--primary)"
                }}
                title={`Study: ${splits.studyHours}h`}
              />
              <div
                className="routine-bar-segment"
                style={{
                  width: `${(splits.breakHours / totalBarHours) * 100}%`,
                  background: "var(--accent)"
                }}
                title={`Breaks: ${splits.breakHours}h`}
              />
              <div
                className="routine-bar-segment"
                style={{
                  width: `${((splits.mindfulnessMinutes / 60) / totalBarHours) * 100}%`,
                  background: "var(--stress-low)"
                }}
                title={`Mindfulness: ${splits.mindfulnessMinutes}m`}
              />
            </div>

            {/* Labels legends */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "var(--text-secondary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px", marginBottom: "14px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} /> Study: {splits.studyHours}h
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} /> Breaks: {splits.breakHours}h
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--stress-low)" }} /> Zen: {splits.mindfulnessMinutes}m
              </span>
            </div>

            {/* Daily Outline splits list */}
            <h4 style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>Daily Outline Recommendation:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {splits.outline?.map((item: string, i: number) => (
                <div key={i} style={{ fontSize: "13px", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", borderLeft: "2px solid var(--primary-hover)" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Advice Cards */}
          {activePlan.strengthMaximizer && (
            <div className="glass-card" style={{ borderLeft: "4px solid var(--stress-low)" }}>
              <h4 style={{ color: "var(--stress-low)", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                ⚡ Strength Maximizer
              </h4>
              <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>{activePlan.strengthMaximizer}</p>
            </div>
          )}

          {activePlan.weaknessMitigation && (
            <div className="glass-card" style={{ borderLeft: "4px solid var(--stress-high)" }}>
              <h4 style={{ color: "var(--stress-high)", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                🛡️ Weakness Defusal Plan
              </h4>
              <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-primary)" }}>{activePlan.weaknessMitigation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AICoach);
