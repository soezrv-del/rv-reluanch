// @ts-nocheck
/**
 * Replace platform share meta on /report documents.
 * Plain ESM so the Vite plugin and Nitro middleware can both import it.
 */

const SHARE_KEYS = new Set([
  "og:title",
  "og:description",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:image:alt",
  "og:type",
  "og:url",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:image",
  "twitter:description",
  "twitter:url",
  "description",
]);

const REPORT_ICON_32 = "/assets/brand/rvfax-mark-32.png";
const REPORT_ICON_180 = "/assets/brand/rvfax-mark-180.png";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripShareMeta(html) {
  return String(html).replace(/<meta\b[^>]*>/gi, (tag) => {
    const attrs = [
      ...tag.matchAll(/\b(?:property|name)\s*=\s*["']([^"']+)["']/gi),
    ];
    for (const match of attrs) {
      if (SHARE_KEYS.has(String(match[1]).toLowerCase())) return "";
    }
    return tag;
  });
}

export function reportMetaTags(meta) {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const image = escapeHtml(meta.image);
  const url = escapeHtml(meta.url);
  const site = escapeHtml(meta.siteName || "RvFAX");
  return [
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="${site}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="description" content="${description}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${image}">`,
  ].join("");
}

function linkRels(tag) {
  const match = String(tag).match(/\brel\s*=\s*["']([^"']+)["']/i);
  if (!match) return [];
  return match[1].toLowerCase().split(/\s+/);
}

function isSiteIconLink(tag) {
  return linkRels(tag).some(
    (rel) =>
      rel === "icon" ||
      rel === "shortcut" ||
      rel === "apple-touch-icon" ||
      rel === "apple-touch-icon-precomposed",
  );
}

function stripSiteIconLinks(html) {
  return String(html).replace(/<link\b[^>]*>/gi, (tag) => (isSiteIconLink(tag) ? "" : tag));
}

/** Small site icon next to a shared /report link. Opaque, sized for the rel. */
export function reportIconTags() {
  return [
    `<link rel="icon" type="image/png" sizes="32x32" href="${REPORT_ICON_32}">`,
    `<link rel="apple-touch-icon" sizes="180x180" href="${REPORT_ICON_180}">`,
  ].join("");
}

/**
 * Replace whatever icon the app shell and platform injector emitted.
 * iMessage uses the first apple-touch-icon it finds, so the old card
 * and the platform 180 icon have to leave the /report document.
 */
export function applyReportIcons(html) {
  if (typeof html !== "string") return html;
  const next = stripSiteIconLinks(html);
  const tags = reportIconTags();
  if (/<\/head>/i.test(next)) return next.replace(/<\/head>/i, `${tags}</head>`);
  return `${next}${tags}`;
}

/** Insert per-report Open Graph tags after any platform head injector. */
export function applyReportOpenGraph(html, meta) {
  if (!meta || typeof html !== "string") return applyReportIcons(html);
  let next = stripShareMeta(html);
  const title = escapeHtml(meta.title);
  if (/<title>[^<]*<\/title>/i.test(next)) {
    next = next.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  }
  const tags = reportMetaTags(meta);
  next = /<\/head>/i.test(next) ? next.replace(/<\/head>/i, `${tags}</head>`) : `${next}${tags}`;
  return applyReportIcons(next);
}
