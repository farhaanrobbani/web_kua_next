const JAKARTA = "Asia/Jakarta";

export function jakartaDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function jakartaHour(date: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: JAKARTA,
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );
}

export function jakartaDayStart(offsetDays = 0): Date {
  const [year, month, day] = jakartaDateString()
    .split("-")
    .map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - 1, day + offsetDays));
}

export function jakartaMonthRange(date: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const [year, month] = jakartaDateString(date)
    .split("-")
    .map(Number) as [number, number];
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}
