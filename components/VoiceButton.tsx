"use client";

import { useEffect } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import WaveformBars from "./WaveformBars";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

export default function VoiceButton({ onTranscript, disabled }: Props) {
  const { isListening, transcript, isSupported, error, start, stop, clearError } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Auto-clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const id = setTimeout(clearError, 3000);
      return () => clearTimeout(id);
    }
  }, [error, clearError]);

  if (!isSupported) return null;

  // Error tooltip
  const errorMsg =
    error === "mic-denied"
      ? "Microphone blocked — check browser permissions"
      : error === "no-speech"
        ? "No speech detected — try again"
        : error
          ? `Voice error: ${error}`
          : null;

  if (isListening) {
    return (
      <button
        type="button"
        onClick={stop}
        aria-label="Stop listening"
        className="rounded-lg border border-red-500/30 bg-red-500/10 px-1 py-1.5 transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]"
      >
        <WaveformBars />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={start}
        disabled={disabled}
        aria-label="Start voice input"
        className={`rounded-lg p-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          error
            ? "text-amber-400/70 hover:text-amber-400"
            : "text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10"
        }`}
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {errorMsg && (
        <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300 backdrop-blur-sm">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
