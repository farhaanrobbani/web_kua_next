import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  LetterForm,
  type LetterFormInitial,
} from "@/components/admin/letter-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import {
  colonTableFormat,
  defaultLetterHeader,
  normalizeLetterHtml,
  parseLetterData,
  parseLetterFields,
  sanitizeLetterHtml,
} from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Surat — Surat Digital KUA",
};

export default async function EditLetterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();

  const letterId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(letterId)) notFound();

  const letter = await prisma.letters.findUnique({
    where: { id: letterId },
    include: { letter_types: true },
  });

  if (!letter) notFound();

  if (!["draft", "ditolak", "disetujui"].includes(letter.status)) {
    redirect(`/letters/${letter.id}?error=status`);
  }

  const template = await prisma.letter_templates.findFirst({
    where: { letter_type_id: letter.letter_type_id, active: true },
    orderBy: { id: "asc" },
  });

  const fields = parseLetterFields(letter.letter_types.fields);
  const initial: LetterFormInitial = {
    nomor: letter.nomor ?? "",
    tanggalSurat: letter.tanggal_surat
      ? letter.tanggal_surat.toISOString().slice(0, 10)
      : "",
    perihal: letter.perihal,
    headerHtml: letter.header_html?.trim() || defaultLetterHeader(),
    showDate: letter.tampilkan_tanggal,
    showSignDate: letter.tampilkan_tanggal_ttd,
    data: parseLetterData(letter.data),
  };

  const templatePreview = template
    ? sanitizeLetterHtml(colonTableFormat(normalizeLetterHtml(template.body)))
    : "";

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Surat" description={letter.letter_types.name}>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={`/letters/${letter.id}`} />}
        >
          <ArrowLeft />
          Kembali ke Detail
        </Button>
      </PageHeader>

      {letter.status === "ditolak" && letter.keterangan ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
          <p className="text-xs font-medium text-destructive">
            Catatan penolakan
          </p>
          <p className="mt-1">{letter.keterangan}</p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Formulir Surat</CardTitle>
          </CardHeader>
          <CardContent>
            <LetterForm
              mode="edit"
              letterId={letter.id}
              letterTypeId={letter.letter_type_id}
              fields={fields}
              initial={initial}
              cancelHref={`/letters/${letter.id}`}
            />
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader className="border-b">
            <CardTitle className="text-base">Template Surat</CardTitle>
          </CardHeader>
          <CardContent>
            {templatePreview ? (
              <div
                className="max-h-[60vh] overflow-auto rounded-md bg-muted/40 p-3 text-sm [&_p]:mb-2 [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-1 [&_th]:border [&_th]:border-border [&_th]:p-1"
                dangerouslySetInnerHTML={{ __html: templatePreview }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Belum ada template aktif untuk jenis surat ini.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
