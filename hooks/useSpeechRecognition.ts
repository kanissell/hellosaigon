"use client";

import { useState, useRef, useCallback, useEffect } from "react";

type SpeechRecognitionInstance = InstanceType<typeof SpeechRecognition>;

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const SpeechRec =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setIsSupported(!!SpeechRec);
  }, []);

  const start = useCallback(async () => {
    setError(null);

    // Check mic permission first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release the stream immediately — we just needed permission
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError("mic-denied");
      return;
    }

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0]?.[0]?.transcript || "";
      setTranscript(result);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setError("mic-denied");
      } else if (event.error === "no-speech") {
        setError("no-speech");
      } else {
        setError(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript("");
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { isListening, transcript, isSupported, error, start, stop, clearError };
}
