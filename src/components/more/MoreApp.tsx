import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Heart,
  HelpCircle,
  Landmark,
  Mail,
  Map as MapIcon,
  MessageSquare,
  Route,
  Search,
  Shield,
  Sparkles,
  Star,
  FileText,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SuitePage } from "@/components/shell/SuitePage";
import type { AppTab } from "@/components/shell/BottomTabs";
import { NhtsaRecallsPanel } from "@/components/nhtsa/NhtsaRecallsPanel";
import { VoicePanel } from "@/components/rvgrok/VoicePanel";
import type { GrokVoice } from "@/lib/rvgrok/voice";
import {
  DEFAULT_VOICE,
  LIVE_VOICE_KEY,
  VOICE_MODE_KEY,
  VOICE_SPEED_KEY,
  VOICE_STORAGE_KEY,
  speakWithBrowserTts,
  stopBrowserTts,
} from "@/lib/rvgrok/voice";

type SheetId = "help" | "feedback" | "privacy" | "terms" | null;

const SAVED_KEY = "rvfax_saved_v1";
const GROK_HIST_KEY = "rvfax_grok_history_v1";

function countSaved(): number {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function countGrokChats(): number {
  try {
    const raw = localStorage.getItem(GROK_HIST_KEY);
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export function MoreApp({
  onNavigate,
}: {
  onNavigate?: (tab: AppTab) => void;
}) {
  const [sheet, setSheet] = useState<SheetId>(null);
  const [recallYear, setRecallYear] = useState("2024");
  const [recallMake, setRecallMake] = useState("Tiffin");
  const [recallModel, setRecallModel] = useState("Allegro Bus");
  const [recallArmed, setRecallArmed] = useState(false);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VOICE);
  const [voiceMode, setVoiceMode] = useState(false);
  const [liveVoice, setLiveVoice] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = localStorage.getItem(VOICE_STORAGE_KEY);
      if (v) setSelectedVoice(v);
      setVoiceMode(localStorage.getItem(VOICE_MODE_KEY) === "true");
      setLiveVoice(localStorage.getItem(LIVE_VOICE_KEY) === "true");
      const sp = Number(localStorage.getItem(VOICE_SPEED_KEY));
      if (sp && !Number.isNaN(sp)) setPlaybackSpeed(sp);
    } catch {
      /* ignore */
    }
  }, []);

  const persistVoice = (id: string) => {
    setSelectedVoice(id);
    try {
      localStorage.setItem(VOICE_STORAGE_KEY, id);
    } catch {
      /* */
    }
  };
  const persistSpeed = (sp: number) => {
    setPlaybackSpeed(sp);
    try {
      localStorage.setItem(VOICE_SPEED_KEY, String(sp));
    } catch {
      /* */
    }
  };
  const setVoiceModeArmed = (on: boolean) => {
    setVoiceMode(on);
    try {
      localStorage.setItem(VOICE_MODE_KEY, String(on));
    } catch {
      /* */
    }
  };
  const setLiveVoiceArmed = (on: boolean) => {
    setLiveVoice(on);
    try {
      localStorage.setItem(LIVE_VOICE_KEY, String(on));
    } catch {
      /* */
    }
  };
  const handlePreview = (voice: GrokVoice) => {
    setPreviewingId(voice.id);
    speakWithBrowserTts(
      `Hi, I'm ${voice.name}. I'll be your RV Grok voice.`,
      {
        rate: playbackSpeed,
        onEnd: () => setPreviewingId(null),
      },
    );
    window.setTimeout(() => setPreviewingId(null), 3500);
  };

  const stats = useMemo(
    () => ({
      saved: countSaved(),
      chats: countGrokChats(),
    }),
    // re-read when opening More — parent remounts not needed; refresh on focus
    [sheet],
  );

  return (
    <>
    <SuitePage tab="more" adaptiveGlass={false}>
        <div className="mx-auto w-full max-w-lg space-y-4 px-3 pb-12 pt-3 sm:px-4">
          <header className="flex items-center justify-between gap-3">
            {onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate("rvfax")}
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[11px] font-bold text-white"
              >
                <ChevronLeft className="size-3.5" />
                Back
              </button>
            ) : (
              <span />
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-blue/45 bg-blue/15 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue">
              <Sparkles className="size-3" />
              v2.0 Beta
            </span>
          </header>

          {/* YOUR ACTIVITY — only real app surfaces */}
          <section>
            <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              YOUR ACTIVITY
            </p>
            <div className="grid grid-cols-3 gap-2">
              <ActivityTile
                label="Searches"
                sub="RvFax"
                icon={<Search className="size-5 text-blue" />}
                accent="blue"
                onClick={() => onNavigate?.("rvfax")}
              />
              <ActivityTile
                label="Saved RVs"
                sub={
                  stats.saved > 0 ? `${stats.saved} saved` : "Favorites"
                }
                icon={<Heart className="size-5 text-ruby" />}
                accent="ruby"
                onClick={() => onNavigate?.("rvfax")}
              />
              <ActivityTile
                label="Trips"
                sub="RvTrips"
                icon={<Route className="size-5 text-emerald-400" />}
                accent="green"
                onClick={() => onNavigate?.("rvtrips")}
              />
            </div>
          </section>

          {/* Quick tools */}
          <section>
            <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              TOOLS
            </p>
            <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
              <RowLink
                icon={<Volume2 className="size-4 text-ruby" />}
                title="RvGrok Voice Settings"
                sub="Live voice · hands-free · speaker · Helix & more"
                onClick={() => setVoiceOpen(true)}
              />
              <RowLink
                icon={<MessageSquare className="size-4 text-blue" />}
                title="Ask RvGrok"
                sub="Voice · chat · coach intel"
                onClick={() => onNavigate?.("rvgrok")}
              />
              <RowLink
                icon={<Landmark className="size-4 text-green" />}
                title="RvCal financing"
                sub="Payment · ZIP tax · lenders"
                onClick={() => onNavigate?.("rvcal")}
              />
              <RowLink
                icon={<MapIcon className="size-4 text-amber" />}
                title="RvTow match"
                sub="Truck · SUV · VIN decode"
                onClick={() => onNavigate?.("rvtow")}
                last
              />
            </div>
          </section>

          {/* TestFlight — no IAP prices (Apple 3.1.1) */}
          <section className="glass-prestige-gold relative overflow-hidden rounded-[1.25rem] p-4">
            <p className="text-[10px] font-bold tracking-[0.16em] text-amber">
              THIS BUILD
            </p>
            <p className="mt-1.5 text-[17px] font-bold leading-snug text-white">
              Full suite is open
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-white">
              Facts, Cal, Tow, Trips, and Grok are unlocked for evaluation. No
              in-app purchases in this version.
            </p>
            <div className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-amber/40 bg-amber/15">
              <Star className="size-4 text-amber" />
            </div>
          </section>

          {/* SUPPORT */}
          <section>
            <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              SUPPORT
            </p>
            <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
              <RowLink
                icon={<HelpCircle className="size-4 text-blue" />}
                title="Help & FAQ"
                sub="Common questions answered"
                onClick={() => setSheet("help")}
              />
              <RowLink
                icon={<MessageSquare className="size-4 text-ruby" />}
                title="Send Feedback"
                sub="Report issues or suggest features"
                onClick={() => setSheet("feedback")}
              />
              <a
                href="https://www.nhtsa.gov/recalls"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20">
                  <Landmark className="size-4 text-blue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-white">
                    NHTSA.gov — Official Recalls
                  </span>
                  <span className="block text-[11px] text-white">
                    Verify recalls directly with government
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-white" />
              </a>
            </div>
          </section>


          {/* NHTSA RECALL LOOKUP */}
          <section>
            <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              NHTSA RECALL LOOKUP
            </p>
            <div className="glass-prestige space-y-2.5 rounded-[1.25rem] p-3.5">
              <p className="text-[12px] leading-relaxed text-white">
                Live government data by year, make, and model — same feed as the
                VIN decoder.
              </p>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                    YEAR
                  </span>
                  <input
                    value={recallYear}
                    onChange={(e) => {
                      setRecallYear(e.target.value);
                      setRecallArmed(false);
                    }}
                    className="glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none"
                    inputMode="numeric"
                    maxLength={4}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                    MAKE
                  </span>
                  <input
                    value={recallMake}
                    onChange={(e) => {
                      setRecallMake(e.target.value);
                      setRecallArmed(false);
                    }}
                    className="glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold tracking-wide text-white">
                    MODEL
                  </span>
                  <input
                    value={recallModel}
                    onChange={(e) => {
                      setRecallModel(e.target.value);
                      setRecallArmed(false);
                    }}
                    className="glass-field w-full rounded-lg px-2 py-2 text-[13px] font-semibold text-white outline-none"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setRecallArmed(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue py-2.5 text-[13px] font-bold text-white"
              >
                Check NHTSA recalls
              </button>
              {recallArmed ? (
                <NhtsaRecallsPanel
                  year={recallYear}
                  make={recallMake}
                  model={recallModel}
                />
              ) : null}
            </div>
          </section>

          {/* LEGAL */}
          <section>
            <p className="mb-2 px-0.5 text-[10px] font-bold tracking-[0.16em] text-white/90">
              LEGAL & PRIVACY
            </p>
            <div className="glass-prestige overflow-hidden rounded-[1.25rem]">
              <a
                href="https://rvfox.app/privacy.html"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20">
                  <Shield className="size-4 text-blue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-white">
                    Privacy Policy
                  </span>
                  <span className="block text-[11px] text-white">
                    rvfox.app/privacy.html
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-white" />
              </a>
              <a
                href="https://rvfox.app/support.html"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20">
                  <HelpCircle className="size-4 text-blue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-white">
                    Support
                  </span>
                  <span className="block text-[11px] text-white">
                    rvfox.app/support.html
                  </span>
                </span>
                <ExternalLink className="size-4 shrink-0 text-white" />
              </a>
              <RowLink
                icon={<FileText className="size-4 text-white" />}
                title="Terms & Copyright"
                sub="© 2026 RVFAX. All rights reserved."
                onClick={() => setSheet("terms")}
              />
              <a
                href="mailto:contact@rvfox.app"
                className="flex w-full items-center gap-3 border-t border-white/10 px-3.5 py-3.5 text-left transition hover:bg-white/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue/20">
                  <Mail className="size-4 text-blue" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-white">
                    Contact
                  </span>
                  <span className="block text-[11px] text-white">
                    contact@rvfox.app
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-white" />
              </a>
            </div>
          </section>

          <footer className="space-y-1.5 px-1 pb-2 text-center text-[10px] leading-relaxed text-white">
            <p>© 2026 RVFAX · All Rights Reserved</p>
            <p>Recall data sourced from NHTSA.gov (U.S. Government)</p>
            <p>AI specs are estimates — always verify before purchase</p>
          </footer>
        </div>
    </SuitePage>
      {sheet ? (
        <InfoSheet id={sheet} onClose={() => setSheet(null)} />
      ) : null}
      <VoicePanel
        open={voiceOpen}
        onClose={() => {
          setVoiceOpen(false);
          stopBrowserTts();
          setPreviewingId(null);
        }}
        selectedId={selectedVoice}
        onSelect={persistVoice}
        voiceMode={voiceMode}
        onVoiceModeChange={setVoiceModeArmed}
        liveVoice={liveVoice}
        onLiveVoiceChange={setLiveVoiceArmed}
        playbackSpeed={playbackSpeed}
        onSpeedChange={persistSpeed}
        onPreview={handlePreview}
        previewingId={previewingId}
      />
    </>
  );
}

