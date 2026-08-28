/**
 * Export / PDF for Vehicle History + Compare.
 *
 * Hybrid design: RvFOX Pro clean paper + CARFAX-style value summary.
 * Bold typography, formal snapshot, blue section system.
 * Brand: RvFOX Pro only — never Carfax trademarks.
 */

import { Capacitor } from "@capacitor/core";

export type ExportResult =
  | { ok: true; method: "print" | "share" | "download" | "preview" }
  | { ok: false; error: string };

export type ReportExportMeta = {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
  tradeIn?: string;
  retailLow?: string;
  retailHigh?: string;
  rating?: string;
  type?: string;
  recallCount?: number;
  reportId?: string;
  preparedFor?: string;
  factors?: Array<{ label: string; positive: boolean }>;
  length?: string;
  slideouts?: string;
  sleeps?: string;
};

function isNative() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function sanitizeClone(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(
      "script, iframe, video, audio, [data-no-export], .print\\:hidden",
    )
    .forEach((n) => n.remove());

  clone.querySelectorAll("*").forEach((node) => {
    const el = node as HTMLElement;
    if (!el.className || typeof el.className !== "string") return;
    el.className = el.className
      .replace(/\bflex-col-reverse\b/g, "flex-col")
      .replace(/\bflex-row-reverse\b/g, "flex-row");
  });

  clone.querySelectorAll("img").forEach((img) => {
    const el = img as HTMLImageElement;
    const cls = el.className || "";
    if (
      cls.includes("absolute") &&
      (cls.includes("inset-0") || cls.includes("object-cover"))
    ) {
      el.remove();
    }
  });

  clone
    .querySelectorAll("button, input, select, textarea, a[href='#']")
    .forEach((n) => {
      const t = (n.textContent || "").trim();
      if (
        t &&
        t.length < 80 &&
        !/retry|search|finance|pdf|save|back|compare|ask/i.test(t)
      ) {
        const span = clone.ownerDocument!.createElement("span");
        span.className = "chip-export";
        span.textContent = t;
        n.replaceWith(span);
      } else {
        n.remove();
      }
    });

  return clone;
}

