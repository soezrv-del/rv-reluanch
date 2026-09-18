import { useState } from "react";
import { KeyRound, Shield } from "lucide-react";
import { useAccess } from "./AccessProvider";
import { AdminWhitelistSheet } from "./AdminWhitelistSheet";

export function AccessMoreSection() {
  const access = useAccess();
  const [phone, setPhone] = useState(access.phone);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const onIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await access.identify(phone);
      if (!result.allowed) {
        setError(
          "This number is not on the list. Request access from a locked tool — that does not unlock the app.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section>
        <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
          ACCESS
        </p>
        <form
          onSubmit={(e) => void onIdentify(e)}
          className="glass-prestige space-y-3 rounded-[1.25rem] p-3.5"
        >
          <p className="text-[12px] leading-relaxed text-white/70">
            {access.allowed
              ? access.isAdmin
                ? "Admin number recognized. Full access."
                : "This number is on the approved list. Full access."
              : "Browse is open. Full tools need an approved number. Requesting access never unlocks you."}
          </p>
          <label className="block">
            <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
              YOUR PHONE
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
              inputMode="tel"
              autoComplete="tel"
              placeholder="702-555-0100"
            />
          </label>
          {error ? (
            <p className="text-[12px] font-semibold text-ruby">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white disabled:opacity-60"
          >
            {busy ? "Checking…" : "Check this number"}
          </button>
          <button
            type="button"
            onClick={() => access.openRequest("Request a spot on the approved list.")}
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 text-[13px] font-bold text-white"
          >
            Request access
          </button>
        </form>
      </section>

      {access.isAdmin ? (
        <section>
          <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
            <button
              type="button"
              onClick={() => setAdminOpen(true)}
              className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Shield className="size-4 text-amber" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold text-white">
                  Manage access list
                </span>
                <span className="block text-[11px] text-white">
                  Password required · add or remove numbers
                </span>
              </span>
              <KeyRound className="size-4 shrink-0 text-white" />
            </button>
          </div>
        </section>
      ) : null}

      <AdminWhitelistSheet
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        canOpen={access.isAdmin}
      />
    </>
  );
}
