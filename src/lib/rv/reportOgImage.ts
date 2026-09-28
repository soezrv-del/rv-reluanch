import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import { loadReportForUrl } from "./reportRequestMeta.ts";
import {
  REPORT_CARD_PHOTO_X,
  REPORT_CARD_TITLE_X,
  REPORT_CARD_WIDTH,
  layoutShareTitle,
  shareTitleMaxWidth,
  ttfTextWidth,
} from "./reportOgLayout.ts";
import { splitHeadlineNote, type ShareReport } from "./shareReport.ts";
import regularFont from "../../../public/fonts/Geist-Regular.ttf?inline";
import semiboldFont from "../../../public/fonts/Geist-SemiBold.ttf?inline";
import markInline from "../../../public/assets/brand/rvfax-mark-og.png?inline";

const require = createRequire(import.meta.url);

const HEIGHT = 630;
const cache = new Map<string, Uint8Array>();
let wasmReady: Promise<void> | null = null;
let fontBytes: [Uint8Array, Uint8Array] | null = null;

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
function ogFonts(): [Uint8Array, Uint8Array] {
  fontBytes ??= [decodeInline(regularFont), decodeInline(semiboldFont)];
  return fontBytes;
}

/** Inlined at build time. Fetching the mark from this origin fails on a protected preview. */
function ogMarkDataUrl(): string {
  if (markInline.startsWith("data:")) return markInline;
  return `data:image/png;base64,${markInline}`;
}

