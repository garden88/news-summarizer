"use client";

import { useState } from "react";
import { ImportanceGauge, clampScore } from "@/components/importance-gauge";
import { KeywordWordCloud } from "@/components/keyword-word-cloud";
import { BotanicalCornerTR, BotanicalCornerBL } from "@/components/botanical-deco";
import {
  excludeSearchKeyword,
  mergeKeywordsByImportance,
} from "@/lib/merge-keywords";
import type { NewsAnalysis, SearchPeriod } from "@/types/news";

type ApiOk = {
  query: { keyword: string | null; period: SearchPeriod };
  count: number;
  analyzedCount: number;
  articles: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
  }>;
  analysis: NewsAnalysis;
};

const periodLabels: Record<SearchPeriod, string> = {
  all: "전체",
  today: "오늘",
  week: "이번 주",
};

function sentimentLabel(s: NewsAnalysis["sentiment"]["label"]): string {
  const m: Record<string, string> = {
    positive: "긍정",
    negative: "부정",
    neutral: "중립",
    mixed: "혼합",
  };
  return m[s] ?? s;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-base tracking-[0.2em] uppercase text-[#2A4A7F]">
      {children}
    </h2>
  );
}

function Divider() {
  return <hr className="border-t border-[#C8D4E0] my-2" />;
}

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [period, setPeriod] = useState<SearchPeriod>("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiOk | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim() || undefined,
          period,
        }),
      });
      const json = (await res.json()) as ApiOk & { error?: string };
      if (!res.ok) {
        setError(json.error ?? `요청 실패 (${res.status})`);
        return;
      }
      setData(json);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto flex min-h-full w-full max-w-3xl flex-col gap-12 px-5 py-14 sm:px-8">
      {/* 모서리 식물 장식 — 파란 잉크 선화 */}
      <BotanicalCornerTR className="absolute right-0 top-0 w-56 opacity-[0.22]" />
      <BotanicalCornerBL className="absolute bottom-0 left-0 w-48 opacity-[0.18]" />

      {/* ── 헤더 ── */}
      <header className="relative space-y-3 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#6B7A99]">
          Naver News · OpenAI
        </p>
        <h1 className="font-serif text-4xl tracking-[0.18em] uppercase text-[#2A4A7F] sm:text-5xl">
          Daily Brief
        </h1>
        <p className="text-xs tracking-[0.25em] uppercase text-[#1A2744]/50">
          실시간 뉴스 브리핑
        </p>
        <Divider />
        <p className="mx-auto max-w-sm text-sm font-light leading-relaxed text-[#4A6080]">
          키워드를 입력하거나 기간을 선택하면{" "}
          <span className="text-[#2A4A7F]">TOP 10</span> 핵심 기사와
          워드클라우드를 함께 보여 드립니다.
        </p>
      </header>

      {/* ── 검색 폼 ── */}
      <form
        onSubmit={onSubmit}
        className="relative rounded-3xl border border-[#C8D4E0] bg-[#FDFAF5] px-8 py-8 space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B7A99]">
              검색 키워드
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 반도체, 기후, 부동산"
              className="rounded-full border border-[#BDD0E0] bg-white px-5 py-2.5 text-sm font-light text-[#1C2D4F] placeholder:text-[#7A90AA]/60 outline-none focus:border-[#2A4A7F] transition"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B7A99]">
              기간
            </span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as SearchPeriod)}
              className="rounded-full border border-[#BDD0E0] bg-white px-5 py-2.5 text-sm font-light text-[#1C2D4F] outline-none focus:border-[#2A4A7F] transition"
            >
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="all">전체 (최신순)</option>
            </select>
          </label>
        </div>
        <div className="flex justify-center pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full border border-[#2A4A7F] px-10 py-2.5 text-xs tracking-[0.25em] uppercase text-[#2A4A7F] transition hover:bg-[#2A4A7F] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "분석 중 …" : "브리핑 받기"}
          </button>
        </div>
      </form>

      {/* ── 오류 ── */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-[#C8D4E0] bg-[#FDFAF5] px-5 py-4 text-sm font-light text-[#8A3030]"
        >
          {error}
        </div>
      )}

      {/* ── 결과 ── */}
      {data && (
        <div className="flex flex-col gap-12">
          {/* 워드클라우드 */}
          <KeywordWordCloud
            keywords={excludeSearchKeyword(
              mergeKeywordsByImportance(data.analysis.keywords),
              data.query.keyword
            )}
          />

          {/* TOP 10 브리핑 */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <SectionTitle>Top {data.analysis.topBriefing10.length} Briefing</SectionTitle>
              <p className="text-[10px] tracking-widest uppercase text-[#6B7A99]">
                {data.query.keyword ?? "—"} · {periodLabels[data.query.period]} ·{" "}
                후보 {data.analyzedCount}건
              </p>
            </div>
            <ol className="space-y-3">
              {data.analysis.topBriefing10.map((story, i) => {
                const idx = story.sourceIndex - 1;
                const link =
                  idx >= 0 && idx < data.articles.length
                    ? data.articles[idx].link
                    : undefined;
                const importance =
                  typeof story.importanceScore === "number"
                    ? story.importanceScore
                    : clampScore(100 - i * 9);
                return (
                  <li
                    key={`${story.sourceIndex}-${i}`}
                    className="rounded-2xl border border-[#C8D4E0] bg-[#FDFAF5] px-5 py-4"
                  >
                    <div className="flex items-stretch gap-4">
                      {/* 순위 배지 */}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full border border-[#2A4A7F] font-serif text-sm text-[#2A4A7F]">
                        {i + 1}
                      </span>
                      {/* 내용 */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm font-medium leading-snug text-[#1C2D4F] underline-offset-2 hover:text-[#2A4A7F] hover:underline transition"
                          >
                            {story.headline}
                          </a>
                        ) : (
                          <p className="text-sm font-medium leading-snug text-[#1A2744]">
                            {story.headline}
                          </p>
                        )}
                        <p className="text-sm font-light leading-relaxed text-[#4A6080]">
                          {story.briefingLine}
                        </p>
                        <p className="text-xs font-light leading-relaxed text-[#6B7A99]">
                          <span className="text-[#1A2744]/60">왜 중요한가 — </span>
                          {story.whyItMatters}
                        </p>
                      </div>
                      {/* 중요도 원형 */}
                      <ImportanceGauge score={importance} />
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* 종합 요약 */}
          <section className="space-y-3">
            <SectionTitle>Summary</SectionTitle>
            <Divider />
            <p className="whitespace-pre-wrap text-sm font-light leading-loose text-[#4A6080]">
              {data.analysis.executiveSummary}
            </p>
            <p className="text-[10px] tracking-widest uppercase text-[#6B7A99]">
              수집 {data.count}건 · 분석 {data.analyzedCount}건
            </p>
          </section>

          {/* 감정 분석 */}
          <section className="space-y-3">
            <SectionTitle>Sentiment</SectionTitle>
            <Divider />
            <div className="rounded-2xl border border-[#C8D4E0] bg-[#FDFAF5] px-6 py-5 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-[#2A4A7F] px-4 py-1 text-xs tracking-widest uppercase text-[#2A4A7F]">
                  {sentimentLabel(data.analysis.sentiment.label)}
                </span>
                <span className="text-xs font-light text-[#6B7A99]">
                  점수 {data.analysis.sentiment.score.toFixed(2)} (–1 ~ 1)
                </span>
              </div>
              <p className="text-sm font-light leading-relaxed text-[#4A6080]">
                {data.analysis.sentiment.contextNote}
              </p>
            </div>
          </section>

          {/* 주제 분류 */}
          <section className="space-y-3">
            <SectionTitle>Categories</SectionTitle>
            <Divider />
            <div className="grid gap-3 sm:grid-cols-2">
              {data.analysis.categories.map((c) => (
                <div
                  key={c.name}
                  className="rounded-2xl border border-[#C8D4E0] bg-[#FDFAF5] px-5 py-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#1A2744]">{c.name}</span>
                    <span className="text-xs font-light text-[#2A4A7F]">
                      {(c.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-light text-[#6B7A99]">{c.rationale}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 트렌드 인사이트 */}
          <section className="space-y-3">
            <SectionTitle>Trend Insights</SectionTitle>
            <Divider />
            <ul className="space-y-2">
              {data.analysis.trendInsights.map((t, i) => (
                <li key={i} className="flex gap-3 text-sm font-light text-[#4A6080]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2A4A7F]" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* 원문 링크 */}
          <section className="space-y-3">
            <SectionTitle>Sources</SectionTitle>
            <Divider />
            <ul className="space-y-2">
              {data.articles.map((a, i) => (
                <li key={i} className="flex items-baseline gap-2 text-xs font-light">
                  <span className="shrink-0 text-[#2A4A7F]">{String(i + 1).padStart(2, "0")}</span>
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A6080] underline-offset-2 hover:text-[#2A4A7F] hover:underline transition"
                  >
                    {a.title}
                  </a>
                  <span className="shrink-0 text-[#6B7A99]">{a.pubDate}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
