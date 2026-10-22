import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

export const UPLOAD_ROOT = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "storage/uploads"),
);

export function uploadUrl(storedPath: string | null | undefined): string | null {
  if (!storedPath) return null;
  const relative = storedPath.replace(/^\/?(storage\/)?/, "");
  if (!relative || relative.includes("..")) return null;
  if (!existsSync(path.join(UPLOAD_ROOT, relative))) return null;
  return `/storage/${relative}`;
}
