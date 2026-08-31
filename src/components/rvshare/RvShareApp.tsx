import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  FileText,
  Landmark,
  MessageCircle,
  Plus,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitePage } from "@/components/shell/SuitePage";
import type { AppTab } from "@/components/shell/BottomTabs";
import {
  compareSelectionKey,
  getSpec,
  ratingFor,
  type RVResult,
} from "@/lib/rv/catalog";
import {
  DOWN_PRESETS,
  formatMoney,
  TERM_PRESETS,
  defaultAprForTerm,
} from "@/lib/rv/rvCal";
import { hapticLight, hapticSuccess } from "@/lib/haptics";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  buildCoachKit,
  buildSuitePitch,
  brochureSpecGroups,
  coachSnapshot,
  coachTitle,
  copyKit,
  DEFAULT_SHARE_INCLUDE,
  defaultMarketFor,
  defaultPaymentFor,
  fetchShareImage,
  kitStrengths,
  lifestyleImageFor,
  loadSavedUnits,
  paymentBreakdown,
  SAVED_UNITS_EVENT,
  shareOrCopy,
  type ShareInclude,
  type ShareMarket,
  type SharePayment,
} from "@/lib/rv/shareKit";

function sampleCoach(): RVResult | null {
  const spec = getSpec("Newmar", "Essex");
  if (!spec) return null;
  return {
    year: "2024",
    make: "Newmar",
    model: "Essex",
    floorplan: "4551",
    data: spec,
  };
}

function parseMoney(raw: string): number {
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

function MoneyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold tracking-wide text-white/70">
        {label}
      </span>
      <input
        aria-label={label}
        inputMode="numeric"
        value={value ? value.toLocaleString("en-US") : ""}
        onChange={(e) => onChange(parseMoney(e.target.value))}
        className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2.5 py-2.5 text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]"
      />
    </label>
  );
}

function DraftNumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  decimals = 2,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  decimals?: number;
}) {
  const format = (n: number) =>
    Number.isFinite(n) ? n.toFixed(decimals) : "";
  const [text, setText] = useState(() => format(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (focused) return;
    setText(
      Number.isFinite(value)
        ? value.toFixed(decimals)
        : "",
    );
  }, [value, focused, decimals]);

  const commit = (raw: string, clamp: boolean) => {
    const n = Number.parseFloat(raw.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(n)) return;
    let next = n;
    if (clamp) {
      if (min != null) next = Math.max(min, next);
      if (max != null) next = Math.min(max, next);
    }
    const f = 10 ** decimals;
    next = Math.round(next * f) / f;
    onChange(next);
  };

  return (
    <label className="block">
      <span className="mb-1 block text-[9px] font-bold tracking-wide text-white/70">
        {label}
      </span>
      <div className="glass-field flex min-h-11 items-center gap-1 rounded-[var(--radius-md)] px-2.5">
        {prefix ? (
          <span className="text-[13px] font-bold text-white/70">{prefix}</span>
        ) : null}
        <input
          aria-label={label}
          inputMode="decimal"
          value={text}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit(text, true);
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.]/g, "");
            setText(raw);
            commit(raw, false);
          }}
          className="w-full bg-transparent py-2.5 text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]"
        />
        {suffix ? (
          <span className="shrink-0 text-[12px] font-bold text-white/60">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function NativeSelect<T extends string | number>({
  "aria-label": ariaLabel,
  value,
  options,
  onChange,
  parse,
}: {
  "aria-label": string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  parse: (raw: string) => T;
}) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={String(value)}
        onChange={(e) => onChange(parse(e.target.value))}
        className="glass-field min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] px-2 py-2.5 pr-7 text-center text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-sky-200"
        aria-hidden
      />
    </div>
  );
}

const INCLUDE_CHIPS: { id: keyof ShareInclude; label: string }[] = [
  { id: "market", label: "Market" },
  { id: "payment", label: "Payment" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "strengths", label: "Strengths" },
  { id: "specs", label: "Specs" },
];

