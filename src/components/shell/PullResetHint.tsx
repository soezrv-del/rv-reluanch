/** Sticky banner shown while pull-to-reset is armed. */
export function PullResetHint({
  show,
  label = "Release to reset · pull down to refresh",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="sticky top-0 z-30 border-b border-sky-400/30 bg-black/75 px-3 py-2 text-center text-[11px] font-semibold text-sky-100 backdrop-blur-md">
      {label}
    </div>
  );
}
