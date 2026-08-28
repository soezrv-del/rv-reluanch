import { useCallback, useMemo, useRef, useState } from "react";
import { BottomTabs, type AppTab } from "./BottomTabs";
import { PAGE_ACCENT } from "./SapphireHeader";
import { Launchpad } from "./Launchpad";
import { ShellNavProvider } from "./ShellNav";
import { RvFaxApp } from "@/components/rvfax/RvFaxApp";
import { RvGrokApp } from "@/components/rvgrok/RvGrokApp";
import { RvTowApp } from "@/components/rvtow/RvTowApp";
import { RvCalApp } from "@/components/rvcal/RvCalApp";
import { RvTripsApp } from "@/components/rvtrips/RvTripsApp";
import { MoreApp } from "@/components/more/MoreApp";
import { useSwipeTabs } from "@/lib/hooks/useSwipeTabs";
import {
  useFocusScrollIntoView,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";

/** Dock order — Facts home, Grok on the right */
export const TAB_ORDER = [
  "rvfax",
  "rvcal",
  "rvtow",
  "rvtrips",
  "rvgrok",
] as const satisfies readonly AppTab[];

const FLOAT_TAB_PAD =
  "pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))]";

const LAUNCH_SEEN_KEY = "rvfox-launchpad-seen-v1";

function hasSeenLaunch(): boolean {
  try {
    return sessionStorage.getItem(LAUNCH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markLaunchSeen() {
  try {
    sessionStorage.setItem(LAUNCH_SEEN_KEY, "1");
  } catch {
    /* */
  }
}

export function AppShell() {
  const [tab, setTab] = useState<AppTab>("rvfax");
  const [grokSeed, setGrokSeed] = useState<string | undefined>();
  const [launchOpen, setLaunchOpen] = useState(() => !hasSeenLaunch());
  const [launchFading, setLaunchFading] = useState(false);
  const [grokSplashPlaying, setGrokSplashPlaying] = useState(false);
  const mainRef = useRef<HTMLElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const launchDoneRef = useRef(false);
  const kb = useKeyboardInset();
  useFocusScrollIntoView(true);

  const finishLaunch = useCallback((nextTab?: AppTab) => {
    if (launchDoneRef.current) return;
    launchDoneRef.current = true;
    markLaunchSeen();
    if (nextTab) setTab(nextTab);
    setLaunchFading(true);
    window.setTimeout(() => {
      setLaunchOpen(false);
      setLaunchFading(false);
    }, 320);
  }, []);

  const openGrok = (prompt?: string) => {
    setGrokSeed(prompt);
    setTab("rvgrok");
  };

  const onTabChange = useCallback((next: AppTab) => {
    setTab(next);
    if (next !== "rvgrok") setGrokSplashPlaying(false);
  }, []);

  useSwipeTabs({
    order: TAB_ORDER,
    active: tab,
    onChange: onTabChange,
    targetRef: shellRef,
    threshold: 24,
  });

  const hideDock = launchOpen || grokSplashPlaying || kb.open;

  const nav = useMemo(
    () => ({
      tab,
      setTab: onTabChange,
      splashPlaying: launchOpen || grokSplashPlaying,
      setSplashPlaying: setGrokSplashPlaying,
    }),
    [tab, onTabChange, launchOpen, grokSplashPlaying],
  );

  return (
    <ShellNavProvider value={nav}>
      <div
        ref={shellRef}
        className="app-shell relative flex w-full flex-col overflow-hidden overscroll-none bg-bg text-fg"
        data-page-accent={PAGE_ACCENT[tab] ?? "sapphire"}
        style={{
          overscrollBehavior: "none",
          height: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
          maxHeight: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
          transform:
            kb.vvOffsetTop > 0
              ? `translateY(${kb.vvOffsetTop}px)`
              : undefined,
        }}
      >
        {/* Brand launchpad — once per session; pick a tool or enter suite */}
        {launchOpen ? (
          <div
            className={`transition-opacity duration-300 ${
              launchFading ? "opacity-0" : "opacity-100"
            }`}
          >
            <Launchpad
              backdropSrc="/assets/splash/rvfox-launch-poster.jpg"
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
        >
          <div className={tab === "rvgrok" ? "h-full" : "hidden"}>
            <RvGrokApp
              active={tab === "rvgrok" && !launchOpen}
              seedPrompt={grokSeed}
              onSeedConsumed={() => setGrokSeed(undefined)}
              onNavigate={onTabChange}
              onSplashPlayingChange={setGrokSplashPlaying}
            />
          </div>
          <div className={tab === "rvfax" ? "h-full" : "hidden"}>
            <RvFaxApp onOpenGrok={openGrok} />
          </div>
          <div className={tab === "rvcal" ? "h-full" : "hidden"}>
            <RvCalApp />
          </div>
          <div className={tab === "rvtow" ? "h-full" : "hidden"}>
            <RvTowApp />
          </div>
          <div className={tab === "rvtrips" ? "h-full" : "hidden"}>
            <RvTripsApp />
          </div>
          <div className={tab === "more" ? "h-full" : "hidden"}>
            <MoreApp onNavigate={onTabChange} />
          </div>
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
