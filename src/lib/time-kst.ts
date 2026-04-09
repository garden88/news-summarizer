const KST = "Asia/Seoul";

export function formatDateKST(d: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Same calendar day in KST as `reference` (default: now). */
export function isSameDayKST(a: Date, reference: Date = new Date()): boolean {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(a) === fmt.format(reference);
}

export function isWithinLastDaysKST(a: Date, days: number, reference: Date = new Date()): boolean {
  const end = reference.getTime();
  const start = end - days * 24 * 60 * 60 * 1000;
  return a.getTime() >= start && a.getTime() <= end;
}
