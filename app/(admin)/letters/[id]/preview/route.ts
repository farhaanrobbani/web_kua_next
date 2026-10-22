import { requireUser } from "@/lib/authz";
import { buildLetterDocument } from "@/lib/letter-document";
import { getKuaSettings } from "@/lib/kua";
import { letterPdfFileName } from "@/lib/letters";
import { inlineStorageImages, renderPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireUser();

  const letterId = Number.parseInt((await params).id, 10);
  if (!Number.isInteger(letterId)) {
    return new Response("Surat tidak ditemukan.", { status: 404 });
  }

  const letter = await prisma.letters.findUnique({
    where: { id: letterId },
    include: { letter_types: true },
  });

  if (!letter) {
    return new Response("Surat tidak ditemukan.", { status: 404 });
  }

  const template = await prisma.letter_templates.findFirst({
    where: { letter_type_id: letter.letter_type_id, active: true },
    orderBy: { id: "asc" },
  });

  const settings = await getKuaSettings();
  const html = buildLetterDocument({
    letter,
    letterType: letter.letter_types,
    template,
    settings,
  });

  const pdf = await renderPdf(await inlineStorageImages(html));
  const fileName = letterPdfFileName(letter.nomor);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": `inline; filename="${fileName.replace(/"/g, "")}"`,
      "Cache-Control": "no-store",
    },
  });
}
