import { useState, useEffect, useRef } from "react";

export type BreatheType = "478" | "box";
export type BreatheState = "ready" | "inhale" | "hold" | "exhale";

export function useBreathingExercise() {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breatheState, setBreatheState] = useState<BreatheState>("ready");
  const [breatheTimer, setBreatheTimer] = useState(0);
  const [breatheType, setBreatheType] = useState<BreatheType>("478");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breatheTypeRef = useRef(breatheType);
  breatheTypeRef.current = breatheType;

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleToggleBreathing = () => {
    if (breathingActive) {
      clearTimer();
      setBreathingActive(false);
      setBreatheState("ready");
      setBreatheTimer(0);
    } else {
      setBreathingActive(true);
    }
  };

  useEffect(() => {
    if (!breathingActive) return;

    const currentType = breatheTypeRef.current;
    const getPhaseDuration = (phase: string) => {
      if (currentType === "478") {
        switch (phase) {
          case "inhale": return 4;
          case "hold": return 7;
          case "exhale": return 8;
          default: return 4;
        }
      }
      return 4;
    };

    let phase: "inhale" | "hold" | "exhale" | "hold2" = "inhale";
    let counter: number;

    const advancePhase = () => {
      switch (phase) {
        case "inhale":
          phase = "hold";
          break;
        case "hold":
          phase = "exhale";
          break;
        case "exhale":
          phase = currentType === "box" ? "hold2" : "inhale";
          break;
        case "hold2":
          phase = "inhale";
          break;
      }

      if (phase === "hold2") {
        setBreatheState("ready");
      } else {
        setBreatheState(phase);
      }

      const dur = getPhaseDuration(phase);
      counter = dur;
      setBreatheTimer(counter);

      if (phase === "inhale" && currentType === "478") {
        clearTimer();
        timerRef.current = setInterval(tick, 1000);
      }
    };

    const tick = () => {
      counter--;
      setBreatheTimer(counter);
      if (counter <= 0) {
        advancePhase();
      }
    };

    const dur = getPhaseDuration("inhale");
    counter = dur;
    setBreatheState("inhale");
    setBreatheTimer(counter);

    timerRef.current = setInterval(tick, 1000);

    return clearTimer;
  }, [breathingActive]);

  return {
    breathingActive,
    breatheState,
    breatheTimer,
    breatheType,
    setBreatheType,
    handleToggleBreathing,
  };
}
