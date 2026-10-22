import { getKuaSettings } from "@/lib/kua";
import { inlineStorageImages, renderPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { buildSubmissionDocument } from "@/lib/submission-document";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const submission = await prisma.submissions.findUnique({
    where: { token },
    include: { letter_types: true },
  });

  if (!submission) {
    return new Response("Permohonan tidak ditemukan.", { status: 404 });
  }

  const settings = await getKuaSettings();
  const html = buildSubmissionDocument({
    submission,
    letterType: submission.letter_types,
    settings,
  });

  const pdf = await renderPdf(await inlineStorageImages(html));
  const fileName = `surat-permohonan-${submission.id}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
