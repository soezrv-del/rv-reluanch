#!/usr/bin/env node
/**
 * Publish the RV Country own-lot scrape to production.
 *
 * Preview reads public/inventory/own-lot-latest.json in this workspace.
 * rvmax.app serves the copy committed on soezrv-del/rv-reluanch main.
 * Those drift when the morning scrape lands here and nobody commits it.
 *
 *   node scripts/publish-own-lot.mjs          # commit the JSON if newer
 *   node scripts/publish-own-lot.mjs --check  # report only
 *
 * Only that one file is committed. An older scrape, a non-array file, a lot
 * under 900 coaches, or a drop of more than 40% vs production is refused.
 * A newer file at OWN_LOT_INVENTORY_PATH (default the midnight agent-data
 * path) is copied into public/ first, then published.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO = "soezrv-del/rv-reluanch";
export const BRANCH = "main";
export const REPO_PATH = "public/inventory/own-lot-latest.json";
export const DEFAULT_UPSTREAM =
  "/home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json";
export const MIN_UNITS = 900;
/** Refuse a newer file that shrinks the lot by more than this fraction. */
export const MAX_SHRINK = 0.4;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function publicSnapshotPath(root = ROOT) {
  return join(root, REPO_PATH);
}

export function describeSnapshot(bytes) {
  let json;
  try {
    json = JSON.parse(Buffer.isBuffer(bytes) ? bytes.toString("utf8") : String(bytes));
  } catch {
    return { ok: false, reason: "not json" };
  }
  if (!Array.isArray(json)) return { ok: false, reason: "not an array" };
  const scraped = [];
  for (const row of json) {
    if (row && typeof row === "object" && row.scraped_at) {
      scraped.push(String(row.scraped_at));
    }
  }
  const uniq = [...new Set(scraped)];
  if (uniq.length > 1) return { ok: false, reason: "mixed scraped_at" };
  const raw = Buffer.isBuffer(bytes) ? bytes : Buffer.from(String(bytes));
  return {
    ok: true,
    units: json.length,
    scrapedAt: uniq[0] || "",
    sha256: createHash("sha256").update(raw).digest("hex"),
    blobSha: gitBlobSha(raw),
  };
}

/** GitHub contents `sha` is the git blob id, not a raw sha256. */
export function gitBlobSha(bytes) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  return createHash("sha1")
    .update(`blob ${buf.length}\0`)
    .update(buf)
    .digest("hex");
}

/** Newer scraped_at wins. Same time: more units. Both undated: more units. */
export function pickFresher(a, b) {
  if (!a?.ok) return b ?? a;
  if (!b?.ok) return a;
  if (a.scrapedAt && b.scrapedAt && a.scrapedAt !== b.scrapedAt) {
    return a.scrapedAt > b.scrapedAt ? a : b;
  }
  if (a.scrapedAt && !b.scrapedAt) return a;
  if (b.scrapedAt && !a.scrapedAt) return b;
  if (a.units !== b.units) return a.units > b.units ? a : b;
  return a;
}

export function decidePublish(local, remote) {
  if (!local?.ok) {
    return { publish: false, reason: local?.reason || "local snapshot invalid" };
  }
  if (local.units < MIN_UNITS) {
    return { publish: false, reason: `only ${local.units} units (need ${MIN_UNITS})` };
  }
  if (!remote?.ok) {
    return { publish: true, reason: "production has no usable snapshot" };
  }
  if (local.sha256 && remote.sha256 && local.sha256 === remote.sha256) {
    return { publish: false, reason: "already current" };
  }
  if (local.blobSha && remote.blobSha && local.blobSha === remote.blobSha) {
    return { publish: false, reason: "already current" };
  }
  if (!local.scrapedAt && remote.scrapedAt) {
    return { publish: false, reason: "local snapshot has no scraped_at" };
  }
  if (local.scrapedAt && remote.scrapedAt && local.scrapedAt < remote.scrapedAt) {
    return {
      publish: false,
      reason: `local scrape ${local.scrapedAt} is older than production ${remote.scrapedAt}`,
    };
  }
  if (remote.units > 0 && local.units < remote.units * (1 - MAX_SHRINK)) {
    return {
      publish: false,
      reason: `refusing shrink ${remote.units} → ${local.units}`,
    };
  }
  const when = local.scrapedAt || "undated";
  return { publish: true, reason: `scrape ${when} (${local.units} units)` };
}

export function gh(args, { input } = {}) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    input,
  });
}

export function readSnapshotFile(path) {
  if (!path || !existsSync(path)) return null;
  const bytes = readFileSync(path);
  return { path, bytes, ...describeSnapshot(bytes) };
}

function atomicWrite(path, bytes) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, bytes);
  renameSync(tmp, path);
}

