import { useEffect, useState } from "react";
import { Shield, X } from "lucide-react";
import { formatPhoneDisplay, normalizePhoneE164 } from "@/lib/access/phone";

export type AccessSheetId = "phone" | "request" | "admin" | null;

type NumberRow = {
  id: string;
  phone_e164: string;
  contact_name: string;
  notes: string;
};

type RequestRow = {
  id: string;
  phone_e164: string;
  contact_name: string;
  note: string;
};

export function AccessSheets({
  sheet,
  phone,
  allowed,
  status,
  onClose,
  onSavePhone,
  onRequested,
}: {
  sheet: AccessSheetId;
  phone: string | null;
  allowed: boolean;
  status: string;
  onClose: () => void;
  onSavePhone: (raw: string) => boolean;
  onRequested: () => void;
}) {
  if (!sheet) return null;
  return (
    <div
      data-access-sheet={sheet}
      className="absolute inset-0 z-[90] flex flex-col bg-black/70 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-[16px] font-bold text-white">
          {sheet === "admin"
            ? "Access admin"
            : sheet === "request"
              ? "Request access"
              : "Your phone"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div data-app-scroll className="rv-scroll flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto w-full max-w-lg">
          {sheet === "phone" ? (
            <PhoneForm
              phone={phone}
              allowed={allowed}
              status={status}
              onSavePhone={onSavePhone}
            />
          ) : null}
          {sheet === "request" ? (
            <RequestForm phone={phone} onRequested={onRequested} />
          ) : null}
          {sheet === "admin" ? <AdminPanel /> : null}
        </div>
      </div>
    </div>
  );
}

function PhoneForm({
  phone,
  allowed,
  status,
  onSavePhone,
}: {
  phone: string | null;
  allowed: boolean;
  status: string;
  onSavePhone: (raw: string) => boolean;
}) {
  const [value, setValue] = useState(phone ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(phone ?? "");
  }, [phone]);

  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-white/80">
        Enter your mobile number once. Whitelisted numbers get full tools;
        everyone else can still browse Facts, Cal, Tow, and GPS.
      </p>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold tracking-wide text-white/70">
          PHONE
        </span>
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          inputMode="tel"
          autoComplete="tel"
          placeholder="(702) 266-5915"
          className="glass-field w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
        />
      </label>
      {error ? <p className="text-[12px] text-ruby">{error}</p> : null}
      {phone && status === "allowed" ? (
        <p className="text-[12px] text-green">
          {formatPhoneDisplay(phone)} is on the list — full access.
        </p>
      ) : null}
      {phone && status === "denied" ? (
        <p className="text-[12px] text-amber">
          {formatPhoneDisplay(phone)} is browse-only. Request access below.
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => {
          if (!normalizePhoneE164(value)) {
            setError("Enter a valid US or international number.");
            return;
          }
          onSavePhone(value);
        }}
        className="flex w-full items-center justify-center rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white"
      >
        Save phone
      </button>
      {!allowed ? (
        <p className="text-[11px] leading-relaxed text-white/60">
          Save, compare, Sold, Grok, and VIN stay locked until your number
          is on the list.
        </p>
      ) : null}
    </div>
  );
}

function RequestForm({
  phone,
  onRequested,
}: {
  phone: string | null;
  onRequested: () => void;
}) {
  const [name, setName] = useState("");
  const [value, setValue] = useState(phone ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setValue(phone ?? "");
  }, [phone]);

  const submit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!normalizePhoneE164(value)) {
      setError("Enter a valid phone number.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: value,
          note: note.trim(),
        }),
      });
      const j = (await res.json()) as {
        error?: string;
        alreadyAllowed?: boolean;
      };
      if (!res.ok) {
        setError(j.error || "Could not send request.");
        return;
      }
      setDone(true);
      onRequested();
    } catch {
      setError("Could not send request. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-3 text-[13px] leading-relaxed text-white/80">
        <p className="text-[15px] font-bold text-white">Request sent</p>
        <p>
          David can add your number from Premium → Access admin. Full tools
          unlock on this device once the number is on the list — pull to
          refresh or reopen the app.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-white/80">
        Browse stays open. Ask David to whitelist your number for save,
        compare, Sold, Grok, and VIN decode.
      </p>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold tracking-wide text-white/70">
          NAME
        </span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="glass-field w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold tracking-wide text-white/70">
          PHONE
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          className="glass-field w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[10px] font-bold tracking-wide text-white/70">
          NOTE (OPTIONAL)
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="glass-field w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
        />
      </label>
      {error ? <p className="text-[12px] text-ruby">{error}</p> : null}
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="flex w-full items-center justify-center rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
      >
        {busy ? "Sending…" : "Request access"}
      </button>
    </div>
  );
}

