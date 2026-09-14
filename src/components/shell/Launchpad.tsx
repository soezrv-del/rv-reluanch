import { cn } from "@/lib/utils";

/**
 * Forged steel wordmark — hammered / embossed into the plate.
 * Dual-layer: deep strike shadow + hard metal face.
 */
export function MetalVerifiedTrue({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "text-[clamp(1.4rem,5.6vw,1.85rem)] tracking-[0.26em]"
      : size === "sm"
        ? "text-[0.82rem] tracking-[0.2em]"
        : "text-[clamp(1.2rem,4.6vw,1.48rem)] tracking-[0.24em]";

  const label = "Verified and True";

  return (
    <span
      className={cn(
        "metal-hammered relative inline-block select-none text-center font-black uppercase leading-none",
        sizeCls,
        className,
      )}
      aria-label={label}
    >
      <span aria-hidden className="metal-hammered-strike">
        {label}
      </span>
      <span className="metal-hammered-face">{label}</span>
    </span>
  );
}
