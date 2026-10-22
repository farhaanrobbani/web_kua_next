"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";
import type { LetterField, LetterFieldType } from "@/lib/letters";
import { normalizeLetterHtml } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

const MANAGE_ROLES = ["operator", "superadmin"] as const;
const FIELD_TYPES: LetterFieldType[] = ["text", "textarea", "date", "select"];

export type LetterTypeFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function parseFields(formData: FormData): {
  fields: LetterField[];
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const fields: LetterField[] = [];
  const count = Number.parseInt(value(formData, "field_count"), 10);

  if (!Number.isInteger(count) || count < 0 || count > 100) {
    return { fields, errors: { fields: "Jumlah field tidak valid." } };
  }

  const seen = new Set<string>();

  for (let index = 0; index < count; index += 1) {
    const name = value(formData, `fields[${index}][name]`);
    const label = value(formData, `fields[${index}][label]`);
    const type = value(formData, `fields[${index}][type]`) as LetterFieldType;
    const required = value(formData, `fields[${index}][required]`) === "1";
    const internal = value(formData, `fields[${index}][internal]`) === "1";
    const optionsText = value(formData, `fields[${index}][options]`);

    if (name === "") {
      errors[`fields.${index}.name`] = "Nama field wajib diisi.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      errors[`fields.${index}.name`] =
        "Nama field hanya boleh huruf, angka, dan garis bawah.";
    } else if (seen.has(name)) {
      errors[`fields.${index}.name`] = "Nama field tidak boleh sama.";
    } else {
      seen.add(name);
    }

    if (label === "") {
      errors[`fields.${index}.label`] = "Label field wajib diisi.";
    }

    if (!FIELD_TYPES.includes(type)) {
      errors[`fields.${index}.type`] = "Tipe field tidak valid.";
    }

    const field: LetterField = { name, label, type, required };
    if (internal) field.internal = true;

    if (type === "select") {
      const options = [
        ...new Set(
          optionsText
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean),
        ),
      ];
      if (options.length === 0) {
        errors[`fields.${index}.options`] =
          "Isi minimal satu pilihan untuk field pilihan.";
      }
      field.options = options;
    }

    fields.push(field);
  }

  return { fields, errors };
}

function parse(
  formData: FormData,
): {
  values?: {
    code: string;
    name: string;
    permohonan_judul: string;
    description: string | null;
    permohonan_body: string | null;
    permohonan_informasi: string | null;
    permohonan_fields: string | null;
    fields: string;
    active: boolean;
    publik: boolean;
    kop_enabled: boolean;
    kop_footer: string | null;
    kop_footer_enabled: boolean;
  };
  fieldErrors?: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  const code = value(formData, "code");
  const name = value(formData, "name");
  const permohonanJudul = value(formData, "permohonan_judul");
  const description = value(formData, "description");
  const permohonanBody = String(formData.get("permohonan_body") ?? "");
  const permohonanInformasi = value(formData, "permohonan_informasi");
  const kopFooter = value(formData, "kop_footer");

  if (code === "") {
    fieldErrors.code = "Kode wajib diisi.";
  } else if (code.length > 50) {
    fieldErrors.code = "Kode maksimal 50 karakter.";
  }

  if (name === "") {
    fieldErrors.name = "Nama wajib diisi.";
  } else if (name.length > 150) {
    fieldErrors.name = "Nama maksimal 150 karakter.";
  }

  if (permohonanJudul === "") {
    fieldErrors.permohonan_judul = "Judul surat permohonan wajib diisi.";
  } else if (permohonanJudul.length > 200) {
    fieldErrors.permohonan_judul = "Judul maksimal 200 karakter.";
  }

  if (description.length > 1000) {
    fieldErrors.description = "Deskripsi maksimal 1000 karakter.";
  }

  if (permohonanInformasi.length > 2000) {
    fieldErrors.permohonan_informasi = "Informasi maksimal 2000 karakter.";
  }

  if (kopFooter.length > 5000) {
    fieldErrors.kop_footer = "Footer maksimal 5000 karakter.";
  }

  const parsedFields = parseFields(formData);
  Object.assign(fieldErrors, parsedFields.errors);

  const fieldNames = new Set(parsedFields.fields.map((field) => field.name));
  const permohonanFields = formData
    .getAll("permohonan_fields")
    .map(String)
    .filter((item) => fieldNames.has(item));

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    values: {
      code,
      name,
      permohonan_judul: permohonanJudul,
      description: description || null,
      permohonan_body: permohonanBody.trim()
        ? normalizeLetterHtml(permohonanBody)
        : null,
      permohonan_informasi: permohonanInformasi || null,
      permohonan_fields:
        permohonanFields.length > 0 ? JSON.stringify(permohonanFields) : null,
      fields: JSON.stringify(parsedFields.fields),
      active: formData.get("active") === "1",
      publik: formData.get("publik") === "1",
      kop_enabled: formData.get("kop_enabled") === "1",
      kop_footer: kopFooter || null,
      kop_footer_enabled: formData.get("kop_footer_enabled") === "1",
    },
  };
}

