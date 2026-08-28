import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lender, LenderQuote } from "@/lib/rv/lendersCatalog";
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
  Info,
  Landmark,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  APR_PRESETS,
  CREDIT_BANDS,
  DOWN_PRESETS,
  TERM_PRESETS,
  aprForCredit,
  buildPdfReportHtml,
  computeLoan,
  creditHint,
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
import { LENDERS_CATALOG } from "@/lib/rv/lendersCatalog";
import { SuitePage } from "@/components/shell/SuitePage";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import { RollPicker } from "@/components/rvcal/RollPicker";

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

function clampCreditScore(n: number) {
  if (!Number.isFinite(n)) return 850;
  return Math.min(850, Math.max(300, Math.round(n)));
}

function clampTermYears(n: number) {
  if (!Number.isFinite(n)) return 20;
  return Math.min(40, Math.max(5, Math.round(n)));
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
  /** roll = swipe drums · manual = text fields seeded from current values */
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
  const [coachLabel, setCoachLabel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const lendersSectionRef = useRef<HTMLElement | null>(null);
  const lastSeedToken = useRef(0);
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
    const seed = nav?.calSeed;
    if (!seed || seed.token === lastSeedToken.current) return;
    lastSeedToken.current = seed.token;
    if (seed.price > 0) {
      setPrice(clampPrice(seed.price));
      setPaymentDriven(false);
      setLastTargetPayment(0);
      setFinanceDriven(false);
      setLastTargetFinance(0);
      setPriceMode("purchase");
      setCoachLabel(seed.label ?? null);
    }
    nav?.clearCalSeed();
  }, [nav?.calSeed, nav]);
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
    const qs = new URLSearchParams({
      amount: String(Math.round(loan.amountFinanced)),
      termMonths: String(termMonths),
      credit,
      zip
    });
    fetch(`/api/lenders?${qs}`, { signal: ctrl.signal }).then((r) => r.json()).then((j) => {
      if (j.lenders?.length) setApiLenders(j.lenders);
    }).catch(() => {});
    return () => ctrl.abort();
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
      {coachLabel ? <p className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-center text-[11px] font-semibold text-gold-bright">
  Market avg · 
  {coachLabel}
</p> : null}
      <section className="glass-prestige-gold rounded-[var(--radius-xl)] px-4 py-5 text-center">
        <div className="mb-2 flex items-center justify-center">
          <p className="text-[11px] font-bold tracking-[0.16em] text-amber">
            {paymentDriven ? "TARGET MONTHLY · PRICE ADJUSTED" : "EST. MONTHLY PAYMENT"}
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
            className="w-full bg-transparent py-1 pl-9 pr-2 text-center text-[40px] font-bold leading-none tabular-nums text-white outline-none"
            inputMode="numeric"
            enterKeyHint="done"
            aria-label="Target monthly payment"
            placeholder="0"
          />
        </div>
        <p className="mt-2 text-[12px] text-white">
          {termMonths}
           mo · 
          {formatPct(apr)}
           APR · 
          {formatPct(downPct, 0)}
          down
        </p>
        <p className="mt-1 text-[11px] text-white">
          Financed 
          {formatMoney(loan.amountFinanced)}
          {paymentDriven ? ` · coach needs ~${formatMoney(price)}` : ""}
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-white/75">
          Type a monthly payment to reverse-solve purchase price from term, APR, down, tax, and fees.
        </p>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <p className="mb-3 flex items-center gap-1.5 text-caption font-bold tracking-[0.12em] text-gold">
          <Car className="size-3.5" />
          VEHICLE DETAILS
        </p>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white">
              {priceMode === "finance" ? "AMOUNT financed" : "purchase price"}
            </span>
            <div
              className="inline-flex rounded-full border border-white/20 bg-black/35 p-0.5"
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
                  "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition",
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
                  "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide transition",
                  priceMode === "finance"
                    ? "bg-blue/30 text-white"
                    : "text-white/70",
                )}
              >
                Amount financed
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

          <p className="mt-1.5 text-[10px] text-white/75">
            {priceMode === "finance" ? (
              <>
                Type the loan amount. Purchase price updates from down %, tax, trade, and fees.
                {price > 0 ? (
                  <span className="font-semibold text-gold">
                    {" "}
                    · sticker ~{formatMoney(price)}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                Type sticker, set a target payment above, or open Finance from a Facts report. Pull down to reset.
                {financeDriven ? null : price > 0 ? (
                  <span className="text-white/60">
                    {" "}
                    · financed {formatMoney(loan.amountFinanced)}
                  </span>
                ) : null}
              </>
            )}
          </p>
        </div>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold tracking-[0.12em] text-gold">
            {loanEntryMode === "roll" ? "QUICK LOAN · SWIPE TO ROLL" : "QUICK LOAN · MANUAL ENTRY"}
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
                  }} className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition", loanEntryMode === "manual" ? "border-blue/50 bg-blue/25 text-white" : "border-white/20 bg-black/30 text-white/85")} aria-label={loanEntryMode === "roll" ? "Switch to manual entry" : "Switch to roll pickers"} title={loanEntryMode === "roll" ? "Manual entry" : "Swipe rollers"}>
            <SlidersHorizontal className="size-3.5" />
            {loanEntryMode === "manual" ? "Rollers" : "Manual"}
          </button>
        </div>
        {loanEntryMode === "roll" ? <div className="grid grid-cols-4 gap-1.5">
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white">
      CREDIT
    </p>
    <RollPicker aria-label="Credit score range" value={credit} options={CREDIT_BANDS.map((b) => ({
                        value: b.id,
                        label: b.range
                      }))} onChange={(band) => {
                        setCredit(band);
                        setCreditScore(creditBandTopScore(band));
                        setAprManual(false);
                      }} itemHeight={36} visible={3} />
  </div>
  <div className="min-w-0">
    <div className="mb-1.5 flex items-center justify-center gap-1">
      <span className="text-[9px] font-bold tracking-[0.1em] text-white">
        APR
      </span>
      {aprManual ? <button type="button" onClick={useAutoApr} className="text-[8px] font-bold text-blue">
  Auto
</button> : null}
    </div>
    <RollPicker aria-label="Interest rate APR" value={APR_PRESETS.reduce((best, a) => Math.abs(a - apr) < Math.abs(best - apr) ? a : best)} options={APR_PRESETS.map((a) => ({
                        value: a,
                        label: `${a.toFixed(2)}%`
                      }))} onChange={(v: number) => setAprFromControl(v)} itemHeight={36} visible={3} />
  </div>
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white">
      TERM
    </p>
    <RollPicker aria-label="Loan term" value={termMonths} options={termRollOptions} onChange={(months: number) => setTermMonths(months)} itemHeight={36} visible={3} />
  </div>
  <div className="min-w-0">
    <p className="mb-1.5 text-center text-[9px] font-bold tracking-[0.1em] text-white">
      DOWN
    </p>
    <RollPicker aria-label="Down payment percent" value={downPct} options={downRollOptions} onChange={(pct: number) => setDownPct(pct)} itemHeight={36} visible={3} />
  </div>
</div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  <label className="block min-w-0">
    <span className="mb-1 block text-[9px] font-bold tracking-[0.1em] text-white">
      CREDIT
    </span>
    <input value={creditScore} onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        if (Number.isFinite(n)) applyCreditScore(n);
                        else if (e.target.value === "") setCreditScore(0);
                      }} className="glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="numeric" enterKeyHint="done" aria-label="Credit score" placeholder="850" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 flex items-center justify-between text-[9px] font-bold tracking-[0.1em] text-white">
      APR %
      {aprManual ? <button type="button" onClick={useAutoApr} className="text-[8px] font-bold text-blue">
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
                      }} className="glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="decimal" enterKeyHint="done" aria-label="APR percent" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 block text-[9px] font-bold tracking-[0.1em] text-white">
      TERM (YRS)
    </span>
    <input value={Math.round(termMonths / 12)} onChange={(e) => {
                        const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
                        if (Number.isFinite(n)) applyTermYears(n);
                      }} className="glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="numeric" enterKeyHint="done" aria-label="Term years" placeholder="20" />
  </label>
  <label className="block min-w-0">
    <span className="mb-1 block text-[9px] font-bold tracking-[0.1em] text-white">
      DOWN %
    </span>
    <input value={Number.isInteger(downPct) ? String(downPct) : String(Math.round(downPct * 10) / 10)} onChange={(e) => {
                        const n = parseFloat(e.target.value.replace(/[^\d.]/g, ""));
                        if (Number.isFinite(n)) applyDownPct(n);
                      }} className="glass-field w-full rounded-[var(--radius-md)] px-2 py-2.5 text-center text-[14px] font-bold tabular-nums text-white outline-none" inputMode="decimal" enterKeyHint="done" aria-label="Down payment percent" placeholder="20" />
  </label>
