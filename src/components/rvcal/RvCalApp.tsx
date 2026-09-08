import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LENDERS_CATALOG,
  SIMULATE_LOOKUP_MS,
  formatLenderAsOf,
  parseLenderRateSource,
  type Lender,
  type LenderQuote,
  type LenderRateSource,
} from "@/lib/rv/lendersCatalog";
import {
  ArrowLeftRight,
  Building2,
  Car,
  Check,
  ChevronDown,
  CircleAlert,
  DollarSign,
  ExternalLink,
  FileText,
  Landmark,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SuiteDisclaimer } from "@/components/shell/SuiteDisclaimer";
import {
  APR_PRESETS,
  CREDIT_BANDS,
  DOWN_PRESETS,
  TERM_PRESETS,
  aprForCredit,
  buildPdfReportHtml,
  computeLoan,
  creditLabel,
  formatMoney,
  formatPct,
  formatZipInput,
  formatZipTaxLabel,
  givesTradeInTaxCredit,
  lenderApr,
  lenderMonthly,
  priceForTargetAmountFinanced,
  priceForTargetPayment,
  validateUsZip,
  type CreditBand,
  type StateTaxInfo,
} from "@/lib/rv/rvCal";
import { SuitePage } from "@/components/shell/SuitePage";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { decideCalOpen } from "@/lib/rv/calHandoff";

function clampPrice(n: number) {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(5_000_000, Math.round(n));
}

function clampApr(n: number) {
  if (!Number.isFinite(n)) return 7.5;
  return Math.min(30, Math.max(0, Number(n.toFixed(3))));
}

/** Top of each credit roll band — shown in manual mode */
function creditBandTopScore(band: CreditBand): number {
  switch (band) {
    case "fair":
      return 650;
    case "good":
      return 700;
    case "very-good":
      return 750;
    case "excellent":
      return 850;
  }
}

function creditScoreToBand(score: number): CreditBand {
  const s = Math.round(score);
  if (s < 650) return "fair";
  if (s < 700) return "good";
  if (s < 800) return "very-good";
  return "excellent";
}

type CalSelectOption<T extends string | number> = {
  value: T;
  label: string;
  sublabel?: string;
};

