import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import puppeteer, { type Browser } from "puppeteer-core";

import { UPLOAD_ROOT } from "@/lib/uploads";

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ?? "/usr/bin/chromium-browser";

const MIME: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

declare global {
  var __kuaPdfBrowser: Promise<Browser> | undefined;
}

function launch(): Promise<Browser> {
  return puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=none",
    ],
  });
}

function getBrowser(): Promise<Browser> {
  if (!globalThis.__kuaPdfBrowser) {
    globalThis.__kuaPdfBrowser = launch().catch((error) => {
      globalThis.__kuaPdfBrowser = undefined;
      throw error;
    });
  }
  return globalThis.__kuaPdfBrowser;
}

export async function inlineStorageImages(html: string): Promise<string> {
  const matches = [...html.matchAll(/src="\/storage\/([^"]+)"/g)];
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const [full, encoded] = match;
    try {
      const relative = decodeURIComponent(encoded);
      const target = path.resolve(UPLOAD_ROOT, relative);
      if (
        target !== UPLOAD_ROOT &&
        !target.startsWith(`${UPLOAD_ROOT}${path.sep}`)
      ) {
        continue;
      }
      const type = MIME[path.extname(target).toLowerCase()];
      if (!type) continue;
      const data = await readFile(target);
      result = result.replaceAll(
        full,
        `src="data:${type};base64,${data.toString("base64")}"`,
      );
    } catch {
      // Biarkan gambar yang tidak ditemukan agar PDF tetap bisa dirender.
    }
  }

  return result;
}

export async function renderPdf(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready.then(() => true));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return pdf;
  } finally {
    await page.close().catch(() => null);
  }
}
