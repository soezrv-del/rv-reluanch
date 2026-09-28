import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { loadReportForUrl } from "./reportRequestMeta.ts";
import type { ShareReport } from "./shareReport.ts";
import regularFont from "../../../public/fonts/Geist-Regular.ttf?inline";
import semiboldFont from "../../../public/fonts/Geist-SemiBold.ttf?inline";

const require = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;
const cache = new Map<string, Uint8Array>();
let wasmReady: Promise<void> | null = null;
let fontBytes: Uint8Array[] | null = null;

function decodeInline(value: string): Uint8Array {
  const payload = value.startsWith("data:") ? (value.split(",")[1] ?? "") : value;
  return new Uint8Array(Buffer.from(payload, "base64"));
}

function ensureWasm(): Promise<void> {
  wasmReady ??= (async () => {
    const wasmPath = require.resolve("@resvg/resvg-wasm/index_bg.wasm");
    const bytes = await readFile(wasmPath);
    await initWasm(bytes);
  })();
  return wasmReady;
}

/**
 * resvg-wasm only paints text from `fontBuffers`. `fontFiles` is copied into
 * the options JSON and never opened, so the card stays cream and blue.
 * Geist SemiBold's typographic family is "Geist" (weight 600).
 */
function ogFonts(): Uint8Array[] {
  fontBytes ??= [decodeInline(regularFont), decodeInline(semiboldFont)];
  return fontBytes;
}

async function dataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    if (!type.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (!bytes.byteLength) return null;
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string): string[] {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= 36) return [clean];
  const cut = clean.lastIndexOf(" ", 36);
  const at = cut > 14 ? cut : 36;
  const second = clean.slice(at).trim();
  return [
    clean.slice(0, at).trim(),
    second.length > 36 ? `${second.slice(0, 35)}…` : second,
  ];
}

function cardSvg(report: ShareReport, logo: string | null, photo: string | null): string {
  const lines = wrapTitle(report.title);
  const headlines = report.headlines.slice(0, 3);
  const titleSize = lines.length > 1 ? 40 : 46;
  const titleY = photo ? 250 : 280;
  const title = lines
    .map(
      (line, index) =>
        `<text x="56" y="${titleY + index * (titleSize + 8)}" fill="#142033" font-family="Geist" font-size="${titleSize}" font-weight="600">${xml(line)}</text>`,
    )
    .join("");
  const headY = titleY + lines.length * (titleSize + 8) + 36;
  const colW = photo ? 200 : 280;
  const heads = headlines
    .map((row, index) => {
      const x = 56 + index * colW;
      return `<text x="${x}" y="${headY}" fill="#5a6678" font-family="Geist" font-size="16" letter-spacing="1.4">${xml(row.label.toUpperCase())}</text>
        <text x="${x}" y="${headY + 36}" fill="#142033" font-family="Geist" font-size="28" font-weight="600">${xml(row.value)}</text>`;
    })
    .join("");
  const logoImg = logo
    ? `<image href="${logo}" x="48" y="38" width="72" height="72" preserveAspectRatio="xMidYMid slice"/>`
    : "";
  const brandX = logo ? 140 : 48;
  const photoImg = photo
    ? `<clipPath id="photo"><rect x="748" y="196" width="400" height="280" rx="16"/></clipPath>
       <image href="${photo}" x="748" y="196" width="400" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f4f1ea"/>
  <rect width="${WIDTH}" height="148" fill="#0a2a8a"/>
  ${logoImg}
  <text x="${brandX}" y="78" fill="#ffffff" font-family="Geist" font-size="36" font-weight="600">RvFAX</text>
  <text x="${brandX}" y="110" fill="#d6e2ff" font-family="Geist" font-size="16" letter-spacing="2">VEHICLE REPORT</text>
  ${title}
  ${heads}
  ${photoImg}
  <text x="56" y="590" fill="#5a6678" font-family="Geist" font-size="20">rvmax.app</text>
</svg>`;
}

export async function renderReportOg(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.search;
  const hit = cache.get(key);
  if (hit) {
    return new Response(Buffer.from(hit), { headers: pngHeaders() });
  }
  const report = await loadReportForUrl(url);
  if (!report) return new Response("Report not found", { status: 404 });
  await ensureWasm();
  const logo = await dataUrl(new URL("/assets/brand/icon-rvfax.png", url.origin).href);
  const photo = report.photoUrl
    ? await dataUrl(
        /^https?:\/\//i.test(report.photoUrl)
          ? report.photoUrl
          : new URL(report.photoUrl, url.origin).href,
      )
    : null;
  const png = new Resvg(cardSvg(report, logo, photo), {
    fitTo: { mode: "width", value: WIDTH },
    font: {
      fontBuffers: ogFonts(),
      defaultFontFamily: "Geist",
    },
  })
    .render()
    .asPng();
  const bytes = new Uint8Array(png);
  cache.set(key, bytes);
  return new Response(Buffer.from(bytes), { headers: pngHeaders() });
}

function pngHeaders(): HeadersInit {
  return {
    "content-type": "image/png",
    "cache-control": "public, max-age=86400, s-maxage=86400",
  };
}
