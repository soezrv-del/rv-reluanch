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
import { PAGE_ACCENT, TAB_ORDER } from "./shellConstants";
import { Launchpad } from "./Launchpad";
import { ShellNavProvider, type CalSeed } from "./ShellNav";
import { useSwipeTabs } from "@/lib/hooks/useSwipeTabs";
import {
  useFocusScrollIntoView,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";

/**
 * Code-split suite tools — iOS cold start was parsing all 6 apps under splash.
 * Launchpad stays eager; tools load only when visited.
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

const FLOAT_TAB_PAD =
  "pb-[calc(5.15rem+env(safe-area-inset-bottom,0px))]";

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
    return this.props.children;
  }
}

export function AppShell() {
  const [tab, setTab] = useState<AppTab>("rvfax");
  const [grokSeed, setGrokSeed] = useState<string | undefined>();
  const [calSeed, setCalSeed] = useState<CalSeed | null>(null);
  const [launchOpen, setLaunchOpen] = useState(true);
  const [launchFading, setLaunchFading] = useState(false);
  const [suiteReady, setSuiteReady] = useState(false);
  const [grokSplashPlaying, setGrokSplashPlaying] = useState(false);
  const [visited, setVisited] = useState<Set<AppTab>>(() => new Set());
  const mainRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const launchDoneRef = useRef(false);
  const calTokenRef = useRef(0);
  const kb = useKeyboardInset();
  useFocusScrollIntoView(true);

  const markVisited = useCallback((id: AppTab) => {
    setVisited((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  }, []);

  const finishLaunch = useCallback(
    (nextTab?: AppTab) => {
      if (launchDoneRef.current) return;
      launchDoneRef.current = true;
      const dest = nextTab ?? "rvfax";
      setTab(dest);
      markVisited(dest);
      setSuiteReady(true);
      setLaunchFading(true);
      window.setTimeout(() => {
        setLaunchOpen(false);
        setLaunchFading(false);
      }, 280);
    },
    [markVisited],
  );

  // Absolute safety: never leave native splash forever if Launchpad fails
  useEffect(() => {
    const t = window.setTimeout(() => {
      void import("@capacitor/splash-screen")
        .then((m) => m.SplashScreen.hide({ fadeOutDuration: 150 }))
        .catch(() => undefined);
    }, 4000);
    return () => window.clearTimeout(t);
  }, []);

  const openGrok = (prompt?: string) => {
    setGrokSeed(prompt);
    setTab("rvgrok");
    markVisited("rvgrok");
  };

  const openCalWithPrice = useCallback(
    (price: number, label?: string) => {
      calTokenRef.current += 1;
      setCalSeed({
        price: Math.max(0, Math.round(price)),
        label,
        token: calTokenRef.current,
      });
      setTab("rvcal");
      markVisited("rvcal");
    },
    [markVisited],
  );

  const clearCalSeed = useCallback(() => setCalSeed(null), []);

  const onTabChange = useCallback(
    (next: AppTab) => {
      setTab(next);
      markVisited(next);
      if (next !== "rvgrok") setGrokSplashPlaying(false);
    },
    [markVisited],
  );

  useSwipeTabs({
    order: TAB_ORDER,
    active: tab,
    onChange: onTabChange,
    targetRef: shellRef,
    threshold: 24,
    enabled: !launchOpen,
  });

  const hideDock = launchOpen || grokSplashPlaying || kb.open;

  const nav = useMemo(
    () => ({
      tab,
      setTab: onTabChange,
      splashPlaying: launchOpen || grokSplashPlaying,
      setSplashPlaying: setGrokSplashPlaying,
      calSeed,
      openCalWithPrice,
      clearCalSeed,
    }),
    [
      tab,
      onTabChange,
      launchOpen,
      grokSplashPlaying,
      calSeed,
      openCalWithPrice,
      clearCalSeed,
    ],
  );

  const show = (id: AppTab) => suiteReady && visited.has(id);

  return (
    <ShellNavProvider value={nav}>
      <div
        ref={shellRef}
        className="app-shell relative flex h-full min-h-0 w-full flex-col overflow-hidden overscroll-none bg-bg text-fg"
        data-page-accent={PAGE_ACCENT[tab] ?? "sapphire"}
        style={{
          overscrollBehavior: "none",
          // Fill the preview iframe with % height. Only pin to visualViewport
          // pixels when the keyboard is open (native iOS). Pixel vvHeight on
          // first paint hydrates as a mismatch and can collapse the shell.
          height:
            kb.open && kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100%",
          maxHeight:
            kb.open && kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100%",
          transform:
            kb.open && kb.vvOffsetTop > 0
              ? `translateY(${kb.vvOffsetTop}px)`
              : undefined,
        }}
      >
        {launchOpen ? (
          <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
              launchFading ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <Launchpad
              onSelect={(t) => finishLaunch(t)}
              onSkip={() => finishLaunch()}
            />
          </div>
        ) : null}

        <main
          ref={mainRef}
          className={`relative min-h-0 flex-1 overflow-hidden touch-pan-y ${
            hideDock ? "pb-2" : FLOAT_TAB_PAD
          }`}
          aria-hidden={launchOpen}
        >
          <Suspense fallback={<SuiteFallback />}>
            {show("rvgrok") ? (
              <div className={tab === "rvgrok" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="RvGROK">
                  <RvGrokApp
                    active={tab === "rvgrok" && !launchOpen}
                    seedPrompt={grokSeed}
                    onSeedConsumed={() => setGrokSeed(undefined)}
                    onNavigate={onTabChange}
                    onSplashPlayingChange={setGrokSplashPlaying}
                  />
                </SuiteErrorBoundary>
              </div>
            ) : null}
            {show("rvfax") ? (
              <div className={tab === "rvfax" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="RvFACTS">
                  <RvFaxApp onOpenGrok={openGrok} />
                </SuiteErrorBoundary>
              </div>
            ) : null}
            {show("rvcal") ? (
              <div className={tab === "rvcal" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="RvCAL">
                  <RvCalApp />
                </SuiteErrorBoundary>
              </div>
            ) : null}
            {show("rvtow") ? (
              <div className={tab === "rvtow" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="RvTOW">
                  <RvTowApp />
                </SuiteErrorBoundary>
              </div>
            ) : null}
            {show("rvtrips") ? (
              <div className={tab === "rvtrips" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="RvTRIPS">
                  <RvTripsApp />
                </SuiteErrorBoundary>
              </div>
            ) : null}
            {show("more") ? (
              <div className={tab === "more" ? "h-full" : "hidden"}>
                <SuiteErrorBoundary name="More">
                  <MoreApp onNavigate={onTabChange} />
                </SuiteErrorBoundary>
              </div>
            ) : null}
          </Suspense>
        </main>

        {!hideDock ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40">
            <BottomTabs tab={tab} onChange={onTabChange} />
          </div>
        ) : null}
      </div>
    </ShellNavProvider>
  );
}
