import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Info,
  Wrench,
} from "lucide-react";
import type { AgentStep } from "@/lib/rvgrok/types";
import { TOOL_META } from "@/lib/rvgrok/types";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Search> = {
  analyze_requirements: Search,
  search_rv_models: Search,
  get_model_details: Info,
  check_market_availability: TrendingUp,
};

export function AgentStepsCard({ steps }: { steps: AgentStep[] }) {
  const [expanded, setExpanded] = useState(true);
  if (!steps?.length) return null;

  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;
  const allDone = doneCount === total && total > 0;

  return (
    <div className="mb-3 overflow-hidden rounded-[var(--radius-md)] border border-ruby-border bg-ruby-soft">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-opacity hover:opacity-90"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-ruby-border bg-ruby-mid px-2 py-0.5 text-[10px] font-bold tracking-wide text-ruby">
            <Sparkles className="size-2.5" />
            AGENT
          </span>
          <span className="truncate text-xs font-medium text-white">
            {allDone
              ? `Research complete · ${total} step${total !== 1 ? "s" : ""}`
              : `Running · ${doneCount}/${total} steps`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-white">
          {!allDone && (
            <Loader2 className="size-3.5 animate-spin text-ruby" />
          )}
          {expanded ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-1.5 border-t border-ruby-border/50 px-2.5 py-2">
          {steps.map((step) => {
            const meta = TOOL_META[step.tool] ?? {
              label: step.tool,
              color: "#888",
            };
            const Icon = ICONS[step.tool] ?? Wrench;
            let resultPreview = "";
            if (step.result) {
              try {
                const parsed = JSON.parse(step.result);
                const keys = Object.keys(parsed).slice(0, 2);
                resultPreview = keys
                  .map((k) => {
                    const v = parsed[k];
                    return `${k}: ${typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v).slice(0, 40)}`;
                  })
                  .join(" · ");
              } catch {
                resultPreview = String(step.result).slice(0, 80);
              }
            }

            return (
              <div
                key={step.step}
                className="flex items-start gap-2 rounded-[var(--radius-sm)] bg-black/25 px-2 py-1.5"
              >
                <div
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${meta.color}18` }}
                >
                  {step.status === "running" ? (
                    <Loader2
                      className="size-3.5 animate-spin"
                      style={{ color: meta.color }}
                    />
                  ) : (
                    <Icon className="size-3.5" style={{ color: meta.color }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    {step.status === "done" && (
                      <CheckCircle2 className="size-3 text-green" />
                    )}
                  </div>
                  {resultPreview ? (
                    <p className="mt-0.5 truncate text-[10px] leading-snug text-white">
                      {resultPreview}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-[10px] tabular-nums text-white">
                  #{step.step}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AgentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-ruby-border bg-ruby-mid px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-ruby",
        className,
      )}
    >
      <Sparkles className="size-2.5" />
      Agent
    </span>
  );
}