async function readPublicImage(pathname: string): Promise<string | null> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  try {
    const bytes = await readFile(join(process.cwd(), "public", pathname.replace(/^\/+/, "")));
    if (!bytes.byteLength) return null;
    const type = pathname.endsWith(".png")
      ? "image/png"
      : pathname.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
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

/** External photos only. A same-origin fetch dies on a protected preview and must not 500 the card. */
async function loadPhoto(photoUrl: string | null, page: URL): Promise<string | null> {
  if (!photoUrl) return null;
  try {
    if (photoUrl.startsWith("/")) return await readPublicImage(photoUrl);
    const target = new URL(photoUrl);
    if (target.origin === page.origin) {
      return await readPublicImage(`${target.pathname}${target.search}`);
    }
    return await dataUrl(target.href);
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

function estimateWidth(text: string, size: number, tracking = 0): number {
  let width = 0;
  for (const ch of text) {
    let factor = 0.56;
    if (ch === " ") factor = 0.28;
    else if (ch === "·" || ch === "." || ch === "," || ch === "'" || ch === "’") factor = 0.32;
    else if (ch >= "0" && ch <= "9") factor = 0.62;
    else if (ch === "m" || ch === "w" || ch === "M" || ch === "W") factor = 0.88;
    else if (ch === "i" || ch === "l" || ch === "I" || ch === "j" || ch === "1") factor = 0.3;
    else if (ch >= "A" && ch <= "Z") factor = 0.72;
    width += size * factor;
  }
  if (tracking > 0 && text.length > 1) width += tracking * (text.length - 1);
  return width;
}

function fitLine(
  text: string,
  maxWidth: number,
  size: number,
  minSize: number,
  tracking = 0,
): { text: string; size: number } {
  let next = size;
  while (next > minSize && estimateWidth(text, next, tracking) > maxWidth) next -= 1;
  if (estimateWidth(text, next, tracking) <= maxWidth) return { text, size: next };
  let cut = text.trimEnd();
  while (cut.length > 1 && estimateWidth(`${cut}…`, next, tracking) > maxWidth) {
    cut = cut.slice(0, -1).trimEnd();
  }
  return { text: `${cut}…`, size: next };
}

function wrapLines(text: string, maxWidth: number, size: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let index = 0;
  while (index < words.length && lines.length < maxLines) {
    let line = words[index] ?? "";
    index += 1;
    while (index < words.length) {
      const trial = `${line} ${words[index]}`;
      if (estimateWidth(trial, size) > maxWidth) break;
      line = trial;
      index += 1;
    }
    if (lines.length === maxLines - 1 && index < words.length) {
      lines.push(fitLine(`${line} ${words.slice(index).join(" ")}`, maxWidth, size, size).text);
      break;
    }
    lines.push(fitLine(line, maxWidth, size, size).text);
  }
  return lines;
}

function cardSvg(report: ShareReport, logo: string | null, photo: string | null): string {
  const laid = layoutShareTitle(report.title, shareTitleMaxWidth(Boolean(photo)), (text, size) =>
    ttfTextWidth(ogFonts()[1], text, size),
  );
  const lines = laid.lines;
  const headlines = report.headlines.slice(0, 3);
  const titleSize = laid.size;
  const titleY = photo ? 250 : 280;
  const title = lines
    .map(
      (line, index) =>
        `<text x="${REPORT_CARD_TITLE_X}" y="${titleY + index * (titleSize + 8)}" fill="#142033" font-family="Geist" font-size="${titleSize}" font-weight="600">${xml(line)}</text>`,
    )
    .join("");
  const headY = titleY + lines.length * (titleSize + 8) + 36;
  const colW = photo ? 200 : 280;
  const colInner = colW - 16;
  const heads = headlines
    .map((row, index) => {
      const x = REPORT_CARD_TITLE_X + index * colW;
      const parts = splitHeadlineNote(row.value);
      const label = fitLine(row.label.toUpperCase(), colInner, 16, 12, 1.2);
      const value = fitLine(parts.value, colInner, 28, 16);
      const noteLines = parts.note ? wrapLines(parts.note, colInner, 15, 2) : [];
      const note = noteLines
        .map(
          (line, lineIndex) =>
            `<text x="${x}" y="${headY + 58 + lineIndex * 20}" fill="#5a6678" font-family="Geist" font-size="15">${xml(line)}</text>`,
        )
        .join("");
      return `<g clip-path="url(#col${index})">
        <text x="${x}" y="${headY}" fill="#5a6678" font-family="Geist" font-size="${label.size}" letter-spacing="1.2">${xml(label.text)}</text>
        <text x="${x}" y="${headY + 34}" fill="#142033" font-family="Geist" font-size="${value.size}" font-weight="600">${xml(value.text)}</text>
        ${note}
      </g>`;
    })
    .join("");
  const clips = headlines
    .map((_, index) => {
      const x = REPORT_CARD_TITLE_X + index * colW;
      return `<clipPath id="col${index}"><rect x="${x}" y="${headY - 24}" width="${colInner}" height="130"/></clipPath>`;
    })
    .join("");
  const logoImg = logo
    ? `<image href="${logo}" x="40" y="32" width="84" height="84" preserveAspectRatio="xMidYMid meet"/>`
    : "";
  const brandX = logo ? 140 : 48;
  const photoImg = photo
    ? `<clipPath id="photo"><rect x="${REPORT_CARD_PHOTO_X}" y="196" width="400" height="280" rx="16"/></clipPath>
       <image href="${photo}" x="${REPORT_CARD_PHOTO_X}" y="196" width="400" height="280" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${REPORT_CARD_WIDTH}" height="${HEIGHT}" viewBox="0 0 ${REPORT_CARD_WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>${clips}</defs>
  <rect width="${REPORT_CARD_WIDTH}" height="${HEIGHT}" fill="#f4f1ea"/>
  <rect width="${REPORT_CARD_WIDTH}" height="148" fill="#0a2a8a"/>
  ${logoImg}
  <text x="${brandX}" y="78" fill="#ffffff" font-family="Geist" font-size="36" font-weight="600">RvFAX</text>
  <text x="${brandX}" y="110" fill="#d6e2ff" font-family="Geist" font-size="16" letter-spacing="2">VEHICLE REPORT</text>
  ${title}
  ${heads}
  ${photoImg}
  <text x="${REPORT_CARD_TITLE_X}" y="590" fill="#5a6678" font-family="Geist" font-size="20">rvmax.app</text>
</svg>`;
}

export async function renderReportOg(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const key = url.search;
  const hit = cache.get(key);
  if (hit) {
    return new Response(Buffer.from(hit), { headers: pngHeaders() });
  }
  let report: ShareReport | null = null;
  try {
    report = await loadReportForUrl(url);
  } catch (error) {
    console.error("[report-og] lookup failed", error);
    return new Response("Report not found", { status: 404 });
  }
  if (!report) return new Response("Report not found", { status: 404 });
  try {
    await ensureWasm();
  } catch (error) {
    console.error("[report-og] wasm failed", error);
    return new Response("Report image failed", { status: 500 });
  }
  const logo = ogMarkDataUrl();
  const photo = await loadPhoto(report.photoUrl, url);
  const bytes =
    paintCard(report, logo, photo) ??
    paintCard(report, logo, null) ??
    paintCard(report, null, null);
  if (!bytes) return new Response("Report image failed", { status: 500 });
  cache.set(key, bytes);
  return new Response(Buffer.from(bytes), { headers: pngHeaders() });
}

function paintCard(report: ShareReport, logo: string | null, photo: string | null): Uint8Array | null {
  try {
    const png = new Resvg(cardSvg(report, logo, photo), {
      fitTo: { mode: "width", value: REPORT_CARD_WIDTH },
      font: {
        fontBuffers: ogFonts(),
        defaultFontFamily: "Geist",
      },
    })
      .render()
      .asPng();
    return new Uint8Array(png);
  } catch (error) {
    console.error("[report-og] paint failed", error);
    return null;
  }
}

function pngHeaders(): HeadersInit {
  return {
    "content-type": "image/png",
    "cache-control": "public, max-age=86400, s-maxage=86400",
  };
}