export function RvShareApp({
  active = true,
  onNavigate,
  onOpenGrok,
}: {
  active?: boolean;
  onNavigate?: (tab: AppTab) => void;
  onOpenGrok?: (prompt?: string) => void;
}) {
  const nav = useShellNavOptional();
  const [saved, setSaved] = useState<RVResult[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(false);
  const [include, setInclude] = useState<ShareInclude>(DEFAULT_SHARE_INCLUDE);
  const [payment, setPayment] = useState<SharePayment>({
    price: 150000,
    downPct: 10,
    termMonths: 144,
    apr: defaultAprForTerm(144),
  });
  const [marketEdit, setMarketEdit] = useState<ShareMarket>({
    tradeIn: 0,
    retailLow: 0,
    retailHigh: 0,
    msrpLo: 0,
    msrpHi: 0,
  });
  const [status, setStatus] = useState<string | null>(null);
  const [strengthDraft, setStrengthDraft] = useState<string[]>([]);
  const [strengthsLocked, setStrengthsLocked] = useState(false);
  const [ratingEdit, setRatingEdit] = useState<number | null>(null);

  const reloadSaved = useCallback(() => {
    setSaved(loadSavedUnits());
  }, []);

  useEffect(() => {
    reloadSaved();
    const onChange = () => reloadSaved();
    window.addEventListener(SAVED_UNITS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    window.addEventListener("focus", onChange);
    return () => {
      window.removeEventListener(SAVED_UNITS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [reloadSaved]);

  useEffect(() => {
    if (active) reloadSaved();
  }, [active, reloadSaved]);

  const sample = useMemo(() => sampleCoach(), []);

  useEffect(() => {
    if (usingSample) return;
    if (saved.length === 0) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((prev) => {
      if (prev && saved.some((r) => compareSelectionKey(r) === prev)) return prev;
      return compareSelectionKey(saved[0]!);
    });
  }, [saved, usingSample]);

  const selected = useMemo(() => {
    if (usingSample) return sample;
    if (!selectedKey) return saved[0] ?? null;
    return saved.find((r) => compareSelectionKey(r) === selectedKey) ?? saved[0] ?? null;
  }, [saved, selectedKey, usingSample, sample]);

  useEffect(() => {
    if (!selected) return;
    setPayment(defaultPaymentFor(selected));
    setMarketEdit(defaultMarketFor(selected));
    setStrengthsLocked(false);
    setRatingEdit(null);
  }, [selected]);

  const catalogRating = useMemo(
    () =>
      selected ? ratingFor(selected.make, selected.model, selected.year) : 0,
    [selected],
  );
  const ratingValue = ratingEdit ?? catalogRating;

  useEffect(() => {
    if (!selected || strengthsLocked) return;
    setStrengthDraft(
      kitStrengths(
        selected,
        include.payment ? payment : undefined,
        ratingValue,
      ),
    );
  }, [selected, include.payment, payment, strengthsLocked, ratingValue]);

  const priceOptions = useMemo(() => {
    const mid = Math.round((marketEdit.retailLow + marketEdit.retailHigh) / 2);
    const uniq = new Map<number, string>();
    if (marketEdit.tradeIn) uniq.set(marketEdit.tradeIn, `Trade ${formatMoney(marketEdit.tradeIn)}`);
    if (marketEdit.retailLow) uniq.set(marketEdit.retailLow, `Low ${formatMoney(marketEdit.retailLow)}`);
    if (mid) uniq.set(mid, `Mid ${formatMoney(mid)}`);
    if (marketEdit.retailHigh) uniq.set(marketEdit.retailHigh, `Ask ${formatMoney(marketEdit.retailHigh)}`);
    if (marketEdit.msrpHi) uniq.set(marketEdit.msrpHi, `MSRP ${formatMoney(marketEdit.msrpHi)}`);
    return [...uniq.entries()].map(([value, label]) => ({ value, label }));
  }, [marketEdit]);

  const kitText = useMemo(() => {
    if (!selected) return "";
    return buildCoachKit({
      result: selected,
      include,
      payment,
      market: marketEdit,
      strengths: strengthDraft,
      rating: ratingValue,
    });
  }, [selected, include, payment, marketEdit, strengthDraft, ratingValue]);

  const loan = useMemo(() => paymentBreakdown(payment), [payment]);

  const snap = useMemo(
    () => (selected ? coachSnapshot(selected, ratingValue) : null),
    [selected, ratingValue],
  );

  const specGroups = useMemo(
    () => (selected ? brochureSpecGroups(selected) : []),
    [selected],
  );

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(null), 2200);
  };

  const sendKit = async () => {
    if (!selected || !kitText) return;
    void hapticLight();
    const files: File[] = [];
    if (include.lifestyle) {
      const img = await fetchShareImage(
        lifestyleImageFor(selected.data.type, selected.data.fuelType, selected.data.chassis),
        `${coachTitle(selected).replace(/[^\w.-]+/g, "_")}-lifestyle.jpg`,
      );
      if (img) files.push(img);
    }
    const out = await shareOrCopy({
      title: coachTitle(selected),
      text: kitText,
      files: files.length ? files : undefined,
    });
    if (out === "shared") {
      hapticSuccess();
      flash("Sent");
    } else if (out === "copied") {
      hapticSuccess();
      flash("Copied");
    } else if (out === "cancelled") {
      flash("Cancelled");
    } else {
      flash("Couldn’t share");
    }
  };

  const copyOnly = async () => {
    if (!kitText) return;
    void hapticLight();
    const out = await copyKit(kitText);
    if (out === "copied") {
      hapticSuccess();
      flash("Copied");
    } else {
      flash("Couldn’t copy");
    }
  };

  const sendSuite = async () => {
    void hapticLight();
    const out = await shareOrCopy({
      title: "RvFOX Pro",
      text: buildSuitePitch(),
    });
    if (out === "shared") {
      hapticSuccess();
      flash("Suite sent");
    } else if (out === "copied") {
      hapticSuccess();
      flash("Suite copied");
    } else if (out !== "cancelled") {
      flash("Couldn’t share");
    }
  };

  const pickUnit = (r: RVResult, samplePick = false) => {
    void hapticLight();
    setUsingSample(samplePick);
    setSelectedKey(compareSelectionKey(r));
  };

  const goFacts = () => onNavigate?.("rvfax") ?? nav?.setTab("rvfax");
  const goCal = () => {
    if (selected && payment.price) {
      nav?.openCalWithPrice(payment.price, coachTitle(selected));
    } else {
      onNavigate?.("rvcal") ?? nav?.setTab("rvcal");
    }
  };
  const goGrok = () => {
    if (!selected) {
      onNavigate?.("rvgrok") ?? nav?.setTab("rvgrok");
      return;
    }
    onOpenGrok?.(
      `Write a buyer-facing lifestyle pitch and talking points for the ${coachTitle(selected)} — who it fits, weekend vs full-time, and why this floorplan.`,
    );
  };

  return (
    <SuitePage tab="rvshare" onPullReset={reloadSaved} pullLabel="Release to refresh saved units">
      <div className="mx-auto w-full max-w-lg space-y-4 px-3 pb-12 pt-3 sm:px-4">
        <section className="glass-prestige-gold relative overflow-hidden rounded-[1.25rem] p-4">
          <p className="text-[10px] font-bold tracking-[0.16em] text-amber">
            SEND KIT
          </p>
          <p className="mt-1.5 text-[17px] font-bold leading-snug text-white">
            Full brochure specs, then the calculator for strengths
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/90">
            Year-true powertrain, weights, tanks, and living data from Facts —
            plus a payment calculator that writes talking-point strengths into
            the kit.
          </p>
          <div className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-amber/40 bg-amber/15">
            <Share2 className="size-4 text-amber" />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              <Bookmark className="size-3.5" />
              SAVED UNITS
            </p>
            <span className="text-[11px] font-semibold text-white/70">
              {saved.length > 0 ? `${saved.length}` : "None yet"}
            </span>
          </div>
          {saved.length === 0 ? (
            <div className="glass-prestige space-y-3 rounded-[1.25rem] p-4">
              <p className="text-[13px] leading-relaxed text-white">
                Heart a coach in Facts, then it lands here for the desk or the buyer.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goFacts}
                  className="min-h-[44px] rounded-full bg-blue px-4 py-2.5 text-[12px] font-bold text-white"
                >
                  Open Facts
                </button>
                {sample ? (
                  <button
                    type="button"
                    onClick={() => pickUnit(sample, true)}
                    className="min-h-[44px] rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[12px] font-bold text-white"
                  >
                    Try a sample kit
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {saved.map((r) => {
                const key = compareSelectionKey(r);
                const on = !usingSample && selectedKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pickUnit(r)}
                    className={cn(
                      "glass-prestige flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 text-left active:scale-[0.99]",
                      on && "border-sky-300/50 ring-1 ring-sky-300/30",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-white">
                        {r.year} {r.make} {r.model}
                      </p>
                      <p className="text-[11px] text-white/80">
                        {r.floorplan || r.data.type}
                      </p>
                    </div>
                    {on ? (
                      <Check className="size-4 shrink-0 text-sky-200" />
                    ) : (
                      <Share2 className="size-4 shrink-0 text-white/50" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {selected ? (
          <section className="space-y-3">
            <p className="px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              {usingSample ? "SAMPLE KIT" : "THIS KIT"}
            </p>
            <article className="glass-prestige overflow-hidden rounded-[var(--radius-2xl)]">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={lifestyleImageFor(selected.data.type, selected.data.fuelType, selected.data.chassis)}
                  alt={`${selected.data.type} lifestyle`}
                  className="size-full object-cover object-center"
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
                {include.lifestyle ? (
                  <p className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] text-sky-100">
                    LIFESTYLE
                  </p>
                ) : null}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[12px] font-semibold text-sky-200">
                    {selected.year} · {selected.data.type}
                  </p>
                  <h2 className="text-[20px] font-bold leading-tight text-white">
                    {selected.make} {selected.model}
                  </h2>
                  {selected.floorplan ? (
                    <p className="text-[12px] text-white/85">
                      Floorplan {selected.floorplan}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {INCLUDE_CHIPS.map((chip) => {
                    const on = include[chip.id];
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => {
                          setInclude((prev) => ({ ...prev, [chip.id]: !prev[chip.id] }));
                        }}
                        className={cn(
                          "min-h-[36px] rounded-full border px-3 text-[11px] font-bold tracking-wide",
                          on
                            ? "border-sky-300/40 bg-sky-400/15 text-sky-50"
                            : "border-white/20 bg-white/5 text-white/55",
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>

                {snap ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold tracking-[0.16em] text-white/70">
                      COACH — RATING IS EDITABLE
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-2.5 py-2">
                        <p className="text-[9px] font-bold tracking-wide text-white/55">
                          TYPE
                        </p>
                        <p className="mt-0.5 truncate text-[13px] font-bold text-white">
                          {snap.type || "—"}
                        </p>
                      </div>
                      <DraftNumberField
                        label="RATING ★"
                        value={ratingValue}
                        onChange={setRatingEdit}
                        min={1}
                        max={5}
                        decimals={1}
                      />
                      <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-2.5 py-2">
                        <p className="text-[9px] font-bold tracking-wide text-white/55">
                          SLEEPS
                        </p>
                        <p className="mt-0.5 truncate text-[13px] font-bold text-white">
                          {snap.sleeps || "—"}
                        </p>
                      </div>
                      <div className="rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-2.5 py-2">
                        <p className="text-[9px] font-bold tracking-wide text-white/55">
                          LENGTH
                        </p>
                        <p className="mt-0.5 truncate text-[13px] font-bold text-white">
                          {snap.length || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {include.market ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold tracking-[0.16em] text-white/70">
                      MARKET — EDITABLE
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <MoneyField
                        label="TRADE-IN EST."
                        value={marketEdit.tradeIn}
                        onChange={(tradeIn) =>
                          setMarketEdit((m) => ({ ...m, tradeIn }))
                        }
                      />
                      <MoneyField
                        label="RETAIL LOW"
                        value={marketEdit.retailLow}
                        onChange={(retailLow) =>
                          setMarketEdit((m) => ({ ...m, retailLow }))
                        }
                      />
                      <MoneyField
                        label="RETAIL HIGH"
                        value={marketEdit.retailHigh}
                        onChange={(retailHigh) =>
                          setMarketEdit((m) => ({ ...m, retailHigh }))
                        }
                      />
                      <MoneyField
                        label="MSRP LOW"
                        value={marketEdit.msrpLo}
                        onChange={(msrpLo) =>
                          setMarketEdit((m) => ({ ...m, msrpLo }))
                        }
                      />
                      <MoneyField
                        label="MSRP HIGH"
                        value={marketEdit.msrpHi}
                        onChange={(msrpHi) =>
                          setMarketEdit((m) => ({ ...m, msrpHi }))
                        }
                      />
                    </div>
                  </div>
                ) : null}

                {include.payment ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold tracking-[0.16em] text-white/70">
                      PAYMENT — PRICE & RATE ARE EDITABLE
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <MoneyField
                        label="PRICE"
                        value={payment.price}
                        onChange={(price) => setPayment((p) => ({ ...p, price }))}
                      />
                      <DraftNumberField
                        label="INTEREST RATE"
                        value={payment.apr}
                        onChange={(apr) => setPayment((p) => ({ ...p, apr }))}
                        suffix="%"
                        min={0}
                        max={30}
                        decimals={2}
                      />
                    </div>
                    {priceOptions.length ? (
                      <div className="flex flex-wrap gap-1.5">
                        {priceOptions.map((o) => (
                          <button
                            key={o.value}
                            type="button"
                            onClick={() =>
                              setPayment((p) => ({ ...p, price: o.value }))
                            }
                            className={cn(
                              "min-h-[32px] rounded-full border px-2.5 text-[10px] font-bold",
                              payment.price === o.value
                                ? "border-sky-300/40 bg-sky-400/15 text-sky-50"
                                : "border-white/20 bg-white/5 text-white/70",
                            )}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-1 block text-[9px] font-bold tracking-wide text-white/70">
                          DOWN
                        </span>
                        <NativeSelect
                          aria-label="Down payment percent"
                          value={payment.downPct}
                          options={DOWN_PRESETS.map((n) => ({
                            value: n,
                            label: `${n}%`,
                          }))}
                          parse={(raw) => Number(raw)}
                          onChange={(downPct) =>
                            setPayment((p) => ({ ...p, downPct }))
                          }
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-[9px] font-bold tracking-wide text-white/70">
                          TERM
                        </span>
                        <NativeSelect
                          aria-label="Loan term"
                          value={payment.termMonths}
                          options={TERM_PRESETS.map((t) => ({
                            value: t.months,
                            label: t.label,
                          }))}
                          parse={(raw) => Number(raw)}
                          onChange={(termMonths) =>
                            setPayment((p) => ({
                              ...p,
                              termMonths,
                              apr: defaultAprForTerm(termMonths),
                            }))
                          }
                        />
                      </label>
                    </div>
                    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-white/15 bg-white/5 px-3 py-2.5">
                      <p className="text-[9px] font-bold tracking-wide text-white/70">
                        EST. / MO
                      </p>
                      <p className="text-[15px] font-black tabular-nums text-sky-100">
                        {formatMoney(loan.monthly)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        ["Down $", formatMoney(loan.down)],
                        ["Financed", formatMoney(loan.financed)],
                      ].map(([label, val]) => (
                        <div
                          key={label}
                          className="rounded-[var(--radius-md)] border border-white/10 bg-black/20 px-2.5 py-2"
                        >
                          <p className="text-[9px] font-bold tracking-wide text-white/55">
                            {label}
                          </p>
                          <p className="mt-0.5 text-[13px] font-bold tabular-nums text-white">
                            {val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {include.strengths ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[9px] font-bold tracking-[0.16em] text-white/70">
                        STRENGTHS — EDITABLE
                      </p>
                      <div className="flex gap-2">
                        {strengthsLocked ? (
                          <button
                            type="button"
                            onClick={() => setStrengthsLocked(false)}
                            className="text-[10px] font-bold tracking-wide text-sky-200"
                          >
                            Reset
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setStrengthsLocked(true);
                            setStrengthDraft((prev) => [...prev, ""]);
                          }}
                          className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 text-[10px] font-bold text-white"
                        >
                          <Plus className="size-3" />
                          Add
                        </button>
                      </div>
                    </div>
                    <ul className="space-y-1.5">
                      {strengthDraft.map((s, i) => (
                        <li key={`str-${i}`} className="flex items-start gap-1.5">
                          <input
                            aria-label={`Strength ${i + 1}`}
                            value={s}
                            onChange={(e) => {
                              const v = e.target.value;
                              setStrengthsLocked(true);
                              setStrengthDraft((prev) =>
                                prev.map((row, idx) => (idx === i ? v : row)),
                              );
                            }}
                            className="glass-field min-h-11 flex-1 rounded-[var(--radius-md)] px-2.5 py-2 text-[12px] font-semibold leading-snug text-white outline-none"
                          />
                          <button
                            type="button"
                            aria-label={`Remove strength ${i + 1}`}
                            onClick={() => {
                              setStrengthsLocked(true);
                              setStrengthDraft((prev) =>
                                prev.filter((_, idx) => idx !== i),
                              );
                            }}
                            className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70"
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {include.specs && specGroups.length ? (
                  <div className="space-y-3">
                    <p className="text-[9px] font-bold tracking-[0.16em] text-white/70">
                      BROCHURE SPECS
                    </p>
                    {specGroups.map((g) => (
                        <div key={g.title}>
                          <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-sky-200/90">
                            {g.title}
                          </p>
                          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {g.rows.map((row) => (
                              <div key={`${g.title}-${row.label}`} className="min-w-0">
                                <dt className="text-[9px] font-bold tracking-wide text-white/50">
                                  {row.label}
                                </dt>
                                <dd className="truncate text-[12px] font-semibold text-white">
                                  {row.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                  </div>
                ) : null}

                <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/85">
                  {kitText}
                </pre>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void sendKit()}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full bg-blue px-4 py-2.5 text-[13px] font-bold text-white"
                  >
                    <Share2 className="size-4" />
                    Share kit
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyOnly()}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-bold text-white"
                  >
                    <Copy className="size-4" />
                    Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={goFacts}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white"
                  >
                    <FileText className="size-3.5" />
                    Facts
                  </button>
                  <button
                    type="button"
                    onClick={goCal}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white"
                  >
                    <Landmark className="size-3.5" />
                    Finance
                  </button>
                  <button
                    type="button"
                    onClick={goGrok}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-bold text-white"
                  >
                    <MessageCircle className="size-3.5" />
                    Ask Grok
                  </button>
                </div>
              </div>
            </article>
          </section>
        ) : null}

        <section className="glass-prestige overflow-hidden rounded-[1.25rem] p-4">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
            <Sparkles className="size-3.5 text-sky-200" />
            SHARE THE SUITE
          </p>
          <p className="mt-1.5 text-[15px] font-bold text-white">
            Send RvFOX Pro itself
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/85">
            A short pitch for a spouse, a buyer, or the next person on the lot.
          </p>
          <button
            type="button"
            onClick={() => void sendSuite()}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-sky-300/35 bg-sky-400/15 px-4 py-2.5 text-[12px] font-bold text-sky-50"
          >
            <Share2 className="size-4" />
            Share suite
          </button>
        </section>

        {status ? (
          <p
            className="pb-1 text-center text-[12px] font-bold tracking-[0.14em] text-sky-100"
            role="status"
          >
            {status}
          </p>
        ) : (
          <p className="pb-1 text-center text-[12px] tracking-[0.14em] text-white/55">
            NATIVE SHARE · COPY · SAVED COACHES
          </p>
        )}
      </div>
    </SuitePage>
  );
}
