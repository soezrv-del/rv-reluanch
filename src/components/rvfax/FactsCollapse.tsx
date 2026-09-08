import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Facts-local section: title + one headline when closed; tap to expand.
 * Default closed — never dump a full section on load.
 */
export function FactsCollapse({
  title,
  headline,
  children,
  defaultOpen = false,
  open: openControlled,
  onOpenChange,
  className,
}: {
  title: string;
  headline?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = openControlled ?? uncontrolled;
  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (openControlled === undefined) setUncontrolled(next);
  };

  return (
    <section className={cn("glass-prestige rounded-[1.25rem]", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[16px] font-bold tracking-tight text-white">
            {title}
          </span>
          {!open && headline ? (
            <span className="mt-0.5 block truncate text-[15px] font-semibold tabular-nums text-white/85">
              {headline}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-white/70 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {open ? <div className="px-5 pb-5">{children}</div> : null}
    </section>
  );
}
