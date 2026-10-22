import "server-only";

import sanitizeHtml from "sanitize-html";

import { setting, type KuaSettings } from "@/lib/kua";

export type LetterFieldType = "text" | "textarea" | "date" | "select";

export type LetterField = {
  name: string;
  label: string;
  type: LetterFieldType;
  required: boolean;
  internal?: boolean;
  options?: string[];
};

export type LetterTypeLike = {
  id: number;
  code: string;
  name: string;
  fields: string | null;
  kop_enabled: boolean;
  kop_footer: string | null;
  kop_footer_enabled: boolean;
};

export type LetterTemplateLike = {
  id: number;
  name: string;
  body: string;
  active: boolean;
};

export type LetterLike = {
  id: number;
  nomor: string | null;
  tanggal_surat: Date | null;
  perihal: string;
  header_html: string | null;
  tampilkan_tanggal: boolean;
  tampilkan_tanggal_ttd: boolean;
  data: string;
};

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "sub", "sup",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "hr",
  "a", "img",
  "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "span",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title"],
  img: ["src", "alt", "title", "width", "height"],
  th: ["colspan", "rowspan", "align", "style"],
  td: ["colspan", "rowspan", "align", "style"],
  tr: ["style"],
  table: ["style"],
  ol: ["start"],
  p: ["style"],
  span: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  li: ["style"],
  blockquote: ["style"],
  figcaption: ["style"],
};

const STYLE_PROPERTIES = [
  "font-size", "font-family", "font-weight", "font-style", "text-decoration",
  "line-height", "color", "background-color", "text-align", "vertical-align",
  "width", "height", "max-width", "max-height", "float",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "border", "border-width", "border-style", "border-color", "border-collapse",
  "letter-spacing", "text-indent", "white-space",
];

const SAFE_STYLE_VALUE = /^(?!.*(?:url|expression|javascript|@import|behavior|-moz-binding)).*$/i;

export function sanitizeLetterHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    allowedStyles: {
      "*": Object.fromEntries(
        STYLE_PROPERTIES.map((property) => [property, [SAFE_STYLE_VALUE]]),
      ),
    },
  });
}