export function loadRemoteMeta({ ghImpl = gh, repo = REPO, branch = BRANCH } = {}) {
  return JSON.parse(
    ghImpl([
      "api",
      `repos/${repo}/contents/${REPO_PATH}?ref=${branch}`,
      "--jq",
      "{sha:.sha,size:.size}",
    ]),
  );
}

export function loadRemoteSnapshot({ ghImpl = gh, repo = REPO, branch = BRANCH } = {}) {
  const meta = loadRemoteMeta({ ghImpl, repo, branch });
  const raw = ghImpl([
    "api",
    "-H",
    "Accept: application/vnd.github.raw",
    `repos/${repo}/contents/${REPO_PATH}?ref=${branch}`,
  ]);
  const bytes = Buffer.from(raw, "utf8");
  return { sha: meta.sha, size: meta.size, bytes, ...describeSnapshot(bytes) };
}

export function commitSnapshot({
  bytes,
  sha,
  units,
  scrapedAt,
  ghImpl = gh,
  repo = REPO,
  branch = BRANCH,
}) {
  const body = {
    message: `Publish own-lot snapshot (${units} units, ${scrapedAt || "undated"}).\n\nWorkspace scrape is newer than production. Inventory file only.`,
    content: Buffer.from(bytes).toString("base64"),
    branch,
  };
  if (sha) body.sha = sha;
  const res = ghImpl(
    ["api", "--method", "PUT", `repos/${repo}/contents/${REPO_PATH}`, "--input", "-"],
    { input: JSON.stringify(body) },
  );
  const parsed = JSON.parse(res);
  return {
    commit: parsed?.commit?.sha || "",
    html: parsed?.commit?.html_url || "",
  };
}

export function syncOwnLot({
  check = false,
  root = ROOT,
  upstreamPath = process.env.OWN_LOT_INVENTORY_PATH || DEFAULT_UPSTREAM,
  ghImpl = gh,
} = {}) {
  const dest = publicSnapshotPath(root);
  const local = readSnapshotFile(dest);
  const upstream = readSnapshotFile(upstreamPath);
  const winner = pickFresher(
    local ? { ...local, path: dest } : null,
    upstream ? { ...upstream, path: upstreamPath } : null,
  );
  let copied = false;
  if (winner?.ok && winner.path && winner.path !== dest && winner.bytes) {
    if (!check) atomicWrite(dest, winner.bytes);
    copied = true;
  }
  const publishing = winner?.ok ? { ...winner, path: dest } : local;
  let remote = null;
  let remoteMeta = null;
  try {
    remoteMeta = loadRemoteMeta({ ghImpl });
  } catch (err) {
    const msg = String(err?.stderr || err?.message || err);
    if (!/404/.test(msg)) throw err;
  }
  if (
    remoteMeta?.sha &&
    publishing?.blobSha &&
    remoteMeta.sha === publishing.blobSha
  ) {
    return {
      copied,
      check,
      units: publishing.units,
      scrapedAt: publishing.scrapedAt,
      remoteUnits: publishing.units,
      remoteScrapedAt: publishing.scrapedAt,
      publish: false,
      reason: "already current",
      commit: "",
    };
  }
  if (remoteMeta?.sha) {
    try {
      remote = loadRemoteSnapshot({ ghImpl });
    } catch (err) {
      const msg = String(err?.stderr || err?.message || err);
      if (!/404/.test(msg)) throw err;
    }
  }
  const decision = decidePublish(publishing, remote);
  const summary = {
    copied,
    check,
    units: publishing?.units ?? 0,
    scrapedAt: publishing?.scrapedAt ?? "",
    remoteUnits: remote?.units ?? 0,
    remoteScrapedAt: remote?.scrapedAt ?? "",
    ...decision,
    commit: "",
  };
  if (!decision.publish || check) return summary;
  const committed = commitSnapshot({
    bytes: publishing.bytes,
    sha: remote?.sha,
    units: publishing.units,
    scrapedAt: publishing.scrapedAt,
    ghImpl,
  });
  summary.commit = committed.commit;
  summary.html = committed.html;
  return summary;
}

export function formatSyncLine(summary) {
  const local = `${summary.units} units${summary.scrapedAt ? `, scraped ${summary.scrapedAt}` : ""}`;
  if (summary.publish && summary.check) return `own-lot: would publish ${local}`;
  if (summary.publish && summary.commit) {
    return `own-lot: published ${local} (${summary.commit.slice(0, 7)})`;
  }
  if (summary.publish) return `own-lot: published ${local}`;
  return `own-lot: ${summary.reason} — ${local}`;
}

function main() {
  const check = process.argv.includes("--check");
  try {
    const summary = syncOwnLot({ check });
    console.log(formatSyncLine(summary));
    if (!summary.publish && summary.reason !== "already current") process.exitCode = 1;
  } catch (err) {
    console.error(`[publish-own-lot] ${err?.stderr || err?.message || err}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
