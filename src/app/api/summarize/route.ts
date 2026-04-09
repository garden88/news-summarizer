import { NextResponse } from "next/server";
import type { SearchPeriod } from "@/types/news";
import { searchNaverNews } from "@/lib/naver";
import { analyzeNewsWithOpenAI } from "@/lib/analyze-news";

export const maxDuration = 120;

function getEnv() {
  const naverId = process.env.NAVER_CLIENT_ID;
  const naverSecret = process.env.NAVER_CLIENT_SECRET;
  const openaiKey = process.env.OPENAI_API_KEY;
  return { naverId, naverSecret, openaiKey };
}

export async function POST(req: Request) {
  const { naverId, naverSecret, openaiKey } = getEnv();
  if (!naverId || !naverSecret) {
    return NextResponse.json(
      { error: "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경 변수를 설정하세요." },
      { status: 500 }
    );
  }
  if (!openaiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 환경 변수를 설정하세요." },
      { status: 500 }
    );
  }

  let body: { keyword?: string; period?: SearchPeriod };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 JSON 본문입니다." }, { status: 400 });
  }

  const period: SearchPeriod =
    body.period === "today" || body.period === "week" || body.period === "all"
      ? body.period
      : "all";
  const keyword = typeof body.keyword === "string" ? body.keyword : undefined;

  try {
    const articles = await searchNaverNews({
      keyword,
      period,
      clientId: naverId,
      clientSecret: naverSecret,
      maxTotal: 60,
    });

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "검색 결과가 없습니다. 키워드나 기간을 바꿔 보세요." },
        { status: 404 }
      );
    }

    const forModel = articles.slice(0, 50);
    const analysis = await analyzeNewsWithOpenAI(openaiKey, forModel, keyword);

    return NextResponse.json({
      query: { keyword: keyword ?? null, period },
      count: articles.length,
      analyzedCount: forModel.length,
      articles: forModel.map((a) => ({
        title: a.title,
        link: a.originallink || a.link,
        description: a.description,
        pubDate: a.pubDate,
      })),
      analysis,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
