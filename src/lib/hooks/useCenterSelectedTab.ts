import { useEffect, type RefObject } from "react";
import { centerPressedTab } from "@/lib/ui/centerTab";

/** Center the pressed tab in a horizontal strip. Does not scroll the page. */
export function useCenterSelectedTab(
  stripRef: RefObject<HTMLElement | null>,
  selected: string | number | boolean | null | undefined,
) {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      centerPressedTab(stripRef.current);
    });
    return () => cancelAnimationFrame(frame);
  }, [stripRef, selected]);
}
