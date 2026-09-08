import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";
import {
  DEAL_SPLIT_IDS,
  DEAL_SPLITS,
  formatSoldMoney,
  formatUnitLabel,
  parseGrossAmount,
  salesmanNet,
  splitPercentLabel,
  type DealSplitId,
} from "@/lib/rv/soldDeals";
import type { SavedUnitIdentity } from "@/lib/rv/savedUnits";

type Step = "name" | "gross" | "split";

const STEPS: Step[] = ["name", "gross", "split"];

export function SoldPrompt({
  unit,
  onClose,
  onSubmit,
}: {
  unit: SavedUnitIdentity;
  onClose: () => void;
  onSubmit: (input: {
    customerName: string;
    gross: number;
    split: DealSplitId;
  }) => void;
}) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [grossDraft, setGrossDraft] = useState("");
  const [split, setSplit] = useState<DealSplitId | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const grossRef = useRef<HTMLInputElement | null>(null);
  const kb = useKeyboardInset();
  const unitLabel = formatUnitLabel(unit);
  const stepIndex = STEPS.indexOf(step);
  const gross = parseGrossAmount(grossDraft);
  const net = useMemo(
    () => (gross != null && split ? salesmanNet(gross, split) : null),
    [gross, split],
  );

  useEffect(() => {
    if (step === "name") nameRef.current?.focus();
    if (step === "gross") grossRef.current?.focus();
  }, [step]);

  const go = (next: Step) => {
    void hapticLight();
    setStep(next);
  };

  const submit = () => {
    if (gross == null || !split) return;
    void hapticSuccess();
    onSubmit({ customerName: name, gross, split });
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sold-prompt-title"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[0.16em] text-white/70">
            SOLD · {stepIndex + 1} OF 3
          </p>
          <h2
            id="sold-prompt-title"
            className="truncate text-[16px] font-bold text-white"
          >
            {unitLabel}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
          aria-label="Close sold prompt"
        >
          <X className="size-5" />
        </button>
      </div>

      <div
        className="rv-scroll flex-1 overflow-y-auto px-4 py-5"
        style={{
          paddingBottom: kb.open
            ? `max(2rem, ${kb.inset + 24}px)`
            : undefined,
        }}
      >
        <div className="mx-auto w-full max-w-lg space-y-4">
          {step === "name" ? (
            <section className="glass-prestige space-y-3 rounded-[var(--radius-xl)] p-4">
              <p className="text-[15px] font-bold text-white">Customer name</p>
              <p className="text-[12px] text-white/65">
                Optional — skip anytime. Never blocks the deal.
              </p>
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name or skip"
                autoComplete="name"
                className="glass-field w-full rounded-[var(--radius-md)] px-3.5 py-3 text-[16px] font-semibold text-white outline-none"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    go("gross");
                  }}
                  className="min-h-[48px] flex-1 rounded-full border border-white/20 bg-black/40 px-4 text-[13px] font-bold text-white"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => go("gross")}
                  className="min-h-[48px] flex-1 rounded-full bg-blue px-4 text-[13px] font-bold text-white"
                >
                  Next
                </button>
              </div>
            </section>
          ) : null}

          {step === "gross" ? (
            <section className="glass-prestige space-y-3 rounded-[var(--radius-xl)] p-4">
              <p className="text-[15px] font-bold text-white">Gross amount</p>
              <p className="text-[12px] text-white/65">Required. Dollars only.</p>
              <input
                ref={grossRef}
                value={grossDraft}
                onChange={(e) => setGrossDraft(e.target.value)}
                inputMode="decimal"
                placeholder="$0"
                className="glass-field w-full rounded-[var(--radius-md)] px-3.5 py-3 text-[22px] font-extrabold text-white outline-none"
              />
              {gross != null ? (
                <p className="text-[12px] font-semibold text-sky-200">
                  {formatSoldMoney(gross)}
                </p>
              ) : grossDraft.trim() ? (
                <p className="text-[12px] text-ruby">Enter a gross above zero.</p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => go("name")}
                  className="inline-flex min-h-[48px] items-center gap-1 rounded-full border border-white/20 bg-black/40 px-4 text-[13px] font-bold text-white"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  disabled={gross == null}
                  onClick={() => go("split")}
                  className="min-h-[48px] flex-1 rounded-full bg-blue px-4 text-[13px] font-bold text-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </section>
          ) : null}

          {step === "split" ? (
            <section className="glass-prestige space-y-3 rounded-[var(--radius-xl)] p-4">
              <p className="text-[15px] font-bold text-white">Deal split</p>
              <p className="text-[12px] text-white/65">
                Dropdown only — quarter, half, or whole. Net is automatic.
              </p>
              <div className="space-y-2" role="listbox" aria-label="Deal split">
                {DEAL_SPLIT_IDS.map((id) => {
                  const opt = DEAL_SPLITS[id];
                  const selected = split === id;
                  const preview =
                    gross != null ? salesmanNet(gross, id) : null;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        void hapticLight();
                        setSplit(id);
                      }}
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-between rounded-[var(--radius-md)] border px-3.5 py-3 text-left",
                        selected
                          ? "border-gold-border/60 bg-gold-dim/25"
                          : "border-white/25 bg-white/[0.04]",
                      )}
                    >
                      <span className="text-[15px] font-bold text-white">
                        {opt.label}
                      </span>
                      <span className="text-[12px] font-semibold text-white/70">
                        {preview != null
                          ? formatSoldMoney(preview)
                          : splitPercentLabel(id)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {net != null ? (
                <p className="text-[13px] font-bold text-sky-200">
                  Your net {formatSoldMoney(net)}
                </p>
              ) : null}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => go("gross")}
                  className="inline-flex min-h-[48px] items-center gap-1 rounded-full border border-white/20 bg-black/40 px-4 text-[13px] font-bold text-white"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  disabled={!split || gross == null}
                  onClick={submit}
                  className="min-h-[48px] flex-1 rounded-full bg-blue px-4 text-[13px] font-bold text-white disabled:opacity-40"
                >
                  Log deal
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