function buildStandaloneHtml(opts: {
  title: string;
  subtitle: string;
  bodyHtml: string;
  meta?: ReportExportMeta;
}): string {
  const { title, subtitle, bodyHtml, meta = {} } = opts;
  const issued = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const issuedTime = new Date().toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const vehicleLine = [meta.year, meta.make, meta.model]
    .filter(Boolean)
    .join(" ");
  const tradeIn = meta.tradeIn || "—";
  const retailLow = meta.retailLow || "—";
  const retailHigh = meta.retailHigh || "—";
  const rating = meta.rating || "—";
  const reportId = meta.reportId || "RVF-REPORT";
  const preparedFor = meta.preparedFor || "Client";
  const type = meta.type || "Motorhome";
  const recallCount = meta.recallCount ?? 0;
  const floorplan = meta.floorplan || "";

  const defaultFactors: Array<{ label: string; positive: boolean }> = [
    { label: "Service history when documented", positive: true },
    { label: "Personal / private ownership pattern", positive: true },
    {
      label:
        recallCount > 0
          ? `${recallCount} active NHTSA recall${recallCount === 1 ? "" : "s"}`
          : "No open NHTSA recalls found",
      positive: recallCount === 0,
    },
    { label: "Age, roof seals, tires, chassis service gaps", positive: false },
  ];
  const factors =
    meta.factors && meta.factors.length ? meta.factors : defaultFactors;

  const factorRows = factors
    .map((f) => {
      const cls = f.positive ? "up" : "down";
      const arrow = f.positive ? "↑" : "↓";
      return `<div class="factor ${cls}"><span class="factor-ico">${arrow}</span><span class="factor-label">${escapeHtml(f.label)}</span></div>`;
    })
    .join("");

  const snapRecalls =
    recallCount > 0
      ? `<div class="snap-row warn"><span class="snap-ico">!</span><strong>${recallCount} open recall${recallCount === 1 ? "" : "s"}</strong> on year/make/model</div>`
      : `<div class="snap-row ok"><span class="snap-ico">✓</span><strong>No open recalls</strong> found for this lineup</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>${escapeHtml(title)}</title>
<style>
  :root {
    --ink: #0b1220;
    --muted: #4b5568;
    --line: #d7e3f2;
    --line-strong: #b8cce3;
    --paper: #ffffff;
    --soft: #f4f8fc;
    --blue: #1d6fbf;
    --blue-deep: #0e4f8f;
    --blue-soft: #e8f2fc;
    --red: #c81e1e;
    --green: #0f7a4a;
    --amber: #b45309;
    --navy: #0b1b33;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--ink);
    background: #e6eef7;
    font-weight: 600;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  strong, b, h1, h2, h3, th, .bold { font-weight: 800 !important; }

  .bar {
    position: sticky; top: 0; z-index: 50;
    display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
    padding: 12px 16px; padding-top: max(12px, env(safe-area-inset-top));
    background: var(--navy); color: #fff; font-weight: 700;
  }
  .bar button {
    appearance: none; border: 0; border-radius: 999px;
    padding: 11px 16px; font-weight: 800; font-size: 13px; cursor: pointer;
  }
  .bar .primary { background: #3b9eff; color: #041018; }
  .bar .secondary { background: rgba(255,255,255,.14); color: #fff; }

  .sheet {
    max-width: 860px; margin: 0 auto;
    background: var(--paper);
    box-shadow: 0 10px 40px rgba(11, 27, 51, 0.14);
    min-height: 100vh;
  }
  .pad { padding: 0 22px 28px; }

  /* ── Brand header (RvFOX Pro) ── */
  .tophead {
    display: grid; grid-template-columns: 1.2fr 1fr;
    gap: 12px; padding: 22px 22px 14px;
    border-bottom: 2px solid var(--line);
  }
  @media (max-width: 640px) { .tophead { grid-template-columns: 1fr; } }
  .brand-word {
    font-size: 28px; font-weight: 900; letter-spacing: -0.02em;
    color: var(--ink); line-height: 1;
  }
  .brand-word span { color: var(--blue); }
  .tagline {
    margin-top: 4px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; color: var(--red); text-transform: uppercase;
  }
  .doc-label {
    margin-top: 8px; font-size: 10px; font-weight: 800;
    letter-spacing: 0.18em; color: #6b7c90; text-transform: uppercase;
  }
  .meta-right { text-align: right; }
  @media (max-width: 640px) { .meta-right { text-align: left; } }
  .meta-right .rid {
    font-size: 11px; font-weight: 800; color: #5b6b7c; letter-spacing: 0.04em;
  }
  .meta-right .date {
    margin-top: 2px; font-size: 12px; font-weight: 700; color: var(--ink);
  }
  .verified {
    display: inline-block; margin-top: 8px;
    font-size: 10px; font-weight: 800; color: var(--green);
    letter-spacing: 0.04em;
  }

  /* Prepared strip */
  .prepared {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px; padding: 12px 22px 16px;
    border-bottom: 1px solid var(--line);
    background: linear-gradient(180deg, #fbfcfe, #f3f7fb);
  }
  @media (max-width: 640px) { .prepared { grid-template-columns: 1fr; } }
  .prep-label {
    font-size: 9px; font-weight: 900; letter-spacing: 0.16em;
    color: #6b7c90; text-transform: uppercase;
  }
  .prep-value {
    margin-top: 2px; font-size: 16px; font-weight: 900; color: var(--ink);
  }
  .prep-sub {
    margin-top: 2px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }

  /* ── CARFAX-style value band ── */
  .value-band {
    display: grid; grid-template-columns: 0.95fr 1.25fr;
    margin: 0 22px 16px;
    border: 2px solid var(--ink);
    background: #fff;
  }
  @media (max-width: 640px) { .value-band { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .value-left {
    padding: 16px 18px;
    border-right: 2px solid var(--ink);
    background: #fafbfc;
  }
  @media (max-width: 640px) { .value-left { border-right: 0; border-bottom: 2px solid var(--ink); } }
  .value-kicker {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase; color: #5b6b7c;
  }
  .value-amount {
    margin-top: 6px; font-size: 30px; font-weight: 900;
    color: var(--ink); letter-spacing: -0.02em; line-height: 1;
  }
  .value-range {
    margin-top: 8px; font-size: 12px; font-weight: 800; color: var(--blue-deep);
  }
  .value-note {
    margin-top: 6px; font-size: 11px; font-weight: 700; color: #5b6b7c;
  }
  .value-right { padding: 14px 16px; }
  .value-right h2 {
    margin: 0 0 10px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink);
  }
  .factor {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 0; font-size: 12px; font-weight: 800;
  }
  .factor-ico {
    width: 20px; height: 20px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 900; flex-shrink: 0;
  }
  .factor.up .factor-ico { background: #e8f8ef; color: var(--green); }
  .factor.down .factor-ico { background: #fdecec; color: var(--red); }
  .factor.up .factor-label { color: var(--ink); }
  .factor.down .factor-label { color: var(--ink); }

  /* Snapshot panel (CARFAX list style) */
  .snapshot {
    margin: 0 22px 18px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .snapshot-head {
    display: flex; justify-content: space-between; align-items: center;
    gap: 10px; flex-wrap: wrap;
    padding: 12px 14px;
    background: var(--navy); color: #fff;
  }
  .snapshot-head .sh-title {
    font-size: 14px; font-weight: 900; letter-spacing: 0.02em;
  }
  .snapshot-head .sh-badge {
    font-size: 10px; font-weight: 900; letter-spacing: 0.08em;
    padding: 4px 8px; border-radius: 999px;
    background: #3b9eff; color: #041018;
  }
  .snap-vehicle {
    padding: 12px 14px; border-bottom: 1px solid var(--line);
    display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px;
  }
  @media (max-width: 640px) { .snap-vehicle { grid-template-columns: 1fr; } }
  .snap-name {
    font-size: 18px; font-weight: 900; color: var(--ink); line-height: 1.15;
  }
  .snap-sub {
    margin-top: 3px; font-size: 12px; font-weight: 700; color: #4b5568;
  }
  .snap-rating {
    text-align: right;
  }
  @media (max-width: 640px) { .snap-rating { text-align: left; } }
  .snap-rating .num {
    font-size: 28px; font-weight: 900; color: var(--blue); line-height: 1;
  }
  .snap-rating .lbl {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    color: #6b7c90; text-transform: uppercase;
  }
  .snap-list { padding: 4px 0; }
  .snap-row {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px; border-top: 1px solid var(--line);
    font-size: 12.5px; font-weight: 700;
  }
  .snap-row strong { font-weight: 900; }
  .snap-ico {
    width: 22px; height: 22px; border-radius: 6px;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; flex-shrink: 0;
    background: var(--soft); color: var(--blue-deep);
  }
  .snap-row.warn .snap-ico { background: #fdecec; color: var(--red); }
  .snap-row.ok .snap-ico { background: #e8f8ef; color: var(--green); }

  /* Market triple */
  .market-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
    margin: 0 22px 18px;
  }
  @media (max-width: 640px) { .market-grid { grid-template-columns: 1fr; margin: 0 14px 14px; } }
  .m-card {
    border: 1.5px solid var(--line-strong); border-radius: 10px;
    padding: 12px 12px 14px; background: #fff; text-align: center;
  }
  .m-card .m-label {
    font-size: 10px; font-weight: 900; letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .m-card.trade .m-label { color: var(--red); }
  .m-card.low .m-label { color: var(--blue); }
  .m-card.high .m-label { color: var(--blue-deep); }
  .m-card .m-val {
    margin-top: 6px; font-size: 22px; font-weight: 900; color: var(--ink);
    letter-spacing: -0.02em;
  }
  .m-card .m-sub {
    margin-top: 4px; font-size: 11px; font-weight: 700; color: #6b7c90;
  }

  /* Body / cloned report */
  .body { padding: 0 22px 8px; }
  #report-root {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root, #report-root * {
    box-shadow: none !important;
    text-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  #report-root [class*="pointer-events-none"][class*="absolute"],
  #report-root [class*="absolute"][class*="inset-0"] {
    display: none !important;
  }
  #report-root img {
    max-width: 120px; height: auto; border-radius: 6px;
    border: 1px solid var(--line);
  }
  #report-root section,
  #report-root [class*="glass"],
  #report-root [class*="rounded-"][class*="border"],
  #report-root [class*="rounded-2xl"],
  #report-root [class*="rounded-\\["] {
    background: #fff !important;
    border: 1.5px solid var(--line) !important;
    border-radius: 12px !important;
    color: var(--ink) !important;
    margin: 0 0 14px !important;
    padding: 14px 16px !important;
    overflow: visible !important;
    page-break-inside: avoid;
    font-weight: 700 !important;
  }
  #report-root section > p:first-child,
  #report-root [class*="tracking"][class*="font-bold"]:first-child,
  #report-root h2, #report-root h3 {
    font-size: 12px !important; font-weight: 900 !important;
    letter-spacing: 0.12em !important; text-transform: uppercase !important;
    color: var(--blue-deep) !important;
    border-bottom: 2px solid var(--blue) !important;
    padding-bottom: 6px !important; margin: 0 0 12px !important;
    background: transparent !important;
  }
  #report-root h1 {
    font-size: 22px !important; font-weight: 900 !important;
    color: var(--ink) !important; margin: 0 !important;
  }
  #report-root, #report-root p, #report-root span, #report-root li, #report-root div {
    color: var(--ink) !important;
    font-weight: 700 !important;
  }
  #report-root [class*="text-white"],
  #report-root [class*="text-white\\/"] { color: var(--ink) !important; }
  #report-root [class*="text-sky"],
  #report-root [class*="text-blue"] { color: var(--blue-deep) !important; font-weight: 800 !important; }
  #report-root [class*="text-ruby"],
  #report-root [class*="text-red"] { color: var(--red) !important; font-weight: 800 !important; }
  #report-root [class*="text-emerald"],
  #report-root [class*="text-green"] { color: var(--green) !important; font-weight: 800 !important; }
  #report-root [class*="text-amber"],
  #report-root [class*="text-gold"],
  #report-root [class*="text-gold-bright"] { color: var(--amber) !important; font-weight: 800 !important; }
  #report-root [class*="text-white\\/70"],
  #report-root [class*="text-white\\/60"],
  #report-root [class*="text-white\\/55"],
  #report-root [class*="text-white\\/80"],
  #report-root [class*="text-white\\/75"],
  #report-root [class*="text-white\\/65"],
  #report-root [class*="text-white\\/45"] { color: #4b5568 !important; font-weight: 700 !important; }

  #report-root [class*="bg-black"],
  #report-root [class*="bg-white\\/"],
  #report-root [class*="bg-emerald"],
  #report-root [class*="bg-ruby"],
  #report-root [class*="bg-sky"],
  #report-root [class*="bg-gold"],
  #report-root [class*="bg-blue"],
  #report-root [class*="bg-green"],
  #report-root [class*="bg-amber"] {
    background: transparent !important;
    border-color: var(--line) !important;
  }
  #report-root [class*="grid"] { display: grid !important; gap: 8px !important; }
  #report-root [class*="grid-cols-2"] { grid-template-columns: 1fr 1fr !important; }
  #report-root [class*="grid-cols-3"] { grid-template-columns: 1fr 1fr 1fr !important; }
  #report-root [class*="grid-cols-4"] { grid-template-columns: 1fr 1fr 1fr 1fr !important; }
  #report-root .chip-export,
  #report-root [class*="rounded-full"] {
    display: inline-flex !important;
    font-size: 10px !important; font-weight: 900 !important;
    letter-spacing: 0.04em !important;
    padding: 4px 9px !important; border-radius: 999px !important;
    border: 1.5px solid var(--line-strong) !important;
    background: var(--blue-soft) !important; color: var(--blue-deep) !important;
    margin: 2px !important;
  }
  #report-root .hidden,
  #report-root .print\\:hidden,
  #report-root [class~="hidden"] { display: none !important; }
  #report-root [class*="space-y"] > * + * { margin-top: 8px !important; }
  #report-root [class*="flex"] {
    display: flex !important; flex-wrap: wrap; gap: 6px; font-weight: 700 !important;
  }
  #report-root [class*="flex-col"] { flex-direction: column !important; }
  #report-root [class*="items-center"] { align-items: center !important; }
  #report-root [class*="justify-between"] { justify-content: space-between !important; }
  #report-root [class*="border-emerald"],
  #report-root [class*="bg-emerald"] {
    background: #e8f8ef !important;
    border: 1px solid #b6e4cf !important;
    color: var(--green) !important;
    border-radius: 8px !important;
    font-weight: 800 !important;
  }
  #report-root svg { width: 12px !important; height: 12px !important; }

  /* Legal */
  .legal {
    margin: 10px 22px 0;
    padding: 14px 16px;
    border: 1.5px solid var(--line-strong);
    border-radius: 10px;
    background: var(--soft);
  }
  .legal h3 {
    margin: 0 0 8px; font-size: 11px; font-weight: 900;
    letter-spacing: 0.14em; text-transform: uppercase; color: var(--navy);
  }
  .legal p {
    margin: 0 0 6px; font-size: 11px; line-height: 1.5;
    color: #4b5568; font-weight: 700;
  }
  .legal p:last-child { margin-bottom: 0; }
  .footer-bar {
    margin-top: 16px; padding: 14px 22px 18px;
    background: var(--navy); color: rgba(255,255,255,0.88);
    font-size: 11px; font-weight: 800; letter-spacing: 0.04em;
    display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .footer-bar strong { color: #7ec4ff; font-weight: 900; }

  @media print {
    body { background: #fff; }
    .bar { display: none !important; }
    .sheet { max-width: none; box-shadow: none; min-height: 0; }
    @page { size: letter; margin: 0.42in 0.48in; }
    .value-band, .snapshot, .market-grid, .legal, section { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="bar">
    <button type="button" class="primary" onclick="window.scrollTo(0,0);setTimeout(function(){window.print()},100)">Save as PDF / Print</button>
    <button type="button" class="secondary" onclick="try{window.parent.postMessage({type:'rvfax-export-close'},'*')}catch(e){};try{window.close()}catch(e){}">Close</button>
  </div>
  <div class="sheet">
    <header class="tophead">
      <div>
        <div class="brand-word">Rv<span>FOX</span> Pro</div>
        <div class="tagline">Know Before You Buy</div>
        <div class="doc-label">Vehicle History Report</div>
      </div>
      <div class="meta-right">
        <div class="rid">REPORT: ${escapeHtml(reportId)}</div>
        <div class="date">${escapeHtml(issued)}</div>
        <div class="verified">Verified & True · RvFOX Pro</div>
      </div>
    </header>

    <div class="prepared">
      <div>
        <div class="prep-label">Prepared for</div>
        <div class="prep-value">${escapeHtml(preparedFor)}</div>
      </div>
      <div>
        <div class="prep-label">Subject vehicle</div>
        <div class="prep-value">${escapeHtml(vehicleLine || title)}</div>
        <div class="prep-sub">Generated ${escapeHtml(issuedTime)}${floorplan ? " · Floorplan " + escapeHtml(floorplan) : ""}</div>
      </div>
    </div>

    <!-- CARFAX-style value + factors -->
    <div class="value-band">
      <div class="value-left">
        <div class="value-kicker">RvFOX Retail Perspective</div>
        <div class="value-amount">${escapeHtml(retailHigh !== "—" ? retailHigh : retailLow)}</div>
        <div class="value-range">Range ${escapeHtml(retailLow)} – ${escapeHtml(retailHigh)}</div>
        <div class="value-note">Trade-in est. ${escapeHtml(tradeIn)} · Confirm with PPI & door sticker</div>
      </div>
      <div class="value-right">
        <h2>History events affecting this coach's value</h2>
        ${factorRows}
      </div>
    </div>

    <!-- CARFAX-style snapshot -->
    <div class="snapshot">
      <div class="snapshot-head">
        <div class="sh-title">Vehicle History Snapshot</div>
        <div class="sh-badge">RvFOX PRO</div>
      </div>
      <div class="snap-vehicle">
        <div>
          <div class="snap-name">${escapeHtml(vehicleLine || title)}</div>
          <div class="snap-sub">${escapeHtml(type)}${floorplan ? " · Floorplan " + escapeHtml(floorplan) : ""}</div>
        </div>
        <div class="snap-rating">
          <div class="num">${escapeHtml(rating)}</div>
          <div class="lbl">RvFOX Rating</div>
        </div>
      </div>
      <div class="snap-list">
        ${snapRecalls}
        <div class="snap-row"><span class="snap-ico">⚙</span><strong>Service schedule</strong>&nbsp;included in this report</div>
        <div class="snap-row"><span class="snap-ico">▣</span><strong>Use / class</strong>&nbsp;${escapeHtml(type)}</div>
        <div class="snap-row"><span class="snap-ico">◆</span><strong>Market band</strong>&nbsp;${escapeHtml(retailLow)} – ${escapeHtml(retailHigh)}</div>
        <div class="snap-row"><span class="snap-ico">◎</span><strong>Data</strong>&nbsp;Catalog + Live Grok + NHTSA when available</div>
      </div>
    </div>

    <!-- Market triple (from your preferred report) -->
    <div class="market-grid">
      <div class="m-card trade">
        <div class="m-label">Trade-In</div>
        <div class="m-val">${escapeHtml(tradeIn)}</div>
        <div class="m-sub">Dealer offer estimate</div>
      </div>
      <div class="m-card low">
        <div class="m-label">Retail Low</div>
        <div class="m-val">${escapeHtml(retailLow)}</div>
        <div class="m-sub">Private party / auction</div>
      </div>
      <div class="m-card high">
        <div class="m-label">Retail High</div>
        <div class="m-val">${escapeHtml(retailHigh)}</div>
        <div class="m-sub">Dealer asking price</div>
      </div>
    </div>

    <div class="body">
      <div id="report-root">${bodyHtml}</div>
    </div>

    <div class="legal">
      <h3>Disclaimer · Limited purpose</h3>
      <p>
        This <strong>RvFOX Pro Vehicle History Report</strong> is a professional decision-support
        dossier for recreational vehicles and motorhomes. It compiles catalog specifications,
        optional Live Grok enrichment, NHTSA recall queries, and market estimates. It is
        <strong>not</strong> a guarantee of condition, title accuracy, or future value.
      </p>
      <p>
        Always confirm chassis VIN, door sticker (GVWR / UVW / lengths), service records, and a
        qualified pre-purchase inspection (PPI) before purchase. Estimates may differ from dealer
        quotes or private-party offers.
      </p>
      <p>© ${new Date().getFullYear()} RvFOX Pro · Know Before You Buy · All rights reserved.</p>
    </div>

    <div class="footer-bar">
      <span><strong>RvFOX Pro</strong> · Know Before You Buy</span>
      <span>Motorcoach intelligence</span>
      <span>Confirm door sticker & PPI</span>
    </div>
  </div>
  <script>
    (function(){
      try {
        window.scrollTo(0,0);
        var r=document.getElementById('report-root');
        if(r){
          r.querySelectorAll('*').forEach(function(el){
            if(!el.style) return;
            el.style.height='auto'; el.style.maxHeight='none'; el.style.overflow='visible';
            el.style.fontWeight = el.style.fontWeight || '';
          });
        }
      } catch(e){}
    })();
  </script>
</body>
</html>`;
}

