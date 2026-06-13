"use client";

import { useState, useEffect, useRef, memo } from "react";
import { useBreathingExercise } from "@/lib/useBreathingExercise";

function MindfulnessHub() {
  const {
    breathingActive,
    breatheState,
    breatheTimer,
    breatheType,
    setBreatheType,
    handleToggleBreathing,
  } = useBreathingExercise();

  // Audio mixer states
  const [rainActive, setRainActive] = useState(false);
  const [wavesActive, setWavesActive] = useState(false);
  const bowlVolume = 0.5;

  // Web Audio Context reference for synthesized sounds
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Synthesized nodes refs
  const rainNodeRef = useRef<{ stop: (when?: number) => void } | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  
  const wavesNodeRef = useRef<{ stop: (when?: number) => void } | null>(null);
  const wavesGainRef = useRef<GainNode | null>(null);
  const wavesLfoRef = useRef<OscillatorNode | null>(null);

  // Initialize Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  // 1. Synthesize Pink Noise for Rain
  const startRain = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    
    // Create custom noise buffer (Pink Noise approximation)
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink filter coefficients
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // Gain normalization
      b6 = white * 0.115926;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Create filter to make it sound like gentle rain
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.value = 0.25;

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noiseSource.start(0);
    
    rainNodeRef.current = noiseSource;
    rainGainRef.current = gain;
  };

  const stopRain = () => {
    if (rainNodeRef.current) {
      try {
        rainNodeRef.current.stop();
      } catch { /* ignore */ }
      rainNodeRef.current = null;
    }
  };

  // 2. Synthesize Swelling Ocean Waves
  const startWaves = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    
    // Noise source
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 350; // Low rumble

    const gain = ctx.createGain();
    gain.gain.value = 0.1;

    // LFO (Low Frequency Oscillator) to modulate gain (create wave swelling effect)
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.12; // Wave frequency (roughly 8s cycle)

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08; // Swell depth

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain); // Modulate wave volume

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    lfo.start();
    noiseSource.start(0);

    wavesNodeRef.current = noiseSource;
    wavesGainRef.current = gain;
    wavesLfoRef.current = lfo;
  };

  const stopWaves = () => {
    if (wavesNodeRef.current) {
      try {
        wavesNodeRef.current.stop();
      } catch { /* ignore */ }
      wavesNodeRef.current = null;
    }
    if (wavesLfoRef.current) {
      try {
        wavesLfoRef.current.stop();
      } catch { /* ignore */ }
      wavesLfoRef.current = null;
    }
  };

  // 3. Play Resonant Zen Singing Bowl Chime
  const playSingingBowl = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    
    const time = ctx.currentTime;
    
    // Fundamental note + Overtones for metallic resonance
    const frequencies = [220, 440, 660, 880, 1200];
    const gains = [0.5, 0.25, 0.15, 0.08, 0.05];

    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      // Add a slight frequency modulation for warmth
      osc.frequency.linearRampToValueAtTime(freq + (idx === 0 ? 0.8 : -0.5), time + 4);

      gainNode.gain.setValueAtTime(gains[idx] * bowlVolume, time);
      // Exponential decay over 6 seconds
      gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(time);
      osc.stop(time + 6.2);
    });
  };

  // Toggle handlers
  const handleToggleRain = () => {
    if (rainActive) {
      stopRain();
      setRainActive(false);
    } else {
      startRain();
      setRainActive(true);
    }
  };

  const handleToggleWaves = () => {
    if (wavesActive) {
      stopWaves();
      setWavesActive(false);
    } else {
      startWaves();
      setWavesActive(true);
    }
  };

  // Clean up all audio nodes on unmount
  useEffect(() => {
    return () => {
      stopRain();
      stopWaves();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Visual Guided Breathing Section */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Adaptive Guided Breathing Bubble</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", textAlign: "center", marginBottom: "24px", maxWidth: "480px" }}>
          Regulate your nervous system. Inhale deep oxygen to calm test anxiety and increase logical retention.
        </p>

        {/* Breathing Options */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "30px" }}>
          <button
            className={`premium-btn ${breatheType === "478" ? "" : "premium-btn-secondary"}`}
            onClick={() => { setBreatheType("478"); }}
            style={{ padding: "10px 16px", fontSize: "13px" }}
          >
            4-7-8 Calming Breath
          </button>
          <button
            className={`premium-btn ${breatheType === "box" ? "" : "premium-btn-secondary"}`}
            onClick={() => { setBreatheType("box"); }}
            style={{ padding: "10px 16px", fontSize: "13px" }}
          >
            Box Focusing Breath
          </button>
        </div>

        {/* Dynamic Breathing Bubble */}
        <div className="breathe-container">
          <div className={`breathe-circle ${
            breathingActive && breatheState === "inhale" ? "breathe-inhale" : ""
          } ${
            breathingActive && breatheState === "hold" ? "breathe-hold" : ""
          } ${
            breathingActive && breatheState === "exhale" ? "breathe-exhale" : ""
          }`}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "24px" }}>
                {breatheState === "inhale" ? "🌬️" : ""}
                {breatheState === "hold" ? "🌸" : ""}
                {breatheState === "exhale" ? "💨" : ""}
                {breatheState === "ready" && breathingActive ? "🍃" : ""}
                {breatheState === "ready" && !breathingActive ? "🧘" : ""}
              </span>
              <span style={{ textTransform: "uppercase", fontSize: "14px", letterSpacing: "1px", fontWeight: "700" }}>
                {breatheState === "ready" && !breathingActive && "Ready"}
                {breatheState === "ready" && breathingActive && "Hold Empty"}
                {breatheState === "inhale" && "Inhale"}
                {breatheState === "hold" && "Hold"}
                {breatheState === "exhale" && "Exhale"}
              </span>
              {breathingActive && (
                <span style={{ fontSize: "22px", fontWeight: "800" }} aria-live="polite" aria-atomic="true">{breatheTimer}s</span>
              )}
            </div>
          </div>
        </div>

        {/* Breathing controls */}
        <div style={{ marginTop: "16px" }}>
          <button
            className="premium-btn"
            onClick={handleToggleBreathing}
            style={{ minWidth: "160px" }}
          >
            {breathingActive ? "Pause Exercise" : "Start Exercise"}
          </button>
        </div>
      </div>

      {/* Soundscape Mixer Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>GenAI Zen Soundscape Mixer</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
          Combine continuous, synthesised nature sounds to block out distractions and soothe exam anxiety. (Powered by Web Audio synthesis—works offline!)
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
          {/* Rain Sound */}
          <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>🌧️</span>
              <div>
                <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>Gentle Rain</h4>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pink noise synthesis</p>
              </div>
            </div>
            <button
              onClick={handleToggleRain}
              className={`premium-btn ${rainActive ? "" : "premium-btn-secondary"}`}
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              {rainActive ? "Active" : "Play"}
            </button>
          </div>

          {/* Waves Sound */}
          <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>🌊</span>
              <div>
                <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>Ocean Waves</h4>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>LFO volume modulator</p>
              </div>
            </div>
            <button
              onClick={handleToggleWaves}
              className={`premium-btn ${wavesActive ? "" : "premium-btn-secondary"}`}
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              {wavesActive ? "Active" : "Play"}
            </button>
          </div>

          {/* Singing Bowl Sound */}
          <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span style={{ fontSize: "24px" }}>🔔</span>
              <div>
                <h4 style={{ fontSize: "14px", marginBottom: "2px" }}>Singing Bowl</h4>
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Resonant chime strike</p>
              </div>
            </div>
            <button
              onClick={playSingingBowl}
              className="premium-btn"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              Strike
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(MindfulnessHub);
