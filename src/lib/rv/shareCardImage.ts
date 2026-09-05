/**
 * Share-kit card image — the bottom signature card as a real PNG File.
 *
 * iPhone Messages drops blob: URLs, canvas object URLs, and HTML attachments.
 * We paint the same card the salesman sees, then wrap the bytes in a File
 * with image/png + a .png name so Web Share `files[]` is a real photo.
 */

import {
  REPORT_CONTACT_KICKER,
  REPORT_CONTACT_MONOGRAM,
  REPORT_CONTACT_NAME,
  REPORT_CONTACT_PHONE,
} from "./reportContact.ts";

export const SHARE_CARD_MIME = "image/png";
export const SHARE_CARD_FILENAME = "RvFOX-share-card.png";
export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 460;
export const SHARE_CARD_MIN_BYTES = 32;

const NAVY = "#0b1b33";
const PAPER = "#f4f8fc";
const INK = "#0b1220";
const BLUE = "#1d6fbf";
const BLUE_DEEP = "#0e4f8f";
const RED = "#c81e1e";
const SKY = "#7dd3fc";
const FOOT_MUTED = "rgba(255,255,255,0.72)";

export type ShareCardContact = {
  monogram: string;
  kicker: string;
  name: string;
  phone: string;
};

export function defaultShareCardContact(): ShareCardContact {
  return {
    monogram: REPORT_CONTACT_MONOGRAM,
    kicker: REPORT_CONTACT_KICKER,
    name: REPORT_CONTACT_NAME,
    phone: REPORT_CONTACT_PHONE,
  };
}

/** Live preview card — same node the salesman sees above Share kit. */
export function elementLooksLikeShareCard(el: Element | null): boolean {
  if (!el) return false;
  const marked = el.getAttribute("data-report-signature") === "1";
  const text = (el.textContent || "").replace(/\s+/g, " ");
  return (
    marked &&
    text.includes(REPORT_CONTACT_NAME) &&
    text.includes(REPORT_CONTACT_PHONE)
  );
}

export function isShareImageMime(type: string): boolean {
  return /^image\/(png|jpeg|webp)$/i.test(type);
}

export function isShareImageFile(file: File | null | undefined): file is File {
  if (!file) return false;
  if (file.size < SHARE_CARD_MIN_BYTES) return false;
  if (!isShareImageMime(file.type)) return false;
  return /\.(png|jpe?g|webp)$/i.test(file.name);
}

export function normalizeShareImageMeta(
  file: File,
): { name: string; type: string } | null {
  let type = (file.type || "").toLowerCase();
  if (type === "image/jpg") type = "image/jpeg";
  if (!type && /\.png$/i.test(file.name)) type = "image/png";
  if (!type && /\.jpe?g$/i.test(file.name)) type = "image/jpeg";
  if (!type && /\.webp$/i.test(file.name)) type = "image/webp";
  if (!isShareImageMime(type)) return null;
  if (file.size < SHARE_CARD_MIN_BYTES) return null;
  const ext =
    type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
  const base =
    (file.name || SHARE_CARD_FILENAME)
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^\w.-]+/g, "_") || "RvFOX-share-card";
  return { name: `${base}.${ext}`, type };
}

/** Rebuild as a real File (ArrayBuffer + image MIME). Blob URLs never leave. */
export async function hardenShareImageFile(file: File): Promise<File | null> {
  const meta = normalizeShareImageMeta(file);
  if (!meta) return null;
  try {
    const buf = await file.arrayBuffer();
    if (buf.byteLength < SHARE_CARD_MIN_BYTES) return null;
    return new File([buf], meta.name, {
      type: meta.type,
      lastModified: Date.now(),
    });
  } catch {
    return null;
  }
}

export function imageFileFromBytes(
  bytes: BlobPart,
  filename: string,
  mime = SHARE_CARD_MIME,
): File {
  const name = /\.(png|jpe?g|webp)$/i.test(filename)
    ? filename
    : `${filename}.png`;
  return new File([bytes], name, { type: mime, lastModified: Date.now() });
}

