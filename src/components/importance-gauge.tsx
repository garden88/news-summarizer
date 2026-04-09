export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function strokeColor(score: number): string {
  if (score >= 80) return "#2A4A7F";
  if (score >= 55) return "#3D6499";
  if (score >= 35) return "#5A80B0";
  return "#BDD0E0";
}

const SIZE = 48;
const STROKE = 3.5;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export function ImportanceGauge({ score }: { score: number }) {
  const s = clampScore(score);
  const dash = (s / 100) * C;
  const col = strokeColor(s);

  return (
    <div
      className="flex shrink-0 flex-col items-center justify-center border-l border-[#BDD0E0] pl-3 sm:pl-4"
      title={`중요도 ${s}점 (0~100)`}
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="#D8E4EF"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={col}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold tabular-nums leading-none text-[#2A4A7F]">{s}</span>
          <span className="text-[8px] font-light tracking-wide text-[#7A90AA]">/100</span>
        </div>
      </div>
    </div>
  );
}
