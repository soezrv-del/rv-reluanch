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

/**
 * Accept a real image, or infer PNG/JPEG/WebP from the filename when the
 * blob type is empty / generic (static JPEGs often arrive as octet-stream).
 */
export function coerceShareImageType(
  type: string,
  filename: string,
): string | null {
  let t = (type || "").toLowerCase().split(";")[0]!.trim();
  if (t === "image/jpg") t = "image/jpeg";
  if (isShareImageMime(t)) return t;
  const generic =
    !t || t === "application/octet-stream" || t === "binary/octet-stream";
  if (!generic) return null;
  const name = (filename || "").split("?")[0] || "";
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.jpe?g$/i.test(name)) return "image/jpeg";
  if (/\.webp$/i.test(name)) return "image/webp";
  return null;
}

export function isShareImageFile(file: File | null | undefined): file is File {
  return !!file && !!normalizeShareImageMeta(file);
}

export function normalizeShareImageMeta(
  file: File,
): { name: string; type: string } | null {
  const type = coerceShareImageType(file.type, file.name);
  if (!type) return null;
  if (file.size < SHARE_CARD_MIN_BYTES) return null;
  const ext =
    type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png";
  const base =
    (file.name || SHARE_CARD_FILENAME)
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^\w.-]+/g, "_") || "RvFOX-share-card";
  return { name: `${base}.${ext}`, type };
}

/** Sync rewrite so Share tap can call `navigator.share` as its first await. */
export function hardenShareImageFileSync(file: File): File | null {
  const meta = normalizeShareImageMeta(file);
  if (!meta) return null;
  if (file.type === meta.type && file.name === meta.name) return file;
  try {
    return new File([file], meta.name, {
      type: meta.type,
      lastModified: Date.now(),
    });
  } catch {
    return null;
  }
}

/** Rebuild as a real File (image MIME + .png/.jpg name). Blob URLs never leave. */
export async function hardenShareImageFile(file: File): Promise<File | null> {
  return hardenShareImageFileSync(file);
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
 * Web Share attempts — file payloads first so the OS sheet gets images:
 * 1) title + text + files (best when the OS keeps both)
 * 2) title + files (iOS sometimes drops long text + photo)
 * 3) files only
 * Text-only is NOT listed here. shareOrCopy may try it only after share({files})
 * throws — never because canShare({files}) returned false.
 */
export function shareDataAttempts(opts: {
  title: string;
  text: string;
  files: File[];
}): ShareAttempt[] {
  const files = opts.files
    .map((file) => hardenShareImageFileSync(file))
    .filter(isShareImageFile);
  if (files.length) {
    return [
      { title: opts.title, text: opts.text, files },
      { title: opts.title, files },
      { files },
    ];
  }
  return [{ title: opts.title, text: opts.text }];
}

export function toShareData(attempt: ShareAttempt): ShareData {
  const data: ShareData = {};
  if (attempt.title) data.title = attempt.title;
  if (attempt.text) data.text = attempt.text;
  if (attempt.files?.length) data.files = attempt.files;
  return data;
}

/**
 * iOS Safari / Capacitor WKWebView often return false (or throw) from
 * canShare({ files }) even when share({ files }) opens the sheet. Treat
 * canShare as a hint, never a gate. Missing / throwing → unknown (try share).
 */
export function canShareSaysYes(
  canShare: ((data?: ShareData) => boolean) | undefined,
  data: ShareData,
): boolean {
  if (typeof canShare !== "function") return true;
  try {
    return canShare(data) === true;
  } catch {
    return false;
  }
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

function canvasToPngBytes(canvas: HTMLCanvasElement): Uint8Array | null {
  try {
    const dataUrl = canvas.toDataURL(SHARE_CARD_MIME);
    const comma = dataUrl.indexOf(",");
    if (comma < 0) return null;
    const bin = atob(dataUrl.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.length >= SHARE_CARD_MIN_BYTES ? bytes : null;
  } catch {
    return null;
  }
}

export type ShareOutcome =
  | "shared"
  | "copied"
  | "downloaded"
  | "cancelled"
  | "failed";

function isShareAbort(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "AbortError") return true;
  }
  return e instanceof Error && /Abort|cancel/i.test(e.message);
}

function nativeShare(
  nav: Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
  },
): ((data: ShareData) => Promise<void>) | null {
  return typeof nav.share === "function" ? nav.share.bind(nav) : null;
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

/**
 * Happy path on iPhone / Capacitor: open the OS share sheet with files.
 *
 * #129 gated every attempt on canShare() and copied text when that failed
 * closed. iOS often returns false for files even though share({files}) works,
 * and a clipboard.writeText before share() made the tap look like "copy only".
 *
 * Rules:
 * - If navigator.share exists, call it. Do not skip because canShare is false.
 * - Prefer file-bearing payloads first (card PNG + lifestyle JPEG).
 * - Never write the clipboard before / instead of the sheet on a capable device.
 * - Download + copy only when share() is missing or every share() throw is
 *   not a user cancel.
 */
export async function shareOrCopy(opts: {
  title: string;
  text: string;
  files?: File[];
}): Promise<ShareOutcome> {
  const files = (opts.files || [])
    .map((file) => hardenShareImageFileSync(file))
    .filter(isShareImageFile);
  const attempts = shareDataAttempts({
    title: opts.title,
    text: opts.text,
    files,
  });
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data?: ShareData) => boolean;
  };
  const share = nativeShare(nav);

  if (share) {
    // Prefer payloads canShare accepts, but still try the rest — iOS often
    // returns false for files even when the sheet accepts them.
    const preferred: ShareAttempt[] = [];
    const rest: ShareAttempt[] = [];
    for (const attempt of attempts) {
      if (canShareSaysYes(nav.canShare, toShareData(attempt))) {
        preferred.push(attempt);
      } else {
        rest.push(attempt);
      }
    }
    for (const attempt of [...preferred, ...rest]) {
      try {
        // First await in this function — keep user activation for iOS share.
        await share(toShareData(attempt));
        return "shared";
      } catch (e) {
        if (isShareAbort(e)) return "cancelled";
      }
    }
    if (files.length) {
      try {
        await share({ title: opts.title, text: opts.text });
        return "shared";
      } catch (e) {
        if (isShareAbort(e)) return "cancelled";
      }
    }
  }

  if (files.length) {
    for (const file of files) downloadShareFile(file);
    await copyKit(opts.text);
    return "downloaded";
  }
  return copyKit(opts.text);
}

/**
 * Paint the signature card to a PNG File synchronously (toDataURL).
 * Async toBlob + arrayBuffer burned the iOS tap gesture before share().
 */
export function captureShareCardFile(
  _previewEl: Element | null,
  filename = SHARE_CARD_FILENAME,
): File | null {
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
    const bytes = canvasToPngBytes(canvas);
    if (!bytes) return null;
    const name = filename.toLowerCase().endsWith(".png")
      ? filename
      : `${filename}.png`;
    return imageFileFromBytes(bytes, name, SHARE_CARD_MIME);
  } catch {
    return null;
  }
}