async function shareFile(
  filename: string,
  html: string,
  title: string,
): Promise<boolean> {
  try {
    const file = new File([html], filename, { type: "text/html" });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data: ShareData) => Promise<void>;
    };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title, text: title });
      return true;
    }
    if (nav.share) {
      await nav.share({ title, text: title });
      return true;
    }
  } catch (e) {
    if (e instanceof Error && /Abort|cancel/i.test(e.message)) return true;
  }
  return false;
}

function downloadBlob(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1500);
}

function openHtmlPreview(html: string): boolean {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "RvFOX Pro Vehicle History Report");
    iframe.style.cssText =
      "position:fixed;inset:0;z-index:99999;width:100%;height:100%;border:0;background:#e6eef7;";
    iframe.src = url;

    const closeBar = document.createElement("div");
    closeBar.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;z-index:100000;display:flex;gap:8px;padding:12px 14px;padding-bottom:max(12px,env(safe-area-inset-bottom));background:#0b1b33;";

    const mk = (label: string, primary?: boolean) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.style.cssText = primary
        ? "flex:1;padding:14px;border:0;border-radius:999px;font-weight:800;background:#3b9eff;color:#041018;font-size:14px;"
        : "padding:14px 16px;border:0;border-radius:999px;font-weight:800;background:rgba(255,255,255,.14);color:#fff;font-size:14px;";
      return b;
    };
    const printBtn = mk("Save as PDF / Print", true);
    const doneBtn = mk("Done");
    const cleanup = () => {
      iframe.remove();
      closeBar.remove();
      URL.revokeObjectURL(url);
    };
    printBtn.onclick = () => {
      try {
        const w = iframe.contentWindow;
        w?.scrollTo(0, 0);
        window.setTimeout(() => {
          w?.focus();
          w?.print();
        }, 120);
      } catch {
        /* */
      }
    };
    doneBtn.onclick = cleanup;
    closeBar.append(printBtn, doneBtn);
    document.body.append(iframe, closeBar);
    return true;
  } catch {
    const w = window.open(url, "_blank");
    if (w) {
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    }
    URL.revokeObjectURL(url);
    return false;
  }
}

