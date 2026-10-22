import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  FileClock,
  FilePlus2,
  Files,
  HeartHandshake,
  Inbox,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { canManageContent } from "@/lib/roles";
import { requireUser } from "@/lib/authz";
import { tanggalId } from "@/lib/format";
import {
  jakartaDayStart,
  jakartaHour,
  jakartaMonthRange,
} from "@/lib/jakarta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Surat Digital KUA",
};

const LETTER_STATUSES = [
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
    className:
      "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
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
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
] as const;

const SUBMISSION_STATUS: Record<string, { label: string; className: string }> = {
  baru: {
    label: "Baru",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  },
  diproses: {
    label: "Diproses",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  selesai: {
    label: "Selesai",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  ditolak: {
    label: "Ditolak",
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
};

function statusBadge(status: string) {
  const found = LETTER_STATUSES.find((item) => item.key === status);
  const label = found?.label ?? status;
  const className = found?.className ?? "bg-muted text-muted-foreground";
  return <Badge className={className}>{label}</Badge>;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <Card className="gap-0">
      <CardContent className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const month = jakartaMonthRange();
  const today = jakartaDayStart(0);
  const tomorrow = jakartaDayStart(1);
  const dayAfter = jakartaDayStart(2);

  const [
    totalSurat,
    suratBulanIni,
    menungguPersetujuan,
    permohonanBaru,
    totalNikah,
    nikahBulanIni,
    nikahHariIni,
    nikahBesok,
    statusGroups,
    perJenis,
    suratTerbaru,
    permohonanTerbaru,
    totalAnnouncements,
  ] = await Promise.all([
    prisma.letters.count(),
    prisma.letters.count({
      where: {
        status: "terbit",
        tanggal_surat: { gte: month.start, lt: month.end },
      },
    }),
    prisma.letters.count({ where: { status: "diajukan" } }),
    prisma.submissions.count({ where: { status: "baru" } }),
    prisma.marriage_announcements.count(),
    prisma.marriage_announcements.count({
      where: { tanggal_akad: { gte: month.start, lt: month.end } },
    }),
    prisma.marriage_announcements.count({
      where: { tanggal_akad: { gte: today, lt: tomorrow } },
    }),
    prisma.marriage_announcements.count({
      where: { tanggal_akad: { gte: tomorrow, lt: dayAfter } },
    }),
    prisma.letters.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.letter_types.findMany({
      include: { _count: { select: { letters: true } } },
      orderBy: { letters: { _count: "desc" } },
      take: 5,
    }),
    prisma.letters.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: { letter_types: { select: { name: true } } },
    }),
    prisma.submissions.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: { letter_types: { select: { name: true } } },
    }),
    prisma.announcements.count(),
  ]);

  const statusCounts = new Map(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  const hour = jakartaHour();
  const greeting =
    hour < 11
      ? "Selamat pagi"
      : hour < 15
        ? "Selamat siang"
        : hour < 18
          ? "Selamat sore"
          : "Selamat malam";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting}, ${user.name}`}
        description={`${tanggalId(new Date(), "long")} — ringkasan aktivitas KUA hari ini.`}
      >
        {canManageContent(user.role) ? (
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/announcements" />}
            >
              <Megaphone />
              Tulis pengumuman
            </Button>
            <Button nativeButton={false} render={<Link href="/letters" />}>
              <FilePlus2 />
              Buat surat
            </Button>
          </>
        ) : null}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Surat"
          value={totalSurat}
          hint="Seluruh surat tercatat"
          icon={Files}
          accent="bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300"
        />
        <StatCard
          label="Surat Terbit Bulan Ini"
          value={suratBulanIni}
          hint="Status terbit"
          icon={FileCheck2}
          accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={menungguPersetujuan}
          hint="Status diajukan"
          icon={FileClock}
          accent="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
        />
        <StatCard
          label="Permohonan Baru"
          value={permohonanBaru}
          hint="Belum diproses"
          icon={Inbox}
          accent="bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
        />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <HeartHandshake className="size-4 text-rose-500" />
            Pengumuman Nikah
          </CardTitle>
          <CardDescription>
            Ringkasan jadwal akad yang tercatat.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 divide-border sm:grid-cols-4 sm:divide-x">
          {[
            { label: "Total", value: totalNikah },
            { label: "Akad bulan ini", value: nikahBulanIni },
            { label: "Akad hari ini", value: nikahHariIni },
            { label: "Akad besok", value: nikahBesok },
          ].map((item) => (
            <div key={item.label} className="px-1 py-3 sm:px-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Surat per Status</CardTitle>
            <CardDescription>Distribusi seluruh surat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-2">
              {LETTER_STATUSES.map((status) => (
                <li
                  key={status.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`inline-block size-2 rounded-full ${status.className.split(" ")[0]}`}
                    />
                    {status.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {statusCounts.get(status.key) ?? 0}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <p className="text-sm font-medium">Surat per Jenis (Top 5)</p>
              {perJenis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data.</p>
              ) : (
                <ul className="space-y-2">
                  {perJenis.map((type) => (
                    <li
                      key={type.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-muted-foreground">
                        {type.name}
                      </span>
                      <span className="font-medium tabular-nums">
                        {type._count.letters}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-4 text-sm">
              <span className="text-muted-foreground">Total pengumuman</span>
              <span className="font-medium tabular-nums">
                {totalAnnouncements}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>Surat Terbaru</CardTitle>
                <CardDescription>5 surat terakhir dibuat.</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/letters" />}
              >
                Lihat semua
                <ArrowRight />
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {suratTerbaru.length === 0 ? (
                <p className="px-4 text-sm text-muted-foreground">
                  Belum ada surat.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Surat</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suratTerbaru.map((letter) => (
                        <TableRow key={letter.id}>
                          <TableCell className="max-w-56">
                            <p className="truncate font-medium">
                              {letter.perihal}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {letter.nomor ?? "Tanpa nomor"}
                            </p>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {letter.letter_types.name}
                          </TableCell>
                          <TableCell>{statusBadge(letter.status)}</TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {tanggalId(
                              letter.tanggal_surat ?? letter.created_at ?? new Date(),
                              "short",
                              "UTC",
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>Permohonan Terbaru</CardTitle>
                <CardDescription>5 permohonan terakhir masuk.</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/submissions" />}
              >
                Lihat semua
                <ArrowRight />
              </Button>
            </CardHeader>
            <CardContent className="px-0">
              {permohonanTerbaru.length === 0 ? (
                <p className="px-4 text-sm text-muted-foreground">
                  Belum ada permohonan.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pemohon</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permohonanTerbaru.map((submission) => {
                        const status =
                          SUBMISSION_STATUS[submission.status] ??
                          SUBMISSION_STATUS.baru;
                        return (
                          <TableRow key={submission.id}>
                            <TableCell className="max-w-56">
                              <p className="truncate font-medium">
                                {submission.nama_pemohon}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {submission.kontak ?? "-"}
                              </p>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {submission.letter_types.name}
                            </TableCell>
                            <TableCell>
                              <Badge className={status.className}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {tanggalId(
                                submission.created_at ?? new Date(),
                                "short",
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
