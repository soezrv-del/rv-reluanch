import { getSql } from "@/lib/db";
import { HARD_ADMIN } from "./constants";
import {
  betaSeedAccessResult,
  hardAdminAccessResult,
  hardAdminRequestResult,
  isHardAdminPhone,
  resolveAccess,
  type AccessRow,
} from "./gate";
import { normalizePhone } from "./phone";

export type WhitelistEntry = {
  id: string;
  phoneDigits: string;
  phoneE164: string;
  contactName: string;
  notes: string;
  isAdmin: boolean;
  createdAt: string;
};

export type AccessRequestEntry = {
  id: string;
  name: string;
  phoneDigits: string;
  phoneE164: string;
  status: string;
  createdAt: string;
};

type WhitelistRow = {
  id: string;
  phone_digits: string;
  phone_e164: string;
  contact_name: string;
  notes: string;
  is_admin: boolean;
  created_at: string;
};

type RequestRow = {
  id: string;
  name: string;
  phone_digits: string;
  phone_e164: string;
  status: string;
  created_at: string;
};

function mapWhitelist(row: WhitelistRow): WhitelistEntry {
  return {
    id: row.id,
    phoneDigits: row.phone_digits,
    phoneE164: row.phone_e164,
    contactName: row.contact_name,
    notes: row.notes,
    isAdmin: Boolean(row.is_admin),
    createdAt: String(row.created_at),
  };
}