function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [numbers, setNumbers] = useState<NumberRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [addPhone, setAddPhone] = useState("");
  const [addName, setAddName] = useState("");
  const [addNotes, setAddNotes] = useState("");

  const load = async () => {
    const res = await fetch("/api/access/admin", {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const j = (await res.json()) as {
      numbers?: NumberRow[];
      requests?: RequestRow[];
      error?: string;
    };
    if (!res.ok) {
      setError(j.error || "Could not load list.");
      return;
    }
    setAuthed(true);
    setNumbers(j.numbers ?? []);
    setRequests(j.requests ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const post = async (body: Record<string, string>) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/access/admin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(j.error || "Action failed.");
        if (res.status === 401) setAuthed(false);
        return false;
      }
      return true;
    } catch {
      setError("Network error.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!authed) {
    return (
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed text-white/80">
          Password is the server env{" "}
          <span className="font-mono text-[12px] text-white">
            WHITELIST_ADMIN_PASSWORD
          </span>
          . It is never stored in the app bundle.
        </p>
        <label className="block">
          <span className="mb-1 block text-[10px] font-bold tracking-wide text-white/70">
            ADMIN PASSWORD
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="glass-field w-full rounded-xl px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
          />
        </label>
        {error ? <p className="text-[12px] text-ruby">{error}</p> : null}
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            const ok = await post({ action: "login", password });
            if (ok) {
              setPassword("");
              await load();
            }
          }}
          className="flex w-full items-center justify-center rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? <p className="text-[12px] text-ruby">{error}</p> : null}

      {requests.length > 0 ? (
        <section>
          <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-white/90">
            PENDING REQUESTS
          </p>
          <div className="glass-prestige space-y-2 rounded-[1.15rem] p-3">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-2 border-b border-white/10 pb-2 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-white">
                    {r.contact_name}
                  </p>
                  <p className="text-[12px] text-white/70">
                    {formatPhoneDisplay(r.phone_e164)}
                  </p>
                  {r.note ? (
                    <p className="text-[11px] text-white/55">{r.note}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      if (await post({ action: "approve", id: r.id })) {
                        await load();
                      }
                    }}
                    className="rounded-lg bg-green/80 px-2 py-1 text-[11px] font-bold text-white"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      if (await post({ action: "dismiss", id: r.id })) {
                        await load();
                      }
                    }}
                    className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-white/90">
          ADD NUMBER
        </p>
        <div className="glass-prestige space-y-2 rounded-[1.15rem] p-3">
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Name"
            className="glass-field w-full rounded-lg px-3 py-2 text-[13px] font-semibold text-white outline-none"
          />
          <input
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
            placeholder="Phone"
            inputMode="tel"
            className="glass-field w-full rounded-lg px-3 py-2 text-[13px] font-semibold text-white outline-none"
          />
          <input
            value={addNotes}
            onChange={(e) => setAddNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="glass-field w-full rounded-lg px-3 py-2 text-[13px] font-semibold text-white outline-none"
          />
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (
                await post({
                  action: "add",
                  phone: addPhone,
                  name: addName,
                  notes: addNotes,
                })
              ) {
                setAddPhone("");
                setAddName("");
                setAddNotes("");
                await load();
              }
            }}
            className="flex w-full items-center justify-center rounded-xl bg-blue py-2 text-[13px] font-bold text-white disabled:opacity-60"
          >
            Add to whitelist
          </button>
        </div>
      </section>

      <section>
        <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-white/90">
          WHITELIST · {numbers.length}
        </p>
        <div className="glass-prestige overflow-hidden rounded-[1.15rem]">
          {numbers.length === 0 ? (
            <p className="px-3.5 py-3 text-[13px] text-white/70">
              No numbers yet. Add one above or run the seed CSV.
            </p>
          ) : (
            numbers.map((n, i) => (
              <div
                key={n.id}
                className={`flex items-center gap-3 px-3.5 py-3 ${
                  i > 0 ? "border-t border-white/10" : ""
                }`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Shield className="size-4 text-blue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-white">
                    {n.contact_name || "Unnamed"}
                  </span>
                  <span className="block text-[11px] text-white/70">
                    {formatPhoneDisplay(n.phone_e164)}
                    {n.notes ? ` · ${n.notes}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    if (await post({ action: "remove", id: n.id })) {
                      await load();
                    }
                  }}
                  className="rounded-lg px-2 py-1 text-[11px] font-bold text-ruby"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={async () => {
          await post({ action: "logout" });
          setAuthed(false);
        }}
        className="w-full text-center text-[12px] font-bold text-white/60"
      >
        Sign out
      </button>
    </div>
  );
}

export function AccessBrowseBanner({
  allowed,
  status,
  onPhone,
  onRequest,
}: {
  allowed: boolean;
  status: string;
  onPhone: () => void;
  onRequest: () => void;
}) {
  if (allowed) return null;
  const unset = status === "unset";
  return (
    <button
      type="button"
      onClick={unset ? onPhone : onRequest}
      className="flex w-full items-center justify-between gap-2 rounded-[1.05rem] border border-amber/35 bg-amber/15 px-3 py-2.5 text-left"
    >
      <span>
        <span className="block text-[12px] font-bold text-white">
          {unset ? "Enter your phone for full tools" : "Browse only"}
        </span>
        <span className="block text-[11px] text-white/75">
          {unset
            ? "Facts, Cal, Tow, and GPS stay open."
            : "Request access to save, compare, Sold, Grok, and VIN."}
        </span>
      </span>
      <span className="shrink-0 text-[11px] font-bold text-amber">
        {unset ? "Add" : "Request"}
      </span>
    </button>
  );
}
