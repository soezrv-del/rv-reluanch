import { useEffect, useRef, useState } from "react";
import { Lock, Shield, Trash2, X } from "lucide-react";
import {
  ADMIN_PASSWORD_UNSET_CODE,
  adminSheetBlockedMessage,
  adminSheetView,
} from "@/lib/access/adminSheet";
import { HARD_ADMIN } from "@/lib/access/constants";
import { adminFetch, adminLogin, clearAdminToken } from "@/lib/access/client";
import { formatPhoneDisplay } from "@/lib/access/phone";
import { canRemoveWhitelistRow } from "@/lib/access/gate";
import { ResearchProviderCard } from "./ResearchProviderCard";

type Entry = {
  id: string;
  phoneDigits: string;
  phoneE164: string;
  contactName: string;
  notes: string;
  isAdmin: boolean;
};

type RequestRow = {
  id: string;
  name: string;
  phoneDigits: string;
  phoneE164: string;
};

export function AdminWhitelistSheet({
  open,
  onClose,
  canOpen,
}: {
  open: boolean;
  onClose: () => void;
  canOpen: boolean;
}) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [addPhone, setAddPhone] = useState("");
  const [addName, setAddName] = useState("");
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/access/admin");
      const data = (await res.json()) as {
        entries?: Entry[];
        requests?: RequestRow[];
        error?: string;
        code?: string;
        message?: string;
      };
      if (res.status === 401 || res.status === 503) {
        setAuthed(false);
        setCode(data.code || (res.status === 503 ? ADMIN_PASSWORD_UNSET_CODE : null));
        setError(data.message || data.error || "");
        return;
      }
      if (!res.ok) throw new Error(data.message || data.error || "Could not load the list.");
      setEntries(data.entries ?? []);
      setRequests(data.requests ?? []);
      setAuthed(true);
      setCode(null);
    } catch (err) {
      setAuthed(false);
      setCode("load_failed");
      setError(err instanceof Error ? err.message : "Could not load the list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let closedByPop = false;
    const prev = window.history.state;
    const marker =
      prev !== null && typeof prev === "object"
        ? { ...prev, adminWhitelist: true }
        : { adminWhitelist: true };
    window.history.pushState(marker, "");
    const onPop = () => {
      closedByPop = true;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      const state = window.history.state;
      if (
        !closedByPop &&
        state !== null &&
        typeof state === "object" &&
        "adminWhitelist" in state &&
        Boolean((state as { adminWhitelist?: unknown }).adminWhitelist)
      ) {
        window.history.back();
      }
    };
  }, [open]);

  if (!open) return null;

  const view = adminSheetView({ canOpen, authed, loading, code });

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await adminLogin(password);
      setPassword("");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      if (/WHITELIST_ADMIN_PASSWORD|not set/i.test(message)) {
        setCode(ADMIN_PASSWORD_UNSET_CODE);
        setError("");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  };

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({
          action: "add",
          phone: addPhone,
          name: addName,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.message || data.error || "Could not add.");
      setAddPhone("");
      setAddName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add.");
    } finally {
      setBusy(false);
    }
  };

  const onClearMemory = async (phoneDigits: string, label: string) => {
    const who = label || phoneDigits;
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Clear RV Grok memory for ${who}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({ action: "clear_memory", phone: phoneDigits }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.message || data.error || "Could not clear memory.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear memory.");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (id: string) => {
    setError("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({ action: "remove", id }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.message || data.error || "Could not remove.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove.");
    } finally {
      setBusy(false);
    }
  };

  const approve = async (row: RequestRow) => {
    setAddPhone(row.phoneE164);
    setAddName(row.name);
    setBusy(true);
    setError("");
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        body: JSON.stringify({
          action: "add",
          phone: row.phoneE164,
          name: row.name,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.message || data.error || "Could not add.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      data-admin-whitelist-sheet
      data-admin-whitelist-view={view}
      className="fixed inset-0 z-[140] isolate flex flex-col bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-whitelist-title"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <h2 id="admin-whitelist-title" className="text-[16px] font-bold text-white">
          Access list
        </h2>
        <button
          type="button"
          data-admin-whitelist-close
          onClick={() => onClose()}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div data-app-scroll className="rv-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-lg space-y-4">
          {view === "loading" ? (
            <p className="text-[13px] leading-relaxed text-white/80">Opening…</p>
          ) : view === "blocked" ? (
            <div className="glass-prestige space-y-3 rounded-[1.25rem] p-4">
              <p className="text-[15px] font-bold text-white">
                You can close this screen.
              </p>
              <p className="text-[13px] leading-relaxed text-white/80">
                {error && code !== ADMIN_PASSWORD_UNSET_CODE
                  ? error
                  : adminSheetBlockedMessage(code)}
              </p>
              <button
                type="button"
                data-admin-whitelist-close
                onClick={() => onClose()}
                className="w-full rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white"
              >
                Close
              </button>
            </div>
          ) : view === "password" ? (
            <form
              onSubmit={(e) => void onLogin(e)}
              className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
            >
              <p className="text-[13px] leading-relaxed text-white/80">
                Admin password required. Managing the list does not use the
                app sign-in flag.
              </p>
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                  ADMIN PASSWORD
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
                  autoComplete="current-password"
                  required
                />
              </label>
              {error ? (
                <p className="text-[12px] font-semibold text-ruby">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
              >
                {busy ? "Checking…" : "Open list"}
              </button>
              <button
                type="button"
                data-admin-whitelist-close
                onClick={() => onClose()}
                className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 text-[13px] font-bold text-white"
              >
                Close
              </button>
            </form>
          ) : (
            <>
              <ResearchProviderCard enabled surface="sheet" />

              <form
                onSubmit={(e) => void onAdd(e)}
                className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
              >
                <p className="text-[10px] font-bold tracking-[0.16em] text-white/90">
                  ADD NUMBER
                </p>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                    NAME
                  </span>
                  <input
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
                    placeholder="Name"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                    PHONE
                  </span>
                  <input
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
                    inputMode="tel"
                    placeholder="702-555-0100"
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Add to list"}
                </button>
              </form>

              {requests.length > 0 ? (
                <section>
                  <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
                    REQUESTS
                  </p>
                  <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
                    {requests.map((row, i) => (
                      <div
                        key={row.id}
                        className={`flex items-center gap-3 px-3.5 py-3 ${
                          i > 0 ? "border-t border-white/10" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-white">
                            {row.name || "No name"}
                          </p>
                          <p className="text-[12px] text-white/70">
                            {formatPhoneDisplay(row.phoneDigits)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void approve(row)}
                          className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
                  APPROVED ({entries.length})
                </p>
                <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
                  {entries.map((row, i) => {
                    const locked = !canRemoveWhitelistRow(row.phoneDigits);
                    return (
                      <div
                        key={row.id}
                        className={`flex flex-wrap items-center gap-2 px-3.5 py-3 sm:gap-3 ${
                          i > 0 ? "border-t border-white/10" : ""
                        }`}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                          {row.isAdmin ? (
                            <Shield className="size-4 text-amber" />
                          ) : (
                            <Lock className="size-4 text-white/70" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-white">
                            {row.contactName || "Unnamed"}
                            {row.isAdmin ? (
                              <span className="ml-2 text-[10px] font-bold tracking-wide text-amber">
                                ADMIN
                              </span>
                            ) : null}
                          </p>
                          <p className="text-[12px] text-white/70">
                            {formatPhoneDisplay(row.phoneDigits)}
                            {row.phoneDigits === HARD_ADMIN.digits
                              ? " · seed"
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          data-admin-clear-memory
                          disabled={busy}
                          onClick={() =>
                            void onClearMemory(
                              row.phoneDigits,
                              row.contactName || formatPhoneDisplay(row.phoneDigits),
                            )
                          }
                          className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/85 disabled:opacity-60"
                        >
                          Clear memory
                        </button>
                        {locked ? null : (
                          <button
                            type="button"
                            onClick={() => void onRemove(row.id)}
                            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                            aria-label={`Remove ${row.contactName || row.phoneDigits}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {error ? (
                <p className="text-[12px] font-semibold text-ruby">{error}</p>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  clearAdminToken();
                  void load();
                }}
                className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 text-[13px] font-bold text-white"
              >
                Lock admin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
