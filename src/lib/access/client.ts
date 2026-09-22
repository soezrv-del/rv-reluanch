import {
  ACCESS_ADMIN_TOKEN_KEY,
  ACCESS_PHONE_HEADER,
  ACCESS_PHONE_STORAGE_KEY,
} from "./constants";

export type AccessCheckResult = {
  allowed: boolean;
  isAdmin: boolean;
  name: string;
  phoneDigits: string;
  phoneE164: string;
};

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* Capacitor private mode */
  }
}

export function readStoredPhone(): string {
  return readStorage(ACCESS_PHONE_STORAGE_KEY);
}

export function storePhone(phone: string) {
  writeStorage(ACCESS_PHONE_STORAGE_KEY, phone);
}

export function readAdminToken(): string {
  return readStorage(ACCESS_ADMIN_TOKEN_KEY);
}

export function storeAdminToken(token: string) {
  writeStorage(ACCESS_ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  writeStorage(ACCESS_ADMIN_TOKEN_KEY, "");
}

/** Same gate chat + `/api/rvgrok/token` send: `x-access-phone`. */
export function accessHeaders(init?: HeadersInit, phoneOverride?: string): Headers {
  const headers = new Headers(init);
  const phone = (phoneOverride || readStoredPhone()).trim();
  if (phone && !headers.has(ACCESS_PHONE_HEADER)) {
    headers.set(ACCESS_PHONE_HEADER, phone);
  }
  return headers;
}

export async function checkAccessPhone(
  phone: string,
): Promise<AccessCheckResult> {
  const res = await fetch("/api/access/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = (await res.json()) as AccessCheckResult & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Could not check that number.");
  }
  return data;
}

export async function submitAccessRequest(input: {
  name: string;
  phone: string;
}): Promise<{
  requested: boolean;
  granted: boolean;
  alreadyAdmin?: boolean;
  message: string;
}> {
  const res = await fetch("/api/access/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as {
    requested?: boolean;
    granted?: boolean;
    alreadyAdmin?: boolean;
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || "Could not send the request.");
  }
  return {
    requested: Boolean(data.requested),
    granted: Boolean(data.granted),
    alreadyAdmin: data.alreadyAdmin,
    message:
      data.message ||
      (data.alreadyAdmin
        ? "Already admin — use Premium → Access with this number."
        : "Request sent. Access stays locked until it is added on the admin list."),
  };
}

export async function adminLogin(password: string): Promise<string> {
  const res = await fetch("/api/access/admin", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) {
    throw new Error(data.error || "Admin login failed.");
  }
  storeAdminToken(data.token);
  return data.token;
}

function adminHeaders(): Headers {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = readAdminToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

export async function adminFetch(path: string, init?: RequestInit) {
  const headers = adminHeaders();
  if (init?.headers) {
    new Headers(init.headers).forEach((v, k) => headers.set(k, v));
  }
  return fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
}
