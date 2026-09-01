import { useShellNavOptional } from "./ShellNavContext";
import { formatActiveCoachChip } from "@/lib/rv/activeCoach";

/**
 * Shared “2023 American Coach American Dream · 45A · change” strip.
 * Lives under suite headers so Cal / Tow follow the open Facts coach.
 */
export function ActiveCoachChip({
  className,
}: {
  className?: string;
}) {
  const nav = useShellNavOptional();
  const coach = nav?.activeCoach;
  if (!coach) return null;

  return (
    <div
      className={
        className ??
        "mx-auto flex w-full max-w-lg items-center gap-2 px-3 pb-1 pt-1 sm:px-4"
      }
    >
      <p className="min-w-0 flex-1 truncate rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white">
        {formatActiveCoachChip(coach)}
      </p>
      <button
        type="button"
        onClick={() => nav?.openFactsPicker()}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-white/20 bg-black/40 px-3 text-[11px] font-bold text-sky-100"
      >
        change
      </button>
    </div>
  );
}
