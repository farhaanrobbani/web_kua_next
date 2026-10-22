"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseLetterFields } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

export type PublicSubmissionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitPublicSubmission(
  _previous: PublicSubmissionState,
  formData: FormData,
): Promise<PublicSubmissionState> {
  if (value(formData, "website") !== "") {
    return { error: "Permohonan ditolak." };
  }

  const code = value(formData, "jenis");
  const namaPemohon = value(formData, "nama_pemohon");
  const kontak = value(formData, "kontak");
  const fieldErrors: Record<string, string> = {};

  const letterType = await prisma.letter_types.findFirst({
    where: { code, active: true, publik: true },
  });

  if (!letterType) {
    return { error: "Jenis surat tidak ditemukan atau tidak menerima permohonan online." };
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
      fieldErrors[`data.${field.name}`] = `${field.label} maksimal 1000 karakter.`;
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

  const cookieStore = await cookies();
  cookieStore.set("permohonan_unduh", submission.token ?? "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  redirect("/permohonan/sukses");
}

export async function trackSubmission(
  _previous: PublicSubmissionState,
  formData: FormData,
): Promise<PublicSubmissionState> {
  const token = value(formData, "token");

  if (token === "") {
    return { fieldErrors: { token: "Token wajib diisi." } };
  }

  if (token.length > 64) {
    return { fieldErrors: { token: "Token tidak valid." } };
  }

  const submission = await prisma.submissions.findUnique({
    where: { token },
    select: { token: true },
  });

  if (!submission?.token) {
    return {
      fieldErrors: {
        token: "Token tidak ditemukan. Periksa kembali token Anda.",
      },
    };
  }

  redirect(`/permohonan/track/${submission.token}`);
}
