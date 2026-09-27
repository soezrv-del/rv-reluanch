import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShellNavOptional } from "./ShellNavContext";

/**
 * Top-right ⋯ control — opens Premium / suite tools on every page.
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

  return (
    <button
      type="button"
      onClick={() => nav?.setTab("more")}
      className={cn(
        showroom
          ? "showroom-menu showroom-float"
          : "premium-menu-btn flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow-[0_0_16px_rgba(80,140,255,0.25)] backdrop-blur-md transition active:scale-95 hover:border-white/50 hover:bg-black/60",
        showroom ? null : dim,
        className,
      )}
      aria-label="Premium and suite tools"
      title="Premium"
    >
      <MoreHorizontal
        className={showroom ? "showroom-menu-icon" : size === "sm" ? "size-5" : "size-5"}
        fill={showroom ? "currentColor" : "none"}
        strokeWidth={showroom ? 1.5 : 2}
      />
    </button>
  );
}
