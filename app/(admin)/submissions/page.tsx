import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { deleteSubmission } from "@/app/actions/submissions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/authz";
import { datetimeId } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Permohonan Surat — Surat Digital KUA",
};

const PAGE_SIZE = 15;

const STATUSES = [
  {
    key: "baru",
    label: "Baru",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  {
    key: "diproses",
    label: "Diproses",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  },
  {
    key: "selesai",
    label: "Selesai",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
  {
    key: "ditolak",
    label: "Ditolak",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  },
] as const;

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function statusInfo(status: string) {
  return (
    STATUSES.find((item) => item.key === status) ?? {
      label: status,
      className: "bg-muted text-muted-foreground",
    }
  );
}

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();

  const raw = await searchParams;
  const status = single(raw.status);
  const cari = single(raw.cari).trim();
  const page = Math.max(1, Number.parseInt(single(raw.page), 10) || 1);

  const where: Prisma.submissionsWhereInput = {};
  if (STATUSES.some((item) => item.key === status)) where.status = status;
  if (cari) {
    where.OR = [
      { nama_pemohon: { contains: cari, mode: "insensitive" } },
      { kontak: { contains: cari, mode: "insensitive" } },
    ];
  }

  const [total, submissions] = await Promise.all([
    prisma.submissions.count({ where }),
    prisma.submissions.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { letter_types: { select: { name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permohonan Surat"
        description="Kelola permohonan surat dari masyarakat dan buat draf suratnya."
      >
        <Button
          nativeButton={false}
          render={<Link href="/submissions/create" />}
        >
          <Plus />
          Buat Permohonan
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <div className="space-y-1.5">
              <label htmlFor="filter-status" className="text-xs text-muted-foreground">
                Status
              </label>
              <select
                id="filter-status"
                name="status"
                defaultValue={status}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Semua status</option>
                {STATUSES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-cari" className="text-xs text-muted-foreground">
                Cari
              </label>
              <Input
                id="filter-cari"
                name="cari"
                defaultValue={cari}
                placeholder="Nama / kontak pemohon"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Search />
                Filter
              </Button>
              {status || cari ? (
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/submissions" />}
                >
                  Reset
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pemohon</TableHead>
                <TableHead>Jenis Surat</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kode Tracking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada permohonan.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => {
                  const info = statusInfo(submission.status);
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Link
                          href={`/submissions/${submission.id}`}
                          className="font-medium hover:underline"
                        >
                          {submission.nama_pemohon}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {submission.kontak ?? "—"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {submission.letter_types.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {submission.created_at
                          ? datetimeId(submission.created_at)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {submission.token ? (
                          <Link
                            href={`/permohonan/track/${submission.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-blue-600 hover:underline dark:text-blue-400"
                            title={submission.token}
                          >
                            {submission.token.slice(0, 8)}…
                          </Link>
                        ) : (
                          <span className="font-mono text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={info.className}>{info.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={
                              <Link href={`/submissions/${submission.id}`} />
                            }
                          >
                            Detail
                          </Button>
                          <form
                            action={deleteSubmission.bind(null, submission.id)}
                          >
                            <ConfirmSubmit
                              confirmMessage={`Hapus permohonan dari "${submission.nama_pemohon}"?`}
                              pendingLabel="Menghapus…"
                            >
                              Hapus
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/submissions"
        query={{ status, cari }}
      />
    </div>
  );
}
