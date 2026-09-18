import { useState } from "react";
import { ShieldAlert, X } from "lucide-react";
import { submitAccessRequest } from "@/lib/access/client";

export function RequestAccessSheet({
  open,
  onClose,
  reason,
  defaultPhone,
}: {
  open: boolean;
  onClose: () => void;
  reason?: string;
  defaultPhone?: string;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(defaultPhone || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await submitAccessRequest({ name, phone });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-[16px] font-bold text-white">Access restricted</h2>
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
        <div className="mx-auto max-w-lg space-y-4">
          <div className="glass-prestige rounded-[1.25rem] p-4">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-amber/15">
              <ShieldAlert className="size-5 text-amber" />
            </div>
            <p className="text-[15px] font-bold leading-snug text-white">
              This tool is limited to the approved list.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/80">
              {reason ||
                "You can keep browsing. Sending your number notifies David — it does not unlock anything. Nobody is added unless he puts them on the list."}
            </p>
          </div>

          {sent ? (
            <div className="glass-prestige rounded-[1.25rem] p-4">
              <p className="text-[15px] font-bold text-white">Request sent</p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/80">
                Still browse-only. Access stays locked until the number is
                added on the admin screen.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white"
              >
                Keep browsing
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => void onSubmit(e)}
              className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
            >
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                  NAME
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                  PHONE
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-field w-full rounded-lg px-3 py-2.5 text-[15px] font-semibold text-white outline-none"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="702-555-0100"
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
                {busy ? "Sending…" : "Send request"}
              </button>
              <p className="text-[11px] leading-relaxed text-white/60">
                Submitting never grants access. Already on the list? Enter that
                number under Premium → Access.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