export type ShareKitPayload = {
  title: string;
  text: string;
  files: File[];
};

/**
 * Share payload for the kit. The card image is first when present.
 * HTML / empty / non-image blobs are dropped — Messages can't show them.
 */
export function buildShareKitPayload(opts: {
  title: string;
  text: string;
  cardFile?: File | null;
  extraFiles?: File[];
}): ShareKitPayload {
  const files: File[] = [];
  if (isShareImageFile(opts.cardFile)) files.push(opts.cardFile);
  for (const extra of opts.extraFiles || []) {
    if (isShareImageFile(extra)) files.push(extra);
  }
  return { title: opts.title, text: opts.text, files };
}

export type ShareAttempt = {
  title?: string;
  text?: string;
  files?: File[];
};

/**
 * Web Share attempts for iPhone Messages:
 * 1) text + image (best when the OS keeps both)
 * 2) title + image (common iOS path — long text can drop the photo)
 * 3) image only
 * Never a text-only attempt while a real image file is in hand.
 */
export function shareDataAttempts(opts: {
  title: string;
  text: string;
  files: File[];
}): ShareAttempt[] {
  const files = opts.files.filter(isShareImageFile);
  if (files.length) {
    return [
      { title: opts.title, text: opts.text, files },
      { title: opts.title, files },
      { files },
    ];
  }
  return [{ title: opts.title, text: opts.text }];
}

export function downloadShareFile(file: File): boolean {
  if (typeof document === "undefined") return false;
  try {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
      a.remove();
    }, 1500);
    return true;
  } catch {
    return false;
  }
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fillTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  tracking: number,
  align: "left" | "right" = "left",
) {
  const chars = [...text];
  let width = 0;
  for (let i = 0; i < chars.length; i++) {
    width += ctx.measureText(chars[i]!).width;
    if (i < chars.length - 1) width += tracking;
  }
  let cx = align === "right" ? x - width : x;
  const prev = ctx.textAlign;
  ctx.textAlign = "left";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
  ctx.textAlign = prev;
}

export function paintShareSignatureCard(
  ctx: CanvasRenderingContext2D,
  width = SHARE_CARD_WIDTH,
  height = SHARE_CARD_HEIGHT,
  contact: ShareCardContact = defaultShareCardContact(),
): void {
  ctx.save();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, width, 12);

  const box = 96;
  const pad = 48;
  const boxY = 56;
  roundRectPath(ctx, pad, boxY, box, box, 16);
  ctx.fillStyle = NAVY;
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 30px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(contact.monogram, pad + box / 2, boxY + box / 2 + 1);

  const textX = pad + box + 28;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BLUE;
  ctx.font = "800 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  fillTracked(ctx, contact.kicker.toUpperCase(), textX, boxY + 22, 3.2);

  ctx.fillStyle = INK;
  ctx.font = "900 44px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(contact.name, textX, boxY + 70);

  ctx.fillStyle = BLUE_DEEP;
  ctx.font = "800 28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(contact.phone, textX, boxY + 112);
  const phoneW = ctx.measureText(contact.phone).width;
  ctx.fillStyle = BLUE;
  ctx.fillRect(textX, boxY + 118, phoneW, 3);

  const brandX = width - pad;
  ctx.textAlign = "right";
  ctx.font = "900 40px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  const fox = "FOX";
  const pro = " Pro";
  const rv = "Rv";
  ctx.fillStyle = INK;
  const proW = ctx.measureText(pro).width;
  ctx.fillStyle = BLUE;
  const foxW = ctx.measureText(fox).width;
  ctx.fillStyle = INK;
  ctx.fillText(rv, brandX - foxW - proW, boxY + 48);
  ctx.fillStyle = BLUE;
  ctx.fillText(fox, brandX - proW, boxY + 48);
  ctx.fillStyle = INK;
  ctx.fillText(pro, brandX, boxY + 48);

  ctx.fillStyle = RED;
  ctx.font = "800 16px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  fillTracked(ctx, "KNOW BEFORE YOU BUY", brandX, boxY + 82, 2.4, "right");

  const footH = 68;
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, height - footH, width, footH);
  ctx.fillStyle = FOOT_MUTED;
  ctx.font = "800 18px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(
    "Confirm door sticker · PPI · lender",
    pad,
    height - footH / 2,
  );
  ctx.fillStyle = SKY;
  ctx.textAlign = "right";
  ctx.fillText("RvFOX · Powered by Grok", width - pad, height - footH / 2);

  ctx.restore();
}

