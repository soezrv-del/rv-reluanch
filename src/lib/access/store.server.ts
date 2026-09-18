import { getSql } from "@/lib/db";
import { normalizePhoneE164 } from "./phone.ts";
import { ACCESS_WHITELIST_SEED } from "./seedData.server.ts";

export type AccessWhitelistRow = {
  id: string;
  phone_e164: string;
  contact_name: string;
  notes: string;
  invited_at: string | null;
  created_at: string;
};

export type AccessRequestRow = {
  id: string;
  phone_e164: string;
  contact_name: string;
  note: string;
  status: string;
  created_at: string;
};

function newId(): string {
  return crypto.randomUUID();
}

/** Apply CSV seed once (missing sentinel). Safe to call on every request. */
export async function ensureAccessSeeded(): Promise<void> {
  const sql = await getSql();
  const meta = await sql<{ id: string }>`
    select id from access_seed_meta where id = 'v1' limit 1
  `;
  if (meta.length > 0) return;

  for (const row of ACCESS_WHITELIST_SEED) {
    await sql`
      insert into access_whitelist
        (id, phone_e164, contact_name, notes, invited_at, created_at)
      values
        (
          ${row.id},
          ${row.phoneE164},
          ${row.contactName},
          ${row.notes},
          ${row.invitedAt},
          ${row.createdAt}
        )
      on conflict (phone_e164) do nothing
    `;
  }
  await sql`
    insert into access_seed_meta (id) values ('v1')
    on conflict (id) do nothing
  `;
}

export async function lookupWhitelist(
  phone: string,
): Promise<AccessWhitelistRow | null> {
  await ensureAccessSeeded();
  const e164 = normalizePhoneE164(phone);
  if (!e164) return null;
  const sql = await getSql();
  const rows = await sql<AccessWhitelistRow>`
    select id, phone_e164, contact_name, notes, invited_at::text, created_at::text
    from access_whitelist
    where phone_e164 = ${e164}
    limit 1
  `;
  return rows[0] ?? null;
}

export async function isPhoneOnWhitelist(phone: string): Promise<boolean> {
  return (await lookupWhitelist(phone)) != null;
}

export async function listWhitelist(): Promise<AccessWhitelistRow[]> {
  await ensureAccessSeeded();
  const sql = await getSql();
  return sql<AccessWhitelistRow>`
    select id, phone_e164, contact_name, notes, invited_at::text, created_at::text
    from access_whitelist
    order by contact_name asc, phone_e164 asc
  `;
}

export async function addWhitelist(input: {
  phone: string;
  contactName?: string;
  notes?: string;
}): Promise<AccessWhitelistRow> {
  await ensureAccessSeeded();
  const e164 = normalizePhoneE164(input.phone);
  if (!e164) throw new Error("Enter a valid phone number.");
  const sql = await getSql();
  const existing = await lookupWhitelist(e164);
  if (existing) return existing;
  const id = newId();
  const name = (input.contactName ?? "").trim().slice(0, 80);
  const notes = (input.notes ?? "").trim().slice(0, 200);
  const rows = await sql<AccessWhitelistRow>`
    insert into access_whitelist (id, phone_e164, contact_name, notes)
    values (${id}, ${e164}, ${name}, ${notes})
    returning id, phone_e164, contact_name, notes, invited_at::text, created_at::text
  `;
  const row = rows[0];
  if (!row) throw new Error("Could not add number.");
  return row;
}

export async function removeWhitelist(id: string): Promise<boolean> {
  const clean = id.trim();
  if (!clean) return false;
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    delete from access_whitelist where id = ${clean} returning id
  `;
  return rows.length > 0;
}

export async function createAccessRequest(input: {
  name: string;
  phone: string;
  note?: string;
}): Promise<{ id: string; alreadyAllowed: boolean; normalized: string }> {
  await ensureAccessSeeded();
  const e164 = normalizePhoneE164(input.phone);
  if (!e164) throw new Error("Enter a valid phone number.");
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new Error("Enter your name.");
  if (await isPhoneOnWhitelist(e164)) {
    return { id: "", alreadyAllowed: true, normalized: e164 };
  }
  const sql = await getSql();
  const pending = await sql<{ id: string }>`
    select id from access_requests
    where phone_e164 = ${e164} and status = 'pending'
    limit 1
  `;
  if (pending[0]) {
    await sql`
      update access_requests
      set contact_name = ${name}, note = ${(input.note ?? "").trim().slice(0, 200)}
      where id = ${pending[0].id}
    `;
    return { id: pending[0].id, alreadyAllowed: false, normalized: e164 };
  }
  const id = newId();
  await sql`
    insert into access_requests (id, phone_e164, contact_name, note, status)
    values (
      ${id},
      ${e164},
      ${name},
      ${(input.note ?? "").trim().slice(0, 200)},
      'pending'
    )
  `;
  return { id, alreadyAllowed: false, normalized: e164 };
}

export async function listRequests(
  status = "pending",
): Promise<AccessRequestRow[]> {
  await ensureAccessSeeded();
  const sql = await getSql();
  return sql<AccessRequestRow>`
    select id, phone_e164, contact_name, note, status, created_at::text
    from access_requests
    where status = ${status}
    order by created_at desc
  `;
}

export async function approveRequest(
  id: string,
): Promise<AccessWhitelistRow | null> {
  const sql = await getSql();
  const rows = await sql<AccessRequestRow>`
    select id, phone_e164, contact_name, note, status, created_at::text
    from access_requests
    where id = ${id.trim()}
    limit 1
  `;
  const req = rows[0];
  if (!req) return null;
  const added = await addWhitelist({
    phone: req.phone_e164,
    contactName: req.contact_name,
    notes: req.note ? `Request: ${req.note}` : "Approved from request",
  });
  await sql`
    update access_requests set status = 'approved' where id = ${req.id}
  `;
  return added;
}

export async function dismissRequest(id: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update access_requests
    set status = 'dismissed'
    where id = ${id.trim()} and status = 'pending'
    returning id
  `;
  return rows.length > 0;
}
