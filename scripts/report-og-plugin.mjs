/**
 * Dev/preview twin of server/middleware/00-report-og.ts.
 * Register BEFORE grokPwaPlugin so this wrap is outside the injector.
 */
import { applyReportIcons, applyReportOpenGraph } from "../src/lib/rv/reportOgHtml.mjs";

function toBuffer(chunk, encoding) {
  if (!chunk || typeof chunk === "function") return null;
  if (Buffer.isBuffer(chunk)) return chunk;
  if (typeof chunk === "string") {
    return Buffer.from(chunk, typeof encoding === "string" ? encoding : "utf8");
  }
  if (chunk instanceof Uint8Array) return Buffer.from(chunk);
  return null;
}

function normalizeEndArgs(chunk, encoding, cb) {
  if (typeof chunk === "function") return { chunk: undefined, encoding: undefined, cb: chunk };
  if (typeof encoding === "function") return { chunk, encoding: undefined, cb: encoding };
  return { chunk, encoding, cb };
}

function install(middlewares, loadMeta) {
  middlewares.use((req, res, next) => {
    const rawUrl = req.url ?? "";
    const pathOnly = rawUrl.split("?", 1)[0] ?? "";
    const method = (req.method ?? "GET").toUpperCase();
    const acceptsHtml = String(req.headers.accept ?? "").includes("text/html");
    if (method !== "GET" || !pathOnly.startsWith("/report") || !acceptsHtml) {
      next();
      return;
    }

    const chunks = [];
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk, encoding, cb) => {
      const buf = toBuffer(chunk, encoding);
      if (buf) chunks.push(buf);
      const done = typeof encoding === "function" ? encoding : cb;
      if (typeof done === "function") done();
      return true;
    };

    res.end = (chunk, encoding, cb) => {
      const args = normalizeEndArgs(chunk, encoding, cb);
      const buf = toBuffer(args.chunk, args.encoding);
      if (buf) chunks.push(buf);
      const done = args.cb;
      const html = Buffer.concat(chunks).toString("utf8");
      const host = req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1:8080";
      const proto = req.headers["x-forwarded-proto"] || "http";
      const absolute = new URL(rawUrl, `${proto}://${host}`);
      Promise.resolve()
        .then(() => loadMeta(absolute))
        .then((meta) => {
          const body = Buffer.from(meta ? applyReportOpenGraph(html, meta) : applyReportIcons(html));
          if (!res.headersSent) res.removeHeader("content-length");
          return originalEnd(body, undefined, done);
        })
        .catch((error) => {
          console.error("[report-og] rewrite failed", error);
          return originalEnd(Buffer.concat(chunks), undefined, done);
        });
      return true;
    };

    next();
  });
}

export function reportOgPlugin() {
  return {
    name: "rvfax-report-og",
    configureServer(server) {
      install(server.middlewares, async (url) => {
        const mod = await server.ssrLoadModule("/src/lib/rv/reportRequestMeta.ts");
        return mod.metaForReportUrl(url);
      });
    },
    configurePreviewServer(server) {
      return () => {
        install(server.middlewares, async (url) => {
          if (typeof server.ssrLoadModule !== "function") return null;
          const mod = await server.ssrLoadModule("/src/lib/rv/reportRequestMeta.ts");
          return mod.metaForReportUrl(url);
        });
      };
    },
  };
}
