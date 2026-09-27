import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { shareScreen, type ShareDocument } from "@/lib/share/screenShare";

/**
 * Thumb-row Share control. Matches the suite's filled pill buttons.
 * The native sheet is the confirmation. Copy shows a short toast.
 */
export function ScreenShareButton({
  title,
  text,
  url,
  photoUrl,
}: ShareDocument & { photoUrl?: string | null }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current != null) window.clearTimeout(timer.current);
    },
    [],
  );

  return (
    <div className="relative" data-screen-share-bar>
      {copied ? (
        <p
          role="status"
          data-share-toast="copied"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-black shadow-lg"
        >
          Copied
        </p>
      ) : null}
      <button
        type="button"
        data-screen-share
        data-share-text={text}
        onClick={() => {
          void shareScreen({ title, text, url, photoUrl })
            .then((result) => {
              if (result !== "copied") return;
              setCopied(true);
              if (timer.current != null) window.clearTimeout(timer.current);
              timer.current = window.setTimeout(() => setCopied(false), 1600);
            })
            .catch(() => undefined);
        }}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-sapphire px-4 text-[14px] font-bold text-white"
      >
        <Share2 className="size-4" aria-hidden />
        Share
      </button>
    </div>
  );
}
