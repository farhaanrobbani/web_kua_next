export const SUBMISSION_STATUS = {
  baru: { label: "Baru", className: "bg-amber-100 text-amber-800" },
  diproses: { label: "Diproses", className: "bg-sky-100 text-sky-800" },
  selesai: { label: "Selesai", className: "bg-emerald-100 text-emerald-800" },
  ditolak: { label: "Ditolak", className: "bg-rose-100 text-rose-800" },
} as const;

export type SubmissionStatus = keyof typeof SUBMISSION_STATUS;

export function submissionStatus(status: string) {
  return (
    SUBMISSION_STATUS[status as SubmissionStatus] ?? {
      label: status,
      className: "bg-muted text-muted-foreground",
    }
  );
}
