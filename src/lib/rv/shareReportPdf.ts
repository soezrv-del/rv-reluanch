import { REPORT_MARK_URL, splitHeadlineNote, type ShareReport } from "./shareReport.ts";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 36;
const SAPPHIRE = { r: 10 / 255, g: 42 / 255, b: 138 / 255 };
const INK = { r: 20 / 255, g: 32 / 255, b: 51 / 255 };
const MUTED = { r: 90 / 255, g: 102 / 255, b: 120 / 255 };

type PdfFont = { widthOfTextAtSize: (text: string, size: number) => number };
type Wrapped = { lines: string[]; size: number };

async function fetchBytes(url: string, ms = 2500): Promise<Uint8Array | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    return bytes.byteLength ? bytes : null;
  } catch {
    return null;
  }
}

function absoluteAsset(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).href;
}

export async function buildShareReportPdf(report: ShareReport): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const logoBytes = await fetchBytes(absoluteAsset(REPORT_MARK_URL));
  let logo: Awaited<ReturnType<typeof pdf.embedPng>> | null = null;
  if (logoBytes) {
    try {
      logo = await pdf.embedPng(logoBytes);
    } catch {
      logo = null;
    }
  }

  let photo: Awaited<ReturnType<typeof pdf.embedJpg>> | null = null;
  let photoKind: "jpg" | "png" | null = null;
  if (report.photoUrl) {
    const bytes = await fetchBytes(absoluteAsset(report.photoUrl));
    if (bytes) {
      try {
        if (bytes[0] === 0xff && bytes[1] === 0xd8) {
          photo = await pdf.embedJpg(bytes);
          photoKind = "jpg";
        } else if (
          bytes[0] === 0x89 &&
          bytes[1] === 0x50 &&
          bytes[2] === 0x4e &&
          bytes[3] === 0x47
        ) {
          photo = await pdf.embedPng(bytes);
          photoKind = "png";
        }
      } catch {
        photo = null;
        photoKind = null;
      }
    }
  }
  void photoKind;

  const rows = report.sections.flatMap((section) => [
    { kind: "head" as const, text: section.title },
    ...section.rows.map((row) => ({
      kind: "row" as const,
      label: row.label,
      value: row.value,
    })),
  ]);

  const draw = () => {
    page.drawRectangle({
      x: 0,
      y: PAGE_H - 78,
      width: PAGE_W,
      height: 78,
      color: rgb(SAPPHIRE.r, SAPPHIRE.g, SAPPHIRE.b),
    });
    let x = MARGIN;
    if (logo) {
      const mark = 52;
      page.drawImage(logo, {
        x,
        y: PAGE_H - 78 + (78 - mark) / 2,
        width: mark,
        height: mark,
      });
      x += mark + 12;
    }
    page.drawText("RvFAX", {
      x,
      y: PAGE_H - 40,
      size: 18,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(report.eyebrow, {
      x,
      y: PAGE_H - 58,
      size: 9,
      font,
      color: rgb(0.82, 0.88, 1),
    });
    const date = report.generatedLabel;
    const dateW = font.widthOfTextAtSize(date, 9);
    page.drawText(date, {
      x: PAGE_W - MARGIN - dateW,
      y: PAGE_H - 46,
      size: 9,
      font,
      color: rgb(0.82, 0.88, 1),
    });

    const contentWidth = PAGE_W - MARGIN * 2;
    const headlineCol = report.headlines.length
      ? contentWidth / report.headlines.length
      : contentWidth;
    const headlineParts = report.headlines.map((item) => ({
      label: item.label,
      ...splitHeadlineNote(item.value),
    }));
    const headlineNotes = headlineParts.map((part) =>
      part.note ? layoutNote(part.note, font, headlineCol - 8) : null,
    );
    const noteSize = headlineNotes.find((note) => note)?.size ?? 7;
    const noteLines = Math.max(0, ...headlineNotes.map((note) => note?.lines.length ?? 0));
    const headlineBlock = report.headlines.length ? headlineDrop(noteLines, noteSize) : 26;
    const sourceLayout = report.sources
      ? layoutWrapped(report.sources, font, 7, contentWidth, 2, 6)
      : null;
    const footer = sourceClearance(sourceLayout);
    const fitted = fitOnePage(rows.length, Boolean(photo), headlineBlock, footer);
    let y = PAGE_H - 96;
    const titleSize = report.title.length > 42 ? 13 : 15;
    page.drawText(clip(report.title, bold, titleSize, contentWidth), {
      x: MARGIN,
      y,
      size: titleSize,
      font: bold,
      color: rgb(INK.r, INK.g, INK.b),
    });
    y -= 18;

    if (report.headlines.length) {
      const headSize = fitted.size < 8 ? 9 : 10;
      headlineParts.forEach((item, i) => {
        const hx = MARGIN + headlineCol * i;
        page.drawText(item.label.toUpperCase(), {
          x: hx,
          y,
          size: 7,
          font: bold,
          color: rgb(MUTED.r, MUTED.g, MUTED.b),
        });
        page.drawText(clip(item.value, bold, headSize, headlineCol - 8), {
          x: hx,
          y: y - 12,
          size: headSize,
          font: bold,
          color: rgb(INK.r, INK.g, INK.b),
        });
        const note = headlineNotes[i];
        if (!note) return;
        note.lines.forEach((line, lineIndex) => {
          page.drawText(line, {
            x: hx,
            y: y - 24 - lineIndex * (note.size + 2),
            size: note.size,
            font,
            color: rgb(MUTED.r, MUTED.g, MUTED.b),
          });
        });
      });
      y -= headlineBlock;
    }

    if (photo && fitted.photoH > 0) {
      const maxW = PAGE_W - MARGIN * 2;
      const scale = Math.min(maxW / photo.width, fitted.photoH / photo.height, 1);
      const w = photo.width * scale;
      const h = photo.height * scale;
      page.drawImage(photo, { x: MARGIN, y: y - h, width: w, height: h });
      y -= h + 8;
    }

    const rowH = fitted.size + 3.2;
    for (const item of rows) {
      if (item.kind === "head") {
        y -= 2;
        page.drawText(item.text.toUpperCase(), {
          x: MARGIN,
          y,
          size: fitted.size,
          font: bold,
          color: rgb(SAPPHIRE.r, SAPPHIRE.g, SAPPHIRE.b),
        });
        y -= rowH;
        continue;
      }
      page.drawText(clip(item.label, font, fitted.size, 250), {
        x: MARGIN,
        y,
        size: fitted.size,
        font,
        color: rgb(MUTED.r, MUTED.g, MUTED.b),
      });
      const value = clip(item.value, bold, fitted.size, 250);
      const vw = bold.widthOfTextAtSize(value, fitted.size);
      page.drawText(value, {
        x: PAGE_W - MARGIN - vw,
        y,
        size: fitted.size,
        font: bold,
        color: rgb(INK.r, INK.g, INK.b),
      });
      y -= rowH;
    }

    page.drawText(report.footerNote, {
      x: MARGIN,
      y: 36,
      size: 8,
      font,
      color: rgb(MUTED.r, MUTED.g, MUTED.b),
    });
    page.drawText(report.siteUrl, {
      x: MARGIN,
      y: 24,
      size: 8,
      font: bold,
      color: rgb(SAPPHIRE.r, SAPPHIRE.g, SAPPHIRE.b),
    });
    if (sourceLayout && y >= footer) {
      const lineH = sourceLayout.size + 2.5;
      const top = 50 + (sourceLayout.lines.length - 1) * lineH;
      sourceLayout.lines.forEach((line, index) => {
        page.drawText(line, {
          x: MARGIN,
          y: top - index * lineH,
          size: sourceLayout.size,
          font,
          color: rgb(MUTED.r, MUTED.g, MUTED.b),
        });
      });
    }
  };

  draw();
  return pdf.save();
}

/** Shrink the photo and type until every row fits above the footer. */
function fitOnePage(
  rowCount: number,
  hasPhoto: boolean,
  headlineBlock: number,
  footer: number,
): { size: number; photoH: number } {
  const fits = (size: number, photoH: number) => {
    let y = PAGE_H - 96 - 18;
    y -= headlineBlock;
    if (photoH > 0) y -= photoH + 8;
    return y - rowCount * (size + 3.2) >= footer;
  };
  let size = 9;
  let photoH = hasPhoto ? 108 : 0;
  while (!fits(size, photoH) && photoH > 72) photoH -= 6;
  while (!fits(size, photoH) && size > 7) size -= 0.5;
  while (!fits(size, photoH) && photoH > 0) photoH -= 6;
  return { size, photoH };
}

/** Label baseline to the next section. A note under the figure needs more than 26. */
function headlineDrop(noteLines: number, noteSize: number): number {
  if (noteLines <= 0) return 26;
  const lastNote = 24 + (noteLines - 1) * (noteSize + 2);
  return lastNote + 12;
}

/** One smaller line when it fits; otherwise a second line, then a slight shrink. */
function layoutNote(text: string, font: PdfFont, maxWidth: number): Wrapped {
  const clean = text.replace(/\s+/g, " ").trim();
  for (let size = 7; size >= 6; size -= 0.25) {
    if (font.widthOfTextAtSize(clean, size) <= maxWidth) return { lines: [clean], size };
  }
  return layoutWrapped(clean, font, 7, maxWidth, 2, 6);
}

/**
 * Keep every word. Prefer the starting size, then shrink until the words
 * fit on `maxLines`.
 */
function layoutWrapped(
  text: string,
  font: PdfFont,
  size: number,
  maxWidth: number,
  maxLines: number,
  minSize: number,
): Wrapped {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return { lines: [], size };
  let next = size;
  while (next >= minSize - 0.01) {
    const lines = packWords(words, font, next, maxWidth, maxLines);
    if (lines) return { lines, size: next };
    next -= 0.25;
  }
  return { lines: words, size: minSize };
}

function packWords(
  words: string[],
  font: PdfFont,
  size: number,
  maxWidth: number,
  maxLines: number,
): string[] | null {
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (font.widthOfTextAtSize(word, size) > maxWidth) return null;
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      current = trial;
      continue;
    }
    if (lines.length + 1 >= maxLines) return null;
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);
  return lines;
}

/** Body text must stop above a one- or two-line source note. */
function sourceClearance(layout: Wrapped | null): number {
  if (!layout || layout.lines.length === 0) return 56;
  const lineH = layout.size + 2.5;
  const top = 50 + (layout.lines.length - 1) * lineH;
  return Math.max(56, top + layout.size + 8);
}

function clip(
  text: string,
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  size: number,
  max: number,
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (font.widthOfTextAtSize(clean, size) <= max) return clean;
  let out = clean;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}…`, size) > max) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

export function shareReportPdfName(report: ShareReport): string {
  const slug = report.title.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-") || "RvFAX";
  return `${slug}.pdf`;
}
