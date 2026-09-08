/**
 * Professional vs consumer entitlement — not auth.
 *
 * There is no IAP / StoreKit / account gate in this repo. Sold UI must still
 * hide from free/consumer builds. This is the single existing-style flag:
 * the same device-local + VITE_ pattern as saved units / app-env, not a
 * parallel login.
 *
 * Resolution (first set wins):
 *   1. localStorage `rvfax_tier_v1` — device entitlement
 *   2. VITE_RVFOX_TIER = professional | pro | consumer
 *   3. VITE_RVFOX_PRO = true | 1
 *   4. default consumer (Sold hidden)
 */

export const PRO_TIER_STORAGE_KEY = "rvfax_tier_v1";
export const PRO_TIER_CHANGED_EVENT = "rvfax-tier-changed";

export type RvfoxTier = "consumer" | "professional";

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

/** Parse a stored / env token into a tier. Unknown → null (fall through). */
export function parseRvfoxTier(raw: unknown): RvfoxTier | null {
  const t = clean(raw);
  if (t === "professional" || t === "pro") return "professional";
  if (t === "consumer" || t === "free") return "consumer";
  return null;
}

export function parseProFlag(raw: unknown): boolean | null {
  const t = clean(raw);
  if (t === "true" || t === "1" || t === "yes") return true;
  if (t === "false" || t === "0" || t === "no") return false;
  return null;
}

export function resolveRvfoxTier(input: {
  stored?: string | null;
  envTier?: string | null;
  envPro?: string | null;
}): RvfoxTier {
  const stored = parseRvfoxTier(input.stored);
  if (stored) return stored;
  const envTier = parseRvfoxTier(input.envTier);
  if (envTier) return envTier;
  const envPro = parseProFlag(input.envPro);
  if (envPro === true) return "professional";
  if (envPro === false) return "consumer";
  return "consumer";
}

function readStoredTier(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(PRO_TIER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function readEnvTier(): string | null {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> })
      .env;
    return env?.VITE_RVFOX_TIER ?? null;
  } catch {
    return null;
  }
}

function readEnvPro(): string | null {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> })
      .env;
    return env?.VITE_RVFOX_PRO ?? null;
  } catch {
    return null;
  }
}

export function currentRvfoxTier(): RvfoxTier {
  return resolveRvfoxTier({
    stored: readStoredTier(),
    envTier: readEnvTier(),
    envPro: readEnvPro(),
  });
}

/** True only for professional / pro entitlement. Consumer / unset → false. */
export function isProfessionalTier(): boolean {
  return currentRvfoxTier() === "professional";
}
