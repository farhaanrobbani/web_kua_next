import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Tambah Template — Surat Digital KUA",
};

export default async function CreateLetterTemplatePage() {
  await requireUser(["operator", "superadmin"]);

  const letterTypes = await prisma.letter_types.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const initial: LetterTemplateInitial = {
    letterTypeId: 0,
    name: "",
    body: "",
    active: true,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Template Surat"
        description="Buat template badan surat dengan placeholder data."
      >
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
            mode="create"
            letterTypes={letterTypes}
            initial={initial}
          />
        </CardContent>
      </Card>
    </div>
  );
}
