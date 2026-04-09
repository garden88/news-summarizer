import type { NewsAnalysis } from "@/types/news";

export function normalizeKeywordKey(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/** 사용자가 입력한 검색어와 동일한 term 제거 (워드클라우드에 검색어가 가장 크게 뜨는 것 방지) */
export function excludeSearchKeyword(
  keywords: NewsAnalysis["keywords"],
  userQuery: string | null | undefined
): NewsAnalysis["keywords"] {
  const q = userQuery?.trim();
  if (!q) return keywords;
  const qn = normalizeKeywordKey(q);
  return keywords.filter((k) => normalizeKeywordKey(k.term) !== qn);
}

/** 표기만 다른 중복 키워드 병합 — 더 높은 importance 유지 */
export function mergeKeywordsByImportance(
  keywords: NewsAnalysis["keywords"]
): NewsAnalysis["keywords"] {
  const map = new Map<
    string,
    { term: string; importance: number; rationale: string }
  >();

  for (const k of keywords) {
    const raw = k.term.trim();
    if (!raw) continue;
    const key = raw.replace(/\s+/g, " ").toLowerCase();
    const prev = map.get(key);
    if (!prev || k.importance > prev.importance) {
      map.set(key, {
        term: raw,
        importance: k.importance,
        rationale: k.rationale,
      });
    } else if (prev && k.importance === prev.importance && k.rationale.length > prev.rationale.length) {
      map.set(key, { ...prev, rationale: k.rationale });
    }
  }

  return [...map.values()].sort((a, b) => b.importance - a.importance);
}
