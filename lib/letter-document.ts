import "server-only";

import {
  letterTypeSettings,
  parseKopTeks,
  parseLetterData,
  parseLetterFields,
  renderLetterBody,
  renderLetterHeader,
  tanggalSuratId,
  titleCase,
  type LetterLike,
  type LetterTemplateLike,
  type LetterTypeLike,
} from "@/lib/letters";
import type { KuaSettings } from "@/lib/kua";
import { uploadUrl } from "@/lib/uploads";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildLetterDocument({
  letter,
  letterType,
  template,
  settings,
}: {
  letter: LetterLike;
  letterType: LetterTypeLike;
  template: LetterTemplateLike | null;
  settings: KuaSettings;
}): string {
  const config = letterTypeSettings(settings);
  const fields = parseLetterFields(letterType.fields);
  const data = parseLetterData(letter.data);
  const body = renderLetterBody({ template, fields, data, letter, settings });
  const header = renderLetterHeader(letter);

  const selectedLogo =
    config.kopLogo === "logo2" && settings.logo2_path
      ? settings.logo2_path
      : settings.logo_path;
  const logoUrl = uploadUrl(selectedLogo);
  const kopLines = parseKopTeks(config.kopTeks);

  const kopClass: Record<string, string> = {
    judul: "kop-judul",
    sub: "kop-sub",
    sub2: "kop-sub2",
    baris: "kop-baris",
  };

  const kopText = kopLines.length
    ? kopLines
        .map(
          (line) =>
            `<div class="${kopClass[line.className]}">${escapeHtml(line.text)}</div>`,
        )
        .join("")
    : `<div class="kop-judul">${escapeHtml(config.instansi)}</div>
       <div class="kop-sub">KECAMATAN ${escapeHtml(config.kecamatan)} KABUPATEN ${escapeHtml(config.kabupaten)}</div>
       <div class="kop-baris">${escapeHtml(config.alamat)}${
         config.telepon ? ` &bull; Telp. ${escapeHtml(config.telepon)}` : ""
       }${config.email ? ` &bull; Email: ${escapeHtml(config.email)}` : ""}${
         config.kodePos ? ` &bull; Kode Pos ${escapeHtml(config.kodePos)}` : ""
       }</div>`;

  let kop = "";

  if (!letterType.kop_enabled) {
    const title = (template?.name?.trim() || letterType.name)
      .replace(/^template\s+/i, "")
      .trim();
    if (title) {
      kop = `<div class="judul-tanpa-kop">${escapeHtml(title)}</div>`;
    }
  } else if (logoUrl || kopLines.length > 0) {
    kop = `<table class="kop-dengan-logo"><tr>${
      logoUrl
        ? `<td class="logo"><img src="${escapeHtml(logoUrl)}" alt="Logo ${escapeHtml(config.instansi)}" /></td>`
        : ""
    }<td class="teks">${kopText}</td></tr></table><hr class="garis-tebal" /><hr class="garis-tipis" />`;
  } else {
    kop = `<div class="kop">${kopText}</div><hr class="garis-tebal" /><hr class="garis-tipis" />`;
  }

  const dateLong = letter.tanggal_surat
    ? tanggalSuratId(letter.tanggal_surat)
    : "";

  const headerBlock = letter.tampilkan_tanggal
    ? `<table class="header-sejajar"><tr><td class="header">${header}</td><td class="tanggal-atas">${escapeHtml(dateLong)}</td></tr></table>`
    : `<div class="header">${header}</div>`;

  const signatureDate =
    letter.tampilkan_tanggal_ttd && dateLong
      ? `<div class="kota">${escapeHtml(titleCase(config.kecamatan))}, ${escapeHtml(dateLong)}</div>`
      : "";

  const anchor = config.kopAnchor
    ? `<div class="anchor">^</div>`
    : `<div style="height:40px"></div>`;

  const footer =
    letterType.kop_footer_enabled && letterType.kop_footer
      ? `<div class="footer-surat">${escapeHtml(letterType.kop_footer)}</div>`
      : "";

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(letter.nomor ? `Surat ${letter.nomor}` : letter.perihal)}</title>
<style>
  @page { size: 210mm 297mm; margin: 0.8cm 3cm 3cm 3cm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { font-family: "DejaVu Sans", Arial, "Liberation Sans", sans-serif; font-size: 12px; line-height: 1.92; color: #111; padding-top: 2.49pt; }
  .kop { text-align: center; margin-bottom: 4px; }
  .kop-judul { font-size: ${config.sizes.judul}px; font-weight: bold; letter-spacing: 0.5px; }
  .kop-sub { font-size: ${config.sizes.sub}px; font-weight: bold; }
  .kop-sub2 { font-size: ${config.sizes.sub2}px; font-weight: bold; }
  .kop-baris { font-size: ${config.sizes.baris}px; }
  .kop-dengan-logo { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  .kop-dengan-logo td { vertical-align: middle; }
  .kop-dengan-logo .logo { width: 100px; text-align: center; }
  .kop-dengan-logo .logo img { width: 90px; height: auto; }
  .kop-dengan-logo .teks { text-align: center; padding-left: 6px; }
  .garis-tebal { border: none; border-top: 3px solid #111; margin: 4px 0 0; }
  .garis-tipis { border: none; border-top: 1.5px solid #111; margin: 1px 0 0; }
  .judul-tanpa-kop { text-align: center; font-weight: bold; font-size: 14px; line-height: 1.792; margin: 0 0 22.31px; }
  .header { margin: 12.23pt 0 15.18pt; line-height: 1.28; }
  .header p { margin: 0 0 12px; }
  .header p:last-child { margin: 0; }
  .header-sejajar { width: 100%; border-collapse: collapse; margin: 12.23pt 0 15.18pt; }
  .header-sejajar td { vertical-align: top; padding: 0; }
  .header-sejajar .tanggal-atas { text-align: right; white-space: nowrap; line-height: 1.28; padding-left: 12px; }
  .isi { text-align: justify; line-height: 1.92; }
  .isi p { margin: 0 0 12px; line-height: 1.92; }
  .isi table { line-height: 1.92; }
  .isi img { max-width: 100%; height: auto; }
  .ttd { margin-top: 40px; text-align: right; padding-right: 8px; }
  .ttd .blok { display: inline-block; text-align: left; }
  .ttd .kota { margin-bottom: 0; }
  .ttd .anchor { font-size: 16px; font-weight: bold; margin: 6px 0; }
  .ttd .nama { font-weight: bold; text-decoration: underline; margin-top: 28px; }
  .ttd .nip { font-size: 11px; line-height: 0.97; }
  .footer-surat { position: fixed; bottom: 1cm; left: 0; right: 0; padding-left: 0.8cm; padding-right: 0.8cm; text-align: left; font-size: 11px; line-height: 1.792; color: #111; }
  @media screen {
    body { max-width: 21cm; margin: 0 auto; padding: 1cm 2cm; }
  }
</style>
</head>
<body>
${kop}
${headerBlock}
<div class="isi">${body}</div>
<div class="ttd"><div class="blok">${signatureDate}<div>Kepala,</div>${anchor}<div class="nama">${escapeHtml(config.kepalaNama)}</div>${
    config.kepalaNip
      ? `<div class="nip">NIP. ${escapeHtml(config.kepalaNip)}</div>`
      : ""
  }</div></div>
${footer}
</body>
</html>`;
}
