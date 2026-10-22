import { bulanSingkat, hariAngka, tanggalId } from "@/lib/format";

type MarriageItem = {
  id: number;
  tanggal_akad: Date;
};

type MarriageScheduleProps = {
  announcements: MarriageItem[];
  title?: string;
};

export function MarriageSchedule({
  announcements,
  title = "Ringkasan Jadwal",
}: MarriageScheduleProps) {
  const groups = new Map<string, number>();
  for (const item of announcements) {
    const key = item.tanggal_akad.toISOString().slice(0, 10);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }

  const entries = Array.from(groups.entries()).slice(0, 6);
  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-teal-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/60 px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
          {title}
        </p>
        <span className="rounded-full bg-teal-700 px-2.5 py-0.5 text-xs font-semibold text-white">
          {announcements.length} pasangan
        </span>
      </div>
      <div className="grid grid-cols-1 gap-6 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([date, count]) => (
          <div
            key={date}
            className="flex items-center gap-3 rounded-lg border border-teal-50 bg-teal-50/40 p-4 transition hover:border-teal-200 hover:bg-teal-50/70"
          >
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-teal-700 text-white">
              <span className="text-base font-bold leading-none">
                {hariAngka(date)}
              </span>
              <span className="text-[10px] uppercase leading-tight">
                {bulanSingkat(date)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-teal-900">
                {tanggalId(date, "long", "UTC")}
              </p>
              <p className="text-xs text-[#1b1b1870]">{count} peristiwa</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
