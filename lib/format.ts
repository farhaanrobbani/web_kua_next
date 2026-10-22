const JAKARTA = "Asia/Jakarta";

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function tanggalId(
  value: Date | string,
  variant: "short" | "long" = "short",
  timeZone: string = JAKARTA,
): string {
  const date = toDate(value);
  const formatter =
    variant === "long"
      ? new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
          timeZone,
        })
      : new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone,
        });
  return formatter.format(date);
}

export function hariAngka(value: Date | string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    timeZone,
  }).format(toDate(value));
}

export function bulanSingkat(value: Date | string, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    timeZone,
  }).format(toDate(value));
}

export function excerpt(
  value: string | null,
  content: string,
  limit = 160,
): string {
  if (value && value.trim().length > 0) return value;
  const plain = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length <= limit ? plain : `${plain.slice(0, limit)}...`;
}
