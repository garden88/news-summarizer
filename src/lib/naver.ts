import type { NaverNewsItemRaw, ParsedNewsItem, SearchPeriod } from "@/types/news";
import { stripAndDecodeHtml } from "@/lib/html";
import { isSameDayKST, isWithinLastDaysKST } from "@/lib/time-kst";

const NAVER_NEWS = "https://openapi.naver.com/v1/search/news.json";

function parsePubDate(s: string): Date {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function buildSearchQuery(keyword: string | undefined, period: SearchPeriod): string {
  const k = keyword?.trim();
  if (k) return k;
  if (period === "today") return "오늘 주요 뉴스";
  if (period === "week") return "이번주 주요 뉴스";
  return "한국 뉴스";
}

async function fetchPage(
  query: string,
  start: number,
  display: number,
  clientId: string,
  clientSecret: string
): Promise<NaverNewsItemRaw[]> {
  const url = new URL(NAVER_NEWS);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));
  url.searchParams.set("start", String(start));
  url.searchParams.set("sort", "date");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver API 오류 (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { items?: NaverNewsItemRaw[] };
  return data.items ?? [];
}

function mapItem(raw: NaverNewsItemRaw): ParsedNewsItem {
  return {
    title: stripAndDecodeHtml(raw.title),
    originallink: raw.originallink,
    link: raw.link,
    description: stripAndDecodeHtml(raw.description),
    pubDate: raw.pubDate,
    publishedAt: parsePubDate(raw.pubDate),
  };
}

function filterByPeriod(items: ParsedNewsItem[], period: SearchPeriod): ParsedNewsItem[] {
  if (period === "all") return items;
  if (period === "today") {
    return items.filter((it) => isSameDayKST(it.publishedAt));
  }
  return items.filter((it) => isWithinLastDaysKST(it.publishedAt, 7));
}

/**
 * Fetches up to `maxTotal` news items (paginated), maps, optionally filters by KST period.
 */
export async function searchNaverNews(options: {
  keyword?: string;
  period: SearchPeriod;
  clientId: string;
  clientSecret: string;
  maxTotal?: number;
}): Promise<ParsedNewsItem[]> {
  const { keyword, period, clientId, clientSecret, maxTotal = 80 } = options;
  const query = buildSearchQuery(keyword, period);
  const pageSize = 100;
  const collected: ParsedNewsItem[] = [];
  let start = 1;

  while (collected.length < maxTotal && start <= 1000) {
    const remaining = maxTotal - collected.length;
    const display = Math.min(pageSize, remaining);
    const page = await fetchPage(query, start, display, clientId, clientSecret);
    if (page.length === 0) break;
    for (const raw of page) {
      collected.push(mapItem(raw));
      if (collected.length >= maxTotal) break;
    }
    if (page.length < display) break;
    start += page.length;
  }

  const filtered = filterByPeriod(collected, period);

  if (period !== "all" && filtered.length < 5 && collected.length >= 10) {
    return collected.slice(0, maxTotal);
  }

  return filtered.length > 0 ? filtered : collected;
}
