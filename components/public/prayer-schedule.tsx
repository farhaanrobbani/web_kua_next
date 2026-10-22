"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Timings = Record<string, string>;

type DisplayItem = {
  key: string;
  label: string;
  time: string;
  mins: number;
  isNext: boolean;
};

const DEFAULT_LAT = -7.97;
const DEFAULT_LON = 112.63;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours)) return 9999;
  return hours * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function formatMinutes(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(wrapped / 60))}:${pad(wrapped % 60)}`;
}

function buildDisplay(timings: Timings): {
  items: DisplayItem[];
  nextIndex: number;
} {
  const fajr = timings.Fajr ?? "--:--";
  const fajrMinutes = toMinutes(fajr);
  const imsak =
    fajrMinutes !== 9999
      ? formatMinutes(fajrMinutes - 10)
      : (timings.Imsak ?? "--:--");

  const order = [
    { key: "Imsak", label: "Imsak", time: imsak },
    { key: "Fajr", label: "Subuh" },
    { key: "Dhuhr", label: "Dzuhur" },
    { key: "Asr", label: "Ashar" },
    { key: "Maghrib", label: "Maghrib" },
    { key: "Isha", label: "Isya" },
  ];

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const items: DisplayItem[] = order.map((entry) => {
    const time = entry.time ?? timings[entry.key] ?? "--:--";
    return {
      key: entry.key,
      label: entry.label,
      time,
      mins: toMinutes(time),
      isNext: false,
    };
  });

  let nextIndex = items.findIndex((item) => item.mins >= nowMinutes);
  if (nextIndex === -1) nextIndex = 0;
  items[nextIndex].isNext = true;

  return { items, nextIndex };
}

export function PrayerSchedule() {
  const [cityLabel, setCityLabel] = useState("Ampelgading");
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState("");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef<DisplayItem[]>([]);
  const nextRef = useRef(0);

  const updateCountdown = useCallback(() => {
    const current = itemsRef.current;
    if (current.length === 0) return;
    const next = current[nextRef.current];
    if (!next) return;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let diff = next.mins - nowMinutes;
    if (diff < 0) diff += 1440;

    setCountdown(
      `${next.label} dalam ${Math.floor(diff / 60)} j ${diff % 60} m`,
    );
  }, []);

  const fetchByCoords = useCallback(
    async (lat: number, lon: number, label?: string) => {
      setLoading(true);
      setError("");
      setCountdown("");
      if (label) setCityLabel(label);

      const now = new Date();
      const date = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=20`,
        );
        const json = await response.json();
        if (json.code !== 200 || !json.data?.timings) {
          throw new Error("Gagal memuat jadwal.");
        }

        const built = buildDisplay(json.data.timings as Timings);
        itemsRef.current = built.items;
        nextRef.current = built.nextIndex;
        setItems(built.items);
        setLoading(false);
        updateCountdown();

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(updateCountdown, 60000);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Gagal memuat jadwal.",
        );
        setLoading(false);
      }
    },
    [updateCountdown],
  );

  useEffect(() => {
    const start = setTimeout(() => {
      void fetchByCoords(DEFAULT_LAT, DEFAULT_LON);
    }, 0);
    return () => {
      clearTimeout(start);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchByCoords]);

  const useGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation tidak didukung.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchByCoords(
          position.coords.latitude,
          position.coords.longitude,
          "Lokasi Saya",
        );
      },
      () => {
        setError("Gagal mengambil lokasi.");
        setLoading(false);
      },
    );
  };

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-lg border border-teal-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-teal-100 bg-teal-50/60 px-5 py-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">
              Jadwal Sholat
            </p>
            <span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-semibold text-white">
              {cityLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={useGeolocation}
            className="shrink-0 rounded-md border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
          >
            Lokasi Saya
          </button>
        </div>

        {countdown ? (
          <div className="px-5 pt-3">
            <p className="text-xs text-[#1b1b1870]">• {countdown}</p>
          </div>
        ) : null}

        <div className="px-5 py-6">
          {loading ? (
            <p className="text-xs text-[#1b1b1870]">Memuat jadwal...</p>
          ) : null}
          {error ? <p className="text-xs text-red-600">{error}</p> : null}

          {!loading && items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 rounded-lg border p-4 transition ${
                    item.isNext
                      ? "border-teal-700 bg-teal-50"
                      : "border-teal-50 bg-teal-50/40 hover:border-teal-200 hover:bg-teal-50/70"
                  }`}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
                    <span className="text-xs font-bold leading-none sm:text-sm">
                      {item.time}
                    </span>
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-semibold text-teal-900">
                      {item.label} — {item.time}
                    </p>
                    {item.isNext ? (
                      <p className="text-xs text-[#1b1b1870]">Selanjutnya</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-3 text-center">
            <a
              href="https://bimasislam.kemenag.go.id/jadwalshalat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-700 hover:underline"
            >
              Lihat selengkapnya di bimasislam.kemenag.go.id/jadwalshalat →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
