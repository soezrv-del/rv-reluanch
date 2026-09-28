import { cn } from "@/lib/utils";
import "./home-truth.css";

/**
 * VERIFIED AND TRUE — one crisp clipped-text face. No blurred strike layer.
 * `size` is kept for call sites; type size lives in the theme CSS.
 */
export function MetalVerifiedTrue({
  className,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const label = "Verified and True";

  return (
    <span
      className={cn(
        "metal-hammered relative inline-block select-none text-center uppercase",
        className,
      )}
      aria-label={label}
    >
      <span className="metal-hammered-face">{label}</span>
    </span>
  );
}