/**
 * Export report — hybrid RvFOX Pro + CARFAX-structure dossier.
 */
export async function exportVehicleReport(opts: {
  reportElementId?: string;
  title: string;
  subtitle: string;
  filenameBase?: string;
  meta?: ReportExportMeta;
}): Promise<ExportResult> {
  const id = opts.reportElementId ?? "rvfax-vehicle-report";
  const root = document.getElementById(id);
  if (!root) {
    return { ok: false, error: "Report not found on screen." };
  }

  const clone = sanitizeClone(root);
  clone.querySelectorAll("[data-no-export]").forEach((n) => n.remove());

  const filename = `${(opts.filenameBase || "RvFOX-Pro-Report").replace(/[^\w.-]+/g, "_")}.html`;
  const html = buildStandaloneHtml({
    title: opts.title,
    subtitle: opts.subtitle,
    bodyHtml: clone.innerHTML,
    meta: opts.meta,
  });

  const native = isNative();
  const ios = isIOS();

  if (native || ios) {
    const previewed = openHtmlPreview(html);
    if (previewed) return { ok: true, method: "preview" };
    const shared = await shareFile(filename, html, opts.title);
    if (shared) return { ok: true, method: "share" };
    try {
      downloadBlob(filename, html);
      return { ok: true, method: "download" };
    } catch {
      return { ok: false, error: "Could not open the report." };
    }
  }

  try {
    const previewed = openHtmlPreview(html);
    if (previewed) return { ok: true, method: "preview" };

    document.body.classList.add("printing-rv-report");
    const scroller = document.getElementById("rvfax-report-scroll");
    const prev: Array<{ el: HTMLElement; css: string }> = [];
    const expand = (el: HTMLElement | null) => {
      if (!el) return;
      prev.push({ el, css: el.style.cssText });
      el.style.height = "auto";
      el.style.maxHeight = "none";
      el.style.overflow = "visible";
    };
    expand(scroller);
    expand(root);

    const after = () => {
      document.body.classList.remove("printing-rv-report");
      prev.forEach(({ el, css }) => {
        el.style.cssText = css;
      });
      window.removeEventListener("afterprint", after);
    };
    window.addEventListener("afterprint", after);
    window.scrollTo(0, 0);
    window.print();
    window.setTimeout(after, 3000);
    return { ok: true, method: "print" };
  } catch {
    downloadBlob(filename, html);
    return { ok: true, method: "download" };
  }
}
