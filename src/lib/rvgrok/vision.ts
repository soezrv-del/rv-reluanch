/**
 * Client-side camera / photo → compressed data URL for Grok vision.
 * xAI chat accepts OpenAI-style multimodal content parts.
 */

export type VisionContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };

export type MultimodalMessage = {
  role: "user" | "assistant" | "system";
  content: string | VisionContentPart[];
};

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.78;
/** Soft cap so chat payloads stay reasonable (~1–1.5MB data URL) */
const MAX_DATA_URL_CHARS = 1_600_000;

export function isDataUrl(s: string | undefined | null): boolean {
  return Boolean(s && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(s));
}

/** Resize + JPEG-compress a File/Blob into a data URL. */
export async function compressImageToDataUrl(
  file: Blob,
  opts?: { maxEdge?: number; quality?: number },
): Promise<string> {
  const maxEdge = opts?.maxEdge ?? MAX_EDGE;
  const quality = opts?.quality ?? JPEG_QUALITY;

  const bitmap = await createImageBitmap(file);
  try {
    let { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(bitmap, 0, 0, width, height);

    let q = quality;
    let dataUrl = canvas.toDataURL("image/jpeg", q);
    while (dataUrl.length > MAX_DATA_URL_CHARS && q > 0.4) {
      q -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", q);
    }
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      // Second pass: smaller edge
      const scale2 = 0.7;
      canvas.width = Math.max(1, Math.round(width * scale2));
      canvas.height = Math.max(1, Math.round(height * scale2));
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL("image/jpeg", 0.65);
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}

/**
 * Build OpenAI/xAI multimodal user content from text + optional image data URL.
 */
export function buildUserContent(
  text: string,
  imageDataUrl?: string | null,
): string | VisionContentPart[] {
  const t = text.trim();
  if (!imageDataUrl) return t;
  const parts: VisionContentPart[] = [];
  if (t) parts.push({ type: "text", text: t });
  else
    parts.push({
      type: "text",
      text: "Please analyze this RV photo. Identify make/model if possible, note visible condition, damage, options, and anything a buyer or owner should know.",
    });
  parts.push({
    type: "image_url",
    image_url: { url: imageDataUrl, detail: "high" },
  });
  return parts;
}

/** Flatten multimodal content to plain text (for demos / logs). */
export function contentToPlainText(
  content: string | VisionContentPart[] | undefined,
): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content
    .map((p) => {
      if (p.type === "text") return p.text;
      if (p.type === "image_url") return "[photo attached]";
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

/** True if any message carries an image part. */
export function messagesHaveVision(
  messages: MultimodalMessage[],
): boolean {
  return messages.some((m) => {
    if (typeof m.content === "string") return false;
    return m.content.some((p) => p.type === "image_url");
  });
}

/**
 * iOS Safari often freezes ctx.drawImage(video) on the FIRST frame even
 * while the <video> preview keeps playing. Paint every animation frame
 * into a canvas, then JPEG that canvas when sending to Grok.
 */
export function startVideoFramePump(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
): () => void {
  const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: true,
    desynchronized: true,
  } as CanvasRenderingContext2DSettings);
  let raf = 0;
  let live = true;
  const tick = () => {
    if (!live) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (ctx && w > 0 && h > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      try {
        ctx.drawImage(video, 0, 0, w, h);
      } catch {
        /* */
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    live = false;
    cancelAnimationFrame(raf);
  };
}

export function snapshotCanvas(
  canvas: HTMLCanvasElement,
  opts?: { maxEdge?: number; quality?: number },
): string | null {
  if (!canvas.width || !canvas.height) return null;
  const maxEdge = opts?.maxEdge ?? 960;
  const quality = opts?.quality ?? 0.72;
  const scale = Math.min(1, maxEdge / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, width, height);
  return out.toDataURL("image/jpeg", quality);
}

export async function grabTrackBitmap(
  track: MediaStreamTrack,
): Promise<ImageBitmap | null> {
  const IC = (
    window as unknown as {
      ImageCapture?: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> };
    }
  ).ImageCapture;
  if (!IC) return null;
  try {
    return await new IC(track).grabFrame();
  } catch {
    return null;
  }
}

/** Grab a JPEG from live camera. Prefers ImageCapture, then the rAF canvas. */
export async function captureVideoFrame(
  video: HTMLVideoElement,
  opts?: { maxEdge?: number; quality?: number; pumpCanvas?: HTMLCanvasElement; track?: MediaStreamTrack | null },
): Promise<string | null> {
  const maxEdge = opts?.maxEdge ?? 960;
  const quality = opts?.quality ?? 0.72;

  if (opts?.track) {
    const bmp = await grabTrackBitmap(opts.track);
    if (bmp) {
      const scale = Math.min(1, maxEdge / Math.max(bmp.width, bmp.height));
      const width = Math.max(1, Math.round(bmp.width * scale));
      const height = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bmp, 0, 0, width, height);
        bmp.close();
        return canvas.toDataURL("image/jpeg", quality);
      }
      bmp.close();
    }
  }

  if (opts?.pumpCanvas && opts.pumpCanvas.width > 0) {
    return snapshotCanvas(opts.pumpCanvas, { maxEdge, quality });
  }

  const w0 = video.videoWidth;
  const h0 = video.videoHeight;
  if (!w0 || !h0) return null;
  const scale = Math.min(1, maxEdge / Math.max(w0, h0));
  const width = Math.max(1, Math.round(w0 * scale));
  const height = Math.max(1, Math.round(h0 * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
