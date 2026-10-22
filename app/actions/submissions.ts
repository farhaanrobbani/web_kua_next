"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";
import { parseLetterFields } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

const SUBMISSION_STATUSES = ["baru", "diproses", "selesai", "ditolak"] as const;

export type SubmissionFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createSubmission(
  _previous: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  await requireUser();

  const code = value(formData, "jenis");
  const namaPemohon = value(formData, "nama_pemohon");
  const kontak = value(formData, "kontak");
  const fieldErrors: Record<string, string> = {};

  const letterType = await prisma.letter_types.findFirst({
    where: { code, active: true },
  });

  if (!letterType) {
    return { error: "Jenis surat tidak ditemukan atau tidak aktif." };
  }

  if (namaPemohon === "") {
    fieldErrors.nama_pemohon = "Nama pemohon wajib diisi.";
  } else if (namaPemohon.length > 150) {
    fieldErrors.nama_pemohon = "Nama pemohon maksimal 150 karakter.";
  }

  if (kontak === "") {
    fieldErrors.kontak = "Kontak wajib diisi.";
  } else if (kontak.length > 100) {
    fieldErrors.kontak = "Kontak maksimal 100 karakter.";
  }

  const fields = parseLetterFields(letterType.fields).filter(
    (field) => !field.internal,
  );
  const data: Record<string, string> = {};

  for (const field of fields) {
    const fieldValue = value(formData, `data[${field.name}]`);
    data[field.name] = fieldValue;

    if (field.required && fieldValue === "") {
      fieldErrors[`data.${field.name}`] = `${field.label} wajib diisi.`;
      continue;
    }

    if (fieldValue.length > 1000) {
      fieldErrors[`data.${field.name}`] =
        `${field.label} maksimal 1000 karakter.`;
      continue;
    }

    if (
      field.type === "select" &&
      fieldValue !== "" &&
      field.options &&
      !field.options.includes(fieldValue)
    ) {
      fieldErrors[`data.${field.name}`] = `Pilihan ${field.label} tidak valid.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const submission = await prisma.submissions.create({
    data: {
      letter_type_id: letterType.id,
      nama_pemohon: namaPemohon,
      kontak,
      data: JSON.stringify(data),
      status: "baru",
      token: randomBytes(20).toString("hex"),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath("/submissions");
  revalidatePath("/dashboard");
  redirect(`/submissions/${submission.id}`);
}

export async function updateSubmissionStatus(
  submissionId: number,
  _previous: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  await requireUser();

  const status = value(formData, "status");
  const catatan = value(formData, "catatan");

  if (!SUBMISSION_STATUSES.includes(status as (typeof SUBMISSION_STATUSES)[number])) {
    return { error: "Status tidak valid." };
  }

  if (catatan.length > 1000) {
    return { fieldErrors: { catatan: "Catatan maksimal 1000 karakter." } };
  }

  const submission = await prisma.submissions.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    return { error: "Permohonan tidak ditemukan." };
  }

  await prisma.submissions.update({
    where: { id: submissionId },
    data: { status, catatan: catatan || null, updated_at: new Date() },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath("/submissions");
  revalidatePath("/dashboard");
  redirect(`/submissions/${submissionId}`);
}

export async function deleteSubmission(submissionId: number) {
  await requireUser();

  await prisma.submissions
    .delete({ where: { id: submissionId } })
    .catch(() => null);

  revalidatePath("/submissions");
  revalidatePath("/dashboard");
  redirect("/submissions");
}
