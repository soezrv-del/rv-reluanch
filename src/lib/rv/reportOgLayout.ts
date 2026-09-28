/**
 * Share-card title measurement. resvg paints Geist from the font files,
 * so column width uses those advances instead of a character count.
 */

export const REPORT_CARD_WIDTH = 1200;
export const REPORT_CARD_TITLE_X = 56;
export const REPORT_CARD_PHOTO_X = 748;
/** Clear space between the title ink and the photo's left edge. */
export const REPORT_CARD_PHOTO_GAP = 24;

export function shareTitleMaxWidth(hasPhoto: boolean): number {
  if (hasPhoto) {
    return REPORT_CARD_PHOTO_X - REPORT_CARD_TITLE_X - REPORT_CARD_PHOTO_GAP;
  }
  return REPORT_CARD_WIDTH - REPORT_CARD_TITLE_X * 2;
}

type FontFace = {
  unitsPerEm: number;
  advance: (codePoint: number) => number;
};

const faces = new WeakMap<Uint8Array, FontFace>();

export function ttfTextWidth(
  bytes: Uint8Array,
  text: string,
  size: number,
  tracking = 0,
): number {
  const face = faces.get(bytes) ?? parseFace(bytes);
  faces.set(bytes, face);
  let units = 0;
  let count = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0);
    units += face.advance(code ?? 0);
    count += 1;
  }
  const width = (units / face.unitsPerEm) * size;
  if (tracking > 0 && count > 1) return width + tracking * (count - 1);
  return width;
}

/**
 * Wrap or shrink a share-card title so every line fits `maxWidth`.
 * Words stay whole. A line that fits at 46 stays one line; otherwise
 * the title wraps at 40 and only then shrinks.
 */
export function layoutShareTitle(
  title: string,
  maxWidth: number,
  measure: (text: string, size: number) => number,
): { lines: string[]; size: number } {
  const words = title.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return { lines: [""], size: 46 };

  const pack = (size: number, maxLines: number): string[] | null => {
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if (measure(word, size) > maxWidth) return null;
      const trial = current ? `${current} ${word}` : word;
      if (measure(trial, size) <= maxWidth) {
        current = trial;
        continue;
      }
      if (lines.length + 1 >= maxLines) return null;
      lines.push(current);
      current = word;
    }
    if (current) lines.push(current);
    return lines;
  };

  const single = pack(46, 1);
  if (single) return { lines: single, size: 46 };

  for (let size = 40; size >= 28; size -= 1) {
    const lines = pack(size, 2);
    if (lines) return { lines, size };
  }

  for (let size = 45; size >= 28; size -= 1) {
    const lines = pack(size, 1);
    if (lines) return { lines, size };
  }

  for (let size = 32; size >= 18; size -= 1) {
    const lines = pack(size, 3);
    if (lines) return { lines, size };
  }

  let size = 18;
  while (size > 10 && words.some((word) => measure(word, size) > maxWidth)) size -= 1;
  return { lines: pack(size, words.length) ?? words, size };
}

function parseFace(bytes: Uint8Array): FontFace {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tables = new Map<string, number>();
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(
      view.getUint8(rec),
      view.getUint8(rec + 1),
      view.getUint8(rec + 2),
      view.getUint8(rec + 3),
    );
    tables.set(tag, view.getUint32(rec + 8));
  }
  const head = tables.get("head");
  const hhea = tables.get("hhea");
  const hmtx = tables.get("hmtx");
  const cmap = tables.get("cmap");
  if (head == null || hhea == null || hmtx == null || cmap == null) {
    throw new Error("share card font is missing glyph tables");
  }
  const unitsPerEm = view.getUint16(head + 18) || 1000;
  const numHMetrics = view.getUint16(hhea + 34);
  const glyphOf = cmapGlyph(view, cmap);
  const advance = (codePoint: number) => {
    const glyph = glyphOf(codePoint);
    const index = glyph < numHMetrics ? glyph : Math.max(0, numHMetrics - 1);
    return view.getUint16(hmtx + index * 4);
  };
  return { unitsPerEm, advance };
}

function cmapGlyph(view: DataView, cmap: number): (codePoint: number) => number {
  const format12 = cmapSubtable(view, cmap, 12);
  const format4 = cmapSubtable(view, cmap, 4);
  return (codePoint: number) => {
    if (format12) {
      const hit = glyphFormat12(view, format12, codePoint);
      if (hit != null) return hit;
    }
    if (format4) return glyphFormat4(view, format4, codePoint);
    return 0;
  };
}

function cmapSubtable(view: DataView, cmap: number, format: number): number | null {
  const count = view.getUint16(cmap + 2);
  let found: number | null = null;
  for (let i = 0; i < count; i += 1) {
    const rec = cmap + 4 + i * 8;
    const platform = view.getUint16(rec);
    const encoding = view.getUint16(rec + 2);
    const offset = cmap + view.getUint32(rec + 4);
    if (view.getUint16(offset) !== format) continue;
    const unicode =
      platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
    if (!unicode) continue;
    found = offset;
    if (platform === 3) return offset;
  }
  return found;
}

function glyphFormat12(view: DataView, table: number, codePoint: number): number | null {
  const groups = view.getUint32(table + 12);
  let lo = 0;
  let hi = groups - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const group = table + 16 + mid * 12;
    const start = view.getUint32(group);
    const end = view.getUint32(group + 4);
    if (codePoint < start) hi = mid - 1;
    else if (codePoint > end) lo = mid + 1;
    else return view.getUint32(group + 8) + (codePoint - start);
  }
  return null;
}

function glyphFormat4(view: DataView, table: number, codePoint: number): number {
  const segCount = view.getUint16(table + 6) / 2;
  const endCode = table + 14;
  const startCode = endCode + segCount * 2 + 2;
  const idDelta = startCode + segCount * 2;
  const idRange = idDelta + segCount * 2;
  for (let i = 0; i < segCount; i += 1) {
    const end = view.getUint16(endCode + i * 2);
    if (codePoint > end) continue;
    const start = view.getUint16(startCode + i * 2);
    if (codePoint < start) return 0;
    const rangeOffset = view.getUint16(idRange + i * 2);
    const delta = view.getInt16(idDelta + i * 2);
    if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
    const glyphPos = idRange + i * 2 + rangeOffset + (codePoint - start) * 2;
    const glyph = view.getUint16(glyphPos);
    if (glyph === 0) return 0;
    return (glyph + delta) & 0xffff;
  }
  return 0;
}
