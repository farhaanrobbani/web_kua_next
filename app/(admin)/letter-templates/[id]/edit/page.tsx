import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  LetterTemplateForm,
  type LetterTemplateInitial,
} from "@/components/admin/letter-template-form";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Template — Surat Digital KUA",
};

export default async function EditLetterTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser(["operator", "superadmin"]);

  const templateId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(templateId)) notFound();

  const [template, letterTypes] = await Promise.all([
    prisma.letter_templates.findUnique({ where: { id: templateId } }),
    prisma.letter_types.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!template) notFound();

  const initial: LetterTemplateInitial = {
    letterTypeId: template.letter_type_id,
    name: template.name,
    body: template.body,
    active: template.active,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Template" description={template.name}>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/letter-templates" />}
        >
          <ArrowLeft />
          Kembali
        </Button>
      </PageHeader>

      <Card>
        <CardContent>
          <LetterTemplateForm
            mode="edit"
            templateId={template.id}
            letterTypes={letterTypes}
            initial={initial}
          />
        </CardContent>
      </Card>
    </div>
  );
}
