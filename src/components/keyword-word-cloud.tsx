import type { NewsAnalysis } from "@/types/news";

type Row = NewsAnalysis["keywords"][number];

/** 파란 잉크 계열 팔레트 — 회전 없이 가로 정렬 */
const PALETTE = [
  "#2A4A7F",
  "#1C2D4F",
  "#3D6499",
  "#4A6080",
  "#5A80B0",
  "#6B7A99",
  "#7A90AA",
  "#344E78",
  "#2A3F60",
  "#4A7099",
];

type Props = { keywords: Row[] };

export function KeywordWordCloud({ keywords }: Props) {
  if (keywords.length === 0) {
    return (
      <section className="space-y-3" aria-label="키워드 워드클라우드">
        <h2 className="font-serif text-base tracking-[0.2em] uppercase text-[#2A4A7F]">
          Keywords
        </h2>
        <p className="rounded-3xl border border-[#BDD0E0] bg-white px-4 py-8 text-center text-sm text-[#7A90AA]">
          표시할 키워드가 없습니다.
        </p>
      </section>
    );
  }

  const list = [...keywords].sort((a, b) => b.importance - a.importance);
  const imp = list.map((k) => k.importance);
  const minI = Math.min(...imp);
  const maxI = Math.max(...imp);
  const span = maxI - minI || 1;

  return (
    <section className="space-y-3" aria-label="키워드 워드클라우드">
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-base tracking-[0.2em] uppercase text-[#2A4A7F]">
          Keywords
        </h2>
        <span className="text-xs tracking-widest text-[#7A90AA] uppercase">
          검색어 제외 · 중요도 비례
        </span>
      </div>
      <div className="rounded-3xl border border-[#BDD0E0] bg-white px-6 py-10">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
          {list.map((k, i) => {
            const t = span > 0 ? (k.importance - minI) / span : 1;
            const fontRem = 0.75 + t * 1.8;
            const weight = t > 0.7 ? 600 : t > 0.4 ? 400 : 300;
            const color = PALETTE[i % PALETTE.length];
            return (
              <span
                key={k.term}
                title={`${k.term} · 중요도 ${k.importance.toFixed(0)}/10`}
                className="inline-block cursor-default select-none leading-tight"
                style={{ fontSize: `${fontRem}rem`, fontWeight: weight, color }}
              >
                {k.term}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
