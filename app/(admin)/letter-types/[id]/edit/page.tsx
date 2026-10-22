import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  title: "Edit Jenis Surat — Surat Digital KUA",
};

export default async function EditLetterTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["operator", "superadmin"]);

  const letterTypeId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(letterTypeId)) notFound();

  const letterType = await prisma.letter_types.findUnique({
    where: { id: letterTypeId },
  });

  if (!letterType) notFound();

  const initial: LetterTypeInitial = {
    code: letterType.code,
    name: letterType.name,
    permohonanJudul: letterType.permohonan_judul ?? "",
    description: letterType.description ?? "",
    permohonanBody: letterType.permohonan_body ?? "",
    permohonanInformasi: letterType.permohonan_informasi ?? "",
    active: letterType.active,
    publik: letterType.publik,
    kopEnabled: letterType.kop_enabled,
    kopFooter: letterType.kop_footer ?? "",
    kopFooterEnabled: letterType.kop_footer_enabled,
    fields: parseLetterFields(letterType.fields),
    permohonanFields: parseStringArray(letterType.permohonan_fields),
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Jenis Surat" description={letterType.name}>
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
            mode="edit"
            letterTypeId={letterType.id}
            initial={initial}
          />
        </CardContent>
      </Card>
    </div>
  );
}
