import type { ReactNode } from "react";
import {
  ShellNavContext,
  type ShellNavValue,
  type CalSeed,
  type TripsHandoff,
} from "./ShellNavContext";

export type { ShellNavValue, CalSeed, TripsHandoff };

/** Provider only — hooks live in `ShellNavContext.ts` for Fast Refresh. */
export function ShellNavProvider({
  value,
  children,
}: {
  value: ShellNavValue;
  children: ReactNode;
}) {
  return (
    <ShellNavContext.Provider value={value}>{children}</ShellNavContext.Provider>
  );
}
