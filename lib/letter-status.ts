export const LETTER_STATUSES = [
  { key: "draft", label: "Draft", className: "bg-muted text-muted-foreground" },
  {
    key: "diajukan",
    label: "Diajukan",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  {
    key: "disetujui",
    label: "Disetujui",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  },
  {
    key: "terbit",
    label: "Terbit",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  {
    key: "ditolak",
    label: "Ditolak",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
] as const;

export type LetterStatus = (typeof LETTER_STATUSES)[number]["key"];

export function isLetterStatus(value: string): value is LetterStatus {
  return LETTER_STATUSES.some((item) => item.key === value);
}

export function letterStatusLabel(status: string): string {
  return LETTER_STATUSES.find((item) => item.key === status)?.label ?? status;
}

export function letterStatusClass(status: string): string {
  return (
    LETTER_STATUSES.find((item) => item.key === status)?.className ??
    "bg-muted text-muted-foreground"
  );
}
