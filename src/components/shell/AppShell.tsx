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
import type { AppTab, DockRoomId } from "./BottomTabs";
import { RoomAskBar } from "./RoomAskBar";
import { SuiteBrand } from "./SuiteBrand";
import { HomeScreen } from "./HomeScreen";
import { SectionDeck } from "./SectionDeck";
import {
  isUnderMore,
  PAGE_ACCENT,
  TAB_ORDER,
} from "./shellConstants";
import { SECTION_ROW, isSectionId, type SectionId } from "@/lib/shell/sectionRow";
import type { MorePick } from "./MoreSheet";
import {
  makeNavMarker,
  planTabHistory,
  popTarget,
  readNavMarker,
  sameView,
  type NavKind,
  type NavView,
} from "@/lib/shell/moreHistory";
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
import type { FactsCascadeSel } from "@/lib/rv/factsOpen";
import {
  useFocusScrollIntoView,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";
import { pinScreenScrollOnOpen } from "@/lib/hooks/screenScroll";
import { useDockSafeInset } from "@/lib/hooks/nativeWebView";
import {
  clearGrokSeedOnDockTap,
  grokSeedFromAskHandoff,
} from "@/lib/rvgrok/tabEntry";
import {
  planGrokTabVoice,
  roomVoiceIsOpen,
  stopRoomVoice,
} from "@/lib/rvgrok/roomAsk";
import { clearPageChatScope, onRouteChange, readActiveScreen, setActiveScreen, setPageChatScope } from "@/lib/rvgrok/screenContext";
import { VIN_DECODER_SCREEN } from "@/lib/rvgrok/screenGuides";

/**
 * Code-split suite tools — tools load only when visited.
 * Cold open lands on RV Grok; no splash / chooser gate.
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
const RvCalApp = lazy(() =>
  import("@/components/rvcal/RvCalApp").then((m) => ({ default: m.RvCalApp })),
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
const VinDecoder = lazy(() =>
  import("@/components/rvfax/VinDecoder").then((m) => ({ default: m.VinDecoder })),
);
const LotStockApp = lazy(() =>
  import("@/components/lot/LotStockApp").then((m) => ({
    default: m.LotStockApp,
  })),
);

const TAB_PANE_ON =
  "absolute inset-0 flex min-h-0 flex-col overflow-hidden";

function SuiteFallback() {
  return (
    <div className="flex h-full items-center justify-center bg-bg">
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
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
          <p className="text-[15px] font-bold text-white">
            {this.props.name} hit a snag
          </p>
          <p className="max-w-sm text-[12px] text-white/70">
            {this.state.err.message || "Something went wrong loading this tab."}
          </p>
          <button
            type="button"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-bold text-white"
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

export function AppShell({
  initialTab = "rvgrok",
}: {
  initialTab?: AppTab;
}) {
  const access = useAccess();
  const [tab, setTab] = useState<AppTab>(initialTab);
  const [homeOpen, setHomeOpen] = useState(initialTab === "rvgrok");
  const [grokSeed, setGrokSeed] = useState<string | undefined>();
  const [grokEntryToken, setGrokEntryToken] = useState(0);
  const [assistantRun, setAssistantRun] = useState(0);
  const [calSeed, setCalSeed] = useState<CalSeed | null>(null);
  const [calCleanToken, setCalCleanToken] = useState(0);
  const [tripsHandoff, setTripsHandoff] = useState<TripsHandoff | null>(null);
  const [towHandoff, setTowHandoff] = useState<FactsTowHandoff | null>(null);
  const [activeCoach, setActiveCoachState] = useState<ActiveCoach | null>(() =>
    readActiveCoach(),
  );
  const [factsPickerToken, setFactsPickerToken] = useState(0);
  const [factsUnitSeed, setFactsUnitSeed] = useState<FactsCascadeSel | null>(null);
  const [factsShareToken, setFactsShareToken] = useState(0);
  const [factsMarketToken, setFactsMarketToken] = useState(0);
  /** More half-sheet and the VIN Decoder it opens. */
  const [moreOpen, setMoreOpen] = useState(false);
  const [vinOpen, setVinOpen] = useState(false);
  /** VIN handed in by a Lot VIN tap; More → VIN Decoder opens blank. */
  const [vinSeed, setVinSeed] = useState("");
  const launchOpen = false;
  const suiteReady = true;
  const [visited, setVisited] = useState<Set<AppTab>>(() => {
    const next = new Set<AppTab>([initialTab]);
    // Ask bar talks to this pane from every room, including /lot.
    next.add("rvgrok");
    for (const page of SECTION_ROW) next.add(page.id);
    return next;
  });
  const mainRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const leftHome = useRef(initialTab !== "rvgrok");
  const calTokenRef = useRef(0);
  const tripsTokenRef = useRef(0);
  const towTokenRef = useRef(0);
  useKeyboardInset();
  useFocusScrollIntoView(true);
  useDockSafeInset();

  useEffect(() => {
    if (typeof history !== "undefined") history.scrollRestoration = "manual";
    return pinScreenScrollOnOpen();
  }, [tab, homeOpen]);

  const markVisited = useCallback((id: AppTab) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  }, []);

  // Hide native Capacitor splash immediately — no in-app video gate.
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

  /** Facts Ask Grok — seed the Grok tab. Dock tap still opens a clean chat. */
  const openGrok = (prompt?: string) => {
    if (!access.guard(undefined, "Ask Grok is limited to the approved list.")) {
      return;
    }
    blurSuiteFocus();
    setGrokSeed(grokSeedFromAskHandoff(prompt));
    setGrokEntryToken((n) => n + 1);
    setTab("rvgrok");
    markVisited("rvgrok");
  };

  const requestCleanCal = useCallback(() => {
    setCalSeed(null);
    setCalCleanToken((n) => n + 1);
  }, []);

  const openCalWithPrice = useCallback(
    (price: number, label?: string) => {
      const payload = normalizeCalHandoff({ price, label });
      if (!payload) {
        requestCleanCal();
        setTab("rvcal");
        markVisited("rvcal");
        return;
      }
      calTokenRef.current += 1;
      setCalSeed({
        ...payload,
        token: calTokenRef.current,
      });
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
      setTab("rvtrips");
      markVisited("rvtrips");
    },
    [markVisited],
  );

  const clearTripsHandoff = useCallback(() => setTripsHandoff(null), []);

  /** Facts “Check tow” only — dock / swipe / launchpad must not set this. */
  const openTowWithCoach = useCallback(
    (offer?: FactsTowHandoffOffer | null) => {
      towTokenRef.current += 1;
      setTowHandoff({
        token: towTokenRef.current,
        offer: normalizeFactsTowOffer(offer ?? null),
      });
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

  const openFactsPicker = useCallback((unit?: FactsCascadeSel | null) => {
    // Plain Facts taps drop any unconsumed Lot seed so they land on search.
    setFactsUnitSeed(unit ?? null);
    setFactsPickerToken((n) => n + 1);
    setTab("rvfax");
    markVisited("rvfax");
  }, [markVisited]);

  const clearFactsUnitSeed = useCallback(() => setFactsUnitSeed(null), []);

  const openFactsShare = useCallback(() => {
    if (!access.guard(undefined, "Share is limited to the approved list.")) {
      return;
    }
    setFactsShareToken((n) => n + 1);
    setTab("rvfax");
    markVisited("rvfax");
  }, [access, markVisited]);

  const openFactsMarket = useCallback(() => {
    setFactsMarketToken((n) => n + 1);
    setTab("rvfax");
    markVisited("rvfax");
  }, [markVisited]);

  const onTabChange = useCallback(
    (next: AppTab, opts?: { skipVoice?: boolean; pageScope?: boolean; startAssistant?: boolean }) => {
      const alreadyOnGrok = !homeOpen && tab === "rvgrok";
      setHomeOpen(false);
      // Hidden Grok composer can keep focus after a room switch — that sticks
      // html.kb-open and used to unmount the dock on re-entry.
      blurSuiteFocus();
      if (next === "rvshare") {
        openFactsShare();
        return;
      }
      // Dock / settings → Facts always lands on clean catalog search.
      // Chip “change” uses the same openFactsPicker token.
      if (next === "rvfax") {
        openFactsPicker();
        return;
      }
      if (next === "rvsold" && !isProfessionalTier()) return;
      if (next === "rvgrok") {
        if (opts?.pageScope) setPageChatScope(readActiveScreen());
        else clearPageChatScope();
        if (opts?.startAssistant) setAssistantRun((n) => n + 1);
        const voicePlan = planGrokTabVoice({
          alreadyOnGrok,
          voiceOpen: roomVoiceIsOpen(),
          skipVoice: opts?.skipVoice,
        });
        // The screen stays blank. Pill and Chat tab arm the session; they do not greet.
        if (voicePlan === "stop") stopRoomVoice();
        // Dock tap / settings — never restore a leftover Ask-Grok seed.
        // The open thread stays; only a Facts Ask Grok seed starts fresh.
        setGrokSeed(clearGrokSeedOnDockTap());
        setGrokEntryToken((n) => n + 1);
      }
      setTab(next);
      markVisited(next);
      if (next === "rvcal") requestCleanCal();
    },
    [markVisited, openFactsShare, openFactsPicker, requestCleanCal, tab, homeOpen],
  );

  const isPro = isProfessionalTier();

  /* ── History for settings sheet / tools: sheet, VIN overlay, and tools ───────────────
   * Android back is webView.goBack(). Leaving Home pushes one entry so
   * back returns Home in one press. Section-row swipes never push; they
   * replace our top entry. The sheet, the VIN Decoder, and tools opened
   * by a handoff push one entry so back closes the sheet or returns to
   * the screen the tool came from.
   */
  const navDepth = useRef(0);
  const navBase = useRef<NavView>({ tab: initialTab, home: homeOpen });
  const navView = useRef<NavView>({ tab: initialTab, home: homeOpen });
  const ignorePops = useRef(0);
  const fromPop = useRef(false);
  const pickedFromSheet = useRef(false);
  /** The next screen change came from the section row (swipe or dot). */
  const rowMove = useRef(false);
  /** Work to do once one of our own history.go() traversals lands. */
  const afterPops = useRef<Array<(() => void) | undefined>>([]);
  const moreOpenRef = useRef(false);
  moreOpenRef.current = moreOpen;

  /**
   * `from` is the view Back should return to. The history effect passes the
   * previous view explicitly because navView already holds the destination.
   */
  const pushNav = useCallback((kind: NavKind, view: NavView, from?: NavView) => {
    if (navDepth.current === 0) navBase.current = from ?? navView.current;
    navDepth.current += 1;
    try {
      history.pushState(makeNavMarker(kind, view, navDepth.current), "");
    } catch {
      /* sandboxed preview */
    }
  }, []);

  const replaceNav = useCallback((kind: NavKind, view: NavView) => {
    try {
      history.replaceState(makeNavMarker(kind, view, navDepth.current), "");
    } catch {
      /* sandboxed preview */
    }
  }, []);

  /** Pop `n` of our entries in one traversal; its popstate is ours. */
  const popNav = useCallback((n: number, after?: () => void) => {
    const steps = Math.min(n, navDepth.current);
    if (steps <= 0) {
      after?.();
      return;
    }
    navDepth.current -= steps;
    ignorePops.current += 1;
    afterPops.current.push(after);
    history.go(-steps);
  }, []);

  const topNavIs = (kind: NavKind) =>
    navDepth.current > 0 && readNavMarker(history.state)?.kind === kind;

  useEffect(() => {
    const prev = navView.current;
    const next: NavView = { tab, home: homeOpen };
    navView.current = next;
    const picked = pickedFromSheet.current;
    pickedFromSheet.current = false;
    const viaRow = rowMove.current;
    rowMove.current = false;
    if (fromPop.current) {
      fromPop.current = false;
      return;
    }
    if (sameView(prev, next)) return;
    // Any screen change shuts the sheet (Home brand tap, handoffs).
    if (moreOpenRef.current) setMoreOpen(false);
    const step = planTabHistory({
      prev,
      next,
      base: navBase.current,
      nextUnderMore: isUnderMore(tab),
      depth: navDepth.current,
      pickedFromSheet: picked && topNavIs("sheet"),
      viaRow,
    });
    if (step === "push") pushNav("tool", next, prev);
    else if (step === "replace") replaceNav("tool", next);
    else if (step === "unwind") popNav(navDepth.current);
    else if (step === "unwind-replace") {
      // Keep the entry that leads back; it now shows this screen.
      popNav(navDepth.current - 1, () => replaceNav("tool", next));
    }
  }, [tab, homeOpen, pushNav, replaceNav, popNav]);

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (ignorePops.current > 0) {
        ignorePops.current -= 1;
        afterPops.current.shift()?.();
        return;
      }
      const hit = popTarget(e.state, navDepth.current, navBase.current);
      if (!hit) return;
      navDepth.current = hit.depth;
      setMoreOpen(false);
      setVinOpen(false);
      const here = navView.current;
      if (sameView(here, hit.view)) return;
      fromPop.current = true;
      // Back restores the screen as it was — no clean-search reset, no voice.
      if (hit.view.home) {
        setHomeOpen(true);
      } else {
        const t = hit.view.tab as AppTab;
        setHomeOpen(false);
        setTab(t);
        markVisited(t);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [markVisited]);

  useEffect(() => {
    if (vinOpen) setActiveScreen(VIN_DECODER_SCREEN);
    else onRouteChange(tab, homeOpen);
  }, [vinOpen, tab, homeOpen]);

  const closeMore = useCallback(() => {
    setMoreOpen(false);
    if (topNavIs("sheet")) popNav(1);
  }, [popNav]);

  const openMore = useCallback(() => {
    blurSuiteFocus();
    pushNav("sheet", navView.current);
    setMoreOpen(true);
  }, [pushNav]);

  const closeVin = useCallback(() => {
    setVinOpen(false);
    if (topNavIs("vin")) popNav(1);
  }, [popNav]);

  const openVinDecoder = useCallback(
    (vin: string) => {
      blurSuiteFocus();
      if (moreOpenRef.current) setMoreOpen(false);
      pushNav("vin", navView.current);
      setVinSeed(vin);
      setVinOpen(true);
    },
    [pushNav],
  );

  /**
   * Legacy dock tap. The bottom bar is gone; section pages replace it.
   * Kept so a More-sheet pick still lands on a room the way a dock tap did.
   */
  const onDockTap = useCallback(
    (next: DockRoomId, opts?: { skipVoice?: boolean }) => {
      if (next === "more") {
        if (moreOpenRef.current) closeMore();
        else openMore();
        return;
      }
      if (moreOpenRef.current) {
        if (!homeOpen && next === tab) {
          closeMore();
          return;
        }
        // The tab change unwinds the sheet entry with any tool entries.
        setMoreOpen(false);
      }
      onTabChange(
        next,
        next === "rvgrok" ? { ...opts, startAssistant: true } : opts,
      );
    },
    [closeMore, openMore, onTabChange, homeOpen, tab],
  );
  void onDockTap;

  const onMorePick = useCallback(
    (id: MorePick) => {
      if (id === "vin") {
        if (topNavIs("sheet")) replaceNav("vin", navView.current);
        else pushNav("vin", navView.current);
        setMoreOpen(false);
        setVinSeed("");
        setVinOpen(true);
        return;
      }
      if (id === "rvshare") {
        if (!access.allowed) {
          // The access sheet shows over this screen; keep its history.
          closeMore();
          onTabChange("rvshare");
          return;
        }
        // Share lands on Facts — a main tab, so unwind everything first.
        setMoreOpen(false);
        popNav(navDepth.current);
        onTabChange("rvshare");
        return;
      }
      if (!homeOpen && id === tab) {
        closeMore();
        return;
      }
      pickedFromSheet.current = true;
      setMoreOpen(false);
      onTabChange(id);
    },
    [access.allowed, closeMore, onTabChange, popNav, pushNav, replaceNav, homeOpen, tab],
  );

  useEffect(() => {
    const openSold = () => {
      if (!isProfessionalTier()) return;
      onTabChange("rvsold");
    };
    window.addEventListener(OPEN_SOLD_EVENT, openSold);
    return () => window.removeEventListener(OPEN_SOLD_EVENT, openSold);
  }, [onTabChange]);

  const nav = useMemo(
    () => ({
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
      factsUnitSeed,
      clearFactsUnitSeed,
      openVinDecoder,
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
    }),
    [
      tab,
      onTabChange,
      calSeed,
      calCleanToken,
      openCalWithPrice,
      clearCalSeed,
      activeCoach,
      setActiveCoach,
      openFactsPicker,
      factsPickerToken,
      factsUnitSeed,
      clearFactsUnitSeed,
      openVinDecoder,
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
      access.allowed,
      access.status,
      access.name,
      access.phone,
    ],
  );

  const show = (id: AppTab) => suiteReady && visited.has(id);

  const goHome = () => {
    blurSuiteFocus();
    setHomeOpen(true);
    if (moreOpenRef.current) setMoreOpen(false);
  };

  const revealSections = () => {
    if (!isSectionId(tab)) {
      onTabChange("more");
      return;
    }
    if (!leftHome.current) {
      onTabChange("rvfax");
      return;
    }
    setHomeOpen(false);
  };

  /** Swipes and dots replace history; they never push (see planTabHistory). */
  const onSectionArrive = (id: SectionId) => {
    if (id === tab && !homeOpen) return;
    rowMove.current = true;
    onTabChange(id);
  };

  useEffect(() => {
    if (!homeOpen) leftHome.current = true;
  }, [homeOpen]);

  const pane = (id: SectionId) => {
    if (id === "rvfax") return <RvFaxApp onOpenGrok={openGrok} />;
    if (id === "rvcal") return <RvCalApp />;
    if (id === "rvgrok") {
      return id === "rvgrok" ? (
        <RvGrokApp
          active={tab === "rvgrok" && !launchOpen}
          entryToken={grokEntryToken}
          assistantRun={assistantRun}
          seedPrompt={grokSeed}
          onSeedConsumed={() => setGrokSeed(undefined)}
        />
      ) : null;
    }
    if (id === "rvtow") return <RvTowApp />;
    if (id === "rvlot") return <LotStockApp onAsk={openGrok} />;
    return (
      <MoreApp onNavigate={onTabChange} active={tab === "more" && !homeOpen} />
    );
  };

  return (
    <ShellNavProvider value={nav}>
      <div
        ref={shellRef}
        className="app-shell showroom-app relative flex min-h-0 w-full flex-col overflow-hidden overscroll-none text-fg"
        data-home-open={homeOpen ? "" : undefined}
        data-page-accent={PAGE_ACCENT[tab] ?? "sapphire"}
        style={{
          overscrollBehavior: "none",
        }}
      >
        <div className="showroom-stage" aria-hidden />
        <SuiteBrand onHome={() => { blurSuiteFocus(); setHomeOpen(true); if (moreOpenRef.current) setMoreOpen(false); }} />
        <main
          ref={mainRef}
          className="suite-swipe-viewport relative flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-hidden={launchOpen}
        >
          {homeOpen ? <HomeScreen onOpen={onTabChange} onReveal={revealSections} /> : null}
          <SectionDeck
            hidden={homeOpen || tab === "rvtrips" || tab === "rvsold"}
            tab={tab}
            onArrive={onSectionArrive}
            onHome={goHome}
          >
            {SECTION_ROW.map((page) => (
              <div
                key={page.id}
                className="section-page"
                data-section-page={page.id}
                data-suite-pane={page.id}
                data-pane-active={page.id === tab ? "" : undefined}
              >
                {show(page.id) ? (
                  <Suspense fallback={<SuiteFallback />}>
                    <SuiteErrorBoundary
                      name={
                        page.id === "rvfax"
                          ? "RvFACTS"
                          : page.id === "rvcal"
                            ? "RvCAL"
                            : page.id === "rvgrok"
                              ? "Ask"
                              : page.id === "rvtow"
                                ? "RvTOW"
                                : page.id === "rvlot"
                                  ? "Inventory"
                                  : "More"
                      }
                    >
                      {pane(page.id)}
                    </SuiteErrorBoundary>
                  </Suspense>
                ) : null}
              </div>
            ))}
          </SectionDeck>
          {TAB_ORDER.map((id) =>
            id === "rvtrips" && show(id) && tab === "rvtrips" && !homeOpen ? (
              <div key={id} className="section-cover" data-suite-pane={id}>
                <Suspense fallback={<SuiteFallback />}>
                  <SuiteErrorBoundary name={id === "rvtrips" ? "RV GPS" : "Suite"}>
                    <RvTripsApp />
                  </SuiteErrorBoundary>
                </Suspense>
              </div>
            ) : null,
          )}
          {show("rvsold") && isPro ? (
            <div className={tab === "rvsold" && !homeOpen ? TAB_PANE_ON : "hidden"}>
              <Suspense fallback={<SuiteFallback />}>
                <SuiteErrorBoundary name="Sold">
                  <SoldBookApp />
                </SuiteErrorBoundary>
              </Suspense>
            </div>
          ) : null}
        </main>

        {vinOpen ? (
          <Suspense fallback={null}>
            <VinDecoder open={vinOpen} onClose={closeVin} initialVin={vinSeed} />
          </Suspense>
        ) : null}

        <RoomAskBar tab={tab} homeOpen={homeOpen} onOpen={onTabChange} />
      </div>
    </ShellNavProvider>
  );
}
