"use client";

export default function WaveformBars() {
  return (
    <div className="flex items-center justify-center gap-[3px] px-2">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="waveform-bar h-5 w-[3px] origin-bottom rounded-full"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}