export function textToHtml(text: string | null | undefined): string {
  if (!text) return "";
  if (/<[a-z!][a-z0-9]*[^>]*>/i.test(text)) return text;

  return text
    .trim()
    .split(/\n\s*\n+/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function normalizeLetterHtml(text: string | null | undefined): string {
  return sanitizeLetterHtml(textToHtml(text));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

type ColonRow = [label: string, value: string];

function splitLabelValue(line: string): ColonRow | null {
  let insideTag = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (insideTag) {
      if (character === ">") insideTag = false;
      continue;
    }

    if (character === "<") {
      insideTag = true;
      continue;
    }

    if (character !== ":") continue;

    const label = cleanText(line.slice(0, index));
    const value = cleanText(line.slice(index + 1));

    if (!isValidLabel(label) || value === "") return null;

    return [escapeHtml(label), line.slice(index + 1)];
  }

  return null;
}

function isValidLabel(label: string): boolean {
  const length = [...label].length;
  if (length < 2 || length > 40) return false;
  return !/[.!?]\s*$/.test(label);
}

function paragraphRows(html: string): ColonRow[] | null {
  const rows: ColonRow[] = [];

  for (const rawLine of html.split(/<br\s*\/?>/i)) {
    if (cleanText(rawLine) === "") continue;
    const row = splitLabelValue(rawLine);
    if (!row) return null;
    rows.push(row);
  }

  return rows.length === 0 ? null : rows;
}

function leftIndent(attributes: string): number {
  const match = attributes.match(
    /(?:padding|margin)-left\s*:\s*(\d+(?:\.\d+)?)\s*px/i,
  );
  return match ? Math.round(Number(match[1])) : 0;
}

function buildColonTable(
  rows: ColonRow[],
  indent: number,
): string {
  const maxLength = Math.max(...rows.map(([label]) => [...label].length));
  const width = Math.max(100, Math.ceil(maxLength * 6.5));

  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="width:${width}px;text-align:left;vertical-align:top">${label}</td><td style="width:14px;text-align:left;vertical-align:top">:</td><td style="text-align:left;vertical-align:top">${value}</td></tr>`,
    )
    .join("");

  return `<table style="border-collapse:collapse;margin-bottom:12px;${indent ? `margin-left:${indent}px;` : ""}">${body}</table>`;
}

export function colonTableFormat(html: string): string {
  if (!html) return "";

  const parts = html.split(/(<p\b[^>]*>[\s\S]*?<\/p>)/i);
  const output: string[] = [];
  let pendingRows: ColonRow[] = [];
  let pendingIndent: number | null = null;

  const flush = () => {
    if (pendingRows.length > 0) {
      output.push(buildColonTable(pendingRows, pendingIndent ?? 0));
    }
    pendingRows = [];
    pendingIndent = null;
  };

  for (const part of parts) {
    if (part === "") continue;

    const paragraph = part.match(/^<p\b([^>]*)>([\s\S]*?)<\/p>$/i);
    if (!paragraph) {
      flush();
      output.push(part);
      continue;
    }

    const rows = paragraphRows(paragraph[2]);
    if (!rows) {
      flush();
      output.push(part);
      continue;
    }

    pendingRows.push(...rows);
    pendingIndent ??= leftIndent(paragraph[1]);
  }

  flush();

  return output.join("");
}

export function parseLetterFields(value: string | null): LetterField[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((item): LetterField[] => {
      if (!item || typeof item !== "object") return [];
      const field = item as Record<string, unknown>;
      if (typeof field.name !== "string" || typeof field.label !== "string") {
        return [];
      }

      const type = ["text", "textarea", "date", "select"].includes(
        String(field.type),
      )
        ? (field.type as LetterFieldType)
        : "text";

      const options = Array.isArray(field.options)
        ? field.options.map((option) => String(option))
        : undefined;

      return [
        {
          name: field.name,
          label: field.label,
          type,
          required: Boolean(field.required),
          internal: Boolean(field.internal),
          options,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function parseStringArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(String).filter((item) => item !== "");
  } catch {
    return [];
  }
}

export function parseLetterData(value: string | null): Record<string, string> {
  if (!value) return {};

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([key, item]) => [
        key,
        item === null || item === undefined ? "" : String(item),
      ]),
    );
  } catch {
    return {};
  }
}

export function tanggalSuratId(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function defaultLetterHeader(): string {
  return "<p>Nomor : {nomor}</p><p>Lampiran : -</p><p>Perihal : {perihal}</p>";
}

export function renderLetterHeader(
  letter: Pick<LetterLike, "nomor" | "perihal" | "tanggal_surat" | "header_html">,
): string {
  const header =
    letter.header_html && letter.header_html.trim() !== ""
      ? letter.header_html
      : defaultLetterHeader();

  const values: Record<string, string> = {
    nomor: letter.nomor ?? "",
    perihal: letter.perihal,
    tanggal_surat: letter.tanggal_surat
      ? tanggalSuratId(letter.tanggal_surat)
      : "",
  };

  let rendered = header;
  for (const [key, value] of Object.entries(values)) {
    rendered = rendered.replaceAll(`{${key}}`, escapeHtml(value));
  }

  return sanitizeLetterHtml(rendered);
}

export function renderLetterBody({
  template,
  fields,
  data,
  letter,
  settings,
}: {
  template: LetterTemplateLike | null;
  fields: LetterField[];
  data: Record<string, string>;
  letter: Pick<LetterLike, "nomor" | "tanggal_surat" | "perihal">;
  settings: KuaSettings;
}): string {
  if (!template) {
    return "<p>Template surat belum tersedia untuk jenis surat ini.</p>";
  }

  const values: Record<string, string> = {};
  for (const field of fields) {
    values[field.name] = data[field.name] ?? "";
  }

  values.nomor = letter.nomor ?? "";
  values.tanggal_surat = letter.tanggal_surat
    ? tanggalSuratId(letter.tanggal_surat)
    : "";
  values.perihal = letter.perihal;

  const settingKeys = [
    "instansi", "alamat", "kecamatan", "kabupaten", "kode_pos", "telepon",
    "email", "kepala_nama", "kepala_nip", "kepala_pangkat", "sk_kepala",
  ];
  for (const key of settingKeys) {
    if (!(key in values)) {
      values[key] = setting(settings, key);
    }
  }

  let body = colonTableFormat(normalizeLetterHtml(template.body));
  for (const [key, value] of Object.entries(values)) {
    body = body.replaceAll(`[${key}]`, escapeHtml(value));
  }

  return sanitizeLetterHtml(body);
}

export function letterTypeSettings(settings: KuaSettings) {
  const num = (key: string, fallback: number) => {
    const parsed = Number(setting(settings, key));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    instansi: setting(settings, "instansi", "KANTOR URUSAN AGAMA"),
    kecamatan: setting(settings, "kecamatan"),
    kabupaten: setting(settings, "kabupaten"),
    alamat: setting(settings, "alamat"),
    telepon: setting(settings, "telepon"),
    email: setting(settings, "email"),
    kodePos: setting(settings, "kode_pos"),
    kepalaNama: setting(settings, "kepala_nama"),
    kepalaNip: setting(settings, "kepala_nip"),
    kopTeks: setting(settings, "kop_teks"),
    kopLogo: setting(settings, "kop_logo", "logo1"),
    kopAnchor: setting(settings, "kop_anchor", "1") !== "0",
    sizes: {
      judul: num("kop_ukuran_judul", 17),
      sub: num("kop_ukuran_sub", 13),
      sub2: num("kop_ukuran_sub2", 11.5),
      baris: num("kop_ukuran_baris", 10.5),
    },
  };
}

export type KopLine = { text: string; className: "judul" | "sub" | "sub2" | "baris" };

export function parseKopTeks(teks: string): KopLine[] {
  const lines: KopLine[] = [];

  for (const raw of teks.split(/\r\n|\r|\n/)) {
    const value = raw.trim();
    if (value === "") continue;

    if (value.startsWith("###")) {
      const text = value.slice(3).trim();
      if (text) lines.push({ text, className: "sub2" });
    } else if (value.startsWith("##")) {
      const text = value.slice(2).trim();
      if (text) lines.push({ text, className: "sub" });
    } else if (value.startsWith("#")) {
      const text = value.slice(1).trim();
      if (text) lines.push({ text, className: "judul" });
    } else {
      lines.push({ text: value, className: "baris" });
    }
  }

  return lines;
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function letterPdfFileName(nomor: string | null): string {
  return `${(nomor ?? "surat").replaceAll("/", "-")}.pdf`;
}
