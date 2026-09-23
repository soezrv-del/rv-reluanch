import { useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { useAccessOptional } from "@/components/access/AccessProvider";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { REPORT_CONTACT_KICKER } from "@/lib/rv/reportContact";
import {
  captureShareCardFile,
  defaultShareCardContact,
  shareCardContactForSession,
  shareOrCopy,
} from "@/lib/rv/shareCardImage";

/**
 * Tow Share — hard switch on phone-access session (`useAccessOptional`).
 * Signed in (`access.allowed`): name, phone, and card PNG are access.name
 * and access.phone. Signed out: dealer signature only.
 */
export function TowShareCard({ shareText }: { shareText: string }) {
  const access = useAccessOptional();
  const contact = access?.allowed
    ? shareCardContactForSession(access.name, access.phone)
    : defaultShareCardContact();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    void hapticLight();
    const cardFile = captureShareCardFile(
      shareCardRef.current,
      "RvFOX-tow-card.png",
      contact,
    );
    const text = [
      shareText,
      "",
      "—",
      contact.kicker.toUpperCase() || REPORT_CONTACT_KICKER.toUpperCase(),
      contact.name,
      contact.phone,
    ]
      .filter((line, i, all) => !(line === "" && all[i - 1] === ""))
      .join("\n");
    const out = await shareOrCopy({
      title: "RvFOX Tow",
      text,
      files: cardFile ? [cardFile] : undefined,
    });
    if (out === "shared") {
      hapticSuccess();
      setStatus("Sent");
    } else if (out === "downloaded") {
      hapticSuccess();
      setStatus("Image saved · text copied");
    } else if (out === "copied") {
      hapticSuccess();
      setStatus("Copied");
    } else if (out === "cancelled") {
      setStatus("Cancelled");
    } else {
      setStatus("Couldn’t share");
    }
    window.setTimeout(() => setStatus(null), 2200);
  };

  return (
    <section
      data-tow-share
      className="glass-surface rounded-[var(--radius-xl)] p-3"
    >
      <p className="mb-2 text-[10px] font-bold tracking-[0.12em] text-blue">
        Share
      </p>
      <div
        ref={shareCardRef}
        data-report-signature="1"
        data-tow-share-card
        className="flex aspect-[16/9] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-white/20 bg-[#f4f8fc]"
      >
        <div className="h-1.5 shrink-0 bg-[#0b1b33]" />
        <div className="flex min-h-0 flex-1 flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-[10px] bg-[#0b1b33] text-[15px] font-black tracking-[0.08em] text-white"
            >
              {contact.monogram}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#1d6fbf]">
                {contact.kicker.toUpperCase()}
              </p>
              <p
                data-tow-share-name
                className="text-[20px] font-black tracking-tight text-[#0b1220]"
              >
                {contact.name}
              </p>
              <a
                data-tow-share-phone
                href={`tel:${contact.tel}`}
                className="mt-1 inline-block min-h-7 text-[14px] font-bold text-[#0e4f8f] underline decoration-[#1d6fbf] underline-offset-4"
              >
                {contact.phone}
              </a>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[18px] font-black tracking-tight text-[#0b1220]">
              Rv<span className="text-[#1d6fbf]">FOX</span> Pro
            </p>
            <p className="mt-0.5 text-[9px] font-bold tracking-[0.14em] text-[#c81e1e]">
              KNOW BEFORE YOU BUY
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 bg-[#0b1b33] px-5 py-3 text-[10px] font-bold tracking-wide text-white/70">
          <span>Confirm door sticker · hitch · GVWR</span>
          <span className="text-sky-300">RvFOX · Powered by Grok</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void send()}
        className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-blue px-4 py-2.5 text-[13px] font-bold text-white"
      >
        <Share2 className="size-4" />
        Share tow
      </button>
      {status ? (
        <p className="mt-2 text-center text-[12px] font-semibold text-white/80">
          {status}
        </p>
      ) : null}
    </section>
  );
}
