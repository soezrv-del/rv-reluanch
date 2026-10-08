import { useEffect, useRef, type ReactNode } from "react";
import {
  SECTION_ROW,
  isSectionId,
  planSectionAxis,
  sectionIndex,
  sectionStep,
  type SectionId,
} from "@/lib/shell/sectionRow";
import "./section-deck.css";

const BLOCK =
  "input, textarea, select, button, a, [data-no-swipe], [data-lot-arrivals], [data-map-engine], [data-mapbox-canvas-host], [role='slider']";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The single row Home reveals. Side swipes move one page.
 * A vertical drag is left alone so the page can scroll.
 */
export function SectionDeck({
  hidden,
  tab,
  onArrive,
  onHome,
  children,
}: {
  hidden: boolean;
  tab: string;
  onArrive: (id: SectionId) => void;
  onHome: () => void;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  useEffect(() => {
    const row = rowRef.current;
    if (!row || hidden) return;
    const index = Math.max(0, sectionIndex(tab));
    const left = index * row.clientWidth;
    if (Math.abs(row.scrollLeft - left) < 2) return;
    row.scrollTo({ left, behavior: "auto" });
  }, [tab, hidden]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || hidden) return;

    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let tracking = false;
    let axis: "h" | "v" | null = null;

    const width = () => row.clientWidth || 1;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const target = event.target;
      if (target instanceof Element && target.closest(BLOCK)) return;
      tracking = true;
      axis = null;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = row.scrollLeft;
    };

    const onMove = (event: PointerEvent) => {
      if (!tracking) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (!axis) axis = planSectionAxis(dx, dy);
      if (axis !== "h") return;
      event.preventDefault();
      row.scrollLeft = startLeft - dx;
    };

    const onUp = (event: PointerEvent) => {
      if (!tracking) return;
      tracking = false;
      const dx = event.clientX - startX;
      if (axis !== "h") return;
      const current = Math.max(0, sectionIndex(tabRef.current));
      const step = sectionStep(dx, current, SECTION_ROW.length);
      const next = current + step;
      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      row.scrollTo({ left: next * width(), behavior });
      const id = SECTION_ROW[next]?.id;
      if (id && id !== tabRef.current) onArriveRef.current(id);
      axis = null;
    };

    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove, { passive: false });
    row.addEventListener("pointerup", onUp);
    row.addEventListener("pointercancel", onUp);
    return () => {
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("pointerup", onUp);
      row.removeEventListener("pointercancel", onUp);
    };
  }, [hidden]);

  const current = isSectionId(tab) ? SECTION_ROW[sectionIndex(tab)] : SECTION_ROW[0];

  return (
    <>
      <div
        ref={rowRef}
        className="section-row"
        data-section-row=""
        hidden={hidden}
        aria-hidden={hidden}
      >
        {children}
      </div>
      {hidden ? null : (
        <div className="section-foot" data-section-foot>
          <button type="button" className="section-home" data-section-home onClick={onHome}>
            Home
          </button>
          <p className="section-foot-label">{current?.label}</p>
          <div className="section-dots" role="tablist" aria-label="Sections">
            {SECTION_ROW.map((page) => (
              <button
                key={page.id}
                type="button"
                className="section-dot"
                data-section-dot={page.id}
                role="tab"
                aria-label={page.label}
                aria-selected={page.id === tab}
                aria-current={page.id === tab ? "page" : undefined}
                onClick={() => {
                  const row = rowRef.current;
                  const index = sectionIndex(page.id);
                  if (row && index >= 0) {
                    row.scrollTo({
                      left: index * (row.clientWidth || 1),
                      behavior: prefersReducedMotion() ? "auto" : "smooth",
                    });
                  }
                  if (page.id !== tab) onArrive(page.id);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
