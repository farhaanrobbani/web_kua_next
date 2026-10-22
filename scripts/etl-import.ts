import "dotenv/config";

import { readFileSync } from "node:fs";

import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";

const prisma = new PrismaClient();

const SURDIG_ENV =
  process.env.SURDIG_ENV ?? "/home/farhanrobbani/projects/surdig/.env";
const CHUNK = 500;

function parseEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      v.length > 1 &&
      ((v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'")))
    ) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const DATE_ONLY = new Set(["tanggal", "tanggal_akad", "tanggal_surat"]);
const TIMESTAMPTZ = new Set([
  "created_at",
  "updated_at",
  "published_at",
  "approved_at",
  "email_verified_at",
]);
const BOOLEAN = new Set([
  "active",
  "publik",
  "kop_footer_enabled",
  "kop_enabled",
  "tampilkan_tanggal",
  "tampilkan_tanggal_ttd",
  "has_submenu",
  "is_active",
]);

function convertRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(row)) {
    const v = raw as unknown;
    if (v === null || v === undefined) {
      out[key] = null;
      continue;
    }
    if (DATE_ONLY.has(key)) {
      const s = String(v);
      out[key] = /^0000-00-00/.test(s) ? null : new Date(`${s.slice(0, 10)}T00:00:00Z`);
      continue;
    }
    if (TIMESTAMPTZ.has(key)) {
      const s = String(v);
      out[key] = /^0000-00-00/.test(s)
        ? null
        : new Date(`${s.replace(" ", "T")}+07:00`);
      continue;
    }
    if (BOOLEAN.has(key)) {
      out[key] = v === true || Number(v) === 1;
      continue;
    }
    out[key] =
      typeof v === "object" && v !== null ? JSON.stringify(v) : v;
  }
  return out;
}

type CreateManyModel = {
  createMany: (args: { data: Record<string, unknown>[] }) => Promise<unknown>;
};

async function copyTable(
  conn: mysql.Connection,
  table: string,
  { stripParent = false } = {},
) {
  const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
  const original = (rows as Record<string, unknown>[]).map(convertRow);
  const data = original.map((row) =>
    stripParent ? { ...row, parent_id: null } : row,
  );

  for (let i = 0; i < data.length; i += CHUNK) {
    await (prisma as unknown as Record<string, CreateManyModel>)[
      table
    ].createMany({
      data: data.slice(i, i + CHUNK),
    });
  }
  console.log(`  ${table.padEnd(24)} ${data.length} baris`);
  return original;
}

async function resetSequence(table: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`,
  );
}

async function main() {
  const env = parseEnv(SURDIG_ENV);
  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 3306),
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    dateStrings: true,
    jsonStrings: true,
  });

  const existing = await prisma.users.count();
  if (existing > 0 && process.env.ETL_FORCE !== "1") {
    throw new Error(
      `Target sudah berisi ${existing} user. Set ETL_FORCE=1 untuk timpa.`,
    );
  }

  console.log("Impor tabel (urutan mengikuti foreign key):");
  await copyTable(conn, "users");
  await copyTable(conn, "letter_types");
  await copyTable(conn, "letter_templates");
  await copyTable(conn, "letters");
  await copyTable(conn, "submissions");
  await copyTable(conn, "announcements");
  await copyTable(conn, "kua_daily_data");
  await copyTable(conn, "staff_activities");
  await copyTable(conn, "user_activity_templates");
  const navbar = await copyTable(conn, "navbar_items", { stripParent: true });

  const noFk = [
    "download_items",
    "kritik_sarans",
    "kua_activity_themes",
    "kua_settings",
    "marriage_announcements",
    "marriage_services",
    "pages",
    "religious_services",
    "staff",
    "wakaf_services",
  ];
  for (const table of noFk) await copyTable(conn, table);

  const withParent = navbar.filter((row) => row.parent_id !== null);
  for (const row of withParent) {
    await prisma.navbar_items.update({
      where: { id: row.id as number },
      data: { parent_id: row.parent_id as number },
    });
  }
  if (withParent.length) {
    console.log(`  navbar_items parent diperbaiki: ${withParent.length}`);
  }

  const mysqlParents = new Map(
    navbar.map((row) => [Number(row.id), row.parent_id ?? null]),
  );
  const pgRows = await prisma.navbar_items.findMany({
    select: { id: true, parent_id: true },
  });
  const parentMismatch = pgRows.filter(
    (row) => (mysqlParents.get(row.id) ?? null) !== row.parent_id,
  ).length;
  if (parentMismatch > 0) {
    throw new Error(`navbar_items: ${parentMismatch} parent_id tidak cocok.`);
  }
  console.log("  navbar_items parent_id: cocok");

  const allTables = [
    "users",
    "letter_types",
    "letter_templates",
    "letters",
    "submissions",
    "announcements",
    "kua_daily_data",
    "staff_activities",
    "user_activity_templates",
    "navbar_items",
    ...noFk,
  ];
  for (const table of allTables) await resetSequence(table);

  console.log("\nVerifikasi jumlah baris:");
  let mismatch = 0;
  for (const table of allTables) {
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS n FROM \`${table}\``,
    );
    const n = Number(rows[0]?.n ?? -1);
    const [{ count }] = await prisma.$queryRawUnsafe<
      { count: bigint }[]
    >(`SELECT COUNT(*)::bigint AS count FROM "${table}"`);
    const ok = Number(n) === Number(count);
    if (!ok) mismatch++;
    console.log(
      `  ${ok ? "OK  " : "BEDA"} ${table.padEnd(24)} mysql=${n} pg=${count}`,
    );
  }

  await conn.end();
  await prisma.$disconnect();
  if (mismatch > 0) {
    console.error(`\n${mismatch} tabel tidak cocok.`);
    process.exit(1);
  }
  console.log("\nETL selesai.");
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