function ActivityTile({
  label,
  sub,
  icon,
  accent,
  onClick,
}: {
  label: string;
  sub: string;
  icon: React.ReactNode;
  accent: "blue" | "ruby" | "green";
  onClick: () => void;
}) {
  const bar =
    accent === "blue"
      ? "bg-blue"
      : accent === "ruby"
        ? "bg-ruby"
        : "bg-emerald-400";
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-prestige flex flex-col items-center rounded-[1.15rem] px-2 py-3.5 text-center transition active:scale-[0.98]"
    >
      <span className="mb-2">{icon}</span>
      <span className={cn("mb-1.5 h-0.5 w-6 rounded-full", bar)} />
      <span className="text-[12px] font-bold text-white">{label}</span>
      <span className="mt-0.5 text-[9px] text-white">{sub}</span>
    </button>
  );
}

function RowLink({
  icon,
  title,
  sub,
  onClick,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3.5 py-3.5 text-left transition hover:bg-white/5",
        !last && "border-b border-white/10",
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-white">{title}</span>
        <span className="block text-[11px] text-white">{sub}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-white" />
    </button>
  );
}

function InfoSheet({ id, onClose }: { id: SheetId; onClose: () => void }) {
  if (!id) return null;
  const copy = SHEETS[id];
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-[16px] font-bold text-white">{copy.title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>
      <div
        data-app-scroll
        className="rv-scroll flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="mx-auto max-w-lg space-y-3 text-[13px] leading-relaxed text-white">
          {copy.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

const SHEETS: Record<
  Exclude<SheetId, null>,
  { title: string; body: string[] }
> = {
  help: {
    title: "Help & FAQ",
    body: [
      "RvGrok — AI chat and live voice. Open Premium → RvGrok Voice Settings for speaker, Live Voice, and hands-free.",
      "RvFax — Year → make → model → floorplan search with brochure-style specs and class filters.",
      "RvCal — Purchase price slider, ZIP tax, credit bands (650–800+), and credit-aware lenders.",
      "RvTow — Truck/SUV catalog + NHTSA VIN decode for tow capacity checks.",
      "RvTrips — Lock your coach profile, enter addresses, route with OSRM, find free sewer dumps, and only see restrictions that match the path.",
      "Swipe left/right between tabs. Scroll up to hide header & footer chrome on iPhone.",
    ],
  },
  feedback: {
    title: "Send Feedback",
    body: [
      "Email contact@rvfox.app with bugs, coach data gaps, or feature ideas.",
      "Include: device, iOS/Android version, which tab, and what you expected.",
      "Toy hauler garage specs, Super C models, and highline diesel data improve fastest with real brochure notes from you.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "RVFAX stores preferences and saved RVs on your device (local storage). Chat history stays in-browser unless you clear it.",
      "Routing uses OSRM/geocode proxies; addresses are sent only to compute routes.",
      "Recall lookups use NHTSA. We do not sell personal data. Contact privacy@rvfox.app for CCPA requests.",
      "AI answers and specs are estimates — always verify with the manufacturer or a dealer before purchase.",
    ],
  },
  terms: {
    title: "Terms & Copyright",
    body: [
      "© 2026 RVFAX. All rights reserved.",
      "This app provides decision-support tools, not legal, financing, or safety guarantees.",
      "Lender rates and eligibility are curated estimates, not offers of credit.",
      "OSRM/OpenStreetMap data © contributors. NHTSA recall data © U.S. Government.",
    ],
  },
};
