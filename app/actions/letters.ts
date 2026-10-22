"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { parseLetterFields, type LetterField } from "@/lib/letters";
import { canApproveLetters } from "@/lib/roles";

export type LetterFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

type ValidatedLetter = {
  nomor: string | null;
  tanggalSurat: Date | null;
  perihal: string;
  headerHtml: string | null;
  showDate: boolean;
  showSignDate: boolean;
  data: Record<string, string>;
};

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function validate(
  formData: FormData,
  fields: LetterField[],
): { values?: ValidatedLetter; fieldErrors?: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const nomor = value(formData, "nomor");
  const tanggal = value(formData, "tanggal_surat");
  const perihal = value(formData, "perihal");
  const headerHtml = String(formData.get("header_html") ?? "");

  if (nomor.length > 100) {
    fieldErrors.nomor = "Nomor surat maksimal 100 karakter.";
  }

  if (perihal === "") {
    fieldErrors.perihal = "Perihal wajib diisi.";
  } else if (perihal.length > 255) {
    fieldErrors.perihal = "Perihal maksimal 255 karakter.";
  }

  let tanggalSurat: Date | null = null;
  if (tanggal !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      fieldErrors.tanggal_surat = "Format tanggal tidak valid.";
    } else {
      tanggalSurat = new Date(`${tanggal}T00:00:00.000Z`);
      if (Number.isNaN(tanggalSurat.getTime())) {
        fieldErrors.tanggal_surat = "Tanggal tidak valid.";
        tanggalSurat = null;
      }
    }
  }

  if (headerHtml.length > 65535) {
    fieldErrors.header_html = "Baris atas surat terlalu panjang.";
  }

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

  return {
    values: {
      nomor: nomor || null,
      tanggalSurat,
      perihal,
      headerHtml: headerHtml.trim() === "" ? null : headerHtml,
      showDate: formData.get("tampilkan_tanggal") === "on",
      showSignDate: formData.get("tampilkan_tanggal_ttd") === "on",
      data,
    },
  };
}

