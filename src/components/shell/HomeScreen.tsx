import { useEffect, useMemo, useState } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import type { AppTab } from "@/components/shell/BottomTabs";
import { DOCK_TAB_ICON, type DockRoomId } from "@/components/shell/BottomTabs";
import {
  SHOWROOM_SPOTLIGHT,
  lotArrivalQuery,
  requestLotUnit,
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";
import { RAIDHO_SHELL_MARK } from "@/components/shell/SuiteBrand";

const EMPTY_UNITS: LotUnit[] = [];

/** Mockup-locked copy when lot fields are empty (spec image is source of truth). */
const MOCK = {
  yearMake: "2026 Entegra Coach",
  model: "Cornerstone 45D",
  price: "$1,124,963",
  inStock: "1,420 in stock",
  stock: "Stock 45282",
  place: "· Fresno CA",
  hero: "/assets/showroom/cornerstone-hero.jpg?v=mock1",
  alt: "2026 Entegra Cornerstone 45D",
} as const;

const TABS: { id: DockRoomId; label: string }[] = [
  { id: "rvfax", label: "Facts" },
  { id: "rvlot", label: "Inventory" },
  { id: "rvgrok", label: "Chat" },
  { id: "more", label: "More" },
];

/**
 * Pixel-faithful Home from the Cornerstone mockup.
 * Full dark-glass screen: logo, placard, hero, Open coach, verified,
 * Ask RV Grok pill, and the four-tab glass bar. Not a restyle of copper chrome.
 */
export function HomeScreen({
  onOpen,
}: {
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean }) => void;
}) {
  const [units, setUnits] = useState<LotUnit[] | null>(null);

  useEffect(() => {
    let cancel = false;
    fetchLotSnapshot()
      .then((snap) => {
        if (!cancel) setUnits(snap.units);
      })
      .catch(() => {
        if (!cancel) setUnits([]);
      });
    return () => {
      cancel = true;
    };
  }, []);

  const listed = units ?? EMPTY_UNITS;
  const spotUnit = useMemo(() => spotlightLotUnit(listed), [listed]);
  const specs = spotUnit ? spotlightSpecs(spotUnit) : null;

  const yearMake = spotUnit
    ? [spotUnit.year.trim(), spotUnit.make.trim(), /coach/i.test(spotUnit.make) ? "" : "Coach"]
        .filter(Boolean)
        .join(" ") || MOCK.yearMake
    : MOCK.yearMake;
  const model = (specs?.model || MOCK.model).trim() || MOCK.model;
  const price = (specs?.price || MOCK.price).trim() || MOCK.price;
  const stockNo = specs?.stock ? `Stock ${specs.stock}` : MOCK.stock;
  const placeRaw = (spotUnit?.location || "").trim();
  const place = placeRaw
    ? `· ${placeRaw.replace(/([A-Za-z])\s+([A-Z]{2})$/, "$1 $2")}`
    : MOCK.place;
  const inStock =
    listed.length > 0
      ? `${listed.length.toLocaleString("en-US")} in stock`
      : MOCK.inStock;
  const heroSrc = MOCK.hero;

  const openSpot = () => {
    if (spotUnit) {
      requestLotUnit(lotArrivalQuery(spotUnit));
    }
    onOpen("rvlot");
  };

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-home-theme="dark"
      data-home-mockup=""
      data-no-swipe
      className="mock-home absolute inset-0 z-30 flex flex-col overflow-hidden"
    >
      {/* Atmospheric dark glass field */}
      <div className="mock-home-atmosphere" aria-hidden />

      {/* Brand — mockup: blue R mark + RvFOX only */}
      <header className="mock-home-header">
        <div className="mock-home-brand" aria-label="RvFOX">
          <img src={RAIDHO_SHELL_MARK} alt="" className="mock-home-mark" draggable={false} />
          <span className="mock-home-word">RvFOX</span>
        </div>
      </header>

      {/* Scrollable body so short phones still reach Ask + tabs */}
      <div className="mock-home-body">
        <div className="mock-home-placard">
          <p className="mock-home-year">{yearMake}</p>
          <h1 className="mock-home-title">{model}</h1>
          <p className="mock-home-price">{price}</p>
          <p className="mock-home-meta">{inStock}</p>
          <p className="mock-home-meta">{stockNo}</p>
          <p className="mock-home-meta">{place}</p>
        </div>

        <div className="mock-home-stage">
          <img
            src={heroSrc}
            alt={MOCK.alt}
            className="mock-home-coach"
            draggable={false}
          />
        </div>

        <div className="mock-home-open-row">
          <button
            type="button"
            className="mock-home-open"
            data-open-coach
            onClick={openSpot}
          >
            Open coach
          </button>
        </div>

        <p className="mock-home-verified" aria-label="Verified and True">
          VERIFIED AND TRUE
        </p>

        <div className="mock-home-ask-wrap">
          <button
            type="button"
            className="mock-home-ask"
            data-ask-grok
            onClick={() => onOpen("rvgrok")}
          >
            Ask RV Grok
          </button>
        </div>
      </div>

      {/* Tab bar — mockup glass plate (not shell copper dock) */}
      <nav className="mock-home-tabs" aria-label="Home" data-mock-tabs>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="mock-home-tab"
            data-bottom-tab={id}
            onClick={() => onOpen(id)}
          >
            <img
              src={DOCK_TAB_ICON[id]}
              alt=""
              className="mock-home-tab-icon"
              draggable={false}
            />
            <span className="mock-home-tab-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
