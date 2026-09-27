import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { BottomTabs, type AppTab } from "./BottomTabs";
import { dockTabOrder, PAGE_ACCENT } from "./shellConstants";
import { useAccess } from "@/components/access/AccessProvider";
import { isProfessionalTier } from "@/lib/rv/proEntitlement";
import { OPEN_SOLD_EVENT } from "@/lib/rv/soldDeals";
import {
  ShellNavProvider,
  type CalSeed,
  type FactsTowHandoff,
  type TripsHandoff,
} from "./ShellNav";
import type { TowHandoffOffer } from "@/lib/trips/towHandoff";
import {
  normalizeFactsTowOffer,
  type FactsTowHandoffOffer,
} from "@/lib/tow/factsTowHandoff";
import {
  readActiveCoach,
  writeActiveCoach,
  type ActiveCoach,
  type ActiveCoachInput,
} from "@/lib/rv/activeCoach";
import { normalizeCalHandoff } from "@/lib/rv/calHandoff";
import {
  useFocusScrollIntoView,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";
import { useDockSafeInset } from "@/lib/hooks/nativeWebView";
import {
  clearGrokSeedOnDockTap,
  grokSeedFromAskHandoff,
} from "@/lib/rvgrok/tabEntry";
import {
  fetchLotSnapshot,
  filterLotBrowse,
  type LotSnapshotView,
  type LotUnit,
} from "@/lib/lot/ownLotPage";
import {
  APR_PRESETS,
  DOWN_PRESETS,
  TERM_PRESETS,
} from "@/lib/rv/rvCal";
import { FoxAsk, FoxChips, FoxMark, type FoxChip } from "./fox/FoxFrame";
import { CalRoom, FactsRoom, HomeRoom, LotRoom } from "./fox/Rooms";
import {
  filterLotUnits,
  matchDeskUnit,
  type LotFilter,
} from "./fox/foxData";

/**
 * Code-split suite tools — tools load only when visited.
 * Cold open lands on Home. Grok is the ask box, not a dock room.
 */
const RvFaxApp = lazy(() =>
  import("@/components/rvfax/RvFaxApp").then((m) => ({ default: m.RvFaxApp })),
);
const RvGrokApp = lazy(() =>
  import("@/components/rvgrok/RvGrokApp").then((m) => ({ default: m.RvGrokApp })),
);
const RvTowApp = lazy(() =>
  import("@/components/rvtow/RvTowApp").then((m) => ({ default: m.RvTowApp })),
);
const RvTripsApp = lazy(() =>
  import("@/components/rvtrips/RvTripsApp").then((m) => ({
    default: m.RvTripsApp,
  })),
);
const MoreApp = lazy(() =>
  import("@/components/more/MoreApp").then((m) => ({ default: m.MoreApp })),
);
const SoldBookApp = lazy(() =>
  import("@/components/rvfax/SoldBookApp").then((m) => ({
    default: m.SoldBookApp,
  })),
);

function SuiteFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-black">
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

class SuiteErrorBoundary extends Component<
  { name: string; children: ReactNode },
  { err: Error | null }
> {
  state: { err: Error | null } = { err: null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error(`[RvFOX] ${this.props.name} crashed`, err, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-black px-6 text-center">
          <p className="text-[15px] font-bold text-white">
            {this.props.name} hit a snag
          </p>
          <p className="max-w-sm text-[12px] text-white/70">
            {this.state.err.message || "Something went wrong loading this tab."}
          </p>
          <button
            type="button"
            className="rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold text-white"
            onClick={() => this.setState({ err: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {this.props.children}
      </div>
    );
  }
}

function askPlaceholder(tab: AppTab, catalogOpen: boolean): string {
  if (catalogOpen) return "Ask about this coach";
  if (tab === "rvcal") return "Ask about the payment.";
  if (tab === "rvtow") return "Ask about the tow.";
  if (tab === "rvlot") return "Stock # or length";
  if (tab === "rvtrips") return "Ask about the route.";
  if (tab === "rvfax") return "Ask about this coach";
  return "Ask about this coach";
}

export function AppShell({
  initialTab = "home",
}: {
  initialTab?: AppTab;
}) {
  const access = useAccess();
  const [tab, setTab] = useState<AppTab>(initialTab);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [grokSeed, setGrokSeed] = useState<string | undefined>();
  const [grokEntryToken, setGrokEntryToken] = useState(0);
  const [calSeed, setCalSeed] = useState<CalSeed | null>(null);
  const [calCleanToken, setCalCleanToken] = useState(0);
  const [tripsHandoff, setTripsHandoff] = useState<TripsHandoff | null>(null);
  const [towHandoff, setTowHandoff] = useState<FactsTowHandoff | null>(null);
  const [activeCoach, setActiveCoachState] = useState<ActiveCoach | null>(() =>
    readActiveCoach(),
  );
  const [factsPickerToken, setFactsPickerToken] = useState(0);
  const [factsShareToken, setFactsShareToken] = useState(0);
  const [factsMarketToken, setFactsMarketToken] = useState(0);
  const launchOpen = false;
  const hideDock = launchOpen;
  const suiteReady = true;
  const [visited, setVisited] = useState<Set<AppTab>>(
    () => new Set<AppTab>([initialTab]),
  );
  const shellRef = useRef<HTMLDivElement | null>(null);
  const calTokenRef = useRef(0);
  const tripsTokenRef = useRef(0);
  const towTokenRef = useRef(0);
  const [snap, setSnap] = useState<LotSnapshotView | null>(null);
  const [snapError, setSnapError] = useState<string | null>(null);
  const [desk, setDesk] = useState<LotUnit | null>(null);
  const [lotFilter, setLotFilter] = useState<LotFilter>("all");
  const [lotQuery, setLotQuery] = useState("");
  const [askText, setAskText] = useState("");
  const [calPrice, setCalPrice] = useState(0);
  const [downPct, setDownPct] = useState<number | null>(null);
  const [termMonths, setTermMonths] = useState<number | null>(null);
  const [apr, setApr] = useState<number | null>(null);
  const [calEdit, setCalEdit] = useState<null | "down" | "term" | "rate">(null);
  useKeyboardInset();
  useFocusScrollIntoView(true);
  useDockSafeInset();

  const markVisited = useCallback((id: AppTab) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  }, []);

  useEffect(() => {
    let cancel = false;
    void fetchLotSnapshot()
      .then((next) => {
        if (!cancel) setSnap(next);
      })
      .catch((err: unknown) => {
        if (cancel) return;
        setSnapError(
          err instanceof Error ? err.message : "Lot snapshot unavailable",
        );
      });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!snap) return;
    setDesk((cur) => cur ?? matchDeskUnit(snap.units, activeCoach));
  }, [snap, activeCoach]);

  useEffect(() => {
    void import("@capacitor/splash-screen")
      .then((m) => m.SplashScreen.hide({ fadeOutDuration: 200 }))
      .catch(() => undefined);
    const t = window.setTimeout(() => {
      void import("@capacitor/splash-screen")
        .then((m) => m.SplashScreen.hide({ fadeOutDuration: 150 }))
        .catch(() => undefined);
    }, 4000);
    return () => window.clearTimeout(t);
  }, []);

  const blurSuiteFocus = () => {
    const el = document.activeElement;
    if (el instanceof HTMLElement && el !== document.body) el.blur();
  };

  /** Facts Ask Grok — seed the Grok conversation. The dock has no Grok tab. */
  const openGrok = (prompt?: string) => {
    if (!access.guard(undefined, "Ask Grok is limited to the approved list.")) {
      return;
    }
    blurSuiteFocus();
    setCatalogOpen(false);
    setGrokSeed(grokSeedFromAskHandoff(prompt));
    setGrokEntryToken((n) => n + 1);
    setTab("rvgrok");
    markVisited("rvgrok");
  };

  const requestCleanCal = useCallback(() => {
    setCalSeed(null);
    setCalCleanToken((n) => n + 1);
  }, []);

  const resetCalFields = useCallback(() => {
    setCalPrice(0);
    setDownPct(null);
    setTermMonths(null);
    setApr(null);
    setCalEdit(null);
  }, []);

  const applyCalPrice = useCallback((next: number) => {
    setCalPrice(next);
  }, []);

  const openCalWithPrice = useCallback(
    (price: number, label?: string) => {
      const payload = normalizeCalHandoff({ price, label });
      if (!payload) {
        requestCleanCal();
        setCatalogOpen(false);
        setTab("rvcal");
        markVisited("rvcal");
        return;
      }
      calTokenRef.current += 1;
      setCalSeed({
        ...payload,
        token: calTokenRef.current,
      });
      setCatalogOpen(false);
      setTab("rvcal");
      markVisited("rvcal");
    },
    [markVisited, requestCleanCal],
  );

  const clearCalSeed = useCallback(() => setCalSeed(null), []);

  const openTripsProfile = useCallback(
    (offer?: TowHandoffOffer | null) => {
      tripsTokenRef.current += 1;
      setTripsHandoff({
        token: tripsTokenRef.current,
        offer: offer ?? null,
      });
      setCatalogOpen(false);
      setTab("rvtrips");
      markVisited("rvtrips");
    },
    [markVisited],
  );

  const clearTripsHandoff = useCallback(() => setTripsHandoff(null), []);

  /** Facts “Check tow” only — dock / menu must not set this. */
  const openTowWithCoach = useCallback(
    (offer?: FactsTowHandoffOffer | null) => {
      towTokenRef.current += 1;
      setTowHandoff({
        token: towTokenRef.current,
        offer: normalizeFactsTowOffer(offer ?? null),
      });
      setCatalogOpen(false);
      setTab("rvtow");
      markVisited("rvtow");
    },
    [markVisited],
  );

  const clearTowHandoff = useCallback(() => setTowHandoff(null), []);

  const setActiveCoach = useCallback((sel: ActiveCoachInput | null) => {
    const next = writeActiveCoach(sel);
    setActiveCoachState(next);
  }, []);

  const openFactsPicker = useCallback(() => {
    setFactsPickerToken((n) => n + 1);
    setCatalogOpen(true);
    setTab("rvfax");
    markVisited("rvfax");
  }, [markVisited]);

  const openFactsShare = useCallback(() => {
    if (!access.guard(undefined, "Share is limited to the approved list.")) {
      return;
    }
    setFactsShareToken((n) => n + 1);
    setCatalogOpen(true);
    setTab("rvfax");
    markVisited("rvfax");
  }, [access, markVisited]);

  const openFactsMarket = useCallback(() => {
    setFactsMarketToken((n) => n + 1);
    setCatalogOpen(true);
    setTab("rvfax");
    markVisited("rvfax");
  }, [markVisited]);

  const onTabChange = useCallback(
    (next: AppTab) => {
      blurSuiteFocus();
      if (next === "rvshare") {
        openFactsShare();
        return;
      }
      setCatalogOpen(false);
      if (next === "rvfax") {
        setTab("rvfax");
        markVisited("rvfax");
        return;
      }
      if (next === "rvsold" && !isProfessionalTier()) return;
      if (next === "rvgrok") {
        setGrokSeed(clearGrokSeedOnDockTap());
        setGrokEntryToken((n) => n + 1);
      }
      setTab(next);
      markVisited(next);
      if (next === "rvcal") requestCleanCal();
    },
    [markVisited, openFactsShare, requestCleanCal],
  );

  const isPro = isProfessionalTier();
  const dockOrder = useMemo(() => dockTabOrder(isPro), [isPro]);

  useEffect(() => {
    const openSold = () => {
      if (!isProfessionalTier()) return;
      onTabChange("rvsold");
    };
    window.addEventListener(OPEN_SOLD_EVENT, openSold);
    return () => window.removeEventListener(OPEN_SOLD_EVENT, openSold);
  }, [onTabChange]);

  const units = snap?.units ?? [];

  const lockUnit = useCallback(
    (unit: LotUnit) => {
      setDesk(unit);
      setActiveCoach({
        year: unit.year,
        make: unit.make,
        model: unit.model,
        floorplan: unit.trim,
        rvType: unit.body_type || undefined,
        price:
          unit.price != null && unit.price > 0
            ? Math.round(unit.price)
            : undefined,
      });
      setCatalogOpen(false);
      setTab("rvfax");
      markVisited("rvfax");
    },
    [markVisited, setActiveCoach],
  );

  const openPayment = useCallback(() => {
    if (desk?.price != null && desk.price > 0) {
      const label = [desk.year, desk.make, desk.model, desk.trim]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");
      openCalWithPrice(desk.price, label);
      return;
    }
    onTabChange("rvcal");
  }, [desk, onTabChange, openCalWithPrice]);

  const applyLotFilter = useCallback(
    (next: LotFilter) => {
      setLotFilter(next);
      setLotQuery("");
      onTabChange("rvlot");
    },
    [onTabChange],
  );

  const listed = useMemo(() => {
    const searched = filterLotBrowse(units, { query: lotQuery });
    return filterLotUnits(searched, lotFilter, desk?.location ?? "");
  }, [units, lotQuery, lotFilter, desk]);

  const chips: FoxChip[] = useMemo(() => {
    if (tab === "rvcal" && !catalogOpen && calEdit === "down") {
      return DOWN_PRESETS.map((pct) => ({
        id: `down-${pct}`,
        label: `${pct}%`,
        on: downPct === pct,
        onClick: () => {
          setDownPct(pct);
          setCalEdit(null);
        },
      }));
    }
    if (tab === "rvcal" && !catalogOpen && calEdit === "term") {
      return TERM_PRESETS.map((term) => ({
        id: `term-${term.months}`,
        label: term.label,
        on: termMonths === term.months,
        onClick: () => {
          setTermMonths(term.months);
          setCalEdit(null);
        },
      }));
    }
    if (tab === "rvcal" && !catalogOpen && calEdit === "rate") {
      return APR_PRESETS.map((rate) => ({
        id: `rate-${rate}`,
        label: `${rate}%`,
        on: apr === rate,
        onClick: () => {
          setApr(rate);
          setCalEdit(null);
        },
      }));
    }
    if (tab === "rvcal" && !catalogOpen) {
      return [
        { id: "down", label: "Down", on: downPct != null, onClick: () => setCalEdit("down") },
        { id: "term", label: "Term", on: termMonths != null, onClick: () => setCalEdit("term") },
        { id: "rate", label: "Rate", on: apr != null, onClick: () => setCalEdit("rate") },
      ];
    }
    if (tab === "rvlot" && !catalogOpen) {
      return [
        {
          id: "diesel-under-40",
          label: "Diesels under 40",
          on: lotFilter === "diesel-under-40",
          onClick: () => applyLotFilter("diesel-under-40"),
        },
        {
          id: "ft-36",
          label: "36-footers",
          on: lotFilter === "ft-36",
          onClick: () => applyLotFilter("ft-36"),
        },
        {
          id: "this-store",
          label: "This store",
          on: lotFilter === "this-store",
          onClick: () => applyLotFilter("this-store"),
        },
        {
          id: "all",
          label: "All",
          on: lotFilter === "all",
          onClick: () => applyLotFilter("all"),
        },
      ];
    }
    if (tab === "rvtow" && !catalogOpen) {
      return [
        {
          id: "this-coach",
          label: "This coach",
          onClick: () => onTabChange("rvfax"),
        },
      ];
    }
    if ((tab === "home" || tab === "rvfax") && !catalogOpen) {
      return [
        { id: "tanks", label: "Tanks", onClick: () => onTabChange("rvfax") },
        { id: "payment", label: "Payment", onClick: openPayment },
        {
          id: "diesel-under-40",
          label: "Diesels under 40",
          onClick: () => applyLotFilter("diesel-under-40"),
        },
        {
          id: "ft-36",
          label: "36-footers",
          onClick: () => applyLotFilter("ft-36"),
        },
      ];
    }
    return [
      { id: "home", label: "Home", onClick: () => onTabChange("home") },
    ];
  }, [
    tab,
    catalogOpen,
    calEdit,
    downPct,
    termMonths,
    apr,
    lotFilter,
    applyLotFilter,
    onTabChange,
    openPayment,
  ]);

  const askValue = tab === "rvlot" && !catalogOpen ? lotQuery : askText;
  const setAskValue = (value: string) => {
    if (tab === "rvlot" && !catalogOpen) setLotQuery(value);
    else setAskText(value);
  };

  const show = (pane: AppTab) => suiteReady && visited.has(pane);
  const id = tab;
  const legacyPane =
    catalogOpen ||
    id === "rvgrok" ||
    id === "rvtow" ||
    id === "rvtrips" ||
    id === "more" ||
    id === "rvsold";

  return (
    <ShellNavProvider
      value={{
        tab,
        setTab: onTabChange,
        calSeed,
        calCleanToken,
        openCalWithPrice,
        clearCalSeed,
        activeCoach,
        setActiveCoach,
        openFactsPicker,
        factsPickerToken,
        openFactsShare,
        factsShareToken,
        openFactsMarket,
        factsMarketToken,
        tripsHandoff,
        openTripsProfile,
        clearTripsHandoff,
        towHandoff,
        openTowWithCoach,
        clearTowHandoff,
        accessSession: {
          allowed: access.allowed,
          status: access.status,
          name: access.name,
          phone: access.phone,
        },
      }}
    >
      <div
        ref={shellRef}
        className="fox-shell app-shell relative flex h-full min-h-0 w-full flex-col overflow-hidden overscroll-none text-white"
        data-fox-shell
        data-page-accent={PAGE_ACCENT[tab] ?? "sapphire"}
        data-dock-order={dockOrder.join(",")}
        style={{ overscrollBehavior: "none" }}
      >
        <FoxMark
          onHome={() => onTabChange("home")}
          onGps={() => onTabChange("rvtrips")}
          onCatalog={openFactsPicker}
          onPremium={() => onTabChange("more")}
        />
        <main
          className={legacyPane ? "fox-main is-legacy" : "fox-main"}
        >
          {id === "rvgrok" ? (
            <RvGrokApp
              active={tab === "rvgrok" && !launchOpen}
              entryToken={grokEntryToken}
              seedPrompt={grokSeed}
              onSeedConsumed={() => setGrokSeed(undefined)}
            />
          ) : catalogOpen ? (
            <Suspense fallback={<SuiteFallback />}>
              <SuiteErrorBoundary name="RvFACTS">
                <RvFaxApp onOpenGrok={openGrok} />
              </SuiteErrorBoundary>
            </Suspense>
          ) : id === "home" ? (
            <HomeRoom
              active={tab === "home"}
              total={snap ? snap.units.length : null}
              desk={desk}
              failed={Boolean(snapError) && !snap}
            />
          ) : id === "rvfax" ? (
            <FactsRoom desk={desk} />
          ) : id === "rvcal" ? (
            <CalRoom
              active={tab === "rvcal"}
              price={calPrice}
              downPct={downPct}
              termMonths={termMonths}
              apr={apr}
              onReset={resetCalFields}
              onApply={applyCalPrice}
            />
          ) : id === "rvtow" ? (
            show("rvtow") ? (
              <Suspense fallback={<SuiteFallback />}>
                <SuiteErrorBoundary name="RvTOW">
                  <RvTowApp />
                </SuiteErrorBoundary>
              </Suspense>
            ) : null
          ) : id === "rvlot" ? (
            <LotRoom
              rows={listed}
              filter={lotFilter}
              totalKnown={Boolean(snap)}
              failed={Boolean(snapError) && !snap}
              onOpen={lockUnit}
            />
          ) : id === "rvtrips" ? (
            show("rvtrips") ? (
              <Suspense fallback={<SuiteFallback />}>
                <SuiteErrorBoundary name="RV GPS">
                  <RvTripsApp />
                </SuiteErrorBoundary>
              </Suspense>
            ) : null
          ) : id === "more" ? (
            show("more") ? (
              <Suspense fallback={<SuiteFallback />}>
                <SuiteErrorBoundary name="More">
                  <MoreApp onNavigate={onTabChange} />
                </SuiteErrorBoundary>
              </Suspense>
            ) : null
          ) : id === "rvsold" && show("rvsold") && isPro ? (
            <Suspense fallback={<SuiteFallback />}>
              <SuiteErrorBoundary name="Sold">
                <SoldBookApp />
              </SuiteErrorBoundary>
            </Suspense>
          ) : null}
        </main>
        <div className="fox-foot" data-fox-chips data-no-swipe>
          <FoxChips chips={chips} />
          <FoxAsk
            placeholder={askPlaceholder(tab, catalogOpen)}
            value={askValue}
            onChange={setAskValue}
            onSubmit={(value) => openGrok(value)}
          />
          {!hideDock ? (
            <div
              className="relative z-[80] shrink-0 isolate pointer-events-auto"
              data-bottom-dock
              data-no-swipe
            >
              <BottomTabs tab={tab} onChange={onTabChange} />
            </div>
          ) : null}
        </div>
      </div>
    </ShellNavProvider>
  );
}
