import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";

import { PageHeader } from "@/components/admin/page-header";
import {
  LetterForm,
  type LetterFormInitial,
} from "@/components/admin/letter-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import { jakartaDateString } from "@/lib/jakarta";
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
  title: "Buat Surat — Surat Digital KUA",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function CreateLetterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser();

  const raw = await searchParams;
  const code = single(raw.jenis);
  const dariId = Number.parseInt(single(raw.dari), 10);

  const letterTypes = await prisma.letter_types.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      letter_templates: {
        where: { active: true },
        orderBy: { id: "asc" },
        take: 1,
      },
    },
  });

  const selectedType = code
    ? await prisma.letter_types.findFirst({
        where: { code, active: true },
        include: {
          letter_templates: {
            where: { active: true },
            orderBy: { id: "asc" },
            take: 1,
          },
        },
      })
    : null;

  if (!selectedType) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Buat Surat Baru"
          description="Pilih jenis surat untuk mulai membuat draft."
        >
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/letters" />}
          >
            <ArrowLeft />
            Kembali
          </Button>
        </PageHeader>

        {code ? (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Jenis surat tidak ditemukan atau sedang tidak aktif.
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {letterTypes.map((type) => {
                  const fieldCount = parseLetterFields(type.fields).length;
                  return (
                    <Link
                      key={type.id}
                      href={`/letters/create?jenis=${encodeURIComponent(type.code)}`}
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
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {fieldCount} field
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields = parseLetterFields(selectedType.fields);
  let submissionId: number | undefined;
  let data: Record<string, string> = {};
  let perihal = "";
  let applicant: { name: string; contact: string } | null = null;

  if (Number.isInteger(dariId) && dariId > 0) {
    const submission = await prisma.submissions.findUnique({
      where: { id: dariId },
    });

    if (submission && submission.letter_type_id === selectedType.id) {
      submissionId = submission.id;
      data = parseLetterData(submission.data);
      perihal = `Permohonan Penerbitan ${selectedType.name}`;
      applicant = {
        name: submission.nama_pemohon,
        contact: submission.kontak ?? "-",
      };
    }
  }

  const initial: LetterFormInitial = {
    nomor: "",
    tanggalSurat: jakartaDateString(),
    perihal,
    headerHtml: defaultLetterHeader(),
    showDate: true,
    showSignDate: true,
    data,
  };

  const template = selectedType.letter_templates[0] ?? null;
  const templatePreview = template
    ? sanitizeLetterHtml(colonTableFormat(normalizeLetterHtml(template.body)))
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Surat Baru"
        description={selectedType.name}
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/letters" />}
        >
          <ArrowLeft />
          Kembali
        </Button>
      </PageHeader>

      {applicant ? (
        <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-200">
          Data diisi otomatis dari permohonan{" "}
          <strong>{applicant.name}</strong> ({applicant.contact}). Silakan
          periksa kembali sebelum menyimpan.
        </p>
      ) : null}

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
                render={<Link href="/letters/create" />}
              >
                Ganti jenis
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <LetterForm
              mode="create"
              letterTypeId={selectedType.id}
              fields={fields}
              initial={initial}
              cancelHref="/letters"
              dariId={submissionId}
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
                Belum ada template aktif untuk jenis surat ini. Surat tetap bisa
                dibuat, tetapi isi badan surat akan kosong sampai template
                ditambahkan.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