export async function createLetter(
  _previous: LetterFormState,
  formData: FormData,
): Promise<LetterFormState> {
  const user = await requireUser();
  const letterTypeId = Number(value(formData, "letter_type_id"));

  const letterType = await prisma.letter_types.findUnique({
    where: { id: letterTypeId },
  });

  if (!letterType || !letterType.active) {
    return { error: "Jenis surat tidak ditemukan atau tidak aktif." };
  }

  const fields = parseLetterFields(letterType.fields);
  const result = validate(formData, fields);

  if (!result.values) {
    return { fieldErrors: result.fieldErrors };
  }

  const letter = await prisma.letters.create({
    data: {
      letter_type_id: letterType.id,
      nomor: result.values.nomor,
      tanggal_surat: result.values.tanggalSurat,
      perihal: result.values.perihal,
      header_html: result.values.headerHtml,
      tampilkan_tanggal: result.values.showDate,
      tampilkan_tanggal_ttd: result.values.showSignDate,
      data: JSON.stringify(result.values.data),
      status: "draft",
      created_by: Number(user.id),
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  const submissionId = Number(value(formData, "dari"));
  if (Number.isInteger(submissionId) && submissionId > 0) {
    await prisma.submissions.updateMany({
      where: {
        id: submissionId,
        letter_type_id: letterType.id,
        status: "baru",
      },
      data: { status: "diproses" },
    });
  }

  revalidatePath("/letters");
  redirect(`/letters/${letter.id}`);
}

export async function updateLetter(
  letterId: number,
  _previous: LetterFormState,
  formData: FormData,
): Promise<LetterFormState> {
  await requireUser();

  const letter = await prisma.letters.findUnique({
    where: { id: letterId },
    include: { letter_types: true },
  });

  if (!letter) {
    return { error: "Surat tidak ditemukan." };
  }

  if (!["draft", "ditolak", "disetujui"].includes(letter.status)) {
    return { error: "Surat sudah diproses dan tidak bisa diubah." };
  }

  const fields = parseLetterFields(letter.letter_types.fields);
  const result = validate(formData, fields);

  if (!result.values) {
    return { fieldErrors: result.fieldErrors };
  }

  await prisma.letters.update({
    where: { id: letter.id },
    data: {
      nomor: result.values.nomor,
      tanggal_surat: result.values.tanggalSurat,
      perihal: result.values.perihal,
      header_html: result.values.headerHtml,
      tampilkan_tanggal: result.values.showDate,
      tampilkan_tanggal_ttd: result.values.showSignDate,
      data: JSON.stringify(result.values.data),
      updated_at: new Date(),
    },
  });

  revalidatePath("/letters");
  revalidatePath(`/letters/${letter.id}`);
  redirect(`/letters/${letter.id}`);
}

export async function deleteLetter(letterId: number) {
  await requireUser();

  await prisma.letters.delete({ where: { id: letterId } }).catch(() => null);

  revalidatePath("/letters");
  redirect("/letters");
}

export async function submitLetter(letterId: number) {
  await requireUser();

  const letter = await prisma.letters.findUnique({ where: { id: letterId } });
  if (!letter) redirect("/letters");
  if (letter.status !== "draft") {
    redirect(`/letters/${letterId}?error=status`);
  }

  await prisma.letters.update({
    where: { id: letterId },
    data: { status: "diajukan", updated_at: new Date() },
  });

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/letters");
  redirect(`/letters/${letterId}`);
}

export async function approveLetter(letterId: number) {
  const user = await requireUser();

  if (!canApproveLetters(user.role)) {
    redirect(`/letters/${letterId}?error=akses`);
  }

  const letter = await prisma.letters.findUnique({ where: { id: letterId } });
  if (!letter) redirect("/letters");
  if (letter.status !== "diajukan") {
    redirect(`/letters/${letterId}?error=status`);
  }

  await prisma.letters.update({
    where: { id: letterId },
    data: {
      status: "disetujui",
      approved_by: Number(user.id),
      approved_at: new Date(),
      updated_at: new Date(),
    },
  });

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/letters");
  redirect(`/letters/${letterId}`);
}

export async function rejectLetter(
  letterId: number,
  _previous: LetterFormState,
  formData: FormData,
): Promise<LetterFormState> {
  const user = await requireUser();

  if (!canApproveLetters(user.role)) {
    return { error: "Anda tidak memiliki akses untuk menolak surat." };
  }

  const keterangan = value(formData, "keterangan");
  if (keterangan === "") {
    return { fieldErrors: { keterangan: "Catatan penolakan wajib diisi." } };
  }
  if (keterangan.length > 1000) {
    return { fieldErrors: { keterangan: "Catatan maksimal 1000 karakter." } };
  }

  const letter = await prisma.letters.findUnique({ where: { id: letterId } });
  if (!letter) {
    return { error: "Surat tidak ditemukan." };
  }
  if (letter.status !== "diajukan") {
    return { error: "Hanya surat berstatus diajukan yang bisa ditolak." };
  }

  await prisma.letters.update({
    where: { id: letterId },
    data: { status: "ditolak", keterangan, updated_at: new Date() },
  });

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/letters");
  redirect(`/letters/${letterId}`);
}

export async function publishLetter(letterId: number) {
  await requireUser();

  const letter = await prisma.letters.findUnique({ where: { id: letterId } });
  if (!letter) redirect("/letters");

  if (letter.status !== "disetujui") {
    redirect(`/letters/${letterId}?error=status`);
  }

  if (!letter.nomor) {
    redirect(`/letters/${letterId}?error=nomor`);
  }

  if (!letter.tanggal_surat) {
    redirect(`/letters/${letterId}?error=tanggal`);
  }

  await prisma.letters.update({
    where: { id: letterId },
    data: { status: "terbit", updated_at: new Date() },
  });

  revalidatePath(`/letters/${letterId}`);
  revalidatePath("/letters");
  redirect(`/letters/${letterId}`);
}
