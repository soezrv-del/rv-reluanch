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
          ? "showroom-menu"
          : "premium-menu-btn showroom-menu flex shrink-0 items-center justify-center",
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
