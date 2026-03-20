"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Props = {
  text: string;
  animate?: boolean;
  speed?: number;
  onComplete?: () => void;
};

export default function TypewriterText({
  text,
  animate = true,
  speed = 18,
  onComplete,
}: Props) {
  const [displayed, setDisplayed] = useState(animate ? "" : text);
  const [done, setDone] = useState(!animate);
  const indexRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);

  const skip = useCallback(() => {
    if (!done) {
      cancelAnimationFrame(rafRef.current);
      setDisplayed(text);
      setDone(true);
      onComplete?.();
    }
  }, [done, text, onComplete]);

  useEffect(() => {
    if (!animate) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    indexRef.current = 0;
    lastRef.current = 0;
    setDisplayed("");
    setDone(false);

    function step(ts: number) {
      if (!lastRef.current) lastRef.current = ts;
      const elapsed = ts - lastRef.current;

      if (elapsed >= speed) {
        const chars = Math.max(1, Math.floor(elapsed / speed));
        indexRef.current = Math.min(indexRef.current + chars, text.length);
        setDisplayed(text.slice(0, indexRef.current));
        lastRef.current = ts;
      }

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDone(true);
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, animate, speed, onComplete]);

  return (
    <span onClick={skip} className={animate && !done ? "cursor-pointer" : ""}>
      <span className="whitespace-pre-wrap">{displayed}</span>
      {animate && !done && <span className="typing-cursor">▎</span>}
    </span>
  );
}
