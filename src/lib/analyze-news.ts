import OpenAI from "openai";
import type { NewsAnalysis, ParsedNewsItem } from "@/types/news";

const MODEL = "gpt-4o-mini";

const SYSTEM = `당신은 한국어 뉴스 에디터입니다. 제공된 뉴스 제목·요약·시간만 근거로 판단하세요. 매일 아침 한 번 읽는 '데일리 브리핑' 형태로, 가장 유의미한 소식 위주로 고릅니다. 추측은 명시하세요. JSON만 출력합니다.`;

function buildUserPayload(
  articles: ParsedNewsItem[],
  userSearchKeyword?: string
): string {
  const lines = articles.map((a, i) => {
    const t = a.title.replace(/\s+/g, " ");
    const d = a.description.replace(/\s+/g, " ").slice(0, 400);
    return `[${i + 1}] ${t}\n    요약: ${d}\n    발행: ${a.pubDate}`;
  });
  const n = articles.length;
  const wantTen = n >= 10;
  const cap = Math.min(n, 10);
  const q = userSearchKeyword?.trim();
  const keywordRule = q
    ? `\n[검색어 규칙] 사용자가 검색창에 입력한 키워드는 **「${q}」** 입니다. keywords의 term에는 **이 문자열과 완전히 동일한 단어(띄어쓰기·대소문자만 다른 것 포함)는 절대 넣지 마세요.** 검색어 자체는 워드클라우드에서 제외하고, 그 주변 이슈를 드러내는 **다른 용어만** 넣으세요.\n`
    : "";
  return `다음 뉴스 목록을 분석하세요. (각 줄 앞의 [번호]는 입력 목록의 1-based 인덱스입니다.)\n총 ${n}건.${keywordRule}\n${lines.join("\n\n")}\n\n요구사항:
1. topBriefing10: **가장 유의미한 기사만** 고릅니다(중요도·사회적 파급·시의성). 위 목록에서만 선택, sourceIndex는 반드시 [번호]와 일치.${wantTen ? ` 기사가 10건 이상이므로 **반드시 10개** 채우고 1위=가장 중요 … 10위 순으로 나열합니다.` : ` 기사가 ${n}건이므로 **최대 ${cap}개**까지 채웁니다(중복 인덱스 금지).`} 각 항목: sourceIndex, headline(짧은 제목), whyItMatters(브리핑에 넣은 이유 1~2문장), briefingLine(한 줄 브리핑), **importanceScore(정수 0~100, 절대 척도: 사회적 파급·시의성·영향 범위를 반영한 단일 점수. 1위가 가장 높게, 순위가 내려갈수록 점수도 내려가게 일관되게)**.
2. executiveSummary: 전체 흐름 2~4문단, 브리핑 도입용.
3. keywords: **서로 다른 용어만** 6~12개. **같은 단어·표기만 다른 중복**은 하나로 합치고 importance는 더 높은 쪽 기준. 유의어·중복 나열 금지. 각 term에 rationale(한 줄).${q ? " 위 [검색어 규칙]을 반드시 지킬 것." : ""}
4. sentiment: 맥락(contextNote) 근거, -1~1 score.
5. categories: 주제별 분류, confidence 0~1, rationale 짧게.
6. trendInsights: 3~6개 인사이트.

반드시 아래 JSON 스키마를 따르세요.`;
}

export async function analyzeNewsWithOpenAI(
  apiKey: string,
  articles: ParsedNewsItem[],
  userSearchKeyword?: string
): Promise<NewsAnalysis> {
  const openai = new OpenAI({ apiKey });

  const cap = Math.min(articles.length, 10);
  const minBrief = articles.length >= 10 ? 10 : 1;

  const res = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.35,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "news_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            executiveSummary: { type: "string" },
            topBriefing10: {
              type: "array",
              minItems: minBrief,
              maxItems: cap,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  sourceIndex: { type: "integer" },
                  headline: { type: "string" },
                  whyItMatters: { type: "string" },
                  briefingLine: { type: "string" },
                  importanceScore: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100,
                  },
                },
                required: [
                  "sourceIndex",
                  "headline",
                  "whyItMatters",
                  "briefingLine",
                  "importanceScore",
                ],
              },
            },
            keywords: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  term: { type: "string" },
                  importance: { type: "number" },
                  rationale: { type: "string" },
                },
                required: ["term", "importance", "rationale"],
              },
            },
            sentiment: {
              type: "object",
              additionalProperties: false,
              properties: {
                label: {
                  type: "string",
                  enum: ["positive", "negative", "neutral", "mixed"],
                },
                score: { type: "number" },
                contextNote: { type: "string" },
              },
              required: ["label", "score", "contextNote"],
            },
            categories: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  confidence: { type: "number" },
                  rationale: { type: "string" },
                },
                required: ["name", "confidence", "rationale"],
              },
            },
            trendInsights: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "executiveSummary",
            "topBriefing10",
            "keywords",
            "sentiment",
            "categories",
            "trendInsights",
          ],
        },
      },
    },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: buildUserPayload(articles, userSearchKeyword) },
    ],
  });

  const text = res.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI 응답이 비어 있습니다.");

  const parsed = JSON.parse(text) as NewsAnalysis;
  return parsed;
}
