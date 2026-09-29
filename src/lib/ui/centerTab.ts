/** Scroll a horizontal strip so the selected tab sits in the center, clamped. */
export function centerTabInStrip(
  strip: HTMLElement,
  tab: HTMLElement,
  behavior: ScrollBehavior = "smooth",
) {
  const raw = tab.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
  const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
  const left = Math.min(max, Math.max(0, raw));
  if (Math.abs(strip.scrollLeft - left) < 1) return;
  strip.scrollTo({ left, behavior });
}

export function centerPressedTab(
  strip: HTMLElement | null,
  behavior: ScrollBehavior = "smooth",
) {
  if (!strip) return;
  const tab = strip.querySelector<HTMLElement>(
    "[aria-current='page'], [aria-pressed='true'], .is-active, .is-on",
  );
  if (!tab) return;
  centerTabInStrip(strip, tab, behavior);
}
