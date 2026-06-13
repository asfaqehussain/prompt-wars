"use client";

import { useState, useRef, useCallback, memo } from "react";
import { analyzeJournal } from "@/lib/api";
import { getStressColor } from "@/lib/utils";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";

interface JournalAnalyzerProps {
  exam: string;
  onAnalysisSuccess: (analysis: { stressScore: number; emotion: string; date: string }) => void;
}

interface AnalysisResult {
  stressScore: number;
  primaryEmotion: string;
  triggers: string[];
  copingStrategies: string[];
  encouragement: string;
}

const prompts = [
  { title: "Mock Test Distress", body: "I got my mock test results today and my score was way below what I expected. I feel like my preparation is going backwards and I'm losing confidence." },
  { title: "Syllabus Overwhelm", body: "There is so much backlog to complete in physics and chemistry. The exam is getting closer and I feel frozen, unable to decide where to start studying." },
  { title: "Family Expectations", body: "I feel stressed about my parents' expectations. They are supporting me so much, but I'm constantly terrified of letting them down if I don't clear the cutoff." },
];

function JournalAnalyzer({ exam, onAnalysisSuccess }: JournalAnalyzerProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  const onSpeechResult = useCallback((transcript: string) => {
    setText((prev) => prev + (prev ? " " : "") + transcript);
  }, []);

  const { isListening, error: speechError, toggleListening } = useSpeechRecognition(onSpeechResult);

  const handleAnalyze = useCallback(async () => {
    if (!text.trim()) {
      setError("Please write down your thoughts or use a sample template first.");
      errorRef.current?.focus();
      return;
    }

    setLoading(true);
    setError("");
    setAnalysisResult(null);

    try {
      const data = await analyzeJournal(text, exam);
      setAnalysisResult(data);
      const currentDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      onAnalysisSuccess({
        stressScore: data.stressScore,
        emotion: data.primaryEmotion,
        date: currentDate,
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong during GenAI analysis.");
    } finally {
      setLoading(false);
    }
  }, [text, exam, onAnalysisSuccess]);

  const handleClear = useCallback(() => {
    setText("");
    setAnalysisResult(null);
    setError("");
  }, []);

  const displayError = error || speechError;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card">
        <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Empathetic Journal & Mood Logger</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "20px" }}>
          Unburden your mind. Write freely about mock tests, time management, pressure, or self-doubt. Our GenAI analyzes patterns to deliver customized coping strategies.
        </p>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Click to use a sample scenario:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {prompts.map((p, idx) => (
              <button
                key={idx}
                className="premium-btn premium-btn-secondary"
                onClick={() => { setText(p.body); setError(""); }}
                style={{ padding: "8px 12px", fontSize: "12px", borderRadius: "8px" }}
                aria-label={`Use template: ${p.title}`}
              >
                📝 {p.title}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", marginBottom: "16px" }}>
          <textarea
            className="glass-input"
            rows={6}
            placeholder={`How is your ${exam} prep going today? Share what's causing you stress...`}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            aria-label="Journal entry text"
            style={{ resize: "vertical", paddingBottom: "40px", fontSize: "15px", lineHeight: "1.6" }}
          />
          <button
            type="button"
            onClick={toggleListening}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
            aria-pressed={isListening}
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              background: isListening ? "rgba(229, 115, 115, 0.2)" : "rgba(255, 255, 255, 0.05)",
              border: isListening ? "1px solid var(--stress-high)" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
              color: isListening ? "var(--stress-high)" : "var(--text-primary)"
            }}
            title={isListening ? "Stop listening" : "Dictate your thoughts"}
          >
            {isListening ? "🛑" : "🎙️"}
          </button>
        </div>

        {displayError && (
          <p ref={errorRef} role="alert" tabIndex={-1} style={{ color: "var(--stress-high)", fontSize: "13px", marginBottom: "12px" }}>
            ⚠️ {displayError}
          </p>
        )}

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="premium-btn"
            onClick={handleAnalyze}
            disabled={loading}
            aria-busy={loading}
            style={{ minWidth: "160px" }}
          >
            {loading ? (
              <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="spinner" style={{
                  width: "14px", height: "14px", border: "2px solid #000",
                  borderTopColor: "transparent", borderRadius: "50%",
                  animation: "spin 0.6s linear infinite"
                }} />
                Analyzing AI triggers...
              </span>
            ) : "Analyze Stress Triggers"}
          </button>
          {text && (
            <button
              className="premium-btn premium-btn-secondary"
              onClick={handleClear}
              disabled={loading}
              style={{ padding: "12px 18px" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {analysisResult && (
        <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", letterSpacing: "1px", textTransform: "uppercase" }}>GenAI Diagnosis</span>
              <h3 style={{ fontSize: "22px", marginTop: "4px" }}>Your Mental Wellness Report</h3>
            </div>
            <div style={{ display: "flex", gap: "24px" }}>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Primary Emotion</span>
                <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "16px" }}>{analysisResult.primaryEmotion}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Stress Score</span>
                <p style={{ color: getStressColor(analysisResult.stressScore), fontWeight: "800", fontSize: "18px" }}>{analysisResult.stressScore}%</p>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Identified Stress Triggers:</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {analysisResult.triggers.map((t: string, idx: number) => (
                <span key={idx} style={{
                  background: "rgba(229, 115, 115, 0.08)", border: "1px solid rgba(229, 115, 115, 0.2)",
                  color: "var(--stress-high)", fontSize: "12px", padding: "6px 12px",
                  borderRadius: "20px", fontWeight: "500"
                }}>
                  🎯 {t}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>Hyper-Personalized Coping Strategies:</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analysisResult.copingStrategies.map((strategy: string, idx: number) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.02)", borderLeft: "4px solid var(--accent)",
                  padding: "12px 16px", borderRadius: "0 10px 10px 0", fontSize: "14px", lineHeight: "1.5"
                }}>
                  <strong style={{ color: "var(--accent)", display: "block", marginBottom: "4px" }}>Strategy {idx + 1}</strong>
                  {strategy}
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(138, 153, 230, 0.08) 0%, rgba(76, 201, 240, 0.04) 100%)",
            border: "1px solid rgba(138, 153, 230, 0.15)", padding: "16px 20px",
            borderRadius: "12px", fontSize: "14px", lineHeight: "1.6", color: "#e2e8f0"
          }}>
            <span style={{ fontSize: "20px", marginRight: "8px", verticalAlign: "middle" }}>🌿</span>
            <strong style={{ color: "var(--secondary)" }}>Empathetic Companion Note:</strong>
            <p style={{ marginTop: "8px", fontStyle: "italic" }}>&ldquo;{analysisResult.encouragement}&rdquo;</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default memo(JournalAnalyzer);
