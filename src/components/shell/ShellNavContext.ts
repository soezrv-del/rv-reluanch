import { createContext, useContext } from "react";
import type { AppTab } from "./BottomTabs";
import type { ActiveCoach, ActiveCoachInput } from "@/lib/rv/activeCoach";
import type { TowHandoffOffer } from "@/lib/trips/towHandoff";

/** Prefill RvCal from a Facts detail report (avg market). */
export type CalSeed = {
  price: number;
  label?: string;
  token: number;
};

/** One-shot Tow → Trips Profile deep-link. Coach identity only — no invented dims. */
export type TripsHandoff = {
  token: number;
  offer: TowHandoffOffer | null;
};

/** One-shot Facts → Tow. Dock tab / swipe never sets this. */
export type FactsTowHandoff = {
  token: number;
  offer: ActiveCoach | null;
};

export type ShellNavValue = {
  tab: AppTab;
  setTab: (tab: AppTab) => void;
  /** Grok opening splash video — hide bottom tabs while playing */
  splashPlaying: boolean;
  setSplashPlaying: (playing: boolean) => void;
  /** One-shot seed for RvCal (detail → finance) */
  calSeed: CalSeed | null;
  openCalWithPrice: (price: number, label?: string) => void;
  clearCalSeed: () => void;
  /** Last Facts coach for the chip. Other tabs must not auto-read this on dock entry. */
  activeCoach: ActiveCoach | null;
  setActiveCoach: (sel: ActiveCoachInput | null) => void;
  /** Dock Facts / chip “change”: clean catalog search (factsPickerToken). */
  openFactsPicker: () => void;
  factsPickerToken: number;
  /** Open the active (or last saved) Facts report and scroll to Share */
  openFactsShare: () => void;
  factsShareToken: number;
  /** One-shot Tow → Trips Profile (open pane; never auto-lock) */
  tripsHandoff: TripsHandoff | null;
  openTripsProfile: (offer?: TowHandoffOffer | null) => void;
  clearTripsHandoff: () => void;
  /** One-shot Facts → Tow (Check tow). Dock setTab("rvtow") must not set this. */
  towHandoff: FactsTowHandoff | null;
  openTowWithCoach: (offer?: ActiveCoachInput | null) => void;
  clearTowHandoff: () => void;
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
