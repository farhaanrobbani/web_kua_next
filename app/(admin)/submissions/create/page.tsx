import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import { SubmissionForm } from "@/components/admin/submission-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import { parseLetterFields } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buat Permohonan — Surat Digital KUA",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function CreateSubmissionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();

  const code = single((await searchParams).jenis);

  const letterTypes = await prisma.letter_types.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const selectedType = code
    ? letterTypes.find((type) => type.code === code) ?? null
    : null;

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Buat Permohonan Surat"
          description="Pilih jenis surat untuk membuat permohonan baru."
        >
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/submissions" />}
          >
            <ArrowLeft />
            Kembali
          </Button>
        </PageHeader>

        {code ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Jenis surat tidak ditemukan atau tidak aktif.
          </p>
        ) : null}

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base">Pilih Jenis Surat</CardTitle>
          </CardHeader>
          <CardContent>
            {letterTypes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada jenis surat aktif.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {letterTypes.map((type) => (
                  <Link
                    key={type.id}
                    href={`/submissions/create?jenis=${encodeURIComponent(type.code)}`}
                    className="group rounded-lg border p-4 transition hover:border-teal-400 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium group-hover:text-teal-700 dark:group-hover:text-teal-300">
                        {type.name}
                      </div>
                      <FileStack className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                    {type.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    ) : null}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields = parseLetterFields(selectedType.fields).filter(
    (field) => !field.internal,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Permohonan Surat"
        description={selectedType.name}
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/submissions" />}
        >
          <ArrowLeft />
          Kembali
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{selectedType.name}</CardTitle>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                nativeButton={false}
                render={<Link href="/submissions/create" />}
              >
                Ganti jenis
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              letterTypeCode={selectedType.code}
              fields={fields}
            />
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Permohonan ini akan tercatat sebagai permohonan baru. Petugas KUA
              akan memproses dan menghubungi pemohon melalui kontak yang diisi.
            </p>
            {selectedType.permohonan_informasi ? (
              <div className="whitespace-pre-line rounded-md bg-muted/40 p-3 text-foreground">
                {selectedType.permohonan_informasi}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
