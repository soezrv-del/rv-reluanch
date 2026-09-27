/** Owner Raidho mark. Shared shell chrome — not a room header. */
export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-shell-mark.png";

export function SuiteBrand() {
  return (
    <div
      data-suite-brand
      className="flex shrink-0 items-center gap-2.5 bg-black px-4 pt-3 pb-1"
    >
      <img
        src={RAIDHO_SHELL_MARK}
        alt=""
        width={19}
        height={32}
        className="h-8 w-auto"
      />
      <span className="text-[17px] font-semibold tracking-tight text-fg">
        RvFOX
      </span>
    </div>
  );
}
