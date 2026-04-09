export type SearchPeriod = "all" | "today" | "week";

export interface NaverNewsItemRaw {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

export interface ParsedNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
  publishedAt: Date;
}

/** 데일리 브리핑: 가장 유의미한 기사 상위(최대 10개) */
export interface BriefingStory {
  /** 입력 목록의 1-based 인덱스 */
  sourceIndex: number;
  headline: string;
  /** 왜 TOP에 들어가는지 (영향·파급) */
  whyItMatters: string;
  /** 한 줄 브리핑 (매일 읽기 좋게) */
  briefingLine: string;
  /** 절대 중요도 0~100 (이번 브리핑 후보 대비 단일 척도) */
  importanceScore: number;
}

export interface NewsAnalysis {
  executiveSummary: string;
  /** 중요도 순 1위~최대 10위 (매일 쫙 브리핑용) */
  topBriefing10: BriefingStory[];
  keywords: Array<{
    term: string;
    importance: number;
    rationale: string;
  }>;
  sentiment: {
    label: "positive" | "negative" | "neutral" | "mixed";
    score: number;
    contextNote: string;
  };
  categories: Array<{
    name: string;
    confidence: number;
    rationale: string;
  }>;
  trendInsights: string[];
}
