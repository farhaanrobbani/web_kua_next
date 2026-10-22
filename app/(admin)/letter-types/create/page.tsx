import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  LetterTypeForm,
  type LetterTypeInitial,
} from "@/components/admin/letter-type-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import {
  parseLetterFields,
  parseStringArray,
} from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tambah Jenis Surat — Surat Digital KUA",
};

function single(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function CreateLetterTypePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireUser(["operator", "superadmin"]);

  const fromId = Number.parseInt(single((await searchParams).from), 10);
  const source =
    Number.isInteger(fromId) && fromId > 0
      ? await prisma.letter_types.findUnique({ where: { id: fromId } })
      : null;

  const initial: LetterTypeInitial = {
    code: "",
    name: source ? `${source.name} (Salinan)` : "",
    permohonanJudul: source?.permohonan_judul ?? "",
    description: source?.description ?? "",
    permohonanBody: source?.permohonan_body ?? "",
    permohonanInformasi: source?.permohonan_informasi ?? "",
    active: true,
    publik: source?.publik ?? false,
    kopEnabled: source?.kop_enabled ?? true,
    kopFooter: source?.kop_footer ?? "",
    kopFooterEnabled: source?.kop_footer_enabled ?? false,
    fields: parseLetterFields(source?.fields ?? null),
    permohonanFields: parseStringArray(source?.permohonan_fields ?? null),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={source ? "Clone Jenis Surat" : "Tambah Jenis Surat"}
        description={
          source
            ? `Menyalin dari ${source.name}. Sesuaikan kode dan nama sebelum menyimpan.`
            : "Buat jenis surat baru beserta field formulir dan pengaturan kop."
        }
      >
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/letter-types" />}
        >
          <ArrowLeft />
          Kembali
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <LetterTypeForm
            mode="create"
            initial={initial}
            cloneNote={
              source
                ? `Data disalin dari ${source.name} (kode asli: ${source.code}). Kode dan nama wajib diubah.`
                : undefined
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
