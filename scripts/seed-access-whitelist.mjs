#!/usr/bin/env node
/**
 * Upsert data/phone-whitelist-seed.csv into access_whitelist.
 *
 *   DATABASE_URL=… npm run access:seed
 *
 * Idempotent (ON CONFLICT phone_e164 DO NOTHING). Preview / no DATABASE_URL
 * skips — PGLite applies migrations/0002_access_whitelist.sql on startup,
 * which already seeds the same 42 numbers.
 */
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.log(
    "[access:seed] DATABASE_URL not set — skip (PGLite migration seeds itself).",
  );
  process.exit(0);
}

function normalizePhoneE164(raw) {
  const trimmed = String(raw ?? "").trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 11) return `+${digits}`;
  return null;
}

const csvPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
  "phone-whitelist-seed.csv",
);

const csv = await readFile(csvPath, "utf8");
const lines = csv.trim().split(/\r?\n/).slice(1);
const rows = [];
for (const line of lines) {
  const m = line.match(/^([^,]+),([^,]*),([^,]*),([^,]*),([^,]*),(.*)$/);
  if (!m) {
    console.error("[access:seed] could not parse:", line);
    process.exit(1);
  }
  const e164 = normalizePhoneE164(m[2]);
  if (!e164) {
    console.error("[access:seed] bad phone:", m[2]);
    process.exit(1);
  }
  rows.push({
    id: m[1],
    e164,
    name: m[3],
    notes: m[4],
    invited: m[5].replace(" ", "T") + "Z",
    created: m[6].replace(" ", "T") + "Z",
  });
}

const pool = new pg.Pool({ connectionString: databaseUrl, max: 1 });
const client = await pool.connect();
try {
  let inserted = 0;
  for (const row of rows) {
    const res = await client.query(
      `insert into access_whitelist
         (id, phone_e164, contact_name, notes, invited_at, created_at)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (phone_e164) do nothing`,
      [row.id, row.e164, row.name, row.notes, row.invited, row.created],
    );
    inserted += res.rowCount ?? 0;
  }
  await client.query(
    `insert into access_seed_meta (id) values ('v1') on conflict (id) do nothing`,
  );
  console.log(
    `[access:seed] ${rows.length} CSV rows — ${inserted} inserted, ${rows.length - inserted} already present.`,
  );
} finally {
  client.release();
  await pool.end();
}
