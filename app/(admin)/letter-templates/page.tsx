import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { deleteLetterTemplate } from "@/app/actions/letter-templates";
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
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Template Surat — Surat Digital KUA",
};

const PAGE_SIZE = 15;

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function LetterTemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser(["operator", "superadmin"]);

  const page = Math.max(1, Number.parseInt(single((await searchParams).page), 10) || 1);

  const [total, templates] = await Promise.all([
    prisma.letter_templates.count(),
    prisma.letter_templates.findMany({
      orderBy: [{ active: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { letter_types: { select: { name: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Surat"
        description="Kelola template badan surat dan variabel data."
      >
        <Button
          nativeButton={false}
          render={<Link href="/letter-templates/create" />}
        >
          <Plus />
          Tambah Template
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Surat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    Belum ada template.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {template.letter_types.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          template.active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {template.active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          nativeButton={false}
                          render={
                            <Link
                              href={`/letter-templates/${template.id}/edit`}
                            />
                          }
                        >
                          Edit
                        </Button>
                        <form
                          action={deleteLetterTemplate.bind(null, template.id)}
                        >
                          <ConfirmSubmit
                            confirmMessage={`Hapus template "${template.name}"?`}
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
        basePath="/letter-templates"
      />
    </div>
  );
}
