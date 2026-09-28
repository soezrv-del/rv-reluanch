import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShellNavOptional } from "./ShellNavContext";
import { ThemeSwitch } from "./ThemeSwitch";

/**
 * Top-right ⋯ — the main menu. White / Blue switches the whole app.
 * Premium tools stay one tap away in the same menu.
 */
export function PremiumMenuButton({
  className,
  size = "md",
  variant = "classic",
}: {
  className?: string;
  size?: "sm" | "md";
  variant?: "classic" | "showroom";
}) {
  const nav = useShellNavOptional();
  const dim = size === "sm" ? "size-9" : "size-10";
  const showroom = variant === "showroom";
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const menu =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="main-menu-layer" data-main-menu-layer>
            <button
              type="button"
              className="main-menu-scrim"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <div
              id={menuId}
              role="dialog"
              aria-label="Main menu"
              data-main-menu
              className="main-menu-sheet"
            >
              <p className="main-menu-kicker">Appearance</p>
              <ThemeSwitch onChoose={() => setOpen(false)} />
              <button
                type="button"
                className="main-menu-link"
                onClick={() => {
                  setOpen(false);
                  nav?.setTab("more");
                }}
              >
                Premium tools
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          showroom
            ? "showroom-menu"
            : "premium-menu-btn showroom-menu flex shrink-0 items-center justify-center",
          showroom ? null : dim,
          className,
        )}
        aria-label="Main menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        title="Main menu"
      >
        <MoreHorizontal
          className={showroom ? "showroom-menu-icon" : size === "sm" ? "size-5" : "size-5"}
          fill={showroom ? "currentColor" : "none"}
          strokeWidth={showroom ? 1.5 : 2}
        />
      </button>
      {menu}
    </>
  );
}
