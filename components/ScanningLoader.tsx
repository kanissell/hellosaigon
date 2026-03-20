"use client";

export default function ScanningLoader() {
  return (
    <div className="glass-card rounded-2xl px-5 py-4">
      {/* Scan bar track */}
      <div className="relative mb-3 h-0.5 overflow-hidden rounded-full bg-cyan-500/10">
        <div className="scan-bar absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
      </div>

      {/* Status text */}
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="waveform-bar h-3 w-0.5 origin-bottom rounded-full"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <span className="scan-text font-mono text-xs tracking-wider text-cyan-500/60">
          Analyzing...
        </span>
      </div>
    </div>
  );
}
