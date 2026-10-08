import { createContext, useContext } from "react";
import type { AppTab } from "./BottomTabs";
import type { ActiveCoach, ActiveCoachInput } from "@/lib/rv/activeCoach";
import type { TowHandoffOffer } from "@/lib/trips/towHandoff";
import type { FactsTowHandoffOffer } from "@/lib/tow/factsTowHandoff";
import type { CalSeed } from "@/lib/rv/calHandoff";
import type { FactsCascadeSel } from "@/lib/rv/factsOpen";

export type { CalSeed };

/** One-shot Tow → Trips Profile deep-link. Coach identity only — no invented dims. */
export type TripsHandoff = {
  token: number;
  offer: TowHandoffOffer | null;
};

/** One-shot Facts → Tow. Dock never sets this. */
export type FactsTowHandoff = {
  token: number;
  offer: FactsTowHandoffOffer | null;
};

export type ShellNavValue = {
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  /** One-shot Facts Check payment seed — consume then drop */
  calSeed: CalSeed | null;
  /** Bumps on every plain Cal tab / launch open (not Estimate payment) */
  calCleanToken: number;
  openCalWithPrice: (price: number, label?: string) => void;
  clearCalSeed: () => void;
  /** Last Facts coach for the chip. Cal / Tow / Grok / Trips must not auto-read this on dock entry. */
  activeCoach: ActiveCoach | null;
  setActiveCoach: (sel: ActiveCoachInput | null) => void;
  /**
   * Dock Facts / chip “change”: clean catalog search (factsPickerToken).
   * Lot “Check RV Facts” passes the unit → Facts opens that report.
   */
  openFactsPicker: (unit?: FactsCascadeSel | null) => void;
  factsPickerToken: number;
  /** One-shot Lot → Facts unit — RvFaxApp consumes then clears. Dock never sets this. */
  factsUnitSeed: FactsCascadeSel | null;
  clearFactsUnitSeed: () => void;
  /** Lot VIN tap: open the VIN Decoder with this VIN and decode it once. */
  openVinDecoder: (vin: string) => void;
  /** Open the active (or last saved) Facts report and scroll to Share */
  openFactsShare: () => void;
  factsShareToken: number;
  /** Open the active (or last saved) Facts report and scroll to Market value */
  openFactsMarket: () => void;
  factsMarketToken: number;
  /** One-shot Tow → Trips Profile (open pane; never auto-lock) */
  tripsHandoff: TripsHandoff | null;
  openTripsProfile: (offer?: TowHandoffOffer | null) => void;
  clearTripsHandoff: () => void;
  /** One-shot Facts → Tow (Check tow). Dock setTab("rvtow") must not set this. */
  towHandoff: FactsTowHandoff | null;
  openTowWithCoach: (offer?: FactsTowHandoffOffer | null) => void;
  clearTowHandoff: () => void;
  /**
   * AppShell's phone-access session. Facts/Fax share reads this when the
   * lazy chunk's AccessProvider context is missing (duplicate module).
   */
  accessSession?: {
    allowed: boolean;
    status: string;
    name: string;
    phone: string;
  };
};

export const ShellNavContext = createContext<ShellNavValue | null>(null);

export function useShellNav(): ShellNavValue {
  const ctx = useContext(ShellNavContext);
  if (!ctx) {
    throw new Error("useShellNav must be used within ShellNavProvider");
  }
  return ctx;
}

export function useShellNavOptional(): ShellNavValue | null {
  return useContext(ShellNavContext);
}
