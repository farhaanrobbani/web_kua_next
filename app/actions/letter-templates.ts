"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";
import { normalizeLetterHtml } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

const MANAGE_ROLES = ["operator", "superadmin"] as const;

export type LetterTemplateFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parse(formData: FormData): {
  values?: {
    letter_type_id: number;
    name: string;
    body: string;
    active: boolean;
  };
  fieldErrors?: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const letterTypeId = Number.parseInt(value(formData, "letter_type_id"), 10);
  const name = value(formData, "name");
  const body = String(formData.get("body") ?? "");

  if (!Number.isInteger(letterTypeId) || letterTypeId <= 0) {
    fieldErrors.letter_type_id = "Pilih jenis surat.";
  }

  if (name === "") {
    fieldErrors.name = "Nama template wajib diisi.";
  } else if (name.length > 150) {
    fieldErrors.name = "Nama maksimal 150 karakter.";
  }

  if (body.trim() === "") {
    fieldErrors.body = "Isi template wajib diisi.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    values: {
      letter_type_id: letterTypeId,
      name,
      body: normalizeLetterHtml(body),
      active: formData.get("active") === "1",
    },
  };
}

async function ensureLetterType(id: number): Promise<boolean> {
  const found = await prisma.letter_types.findUnique({
    where: { id },
    select: { id: true },
  });
  return Boolean(found);
}

export async function createLetterTemplate(
  _previous: LetterTemplateFormState,
  formData: FormData,
): Promise<LetterTemplateFormState> {
  await requireUser(MANAGE_ROLES);

  const result = parse(formData);
  if (!result.values) return { fieldErrors: result.fieldErrors };

  if (!(await ensureLetterType(result.values.letter_type_id))) {
    return { fieldErrors: { letter_type_id: "Jenis surat tidak ditemukan." } };
  }

  await prisma.letter_templates.create({
    data: {
      ...result.values,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/letter-templates");
  revalidatePath("/letters");
  redirect("/letter-templates");
}

export async function updateLetterTemplate(
  templateId: number,
  _previous: LetterTemplateFormState,
  formData: FormData,
): Promise<LetterTemplateFormState> {
  await requireUser(MANAGE_ROLES);

  const existing = await prisma.letter_templates.findUnique({
    where: { id: templateId },
  });
  if (!existing) return { error: "Template tidak ditemukan." };

  const result = parse(formData);
  if (!result.values) return { fieldErrors: result.fieldErrors };

  if (!(await ensureLetterType(result.values.letter_type_id))) {
    return { fieldErrors: { letter_type_id: "Jenis surat tidak ditemukan." } };
  }

  await prisma.letter_templates.update({
    where: { id: templateId },
    data: { ...result.values, updated_at: new Date() },
  });

  revalidatePath("/letter-templates");
  revalidatePath("/letters");
  revalidatePath(`/letters/${templateId}`);
  redirect("/letter-templates");
}

export async function deleteLetterTemplate(templateId: number) {
  await requireUser(MANAGE_ROLES);

  await prisma.letter_templates
    .delete({ where: { id: templateId } })
    .catch(() => null);

  revalidatePath("/letter-templates");
  revalidatePath("/letters");
  redirect("/letter-templates");
}
