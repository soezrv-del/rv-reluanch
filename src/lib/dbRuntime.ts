/**
 * PGLite is for local / Grok preview only. Deployed Vercel (Lambda /var/task)
 * does not ship pglite.data — treating that runtime as supported boots WASM,
 * throws ENOENT, then an unhandled rejection kills the isolate (exit 128).
 * That crash is what Production logs as 403 on /api/rvgrok/token + web-research.
 */

export type PgliteRuntimeEnv = {
  VERCEL?: string;
  VERCEL_ENV?: string;
  AWS_LAMBDA_FUNCTION_NAME?: string;
};

export type PgliteRuntimeHints = {
  importMetaUrl?: string;
  env?: PgliteRuntimeEnv;
};

function readEnv(): PgliteRuntimeEnv {
  if (typeof process === "undefined") return {};
  return {
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME,
  };
}

export function isVercelServerlessRuntime(hints?: PgliteRuntimeHints): boolean {
  const env = hints?.env ?? readEnv();
  const vercel = (env.VERCEL || "").trim();
  if (vercel && vercel !== "0" && vercel.toLowerCase() !== "false") return true;
  if ((env.VERCEL_ENV || "").trim()) return true;
  if ((env.AWS_LAMBDA_FUNCTION_NAME || "").trim()) return true;
  try {
    const url = String(hints?.importMetaUrl ?? import.meta.url ?? "");
    if (url.includes(".vercel/output")) return true;
    if (url.includes("/var/task")) return true;
  } catch {
    return false;
  }
  return false;
}

/** False on Vercel/Lambda — never import or eager-boot PGLite there. */
export function pgliteRuntimeSupported(hints?: PgliteRuntimeHints): boolean {
  return !isVercelServerlessRuntime(hints);
}