function mapRequest(row: RequestRow): AccessRequestEntry {
  return {
    id: row.id,
    name: row.name,
    phoneDigits: row.phone_digits,
    phoneE164: row.phone_e164,
    status: row.status,
    createdAt: String(row.created_at),
  };
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Always restore David's admin row. Never seeds the CSV list. */
export async function ensureAdminSeed(): Promise<void> {
  const sql = await getSql();
  await sql`
    insert into access_whitelist (
      id, phone_digits, phone_e164, contact_name, notes, is_admin
    ) values (
      ${HARD_ADMIN.id},
      ${HARD_ADMIN.digits},
      ${HARD_ADMIN.e164},
      ${HARD_ADMIN.name},
      ${HARD_ADMIN.notes},
      true
    )
    on conflict (phone_digits) do update set
      phone_e164 = excluded.phone_e164,
      contact_name = excluded.contact_name,
      notes = excluded.notes,
      is_admin = true
  `;
}

export async function findWhitelistByPhone(
  raw: string,
): Promise<WhitelistEntry | null> {
  const n = normalizePhone(raw);
  if (!n) return null;
  const sql = await getSql();
  const rows = await sql<WhitelistRow>`
    select id, phone_digits, phone_e164, contact_name, notes, is_admin, created_at
    from access_whitelist
    where phone_digits = ${n.digits} or phone_e164 = ${n.e164}
    limit 1
  `;
  return rows[0] ? mapWhitelist(rows[0]) : null;
}

/**
 * Hard admin offline → static beta seed → Neon SQL if available.
 * Seeded testers never 503 when DATABASE_URL / PGLite is down.
 */
export async function checkPhoneAccess(raw: string) {
  const offline = hardAdminAccessResult(raw);
  if (offline) return offline;
  const n = normalizePhone(raw);
  if (!n) {
    return {
      ok: false as const,
      error: "Enter a valid US phone number.",
    };
  }
  const seed = betaSeedAccessResult(raw);
  if (seed) return seed;
  await ensureAdminSeed();
  const row = await findWhitelistByPhone(n.e164);
  const decision = resolveAccess(n.e164, row ? toAccessRow(row) : null);
  return {
    ok: true as const,
    allowed: decision.allowed,
    isAdmin: decision.isAdmin,
    name: row?.contactName || (decision.isAdmin ? HARD_ADMIN.name : ""),
    phoneDigits: n.digits,
    phoneE164: n.e164,
  };
}

function toAccessRow(row: WhitelistEntry): AccessRow {
  return {
    phoneDigits: row.phoneDigits,
    phoneE164: row.phoneE164,
    isAdmin: row.isAdmin,
  };
}

/**
 * Notify-only. Never inserts into access_whitelist.
 * Returns the request id; caller must not treat this as approval.
 */
export async function createAccessRequest(input: {
  name: string;
  phone: string;
}): Promise<
  | { ok: true; requested: true; granted: false; phoneE164: string }
  | {
      ok: true;
      requested: false;
      granted: true;
      alreadyAdmin: true;
      phoneE164: string;
    }
  | { ok: false; error: string; unavailable?: boolean }
> {
  const offline = hardAdminRequestResult(input.phone);
  if (offline) return offline;
  const n = normalizePhone(input.phone);
  if (!n) return { ok: false, error: "Enter a valid US phone number." };
  const name = String(input.name ?? "").trim().slice(0, 80);
  try {
    await ensureAdminSeed();
    const sql = await getSql();
    const id = newId("req");
    await sql`
      insert into access_requests (id, name, phone_digits, phone_e164, status)
      values (${id}, ${name}, ${n.digits}, ${n.e164}, 'pending')
      on conflict (phone_digits) do update set
        name = excluded.name,
        phone_e164 = excluded.phone_e164,
        status = 'pending',
        created_at = now()
    `;
    return { ok: true, requested: true, granted: false, phoneE164: n.e164 };
  } catch {
    return {
      ok: false,
      error: "Access list is temporarily unavailable. Try again shortly.",
      unavailable: true,
    };
  }
}

export async function listWhitelist(): Promise<WhitelistEntry[]> {
  await ensureAdminSeed();
  const sql = await getSql();
  const rows = await sql<WhitelistRow>`
    select id, phone_digits, phone_e164, contact_name, notes, is_admin, created_at
    from access_whitelist
    order by is_admin desc, contact_name asc, created_at asc
  `;
  return rows.map(mapWhitelist);
}

export async function listAccessRequests(): Promise<AccessRequestEntry[]> {
  const sql = await getSql();
  const rows = await sql<RequestRow>`
    select id, name, phone_digits, phone_e164, status, created_at
    from access_requests
    where status = 'pending'
    order by created_at desc
  `;
  return rows.map(mapRequest);
}

export async function addWhitelistEntry(input: {
  phone: string;
  name?: string;
  notes?: string;
  isAdmin?: boolean;
}): Promise<{ ok: true; entry: WhitelistEntry } | { ok: false; error: string }> {
  await ensureAdminSeed();
  const n = normalizePhone(input.phone);
  if (!n) return { ok: false, error: "Enter a valid US phone number." };
  const name = String(input.name ?? "").trim().slice(0, 80);
  const notes = String(input.notes ?? "").trim().slice(0, 200);
  const forceAdmin = isHardAdminPhone(n.digits) || Boolean(input.isAdmin);
  const id = isHardAdminPhone(n.digits) ? HARD_ADMIN.id : newId("wl");
  const contactName = isHardAdminPhone(n.digits)
    ? HARD_ADMIN.name
    : name || "";
  const sql = await getSql();
  await sql`
    insert into access_whitelist (
      id, phone_digits, phone_e164, contact_name, notes, is_admin
    ) values (
      ${id}, ${n.digits}, ${n.e164}, ${contactName}, ${notes}, ${forceAdmin}
    )
    on conflict (phone_digits) do update set
      phone_e164 = excluded.phone_e164,
      contact_name = excluded.contact_name,
      notes = excluded.notes,
      is_admin = excluded.is_admin
  `;
  await sql`
    update access_requests
    set status = 'approved'
    where phone_digits = ${n.digits}
  `;
  const entry = await findWhitelistByPhone(n.e164);
  if (!entry) return { ok: false, error: "Could not save that number." };
  return { ok: true, entry };
}

export async function removeWhitelistEntry(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await ensureAdminSeed();
  const sql = await getSql();
  const rows = await sql<WhitelistRow>`
    select id, phone_digits, phone_e164, contact_name, notes, is_admin, created_at
    from access_whitelist
    where id = ${id}
    limit 1
  `;
  const row = rows[0];
  if (!row) return { ok: false, error: "Number not found." };
  if (isHardAdminPhone(row.phone_digits)) {
    return { ok: false, error: "The admin seed cannot be removed." };
  }
  await sql`delete from access_whitelist where id = ${id}`;
  return { ok: true };
}
