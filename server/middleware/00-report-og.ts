/**
 * Outer middleware: after the platform head injector, report URLs get
 * their own Open Graph and Twitter tags. Registered before grok-pwa
 * so this sees the already-injected HTML.
 */
import { applyReportIcons, applyReportOpenGraph } from "../../src/lib/rv/reportOgHtml.mjs";
import { metaForReportUrl } from "../../src/lib/rv/reportRequestMeta.ts";

interface ReportOgEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function reportOgMiddleware(
  event: ReportOgEvent,
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET") return next();
  const path = event.url.pathname;
  if (!path.startsWith("/report")) return next();

  const result = await next();
  if (!(result instanceof Response)) return result;
  const type = result.headers.get("content-type") ?? "";
  if (!type.includes("text/html") || result.headers.get("content-encoding")) {
    return result;
  }
  const html = await result.text();
  let meta = null;
  try {
    meta = await metaForReportUrl(event.url);
  } catch (error) {
    console.error("[report-og] meta failed", error);
  }
  const headers = new Headers(result.headers);
  headers.delete("content-length");
  const body = meta ? applyReportOpenGraph(html, meta) : applyReportIcons(html);
  return new Response(body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