function NativeCalSelect<T extends string | number>({
  "aria-label": ariaLabel,
  value,
  options,
  onChange,
  parse,
}: {
  "aria-label": string;
  value: T;
  options: CalSelectOption<T>[];
  onChange: (value: T) => void;
  parse: (raw: string) => T;
}) {
  const hasValue = options.some((o) => o.value === value);
  const selected = hasValue ? value : options[0]?.value;
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={selected === undefined ? "" : String(selected)}
        onChange={(e) => onChange(parse(e.target.value))}
        className="glass-field min-h-11 w-full cursor-pointer appearance-none rounded-[var(--radius-md)] px-2 py-2.5 pr-7 text-center text-[13px] font-bold tabular-nums text-white outline-none [color-scheme:dark]"
      >
        {options.map((o, i) => (
          <option key={`${String(o.value)}-${i}`} value={String(o.value)}>
            {o.sublabel ? `${o.label} · ${o.sublabel}` : o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-gold"
        aria-hidden
      />
    </div>
  );
}

function clampCreditScore(n: number) {
  if (!Number.isFinite(n)) return 850;
  return Math.min(850, Math.max(300, Math.round(n)));
}

function clampTermYears(n: number) {
  if (!Number.isFinite(n)) return 20;
  return Math.min(40, Math.max(5, Math.round(n)));
}

/** Single Cal-screen legal line — source honesty lives here, not on cards. */
function calScreenDisclaimer(
  meta: {
    source: LenderRateSource;
    asOf: string;
    state: string | null;
  } | null,
): string {
  if (meta?.source === "rateapi") {
    const where = meta.state ? ` in ${meta.state}` : "";
    const asOf = meta.asOf ? formatLenderAsOf(meta.asOf) : "";
    const when = asOf ? ` as of ${asOf}` : "";
    return `Estimates only — not a loan offer or prequalification. Published credit-union RV rates${where}${when}; membership and credit still apply. Confirm with the credit union before you buy.`;
  }
  if (meta?.source === "simulate") {
    return "Estimates only — not a loan offer or prequalification. Preview / demo rates, not live RateAPI. Confirm rates with a lender before you buy.";
  }
  return "Estimates only — not live offers or a loan commitment. Confirm rates with a lender before you buy.";
}

export function RvCalApp() {
  const [price, setPrice] = useState(0);
  const [priceFocused, setPriceFocused] = useState(false);
  const [priceDraft, setPriceDraft] = useState("");
  const [zip, setZip] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [registrationFees, setRegistrationFees] = useState(0);
  const [stateLabel, setStateLabel] = useState("Enter ZIP for tax");
  const [stateAbbr, setStateAbbr] = useState("");
  const [zipInfo, setZipInfo] = useState<StateTaxInfo | null>(null);
  const [taxManual, setTaxManual] = useState(false);
  const [tradeValue, setTradeValue] = useState(0);
  const [tradePayoff, setTradePayoff] = useState(0);
  const [downPct, setDownPct] = useState(20);
  const [credit, setCredit] = useState<CreditBand>("excellent");
  const [creditScore, setCreditScore] = useState(850);
  /** select = native dropdowns · manual = text fields seeded from current values */
  const [loanEntryMode, setLoanEntryMode] = useState<"roll" | "manual">("roll");
  const [apr, setApr] = useState(7.5);
  const [aprFocused, setAprFocused] = useState(false);
  const [aprDraft, setAprDraft] = useState("");
  const [termMonths, setTermMonths] = useState(240);
  const [lendersOpen, setLendersOpen] = useState(false);
  const [lendersPulse, setLendersPulse] = useState(true);
  const [lenderRevealKey, setLenderRevealKey] = useState(0);
  const [aprManual, setAprManual] = useState(false);
  const [paymentFocused, setPaymentFocused] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState("");
  const [paymentDriven, setPaymentDriven] = useState(false);
  const [lastTargetPayment, setLastTargetPayment] = useState(0);
  /** purchase = edit sticker · finance = edit amount financed (solves sticker) */
  const [priceMode, setPriceMode] = useState<"purchase" | "finance">("purchase");
  const [financeDriven, setFinanceDriven] = useState(false);
  const [lastTargetFinance, setLastTargetFinance] = useState(0);
  const [apiLenders, setApiLenders] = useState<LenderQuote[] | null>(null);
  const [lendersMeta, setLendersMeta] = useState<{
    source: LenderRateSource;
    asOf: string;
    state: string | null;
  } | null>(null);
  const [lendersLookingUp, setLendersLookingUp] = useState(false);
  const [coachLabel, setCoachLabel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lendersSectionRef = useRef<HTMLElement | null>(null);
  const lastSeedToken = useRef(0);
  const lastCleanToken = useRef(0);
  const lendersSourceRef = useRef<LenderRateSource | null>(null);
  const nav = useShellNavOptional();
  useEffect(() => {
    const v = validateUsZip(zip);
    setZipInfo(v.status === "valid" ? v.info : null);
    if (taxManual) return;
    if (v.status === "valid" && v.info) {
      setTaxRate(v.info.taxRate);
      setRegistrationFees(v.info.registrationFees);
      setStateAbbr(v.info.abbr);
      setStateLabel(formatZipTaxLabel(v.info));
      return;
    }
    setTaxRate(0);
    setRegistrationFees(0);
    setStateAbbr("");
    setStateLabel("Enter ZIP for tax");
  }, [zip, taxManual]);
  useEffect(() => {
    const t = window.setTimeout(() => setLendersPulse(false), 1800);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!aprManual) setApr(aprForCredit(credit, termMonths));
  }, [
    credit,
    termMonths,
    aprManual
  ]);
  const tradeTaxCredit = givesTradeInTaxCredit(stateAbbr);
  const zipCheck = useMemo(() => validateUsZip(zip), [zip]);
  const resetCal = useCallback(() => {
    setPrice(0);
    setPriceFocused(false);
    setPriceDraft("");
    setZip("");
    setTaxRate(0);
    setRegistrationFees(0);
    setStateLabel("Enter ZIP for tax");
    setStateAbbr("");
    setZipInfo(null);
    setTaxManual(false);
    setTradeValue(0);
    setTradePayoff(0);
    setDownPct(20);
    setCredit("excellent");
    setCreditScore(850);
    setLoanEntryMode("roll");
    setApr(7.5);
    setAprFocused(false);
    setAprDraft("");
    setTermMonths(240);
    setLendersOpen(false);
    setAprManual(false);
    setPaymentFocused(false);
    setPaymentDraft("");
    setPaymentDriven(false);
    setLastTargetPayment(0);
    setPriceMode("purchase");
    setFinanceDriven(false);
    setLastTargetFinance(0);
    setApiLenders(null);
    setCoachLabel(null);
  }, []);
  useEffect(() => {
    const seed = nav?.calSeed ?? null;
    const cleanToken = nav?.calCleanToken ?? 0;
    const decision = decideCalOpen({
      seed,
      lastSeedToken: lastSeedToken.current,
      cleanToken,
      lastCleanToken: lastCleanToken.current,
    });
    if (seed) lastSeedToken.current = seed.token;
    if (cleanToken) lastCleanToken.current = cleanToken;

    if (decision.action === "reset") {
      resetCal();
      nav?.clearCalSeed();
      return;
    }
    if (decision.action !== "apply") return;

    resetCal();
    setPrice(clampPrice(decision.payload.price));
    setCoachLabel(decision.payload.label ?? null);
    nav?.clearCalSeed();
  }, [nav, nav?.calSeed, nav?.calCleanToken, resetCal]);
  const loanOpts = useMemo(() => ({
    apr,
    termMonths,
    taxRate,
    tradeValue,
    tradePayoff,
    registrationFees,
    fees: 0,
    applyTradeInTaxCredit: tradeTaxCredit
  }), [
    apr,
    termMonths,
    taxRate,
    tradeValue,
    tradePayoff,
    registrationFees,
    tradeTaxCredit
  ]);
  const downPayment = price * downPct / 100;
  const applyDownPct = (pct: number) => {
    if (!Number.isFinite(pct)) return;
    setDownPct(Math.min(100, Math.max(0, Math.round(pct * 100) / 100)));
  };
  const applyCreditScore = (score: number) => {
    const s = clampCreditScore(score);
    setCreditScore(s);
    setCredit(creditScoreToBand(s));
    setAprManual(false);
  };
  const applyTermYears = (years: number) => {
    const y = clampTermYears(years);
    setTermMonths(y * 12);
  };
  const downRollOptions = useMemo(() => {
    const base: { value: number; label: string; sublabel?: string }[] = DOWN_PRESETS.map((pct) => {
      const down = price * pct / 100;
      return {
        value: pct,
        label: `${pct}%`,
        sublabel: price > 0 ? formatMoney(down, 0) : undefined
      };
    });
    if (!(DOWN_PRESETS as readonly number[]).includes(downPct) && downPct >= 0) {
      base.push({
        value: downPct,
        label: `${Number(downPct.toFixed(1))}%`,
        sublabel: price > 0 ? formatMoney(downPayment, 0) : "custom"
      });
      base.sort((a, b) => a.value - b.value);
    }
    return base;
  }, [
    price,
    downPct,
    downPayment
  ]);
  const termRollOptions = useMemo(() => {
    const base: { value: number; label: string; sublabel?: string }[] = TERM_PRESETS.map((t) => ({
      value: t.months,
      label: t.label,
      sublabel: `${t.months} mo`
    }));
    if (!TERM_PRESETS.some((t) => t.months === termMonths)) {
      const years = Math.round(termMonths / 12);
      base.push({
        value: termMonths,
        label: `${years} yr`,
        sublabel: `${termMonths} mo`
      });
      base.sort((a, b) => a.value - b.value);
    }
    return base;
  }, [termMonths]);
  const loan = useMemo(() => computeLoan({
    price,
    downPayment,
    ...loanOpts
  }), [
    price,
    downPayment,
    loanOpts
  ]);
  useEffect(() => {
    if (!paymentDriven || lastTargetPayment <= 0 || paymentFocused) return;
    if (financeDriven) return;
    const nextPrice = priceForTargetPayment(lastTargetPayment, downPct, {
      apr,
      termMonths,
      taxRate,
      tradeValue: 0,
      tradePayoff: 0,
      registrationFees,
      fees: 0,
      applyTradeInTaxCredit: tradeTaxCredit
    });
    setPrice((prev: number) => {
      const n = clampPrice(nextPrice);
      return n === prev ? prev : n;
    });
  }, [
    paymentDriven,
    lastTargetPayment,
    downPct,
    apr,
    termMonths,
    taxRate,
    registrationFees,
    tradeTaxCredit,
    paymentFocused,
    financeDriven
  ]);
  useEffect(() => {
    if (!financeDriven || lastTargetFinance <= 0 || priceFocused) return;
    if (paymentDriven) return;
    const nextPrice = priceForTargetAmountFinanced(lastTargetFinance, downPct, {
      apr,
      termMonths,
      taxRate,
      tradeValue,
      tradePayoff,
      registrationFees,
      fees: 0,
      applyTradeInTaxCredit: tradeTaxCredit
    });
    setPrice((prev: number) => {
      const n = clampPrice(nextPrice);
      return n === prev ? prev : n;
    });
  }, [
    financeDriven,
    lastTargetFinance,
    downPct,
    apr,
    termMonths,
    taxRate,
    tradeValue,
    tradePayoff,
    registrationFees,
    tradeTaxCredit,
    priceFocused,
    paymentDriven
  ]);
  useEffect(() => {
    const ctrl = new AbortController();
    const timeoutBox: { id?: ReturnType<typeof setTimeout> } = {};
    const started = Date.now();
    if (lendersSourceRef.current === "simulate") setLendersLookingUp(true);
    const qs = new URLSearchParams({
      amount: String(Math.round(loan.amountFinanced)),
      termMonths: String(termMonths),
      credit,
      zip
    });
    fetch(`/api/lenders?${qs}`, { signal: ctrl.signal }).then((r) => r.json()).then((j) => {
      if (ctrl.signal.aborted) return;
      if (!j.lenders?.length) {
        setLendersLookingUp(false);
        return;
      }
      const source = parseLenderRateSource(j.source);
      const meta = {
        source,
        asOf: typeof j.asOf === "string" ? j.asOf : "",
        state:
          typeof j.query?.state === "string" && j.query.state
            ? j.query.state
            : null,
      };
      const apply = () => {
        if (ctrl.signal.aborted) return;
        lendersSourceRef.current = source;
        setApiLenders(j.lenders);
        setLendersMeta(meta);
        setLendersLookingUp(false);
      };
      if (source === "simulate") {
        lendersSourceRef.current = source;
        setLendersMeta(meta);
        setLendersLookingUp(true);
        const remain = Math.max(0, SIMULATE_LOOKUP_MS - (Date.now() - started));
        timeoutBox.id = setTimeout(() => {
          if (ctrl.signal.aborted) return;
          setApiLenders(j.lenders);
          setLendersLookingUp(false);
        }, remain);
        return;
      }
      apply();
    }).catch(() => {
      if (!ctrl.signal.aborted) setLendersLookingUp(false);
    });
    return () => {
      ctrl.abort();
      if (timeoutBox.id) clearTimeout(timeoutBox.id);
    };
  }, [
    loan.amountFinanced,
    termMonths,
    credit,
    zip
  ]);
  const onZipChange = (raw: string) => {
    setZip(formatZipInput(raw));
    setTaxManual(false);
  };
  const commitPriceDraft = () => {
    const n = clampPrice(parseInt(priceDraft.replace(/\D/g, ""), 10) || 0);
    if (priceMode === "finance") {
      setLastTargetFinance(n);
      setFinanceDriven(n > 0);
      setPaymentDriven(false);
      setLastTargetPayment(0);
      if (n > 0) setPrice(clampPrice(priceForTargetAmountFinanced(n, downPct, {
        apr,
        termMonths,
        taxRate,
        tradeValue,
        tradePayoff,
        registrationFees,
        fees: 0,
        applyTradeInTaxCredit: tradeTaxCredit
      })));
      else setPrice(0);
    } else {
      setPrice(n);
      setFinanceDriven(false);
      setLastTargetFinance(0);
      setPaymentDriven(false);
    }
    setPriceFocused(false);
    setPriceDraft("");
  };
  const applyPriceInput = (rawDigits: number) => {
    if (!Number.isFinite(rawDigits)) return;
    if (priceMode === "finance") {
      const af = clampPrice(rawDigits);
      setLastTargetFinance(af);
      setFinanceDriven(af > 0);
      setPaymentDriven(false);
      setLastTargetPayment(0);
      if (af <= 0) {
        setPrice(0);
        return;
      }
      setPrice(clampPrice(priceForTargetAmountFinanced(af, downPct, {
        apr,
        termMonths,
        taxRate,
        tradeValue,
        tradePayoff,
        registrationFees,
        fees: 0,
        applyTradeInTaxCredit: tradeTaxCredit
      })));
      return;
    }
    setPaymentDriven(false);
    setFinanceDriven(false);
    setLastTargetFinance(0);
    setPrice(clampPrice(rawDigits));
  };
  /** Reverse payment → sticker. Trade is never part of sticker solve. */
  const stickerFromPayment = (monthly: number) => priceForTargetPayment(monthly, downPct, {
    apr,
    termMonths,
    taxRate,
    tradeValue: 0,
    tradePayoff: 0,
    registrationFees,
    fees: 0,
    applyTradeInTaxCredit: tradeTaxCredit
  });
  const applyTargetPayment = (n: number) => {
    const monthly = Math.max(0, Math.round(n));
    if (monthly <= 0) return;
    setPrice(clampPrice(stickerFromPayment(monthly)));
    setLastTargetPayment(monthly);
    setPaymentDriven(true);
    setFinanceDriven(false);
    setLastTargetFinance(0);
    setPriceMode("purchase");
  };

  const commitPaymentDraft = () => {
    const n = Math.round(parseInt(paymentDraft.replace(/\D/g, ""), 10) || 0);
    setPaymentFocused(false);
    applyTargetPayment(n);
  };
  const setAprFromControl = (n: number) => {
    setAprManual(true);
    setApr(clampApr(n));
  };
  const useAutoApr = () => {
    setAprManual(false);
    setApr(aprForCredit(credit, termMonths));
  };
  const openPdf = () => {
    const html = buildPdfReportHtml({
      price,
      loan,
      downPct,
      stateLabel,
      credit: creditLabel(credit)
    });
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };
  const lendersList = apiLenders?.length ? apiLenders : LENDERS_CATALOG;
  /** While Lender Options expands, keep the card in view with a smooth upward scroll */
  useEffect(() => {
    if (!lendersOpen) return;
    const section = lendersSectionRef.current;
    const scroller = scrollRef.current;
    if (!section || !scroller) return;
    const keepVisible = () => {
      const sRect = section.getBoundingClientRect();
      const cRect = scroller.getBoundingClientRect();
      const padTop = 12;
      const padBottom = 24;
      if (sRect.bottom > cRect.bottom - padBottom) {
        const delta = sRect.bottom - (cRect.bottom - padBottom);
        scroller.scrollBy({
          top: delta,
          behavior: "smooth"
        });
      } else if (sRect.top < cRect.top + padTop) {
        const delta = sRect.top - (cRect.top + padTop);
        scroller.scrollBy({
          top: delta,
          behavior: "smooth"
        });
      }
    };
    section.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
    keepVisible();
    const lenderCount = Math.max(1, lendersList.length);
    const duration = 900 + lenderCount * 1e3 + 500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      keepVisible();
      if (now - start < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const intervals: number[] = [];
    for (let i = 0; i <= lenderCount; i++) intervals.push(window.setTimeout(keepVisible, 250 + i * 1e3));
    return () => {
      cancelAnimationFrame(raf);
      intervals.forEach((id) => window.clearTimeout(id));
    };
  }, [
    lendersOpen,
    lenderRevealKey,
    lendersList.length
  ]);
  const activeBand = CREDIT_BANDS.find((b) => b.id === credit);
  return (
    <SuitePage
      tab="rvcal"
      scrollRef={scrollRef}
      onPullReset={resetCal}
      pullLabel="Release to reset RvCal · pull down"
      adaptiveGlass={false}
    >
    <div className="landscape-content mx-auto w-full max-w-lg space-y-3 px-3 pb-10 pt-3 sm:px-4">
      {coachLabel ? <p className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-center text-[12px] font-semibold text-gold-bright">
  {coachLabel}
</p> : null}
      <section className="glass-prestige-gold rounded-[var(--radius-xl)] px-4 py-5 text-center">
        <div className="mb-2 flex items-center justify-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-amber">
            {paymentDriven ? "TARGET /MO" : "MONTHLY"}
          </p>
        </div>
        <div className="relative mx-auto flex max-w-[16rem] items-center justify-center">
          <span className="pointer-events-none absolute left-2 text-[28px] font-bold text-gold">
            $
          </span>
          <input
            value={
              paymentFocused
                ? paymentDraft
                : price > 0
                  ? Math.round(loan.monthlyPayment).toLocaleString("en-US")
                  : ""
            }
            onFocus={() => {
              setPaymentFocused(true);
              setPaymentDraft(String(Math.round(loan.monthlyPayment) || ""));
            }}
            onBlur={commitPaymentDraft}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d,]/g, "");
              setPaymentDraft(raw);
              const n = parseInt(raw.replace(/\D/g, ""), 10);
              if (!Number.isFinite(n) || n <= 0) return;
              applyTargetPayment(n);
            }}
            className="w-full bg-transparent py-1 pl-9 pr-2 text-center text-[44px] font-bold leading-none tabular-nums text-white outline-none sm:text-[48px]"
            inputMode="numeric"
            enterKeyHint="done"
            aria-label="Target monthly payment"
            placeholder="0"
          />
        </div>
        <p className="mt-2 text-[13px] font-semibold tabular-nums text-white">
          {termMonths} mo · {formatPct(apr)} APR · {formatPct(downPct, 0)} down
        </p>
        <p className="mt-1 text-[12px] font-semibold tabular-nums text-white/85">
          Financed {formatMoney(loan.amountFinanced)}
          {paymentDriven ? ` · sticker ${formatMoney(price)}` : ""}
        </p>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-gold">
              <Car className="size-3.5" />
              {priceMode === "finance" ? "FINANCED" : "PRICE"}
            </span>
            <div
              className="inline-flex rounded-full border border-white/25 bg-white/10 p-0.5"
              role="group"
              aria-label="Price input mode"
            >
              <button
                type="button"
                onClick={() => {
                  setPriceMode("purchase");
                  setFinanceDriven(false);
                  setLastTargetFinance(0);
                  setPriceFocused(false);
                  setPriceDraft("");
                }}
                className={cn(
                  "min-h-9 rounded-full px-3 text-[11px] font-bold tracking-wide transition",
                  priceMode === "purchase"
                    ? "bg-gold/25 text-gold-bright"
                    : "text-white/70",
                )}
              >
                Purchase
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriceMode("finance");
                  setPaymentDriven(false);
                  setLastTargetPayment(0);
                  setPriceFocused(false);
                  setPriceDraft("");
                  if (price > 0 && loan.amountFinanced > 0) {
                    setLastTargetFinance(Math.round(loan.amountFinanced));
                    setFinanceDriven(true);
                  }
                }}
                className={cn(
                  "min-h-9 rounded-full px-3 text-[11px] font-bold tracking-wide transition",
                  priceMode === "finance"
                    ? "bg-blue/30 text-white"
                    : "text-white/70",
                )}
              >
                Financed
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gold">
              $
            </span>
            <input
              value={
                priceFocused
                  ? priceDraft
                  : priceMode === "finance"
                    ? price
                      ? Math.round(
                          financeDriven && lastTargetFinance > 0
                            ? lastTargetFinance
                            : loan.amountFinanced,
                        ).toLocaleString("en-US")
                      : ""
                    : price
                      ? price.toLocaleString("en-US")
                      : ""
              }
              onFocus={() => {
                setPriceFocused(true);
                if (priceMode === "finance") {
                  const af =
                    financeDriven && lastTargetFinance > 0
                      ? lastTargetFinance
                      : Math.round(loan.amountFinanced);
                  setPriceDraft(af > 0 ? String(af) : "");
                } else {
                  setPriceDraft(price ? String(price) : "");
                }
              }}
              onBlur={commitPriceDraft}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d,]/g, "");
                setPriceDraft(raw);
                const n = parseInt(raw.replace(/\D/g, ""), 10);
                if (Number.isFinite(n)) applyPriceInput(n);
              }}
              className="glass-field w-full rounded-[var(--radius-md)] py-3.5 pl-8 pr-3 text-[18px] font-bold tabular-nums tracking-tight text-white outline-none placeholder:text-white/35"
              inputMode="numeric"
              enterKeyHint="done"
              aria-label={
                priceMode === "finance" ? "Amount financed" : "Purchase price"
              }
              placeholder="0"
            />
          </div>

          {price > 0 ? (
            <p className="mt-1.5 text-[12px] font-semibold tabular-nums text-gold">
              {priceMode === "finance"
                ? `Sticker ${formatMoney(price)}`
                : `Financed ${formatMoney(loan.amountFinanced)}`}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-[0.12em] text-gold">
            LOAN
          </p>
          <button type="button" onClick={() => {
                    setLoanEntryMode((m) => {
                  if (m === "roll") {
                    setCreditScore(creditBandTopScore(credit));
                    return "manual";
                  }
                  setCredit(creditScoreToBand(creditScore));
                  return "roll";
                });
                  }} className={cn("inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-[11px] font-bold transition", loanEntryMode === "manual" ? "border-blue/50 bg-blue/25 text-white" : "border-white/25 bg-white/10 text-white/85")} aria-label={loanEntryMode === "roll" ? "Switch to manual entry" : "Switch to dropdowns"} title={loanEntryMode === "roll" ? "Manual entry" : "Dropdowns"}>
            <SlidersHorizontal className="size-3.5" />
            {loanEntryMode === "manual" ? "Select" : "Manual"}
          </button>
        </div>
        <div className="mt-2">
        {loanEntryMode === "roll" ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[10px] font-bold tracking-[0.1em] text-white">
      CREDIT
    </p>
    <NativeCalSelect
      aria-label="Credit score range"
      value={credit}
      options={CREDIT_BANDS.map((b) => ({
        value: b.id,
        label: b.range,
      }))}
      parse={(raw) => raw as CreditBand}
      onChange={(band) => {
        setCredit(band);
        setCreditScore(creditBandTopScore(band));
        setAprManual(false);
      }}
    />
  </div>
  <div className="min-w-0">
    <div className="mb-1.5 flex items-center justify-center gap-1">
      <span className="text-[10px] font-bold tracking-[0.1em] text-white">
        APR
      </span>
      {aprManual ? <button type="button" onClick={useAutoApr} className="text-[10px] font-bold text-blue">
  Auto
</button> : null}
    </div>
    <NativeCalSelect
      aria-label="Interest rate APR"
      value={APR_PRESETS.reduce((best, a) => Math.abs(a - apr) < Math.abs(best - apr) ? a : best)}
      options={APR_PRESETS.map((a) => ({
        value: a,
        label: `${a.toFixed(2)}%`,
      }))}
      parse={(raw) => Number(raw)}
      onChange={(v) => setAprFromControl(v)}
    />
  </div>
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[10px] font-bold tracking-[0.1em] text-white">
      TERM
    </p>
    <NativeCalSelect
      aria-label="Loan term"
      value={termMonths}
      options={termRollOptions}
      parse={(raw) => Number(raw)}
      onChange={(months) => setTermMonths(months)}
    />
  </div>
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[10px] font-bold tracking-[0.1em] text-white">
      DOWN
    </p>
    <NativeCalSelect
      aria-label="Down payment percent"
      value={downPct}
      options={downRollOptions}
      parse={(raw) => Number(raw)}
      onChange={(pct) => setDownPct(pct)}
    />
  </div>
</div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-white">
      CREDIT
    </span>
    <input value={creditScore} onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        if (Number.isFinite(n)) applyCreditScore(n);
                        else if (e.target.value === "") setCreditScore(0);
                      }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="numeric" enterKeyHint="done" aria-label="Credit score" placeholder="850" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-[0.1em] text-white">
      APR %
      {aprManual ? <button type="button" onClick={useAutoApr} className="text-[10px] font-bold text-blue">
  Auto
</button> : null}
    </span>
    <input value={aprFocused ? aprDraft : apr.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} onFocus={() => {
                        setAprFocused(true);
                        setAprDraft(apr.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }));
                      }} onBlur={() => {
                        const n = parseFloat(aprDraft.replace(/[^\d.]/g, ""));
                        if (Number.isFinite(n)) setAprFromControl(n);
                        setAprFocused(false);
                        setAprDraft("");
                      }} onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d.]/g, "");
                        setAprDraft(raw);
                        const n = parseFloat(raw);
                        if (Number.isFinite(n)) setAprFromControl(n);
                      }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="decimal" enterKeyHint="done" aria-label="APR percent" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-white">
      TERM (YRS)
    </span>
    <input value={Math.round(termMonths / 12)} onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        if (Number.isFinite(n)) applyTermYears(n);
                      }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="numeric" enterKeyHint="done" aria-label="Term years" placeholder="20" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 block text-[10px] font-bold tracking-[0.1em] text-white">
      DOWN %
    </span>
    <input value={Number.isInteger(downPct) ? String(downPct) : String(Math.round(downPct * 10) / 10)} onChange={(e) => {
                        const n = parseFloat(e.target.value.replace(/[^\d.]/g, ""));
                        if (Number.isFinite(n)) applyDownPct(n);
                      }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="decimal" enterKeyHint="done" aria-label="Down payment percent" placeholder="20" />
  </label>
</div>}
        </div>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-amber">
          <ArrowLeftRight className="size-3.5" />
          TRADE
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-white">
              VALUE
            </span>
            <input value={tradeValue || ""} onChange={(e) => {
                      setPaymentDriven(false);
                      setTradeValue(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
                    }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none" inputMode="numeric" placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-white">
              PAYOFF
            </span>
            <input value={tradePayoff || ""} onChange={(e) => {
                      setPaymentDriven(false);
                      setTradePayoff(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
                    }} className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none" inputMode="numeric" placeholder="0" />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-gold">
            <MapPin className="size-3.5" />
            ZIP
          </span>
          <input
            value={zip}
            onChange={(e) => onZipChange(e.target.value)}
            maxLength={10}
            inputMode="numeric"
            autoComplete="postal-code"
            enterKeyHint="done"
            placeholder="85001"
            aria-label="Customer ZIP code"
            aria-invalid={zipCheck.status === "invalid"}
            aria-describedby="zip-status"
            className={cn(
              "glass-field min-h-11 w-full rounded-[var(--radius-md)] px-3 py-3 font-mono text-sm font-semibold tracking-wider text-white outline-none",
              zipCheck.status === "valid" && "border-gold/50",
              zipCheck.status === "invalid" && "border-amber/70",
            )}
          />
        </label>
        <div
          id="zip-status"
          className={zipCheck.status === "empty" ? "sr-only" : "mt-2.5"}
        >
          {zipCheck.status === "valid" && zipInfo ? (
            <div className="rounded-[var(--radius-md)] border border-gold/30 bg-gold/10 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[13px] font-bold text-gold">
                <Check className="size-3.5 shrink-0" />
                {stateLabel}
              </p>
            </div>
          ) : zipCheck.status === "incomplete" ? (
            <p className="flex items-center gap-1.5 text-[12px] text-white/75">
              <MapPin className="size-3.5 shrink-0 text-gold" />
              {zipCheck.message}
            </p>
          ) : zipCheck.status === "invalid" ? (
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber">
              <CircleAlert className="size-3.5 shrink-0" />
              {zipCheck.message}
            </p>
          ) : null}
        </div>
        <label className="mt-3 block">
          <div className="mb-1 flex min-h-5 items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white">
              TAX %
            </span>
            {taxManual ? (
              <button type="button" onClick={() => setTaxManual(false)} className="text-[11px] font-bold text-blue">
                Reset
              </button>
            ) : null}
          </div>
          <input
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => {
              setTaxManual(true);
              setTaxRate(Number(e.target.value) || 0);
            }}
            className="glass-field min-h-11 w-full rounded-[var(--radius-md)] px-3 py-3 text-sm font-semibold text-white outline-none"
          />
        </label>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.12em] text-white">
          <DollarSign className="size-3.5 text-gold" />
          BREAKDOWN
        </p>
        <div className="space-y-1.5">
          <Row label="Price" value={formatMoney(price)} />
          <Row label={`Tax ${formatPct(taxRate)}`} value={formatMoney(loan.taxAmount)} />
          <Row label="Fees" value={formatMoney(registrationFees)} />
          {loan.negativeEquity > 0 ? <Row label="Neg. equity" value={formatMoney(loan.negativeEquity)} warn /> : null}
          {loan.equity > 0 ? <Row label="Trade equity" value={`−${formatMoney(loan.equity)}`} accent /> : null}
          <Row label={`Down ${Number.isInteger(downPct) ? downPct : downPct.toFixed(1)}%`} value={`−${formatMoney(loan.downPayment)}`} accent />
        </div>
        <button type="button" onClick={openPdf} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 text-[13px] font-bold text-white">
          <FileText className="size-4" />
          Payment report
        </button>
      </section>
      <section ref={lendersSectionRef} className={cn("glass-prestige exclusive-card rounded-[var(--radius-xl)] p-3.5", lendersPulse && "exclusive-card-pulse-once")}>
        <div className="exclusive-card-shine" aria-hidden>
          <div className="exclusive-card-shine-glow" />
          <div className="exclusive-card-shine-blade" />
        </div>
        <button type="button" onClick={() => {
                  setLendersOpen((v) => {
                    const next = !v;
                    if (next) setLenderRevealKey((k) => k + 1);
                    return next;
                  });
                }} className="flex min-h-11 w-full items-center justify-between gap-2" aria-expanded={lendersOpen} aria-controls="lender-options-panel">
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-gold/15">
              <Landmark className="size-3.5 text-gold-bright" />
            </span>
            <span className="text-[11px] font-bold tracking-[0.12em] text-gold-bright">
              LENDERS
            </span>
          </span>
          <ChevronDown className="exclusive-chevron size-4 shrink-0 text-gold-bright" data-open={lendersOpen ? "true" : "false"} aria-hidden />
        </button>
        <div id="lender-options-panel" className="exclusive-reveal" data-open={lendersOpen ? "true" : "false"}>
          <div className="exclusive-reveal-inner">
            <div className="exclusive-reveal-content mt-2.5 space-y-2">
              <p className="exclusive-lender-row text-[12px] font-semibold tabular-nums text-white/85" style={{ ["--lender-delay" as string]: "0ms" }}>
                {activeBand?.range ?? creditLabel(credit)} · {formatMoney(loan.amountFinanced, 0)} · {termMonths} mo
              </p>
              {lendersLookingUp ? (
                <div
                  className="exclusive-lender-row flex items-center gap-3 rounded-xl border border-white/30 bg-white/10 px-3 py-3"
                  role="status"
                  aria-live="polite"
                  style={{ ["--lender-delay" as string]: "0ms" }}
                >
                  <span
                    className="size-4 shrink-0 animate-spin rounded-full border-2 border-gold/25 border-t-gold-bright"
                    aria-hidden
                  />
                  <p className="text-[13px] font-semibold text-white">
                    Looking up rates…
                  </p>
                </div>
              ) : (
                lendersList.map((L: Lender | LenderQuote, i: number) => {
                      const quote = "estimatedApr" in L ? L : null;
                      const eligible = quote ? quote.eligible !== false : true;
                      const monthly = quote ? quote.estimatedMonthly : lenderMonthly(L, loan.amountFinanced, termMonths, credit);
                      const aprShow = quote ? quote.estimatedApr : lenderApr(L, credit);
                      const range =
                        L.aprLow === L.aprHigh
                          ? formatPct(L.aprLow)
                          : `${L.aprLow}%–${L.aprHigh}%`;
                      const delayMs = (i + 1) * 1e3;
                      return (
                  <a key={`${L.id}-${lenderRevealKey}`} href={L.url || "#"} target="_blank" rel="noopener noreferrer" className={cn("exclusive-lender-row flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 transition", eligible ? "border-white/30 bg-white/10 hover:border-gold/45 hover:bg-gold/10" : "border-white/15 bg-white/5 opacity-70")} style={{ ["--lender-delay" as string]: `${delayMs}ms` }}>
  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", eligible ? "bg-gold/15" : "bg-white/10")}>
    <Building2 className={cn("size-4", eligible ? "text-gold-bright" : "text-white")} />
  </div>
  <div className="min-w-0 flex-1">
    <p className="truncate text-[14px] font-bold text-white">
      {L.name}
    </p>
    <p className="text-[12px] font-semibold tabular-nums text-white/80">
      {eligible ? range : "—"}
    </p>
  </div>
  <div className="text-right">
    <p className="text-[18px] font-bold tabular-nums leading-none text-gold-bright">
      {eligible && monthly != null ? formatMoney(monthly) : "—"}
    </p>
    <p className="mt-0.5 text-[12px] font-semibold tabular-nums text-white/80">
      {eligible ? `/mo · ${formatPct(aprShow)}` : ""}
    </p>
  </div>
  <ExternalLink className="size-3.5 shrink-0 text-white" />
                  </a>
                );
              })
              )}
            </div>
          </div>
        </div>
      </section>
      <SuiteDisclaimer>
        {calScreenDisclaimer(lendersMeta)}
      </SuiteDisclaimer>
    </div>
    </SuitePage>
  );
}


function Row({
  label,
  value,
  bold,
  accent,
  warn,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span
        className={cn(
          "min-w-0 flex-1 leading-snug text-white",
          bold ? "text-[14px] font-bold" : "text-[13px]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          bold ? "text-[15px] font-bold" : "text-[14px] font-semibold",
          warn && "text-amber",
          accent && "text-gold",
          !warn && !accent && "text-white",
        )}
      >
        {value}
      </span>
    </div>
  );
}

