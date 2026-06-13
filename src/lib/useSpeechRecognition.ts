import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  error: string;
  toggleListening: () => void;
}

export function useSpeechRecognition(
  onResult: (transcript: string) => void
): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as Record<string, unknown>;
      const SpeechRecognition: unknown =
        win.SpeechRecognition || win.webkitSpeechRecognition;
      if (typeof SpeechRecognition === "function") {
        const RecognitionCtor = SpeechRecognition as new () => Record<string, unknown>;
        const recognition = new RecognitionCtor();
        (recognition as Record<string, unknown>).continuous = true;
        (recognition as Record<string, unknown>).interimResults = false;
        (recognition as Record<string, unknown>).lang = "en-IN";
        recognitionRef.current = recognition;
      }
    }
  }, []);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    const handleResult = (event: Event) => {
      const speechEvent = event as unknown as {
        results: Array<Array<{ transcript: string }>>;
      };
      const results = speechEvent.results;
      const lastResult = results[results.length - 1];
      const transcript = lastResult[0].transcript;
      onResult(transcript);
    };

    const handleError = (event: Event) => {
      const err = event as unknown as { error: string };
      setIsListening(false);
      setError("Speech recognition error: " + err.error);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    const rec = recognition as unknown as {
      addEventListener: (ev: string, cb: (e: Event) => void) => void;
      removeEventListener: (ev: string, cb: (e: Event) => void) => void;
      stop: () => void;
    };
    rec.addEventListener("result", handleResult);
    rec.addEventListener("error", handleError);
    rec.addEventListener("end", handleEnd);

    return () => {
      rec.removeEventListener("result", handleResult);
      rec.removeEventListener("error", handleError);
      rec.removeEventListener("end", handleEnd);
      rec.stop();
    };
  }, [onResult]);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      (recognition as unknown as { stop: () => void }).stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setError("");
      (recognition as unknown as { start: () => void }).start();
    }
  }, [isListening]);

  return { isListening, error, toggleListening };
}
