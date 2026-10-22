import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";

import { deleteLetter } from "@/app/actions/letters";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { tanggalId } from "@/lib/format";
import {
  LETTER_STATUSES,
  letterStatusClass,
  letterStatusLabel,
  isLetterStatus,
} from "@/lib/letter-status";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Arsip Surat — Surat Digital KUA",
};

const PAGE_SIZE = 15;

type Search = {
  jenis?: string;
  status?: string;
  tahun?: string;
  cari?: string;
  page?: string;
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();

  const raw = await searchParams;
  const search: Search = {
    jenis: single(raw.jenis),
    status: single(raw.status),
    tahun: single(raw.tahun),
    cari: single(raw.cari).trim(),
    page: single(raw.page),
  };

  const currentPage = Math.max(1, Number.parseInt(search.page ?? "1", 10) || 1);
  const typeId = Number.parseInt(search.jenis ?? "", 10);
  const year = Number.parseInt(search.tahun ?? "", 10);

  const where: Prisma.lettersWhereInput = {};

  if (Number.isInteger(typeId) && typeId > 0) {
    where.letter_type_id = typeId;
  }

  if (search.status && isLetterStatus(search.status)) {
    where.status = search.status;
  }

  if (Number.isInteger(year) && year > 1900 && year < 2200) {
    where.created_at = {
      gte: new Date(`${year}-01-01T00:00:00.000+07:00`),
      lt: new Date(`${year + 1}-01-01T00:00:00.000+07:00`),
    };
  }

  if (search.cari) {
    where.OR = [
      { nomor: { contains: search.cari, mode: "insensitive" } },
      { perihal: { contains: search.cari, mode: "insensitive" } },
    ];
  }

  const [total, letters, letterTypes, yearRows] = await Promise.all([
    prisma.letters.count({ where }),
    prisma.letters.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        letter_types: { select: { name: true } },
        users_letters_created_byTousers: { select: { name: true } },
      },
    }),
    prisma.letter_types.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.$queryRaw<{ tahun: number }[]>`
      SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS tahun
      FROM letters
      WHERE created_at IS NOT NULL
      ORDER BY tahun DESC
    `,
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilters = Boolean(
    search.jenis || search.status || search.tahun || search.cari,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Arsip Surat"
        description="Kelola surat, ajukan persetujuan, terbitkan, dan cetak PDF."
      >
        <Button
          nativeButton={false}
          render={<Link href="/letters/create" />}
        >
          <FilePlus2 />
          Buat Surat
        </Button>
      </PageHeader>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div className="space-y-1.5">
              <label htmlFor="filter-jenis" className="text-xs text-muted-foreground">
                Jenis
              </label>
              <select
                id="filter-jenis"
                name="jenis"
                defaultValue={search.jenis}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Semua jenis</option>
                {letterTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-status" className="text-xs text-muted-foreground">
                Status
              </label>
              <select
                id="filter-status"
                name="status"
                defaultValue={search.status}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Semua status</option>
                {LETTER_STATUSES.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="filter-tahun" className="text-xs text-muted-foreground">
                Tahun
              </label>
              <select
                id="filter-tahun"
                name="tahun"
                defaultValue={search.tahun}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Semua tahun</option>
                {yearRows.map((row) => (
                  <option key={row.tahun} value={row.tahun}>
                    {row.tahun}
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
                defaultValue={search.cari}
                placeholder="Nomor / perihal"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Search />
                Filter
              </Button>
              {activeFilters ? (
                <Button
                  variant="ghost"
                  nativeButton={false}
                  render={<Link href="/letters" />}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {letters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      {activeFilters
                        ? "Tidak ada surat yang cocok dengan filter."
                        : "Belum ada surat."}
                    </TableCell>
                  </TableRow>
                ) : (
                  letters.map((letter) => (
                    <TableRow key={letter.id}>
                      <TableCell className="font-mono text-xs">
                        {letter.nomor ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-72">
                        <Link
                          href={`/letters/${letter.id}`}
                          className="line-clamp-2 font-medium hover:underline"
                        >
                          {letter.perihal}
                        </Link>
                        {letter.users_letters_created_byTousers?.name ? (
                          <p className="text-xs text-muted-foreground">
                            oleh {letter.users_letters_created_byTousers.name}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {letter.letter_types.name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {letter.created_at
                          ? tanggalId(letter.created_at, "short", "Asia/Jakarta")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={letterStatusClass(letter.status)}>
                          {letterStatusLabel(letter.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={<Link href={`/letters/${letter.id}`} />}
                          >
                            Detail
                          </Button>
                          {letter.status === "terbit" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              nativeButton={false}
                              render={<a href={`/letters/${letter.id}/pdf`} />}
                            >
                              PDF
                            </Button>
                          ) : null}
                          <form action={deleteLetter.bind(null, letter.id)}>
                            <ConfirmSubmit
                              confirmMessage={`Hapus surat "${letter.perihal}"? Tindakan ini tidak bisa dibatalkan.`}
                              pendingLabel="Menghapus…"
                            >
                              Hapus
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        basePath="/letters"
        query={{
          jenis: search.jenis,
          status: search.status,
          tahun: search.tahun,
          cari: search.cari,
        }}
      />
    </div>
  );
}
