import "server-only";

import {
  normalizeLetterHtml,
  parseLetterData,
  parseLetterFields,
  parseStringArray,
  sanitizeLetterHtml,
  tanggalSuratId,
  titleCase,
  type LetterTypeLike,
} from "@/lib/letters";
import { setting, type KuaSettings } from "@/lib/kua";

type SubmissionLike = {
  id: number;
  nama_pemohon: string;
  kontak: string | null;
  data: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isNaN(date.getTime())) return tanggalSuratId(date);
  }
  return value;
}

function todayId(): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export function renderSubmissionBody({
  submission,
  letterType,
}: {
  submission: SubmissionLike;
  letterType: LetterTypeLike & { permohonan_body: string | null };
}): string {
  const fields = parseLetterFields(letterType.fields);
  const data = parseLetterData(submission.data);

  const narrative =
    letterType.permohonan_body && letterType.permohonan_body.trim() !== ""
      ? normalizeLetterHtml(letterType.permohonan_body)
      : normalizeLetterHtml(
          `Memohon agar diterbitkan ${letterType.name} yang saya perlukan untuk kepentingan yang sah.\n\nDemikian Surat Permohonan ini kami buat dengan sebenar-benarnya agar dapat menjadi maklum.`,
        );

  let body = narrative;
  for (const field of fields) {
    const fieldValue = data[field.name] ?? "";
    body = body.replaceAll(
      `[${field.name}]`,
      escapeHtml(formatValue(fieldValue)),
    );
  }
  body = body.replaceAll("[nama_pemohon]", escapeHtml(submission.nama_pemohon));
  body = body.replaceAll("[kontak]", escapeHtml(submission.kontak ?? ""));

  return sanitizeLetterHtml(body);
}

export function buildSubmissionDocument({
  submission,
  letterType,
  settings,
}: {
  submission: SubmissionLike;
  letterType: LetterTypeLike & {
    permohonan_judul: string | null;
    permohonan_fields: string | null;
    permohonan_body: string | null;
  };
  settings: KuaSettings;
}): string {
  const fields = parseLetterFields(letterType.fields).filter(
    (field) => !field.internal,
  );
  const selected = parseStringArray(letterType.permohonan_fields);
  const identityFields =
    selected.length > 0
      ? fields.filter((field) => selected.includes(field.name))
      : fields;

  const data = parseLetterData(submission.data);
  const body = renderSubmissionBody({ submission, letterType });

  const rows = identityFields
    .map((field) => {
      const raw = data[field.name];
      const value = raw ? formatValue(raw) : "—";
      return `<tr><td class="label">${escapeHtml(field.label)}</td><td class="titik">:</td><td>${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  const kabupaten = setting(settings, "kabupaten");
  const title = (
    letterType.permohonan_judul?.trim() || letterType.name
  ).toUpperCase();

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Surat Permohonan ${escapeHtml(letterType.name)}</title>
<style>
  @page { size: 210mm 297mm; margin: 2cm 2.5cm 2.5cm 3cm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: "DejaVu Sans", Arial, "Liberation Sans", sans-serif; font-size: 12px; line-height: 1.92; color: #111; }
  .judul { text-align: center; font-weight: bold; text-decoration: underline; font-size: 14px; margin-bottom: 24px; }
  .isi { text-align: justify; line-height: 1.92; }
  .isi p { margin: 0 0 12px; line-height: 1.92; }
  .isi table { line-height: 1.92; }
  .isi img { max-width: 100%; height: auto; }
  .data-tabel { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
  .data-tabel td { vertical-align: top; padding: 1px 0; }
  .data-tabel .label { width: 190px; }
  .data-tabel .titik { width: 16px; }
  .ttd { margin-top: 48px; text-align: right; }
  .ttd .blok { display: inline-block; text-align: center; }
  .kotak-materai { width: 96px; height: 72px; border: 2px solid #111; margin: 6px auto; text-align: center; line-height: 72px; font-size: 10px; }
  .ttd .nama { font-weight: bold; text-decoration: underline; margin-top: 4px; }
  @media screen {
    body { max-width: 21cm; margin: 0 auto; padding: 2cm 2.5cm; }
  }
</style>
</head>
<body>
<div class="judul">${escapeHtml(title)}</div>
<div class="isi">
<p>Yang bertanda tangan di bawah ini, saya:</p>
<table class="data-tabel">${rows}</table>
${body}
</div>
<div class="ttd"><div class="blok">
<div>${kabupaten ? `${escapeHtml(titleCase(kabupaten))}, ` : ""}${escapeHtml(todayId())}</div>
<div>Hormat saya</div>
<div class="kotak-materai">MATERAI 10.000</div>
<div class="nama">${escapeHtml(submission.nama_pemohon)}</div>
</div></div>
</body>
</html>`;
}
