import { cn } from "@/lib/utils";

export type GrokAvatarSize = "sm" | "md" | "lg";

const SIZE: Record<GrokAvatarSize, string> = {
  sm: "size-16",
  md: "size-28 sm:size-32",
  lg: "size-36 sm:size-44",
};

export function GrokAvatar({
  size = "lg",
  speaking = false,
  className,
}: {
  size?: GrokAvatarSize;
  speaking?: boolean;
  className?: string;
}) {
  return (
    <div
      data-rvgrok-avatar=""
      data-speaking={speaking ? "1" : undefined}
      className={cn(
        "grok-avatar-ring relative shrink-0 rounded-full",
        SIZE[size],
        speaking && "grok-avatar-speak",
        className,
      )}
    >
      <div className="grok-avatar-well absolute inset-[3px] overflow-hidden rounded-full">
        <img
          src="/assets/brand/icon-rvgrok.png"
          alt=""
          className="size-full object-cover"
        />
      </div>
    </div>
  );
}
