import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** One customer-facing legal line — same pattern on every screen that needs it. */
export const SUITE_DISCLAIMER =
  "Confirm brochure, door sticker, and NHTSA before you buy.";

export function SuiteDisclaimer({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-1 pb-2 text-center text-[11px] leading-snug text-white/50",
        className,
      )}
    >
      {children ?? SUITE_DISCLAIMER}
    </p>
  );
}