export function canvasLooksPainted(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  const spots: Array<[number, number]> = [
    [8, 6],
    [width / 2, 6],
    [24, 80],
    [width / 2, height / 2],
    [width - 24, 80],
    [24, height - 12],
    [width - 24, height - 12],
  ];
  const seen = new Set<string>();
  for (const [x, y] of spots) {
    try {
      const px = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      if ((px[3] ?? 0) < 12) continue;
      seen.add(`${(px[0] ?? 0) >> 4}:${(px[1] ?? 0) >> 4}:${(px[2] ?? 0) >> 4}`);
    } catch {
      return true;
    }
  }
  return seen.size >= 2;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), type);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Render the signature card the salesman already sees to a PNG File.
 * `el` is the on-screen card — we only paint when that card is present
 * (or when called without a document, tests pass a null and get a File
 * from the same paint path in browsers).
 */
export type ShareOutcome =
  | "shared"
  | "copied"
  | "downloaded"
  | "cancelled"
  | "failed";

function canShareData(
  canShare: ((data?: ShareData) => boolean) | undefined,
  data: ShareData,
): boolean {
  if (!canShare) return true;
  try {
    return canShare(data);
  } catch {
    return false;
  }
}

function isShareAbort(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "AbortError") return true;
  }
  return e instanceof Error && /Abort|cancel/i.test(e.message);
}

export async function copyKit(text: string): Promise<ShareOutcome> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok ? "copied" : "failed";
    } catch {
      return "failed";
    }
  }
}

export async function shareOrCopy(opts: {
  title: string;
  text: string;
  files?: File[];
}): Promise<ShareOutcome> {
  const hardened = opts.files?.length
    ? (
        await Promise.all(opts.files.map((file) => hardenShareImageFile(file)))
      ).filter(isShareImageFile)
    : [];
  const attempts = shareDataAttempts({
    title: opts.title,
    text: opts.text,
    files: hardened,
  });
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
  };

  if (typeof nav.share === "function") {
    for (const attempt of attempts) {
      const data: ShareData = {};
      if (attempt.title) data.title = attempt.title;
      if (attempt.text) data.text = attempt.text;
      if (attempt.files?.length) data.files = attempt.files;
      if (!canShareData(nav.canShare, data)) continue;
      try {
        // iOS Messages often keeps the photo only when `text` is omitted.
        // Copy the kit first so the report is still on the clipboard.
        if (hardened.length && !attempt.text) {
          await copyKit(opts.text);
        }
        await nav.share(data);
        return "shared";
      } catch (e) {
        if (isShareAbort(e)) return "cancelled";
      }
    }
  }

  if (hardened.length) {
    for (const file of hardened) downloadShareFile(file);
    await copyKit(opts.text);
    return "downloaded";
  }
  return copyKit(opts.text);
}

/**
 * Render the signature card the salesman already sees to a PNG File.
 * `_previewEl` is the on-screen card (same name / phone / mark).
 */
export async function captureShareCardFile(
  _previewEl: Element | null,
  filename = SHARE_CARD_FILENAME,
): Promise<File | null> {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SHARE_CARD_WIDTH;
    canvas.height = SHARE_CARD_HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return null;
    paintShareSignatureCard(ctx);
    if (!canvasLooksPainted(ctx, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT)) {
      return null;
    }
    const blob = await canvasToBlob(canvas, SHARE_CARD_MIME);
    if (!blob || blob.size < SHARE_CARD_MIN_BYTES) return null;
    const name = filename.toLowerCase().endsWith(".png")
      ? filename
      : `${filename}.png`;
    return imageFileFromBytes(await blob.arrayBuffer(), name, SHARE_CARD_MIME);
  } catch {
    return null;
  }
}
