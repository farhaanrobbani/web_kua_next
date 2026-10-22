import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2, Plus } from "lucide-react";

import { deleteLetterType } from "@/app/actions/letter-types";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { PageHeader } from "@/components/admin/page-header";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/authz";
import { parseLetterFields } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jenis Surat — Surat Digital KUA",
};

const PAGE_SIZE = 15;

const ERRORS: Record<string, string> = {
  letters:
    "Jenis surat tidak bisa dihapus karena masih memiliki surat terkait.",
  submissions:
    "Jenis surat tidak bisa dihapus karena masih memiliki permohonan terkait.",
  templates:
    "Jenis surat tidak bisa dihapus karena masih memiliki template terkait.",
  notfound: "Jenis surat tidak ditemukan.",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LetterTypesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser(["operator", "superadmin"]);

  const raw = await searchParams;
  const page = Math.max(1, Number.parseInt(single(raw.page), 10) || 1);
  const errorKey = single(raw.error);

  const [total, letterTypes] = await Promise.all([
    prisma.letter_types.count(),
    prisma.letter_types.findMany({
      orderBy: [{ active: "desc" }, { code: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { letters: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jenis Surat"
        description="Atur jenis surat, field formulir, dan pengaturan kop surat."
      >
        <Button nativeButton={false} render={<Link href="/letter-types/create" />}>
          <Plus />
          Tambah Jenis Surat
        </Button>
      </PageHeader>

      {ERRORS[errorKey] ? (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {ERRORS[errorKey]}
        </p>
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Surat</TableHead>
                <TableHead>Publik</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {letterTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada jenis surat.
                  </TableCell>
                </TableRow>
              ) : (
                letterTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono text-xs">
                      {type.code}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{type.name}</p>
                      {type.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {type.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {parseLetterFields(type.fields).length} field
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {type._count.letters}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          type.publik
                            ? "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {type.publik ? "Publik" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          type.active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {type.active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/letter-types/${type.id}/edit`} />
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link href={`/letter-types/create?from=${type.id}`} />
                          }
                        >
                          <FilePlus2 />
                          Clone
                        </Button>
                        <form action={deleteLetterType.bind(null, type.id)}>
                          <ConfirmSubmit
                            confirmMessage={`Hapus jenis surat "${type.name}"?`}
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
        </CardContent>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/letter-types"
      />
    </div>
  );
}
