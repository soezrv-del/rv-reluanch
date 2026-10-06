import { useEffect, useRef, type ReactNode } from "react";
import { Calculator, ChevronRight, MapPin, ScanLine, Settings, Share2 } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { TowGlyph } from "./BottomTabs";
import "./more-sheet.css";

/** What a More sheet tap opens. "vin" is the VIN Decoder overlay. */
export type MorePick = "rvtow" | "rvcal" | "rvtrips" | "rvshare" | "more" | "vin";

const TILES: { id: MorePick; title: string; sub: string; icon: ReactNode }[] = [
  {
    id: "rvtow",
    title: "Tow Check",
    sub: "Truck + VIN",
    icon: <TowGlyph className="more-sheet-glyph" />,
  },
  {
    id: "rvcal",
    title: "Payments",
    sub: "Finance calc",
    icon: <Calculator className="more-sheet-glyph" strokeWidth={1.75} aria-hidden />,
  },
  {
    id: "rvtrips",
    title: "RV GPS",
    sub: "Route + camps",
    icon: <MapPin className="more-sheet-glyph" strokeWidth={1.75} aria-hidden />,
  },
];

const ROWS: { id: MorePick; title: string; icon: ReactNode }[] = [
  { id: "vin", title: "VIN Decoder", icon: <ScanLine className="more-sheet-row-icon" strokeWidth={1.75} aria-hidden /> },
  { id: "rvshare", title: "Share a brochure", icon: <Share2 className="more-sheet-row-icon" strokeWidth={1.75} aria-hidden /> },
  { id: "more", title: "Premium & settings", icon: <Settings className="more-sheet-row-icon" strokeWidth={1.75} aria-hidden /> },
];

/**
 * Half-sheet above the dock: Tow Check, Payments and RV GPS as big tiles,
 * then VIN Decoder, Share a brochure and Premium & settings. The dock stays
 * visible under it, so More toggles it shut. Android back closes it (the
 * shell pushes a history entry on open).
 */
export function MoreSheet({
  open,
  tab,
  onPick,
  onClose,
}: {
  open: boolean;
  tab: AppTab;
  onPick: (id: MorePick) => void;
  onClose: () => void;
}) {
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="more-sheet-scrim" data-more-scrim data-no-swipe aria-hidden onClick={onClose} />
      <div
        className="more-sheet"
        data-more-sheet
        data-no-swipe
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="more-sheet-grab" aria-hidden />
        <p className="more-sheet-heading">Tools</p>
        <div className="more-sheet-tiles">
          {TILES.map(({ id, title, sub, icon }, i) => (
            <button
              key={id}
              ref={i === 0 ? firstRef : undefined}
              type="button"
              data-more-tool={id}
              aria-current={tab === id ? "page" : undefined}
              className={"more-sheet-tile" + (tab === id ? " is-current" : "")}
              onClick={() => onPick(id)}
            >
              {icon}
              <span className="more-sheet-tile-copy">
                <span className="more-sheet-tile-title">{title}</span>
                <span className="more-sheet-tile-sub">{sub}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="more-sheet-rows">
          {ROWS.map(({ id, title, icon }) => (
            <button
              key={id}
              type="button"
              data-more-tool={id}
              className="more-sheet-row"
              onClick={() => onPick(id)}
            >
              {icon}
              <span className="more-sheet-row-title">{title}</span>
              <ChevronRight className="more-sheet-row-chev" strokeWidth={1.75} aria-hidden />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
