/** Hostname suitable for absolute og:image / x:game:image URLs. */
export function publicAppHost(hostHeader?: string | null): string {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  return host;
}

export function resolveShareHost(): string {
  if (typeof window !== "undefined") {
    return publicAppHost(window.location.host);
  }
  return publicAppHost(import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined);
}
