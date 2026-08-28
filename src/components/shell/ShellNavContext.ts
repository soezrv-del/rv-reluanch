import { createContext, useContext } from "react";
import type { AppTab } from "./BottomTabs";

/** Prefill RvCal from a Facts detail report (avg market). */
export type CalSeed = {
  price: number;
  label?: string;
  token: number;
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