</div>}
        <p className="mt-2 text-[10px] leading-relaxed text-white/75">
          {creditHint(credit)}
        </p>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <div className="mb-1.5">
          <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-amber">
            <ArrowLeftRight className="size-3.5" />
            TRADE-IN
          </p>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-white/80">
          Trade equity always lowers amount financed (and payment). Sticker price does not change.
          {tradeTaxCredit ? <span className="text-emerald-200">
  {stateAbbr || "This state"}
  : sales tax is on (price − trade value).
</span> : <span className="text-amber">
  {stateAbbr || "This state"}
  : sales tax is on full selling price (no trade deduction on tax).
</span>}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-white">
              TRADE VALUE
            </span>
            <input value={tradeValue || ""} onChange={(e) => {
                      setPaymentDriven(false);
                      setTradeValue(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
                    }} className="glass-field w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none" inputMode="numeric" placeholder="0" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.12em] text-white">
              TRADE PAYOFF
            </span>
            <input value={tradePayoff || ""} onChange={(e) => {
                      setPaymentDriven(false);
                      setTradePayoff(parseInt(e.target.value.replace(/\D/g, ""), 10) || 0);
                    }} className="glass-field w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-semibold text-white outline-none" inputMode="numeric" placeholder="0" />
          </label>
        </div>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <p className="mb-3 flex items-center gap-1.5 text-caption font-bold tracking-[0.12em] text-gold">
          <MapPin className="size-3.5" />
          LOCATION & TAX
        </p>
        <label className="block">
          <span className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-[0.12em] text-white">
            <span>CUSTOMER ZIP CODE</span>
            <span className="font-semibold tracking-normal text-white/60">
              {zipCheck.status === "valid" && zipCheck.digits.length > 5
                ? "ZIP+4"
                : "5-digit US"}
            </span>
          </span>
          <input
            value={zip}
            onChange={(e) => onZipChange(e.target.value)}
            maxLength={10}
            inputMode="numeric"
            autoComplete="postal-code"
            enterKeyHint="done"
            placeholder="85001 or 85001-1234"
            aria-label="Customer ZIP code"
            aria-invalid={zipCheck.status === "invalid"}
            aria-describedby="zip-status"
            className={cn(
              "glass-field w-full rounded-[var(--radius-md)] px-3 py-3 font-mono text-sm font-semibold tracking-wider text-white outline-none",
              zipCheck.status === "valid" && "border-gold/50",
              zipCheck.status === "invalid" && "border-amber/70",
            )}
          />
        </label>
        <div id="zip-status" className="mt-2.5">
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
          ) : (
            <p className="text-[11px] text-white/60">
              Enter a 5-digit US ZIP to fill sales tax. ZIP+4 is optional.
            </p>
          )}
        </div>
        <label className="mt-3 block">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.12em] text-white">
              SALES TAX RATE (%)
            </span>
            {taxManual ? (
              <button type="button" onClick={() => setTaxManual(false)} className="text-[10px] font-bold text-blue">
                Reset from ZIP
              </button>
            ) : (
              <span className="text-[10px] text-white">auto from ZIP</span>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => {
              setTaxManual(true);
              setTaxRate(Number(e.target.value) || 0);
            }}
            className="glass-field w-full rounded-[var(--radius-md)] px-3 py-3 text-sm font-semibold text-white outline-none"
          />
        </label>
      </section>
      <section className="glass-prestige rounded-[var(--radius-xl)] p-3.5">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-white">
          <DollarSign className="size-3.5 text-gold" />
          PAYMENT BREAKDOWN
        </p>
        <div className="space-y-1.5">
          <Row label="Vehicle price" value={formatMoney(price)} />
          <Row label={tradeTaxCredit && loan.tradeValue > 0 ? `Sales tax ${formatPct(taxRate)} (price − trade)` : `Sales tax (${formatPct(taxRate)})`} value={formatMoney(loan.taxAmount)} />
          <Row label="Registration / fees" value={formatMoney(registrationFees)} />
          {loan.negativeEquity > 0 ? <Row label="Negative equity rolled in" value={formatMoney(loan.negativeEquity)} warn /> : null}
          {loan.equity > 0 ? <Row label="Trade equity applied" value={`−${formatMoney(loan.equity)}`} accent /> : null}
          <Row label={`Down payment (${Number.isInteger(downPct) ? downPct : downPct.toFixed(1)}%)`} value={`−${formatMoney(loan.downPayment)}`} accent />
        </div>
        <button type="button" onClick={openPdf} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/30 py-2.5 text-[13px] font-bold text-white">
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
                }} className="flex w-full items-center justify-between gap-2" aria-expanded={lendersOpen} aria-controls="lender-options-panel">
          <span className="flex min-w-0 items-center gap-2">
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-gold/45 bg-gold/15">
              <Landmark className="size-3.5 text-gold-bright" />
              <Sparkles className="absolute -right-0.5 -top-0.5 size-3 text-gold-bright" />
            </span>
            <span className="min-w-0 text-left">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold tracking-[0.12em] text-gold-bright">
                  LENDER OPTIONS
                </span>
                <span className="exclusive-badge inline-flex items-center gap-0.5 rounded-full border border-gold/50 bg-gold/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-gold-bright">
                  <Star className="size-2.5 fill-gold-bright text-gold-bright" />
                  Exclusive
                </span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium leading-snug text-white/80">
                Your broker edge — match the deal, then let them choose you
              </span>
            </span>
          </span>
          <ChevronDown className="exclusive-chevron size-4 shrink-0 text-gold-bright" data-open={lendersOpen ? "true" : "false"} aria-hidden />
        </button>
        <div id="lender-options-panel" className="exclusive-reveal" data-open={lendersOpen ? "true" : "false"}>
          <div className="exclusive-reveal-inner">
            <div className="exclusive-reveal-content mt-2.5 space-y-2">
              <p className="exclusive-lender-row rounded-lg border border-gold/25 bg-gold/10 px-2.5 py-2 text-[10px] leading-relaxed text-white/90" style={{ ["--lender-delay" as string]: "0ms" }}>
                <span className="font-bold text-gold-bright">
                  Show this list. Close the loan.
                </span>
                Credit-aware options for
                <span className="font-bold">
                  {activeBand?.range ?? creditLabel(credit)}
                </span>
                · 
                {formatMoney(loan.amountFinanced, 0)}
                 financed ·
                {termMonths}
                 mo. Estimates to start the conversation — you broker the best real offer.
              </p>
              {lendersList.map((L: Lender | LenderQuote, i: number) => {
                      const quote = "estimatedApr" in L ? L : null;
                      const eligible = quote ? quote.eligible !== false : true;
                      const reason = quote?.ineligibilityReason;
                      const monthly = quote ? quote.estimatedMonthly : lenderMonthly(L, loan.amountFinanced, termMonths, credit);
                      const aprShow = quote ? quote.estimatedApr : lenderApr(L, credit);
                      const range = `${L.aprLow}%–${L.aprHigh}%`;
                      const delayMs = (i + 1) * 1e3;
                      return (
                  <a key={`${L.id}-${lenderRevealKey}`} href={L.url || "#"} target="_blank" rel="noopener noreferrer" className={cn("exclusive-lender-row flex items-center gap-3 rounded-xl border px-3 py-2.5 transition", eligible ? "border-gold/25 bg-black/35 hover:border-gold/45 hover:bg-gold/10" : "border-white/10 bg-black/20 opacity-70")} style={{ ["--lender-delay" as string]: `${delayMs}ms` }}>
  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", eligible ? "bg-gold/15" : "bg-white/10")}>
    <Building2 className={cn("size-4", eligible ? "text-gold-bright" : "text-white")} />
  </div>
  <div className="min-w-0 flex-1">
    <p className="truncate text-[13px] font-bold text-white">
      {L.name}
      {!eligible ? <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wide text-amber">
  unlikely
</span> : null}
    </p>
    <p className="text-[10px] leading-snug text-white/85">
      {eligible ? range : reason || "Credit / loan size limit"}
    </p>
  </div>
  <div className="text-right">
    <p className="text-[14px] font-bold tabular-nums text-gold-bright">
      {eligible && monthly != null ? formatMoney(monthly) : "—"}
    </p>
    <p className="text-[10px] text-white/85">
      {eligible ? `/mo · ${formatPct(aprShow)}` : "n/a"}
    </p>
  </div>
  <ExternalLink className="size-3.5 shrink-0 text-white" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <p className="flex gap-1.5 px-1 text-[10px] leading-relaxed text-white">
        <Info className="mt-0.5 size-3 shrink-0" />
        Estimates only — not a credit offer. Confirm rates and fees with a dealer or lender.
      </p>
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
          bold ? "text-[13px] font-bold" : "text-[12px]",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "shrink-0 tabular-nums",
          bold ? "text-[13px] font-bold" : "text-[12px] font-semibold",
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