async function ensureUniqueCode(
  code: string,
  currentId: number | null,
): Promise<string | undefined> {
  const existing = await prisma.letter_types.findFirst({
    where: {
      code,
      ...(currentId ? { id: { not: currentId } } : {}),
    },
    select: { id: true },
  });

  if (existing) return "Kode sudah digunakan oleh jenis surat lain.";
  return undefined;
}

export async function createLetterType(
  _previous: LetterTypeFormState,
  formData: FormData,
): Promise<LetterTypeFormState> {
  await requireUser(MANAGE_ROLES);

  const result = parse(formData);
  if (!result.values) return { fieldErrors: result.fieldErrors };

  const codeError = await ensureUniqueCode(result.values.code, null);
  if (codeError) return { fieldErrors: { code: codeError } };

  await prisma.letter_types.create({
    data: {
      ...result.values,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/letter-types");
  revalidatePath("/letters/create");
  redirect("/letter-types");
}

export async function updateLetterType(
  letterTypeId: number,
  _previous: LetterTypeFormState,
  formData: FormData,
): Promise<LetterTypeFormState> {
  await requireUser(MANAGE_ROLES);

  const existing = await prisma.letter_types.findUnique({
    where: { id: letterTypeId },
  });
  if (!existing) return { error: "Jenis surat tidak ditemukan." };

  const result = parse(formData);
  if (!result.values) return { fieldErrors: result.fieldErrors };

  const codeError = await ensureUniqueCode(result.values.code, letterTypeId);
  if (codeError) return { fieldErrors: { code: codeError } };

  await prisma.letter_types.update({
    where: { id: letterTypeId },
    data: { ...result.values, updated_at: new Date() },
  });

  revalidatePath("/letter-types");
  revalidatePath("/letters");
  revalidatePath("/letters/create");
  revalidatePath(`/letters/create?jenis=${existing.code}`);
  redirect("/letter-types");
}

export async function deleteLetterType(letterTypeId: number) {
  await requireUser(MANAGE_ROLES);

  const letterType = await prisma.letter_types.findUnique({
    where: { id: letterTypeId },
    include: {
      _count: { select: { letters: true, submissions: true, letter_templates: true } },
    },
  });

  if (!letterType) redirect("/letter-types?error=notfound");
  if (letterType._count.letters > 0) redirect("/letter-types?error=letters");
  if (letterType._count.submissions > 0) redirect("/letter-types?error=submissions");
  if (letterType._count.letter_templates > 0) {
    redirect("/letter-types?error=templates");
  }

  await prisma.letter_types.delete({ where: { id: letterTypeId } });

  revalidatePath("/letter-types");
  revalidatePath("/letters/create");
  redirect("/letter-types");
}
