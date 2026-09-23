import { useEffect, useState, type ReactNode } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { RvVideoLibraryCard } from "@/components/rvfax/RvVideoLibraryCard";
import { fetchRecallsViaApi, type NhtsaRecall } from "@/lib/nhtsa/recalls";
import { decodeVinViaApi } from "@/lib/nhtsa/decode";
import {
  fetchFactsMarketLive,
  factsMarketAverageUsd,
} from "@/lib/rv/factsMarketBands";
import { formatMoney } from "@/lib/rv/catalog";
import { getMockReviews } from "@/lib/rv/rvReviews";
import { mapReportRatings } from "@/lib/rv/reportRatings";
import { fetchJdPowerPublicEstimate } from "@/lib/rv/jdPowerPublic";
import { getSpec } from "@/lib/rv/catalog";
import { ensureCatalogLoaded } from "@/lib/rv/catalogLoad";
import { getMaintenanceSchedule } from "@/lib/rv/rvTypes";
import {
  extrasToOffer,
  GROK_EXTRA_PROMPTS,
  type GrokExtraCoach,
  type GrokExtraKind,
} from "@/lib/rvgrok/grokExtras";

type Phase = "prompt" | "hidden" | "loading" | "ready";

function PromptCard({
  kind,
  onYes,
  onNo,
}: {
  kind: GrokExtraKind;
  onYes: () => void;
  onNo: () => void;
}) {
  const copy = GROK_EXTRA_PROMPTS[kind];
  return (
    <section
      className="grok-frost rounded-[var(--radius-xl)] px-3.5 py-3"
      data-grok-extra={kind}
      data-grok-extra-phase="prompt"
    >
      <p className="text-[13px] font-semibold text-fg">{copy.title}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-muted">{copy.body}</p>
      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={onYes}
          className="inline-flex min-h-11 min-w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-[12px] font-bold text-fg"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={onNo}
          className="inline-flex min-h-11 min-w-16 items-center justify-center rounded-full border border-white/15 bg-transparent px-4 text-[12px] font-semibold text-muted"
        >
          No thanks
        </button>
      </div>
    </section>
  );
}

function ExtraShell({
  kind,
  children,
}: {
  kind: GrokExtraKind;
  children: ReactNode;
}) {
  return (
    <section
      className="grok-frost rounded-[var(--radius-xl)] px-3.5 py-3"
      data-grok-extra={kind}
      data-grok-extra-phase="ready"
    >
      {children}
    </section>
  );
}

function VideoExtra({
  coach,
  promptFirst,
  openNow,
}: {
  coach: GrokExtraCoach;
  promptFirst?: boolean;
  openNow?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(
    openNow || !promptFirst ? "ready" : "prompt",
  );
  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="video"
        onYes={() => setPhase("ready")}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <RvVideoLibraryCard
      year={coach.year || ""}
      make={coach.make || ""}
      model={coach.model || ""}
      floorplan={coach.floorplan}
      type={coach.type}
    />
  );
}

function NhtsaExtra({
  coach,
  openNow,
}: {
  coach: GrokExtraCoach;
  openNow?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(openNow ? "loading" : "prompt");
  const [rows, setRows] = useState<NhtsaRecall[]>([]);
  const [note, setNote] = useState("");

  async function onYes() {
    setPhase("loading");
    const res = await fetchRecallsViaApi(
      coach.year || "",
      coach.make || "",
      coach.model || "",
    );
    if (!res.ok) {
      setNote(res.error);
      setPhase("ready");
      return;
    }
    setRows(res.data.recalls.slice(0, 6));
    setNote(
      res.data.recalls.length
        ? `${res.data.recalls.length} campaign${res.data.recalls.length === 1 ? "" : "s"}`
        : "No campaigns on this year / make / model.",
    );
    setPhase("ready");
  }

  useEffect(() => {
    if (openNow) void onYes();
    // Named pick opens this card once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="nhtsa"
        onYes={() => void onYes()}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="nhtsa">
      <p className="text-[12px] font-semibold text-fg">NHTSA safety</p>
      {phase === "loading" ? (
        <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Looking up recalls
        </p>
      ) : (
        <>
          <p className="mt-1 text-[12px] text-muted">{note}</p>
          <ul className="mt-2 space-y-1.5">
            {rows.map((r, i) => (
              <li key={`${r.campaignNumber || i}`} className="text-[12px] text-fg">
                <span className="font-semibold">{r.component || "Recall"}</span>
                {r.campaignNumber ? ` · ${r.campaignNumber}` : ""}
              </li>
            ))}
          </ul>
          <a
            href="https://www.nhtsa.gov/recalls"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-muted underline"
          >
            nhtsa.gov <ExternalLink className="size-3" />
          </a>
        </>
      )}
    </ExtraShell>
  );
}

function MarketExtra({
  coach,
  openNow,
}: {
  coach: GrokExtraCoach;
  openNow?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(openNow ? "loading" : "prompt");
  const [line, setLine] = useState("");

  async function onYes() {
    setPhase("loading");
    const [res, jd] = await Promise.all([
      fetchFactsMarketLive({
        year: coach.year || "",
        make: coach.make || "",
        model: coach.model || "",
        floorplan: coach.floorplan,
      }),
      fetchJdPowerPublicEstimate({
        year: coach.year || "",
        make: coach.make || "",
        model: coach.model || "",
        floorplan: coach.floorplan,
      }).catch(() => ({
        ok: false as const,
        reason: "J.D. Power lookup failed",
        data: null,
      })),
    ]);
    const jdLine = jd.ok
      ? `J.D. Power average ${formatMoney(jd.data.averageRetail)}.`
      : "J.D. Power: unavailable.";
    if (res.status === "ready") {
      const avg = factsMarketAverageUsd(res.comps);
      setLine(
        avg > 0
          ? `${jdLine} Live listings average ${formatMoney(avg)}.`
          : `${jdLine} Live listings came back without an average.`,
      );
    } else if (res.status === "error") {
      setLine(`${jdLine} Live listings: ${res.error}`);
    } else {
      setLine(`${jdLine} Live listings: unavailable.`);
    }
    setPhase("ready");
  }

  useEffect(() => {
    if (openNow) void onYes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="market"
        onYes={() => void onYes()}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="market">
      <p className="text-[12px] font-semibold text-fg">Market bands</p>
      {phase === "loading" ? (
        <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Loading
        </p>
      ) : (
        <p className="mt-1 text-[12px] text-fg">{line}</p>
      )}
    </ExtraShell>
  );
}

function RatingsExtra({
  coach,
  openNow,
}: {
  coach: GrokExtraCoach;
  openNow?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(openNow ? "loading" : "prompt");
  const [lines, setLines] = useState<string[]>([]);

  async function onYes() {
    setPhase("loading");
    try {
      await ensureCatalogLoaded();
    } catch {
      /* thin index may still have the spec */
    }
    const ratings = mapReportRatings({
      make: coach.make,
      model: coach.model,
      year: coach.year,
    });
    const spec = getSpec(coach.make || "", coach.model || "");
    const next: string[] = [];
    const slot = (
      label: string,
      score: number | null | undefined,
    ) => {
      if (score == null || !Number.isFinite(score)) {
        next.push(`${label}: GAP`);
        return;
      }
      next.push(`${label}: ${score.toFixed(1)}`);
    };
    slot("Quality", ratings.quality.score);
    slot("Reliability", ratings.reliability.score);
    slot("Customer satisfaction", ratings.customerSatisfaction.score);
    const torque = spec?.torqueLbFt;
    const uvw = spec?.uvwLbs;
    if (
      typeof torque === "number" &&
      torque > 0 &&
      typeof uvw === "number" &&
      uvw > 0
    ) {
      const ratio = torque / uvw;
      next.push(
        `Torque ÷ UVW: ${ratio.toFixed(4)} (${torque} lb-ft ÷ ${uvw.toLocaleString("en-US")} lb)`,
      );
    } else {
      next.push("Torque ÷ UVW: GAP");
    }
    next.push("Torque ÷ dry weight: GAP");
    setLines(next);
    setPhase("ready");
  }

  useEffect(() => {
    if (openNow) void onYes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="ratings"
        onYes={() => void onYes()}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="ratings">
      <p className="text-[12px] font-semibold text-fg">Ratings</p>
      {phase === "loading" ? (
        <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Loading catalog ratings
        </p>
      ) : (
        <ul className="mt-2 space-y-1">
          {lines.map((line) => (
            <li key={line} className="text-[12px] text-fg">
              {line}
            </li>
          ))}
        </ul>
      )}
    </ExtraShell>
  );
}

function ReviewsExtra({ coach }: { coach: GrokExtraCoach }) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const reviews =
    phase === "ready"
      ? getMockReviews(coach.make || "", coach.model || "", 4.4).slice(0, 3)
      : [];

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="reviews"
        onYes={() => setPhase("ready")}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="reviews">
      <p className="text-[12px] font-semibold text-fg">Owner reviews</p>
      {reviews.length === 0 ? (
        <p className="mt-1 text-[12px] text-muted">No owner notes for this series.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {reviews.map((r) => (
            <li key={r.id} className="text-[12px] leading-snug text-fg">
              <span className="font-semibold">{r.title}</span>
              <span className="mt-0.5 block text-muted">
                {r.author} · {r.location}
              </span>
            </li>
          ))}
        </ul>
      )}
    </ExtraShell>
  );
}

function MaintenanceExtra({
  coach,
  openNow,
}: {
  coach: GrokExtraCoach;
  openNow?: boolean;
}) {
  const [phase, setPhase] = useState<Phase>(openNow ? "loading" : "prompt");
  const [lines, setLines] = useState<string[]>([]);
  const [note, setNote] = useState("");

  async function onYes() {
    setPhase("loading");
    try {
      await ensureCatalogLoaded();
    } catch {
      /* thin index still may have the spec */
    }
    const spec = getSpec(coach.make || "", coach.model || "");
    if (!spec) {
      setNote("Catalog miss — open Facts for the full schedule.");
      setLines([]);
      setPhase("ready");
      return;
    }
    const items = getMaintenanceSchedule(spec).slice(0, 8);
    setLines(items.map((m) => `${m.task} · ${m.interval}`));
    setNote(`${items.length} tasks`);
    setPhase("ready");
  }

  useEffect(() => {
    if (openNow) void onYes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNow]);

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="maintenance"
        onYes={() => void onYes()}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="maintenance">
      <p className="text-[12px] font-semibold text-fg">Maintenance</p>
      {phase === "loading" ? (
        <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Loading
        </p>
      ) : (
        <>
          <p className="mt-1 text-[12px] text-muted">{note}</p>
          <ul className="mt-2 space-y-1">
            {lines.map((line) => (
              <li key={line} className="text-[12px] text-fg">
                {line}
              </li>
            ))}
          </ul>
        </>
      )}
    </ExtraShell>
  );
}

function VinExtra() {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [vin, setVin] = useState("");
  const [note, setNote] = useState("");

  async function onDecode() {
    setPhase("loading");
    const res = await decodeVinViaApi(vin);
    if (!res.ok) {
      setNote(res.error);
      setPhase("ready");
      return;
    }
    const d = res.data;
    setNote(
      [d.year, d.make, d.model, d.vehicleType].filter(Boolean).join(" · ") ||
        "Decoded.",
    );
    setPhase("ready");
  }

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="vin"
        onYes={() => setPhase("ready")}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="vin">
      <p className="text-[12px] font-semibold text-fg">VIN decode</p>
      <div className="mt-2 flex gap-2">
        <input
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase())}
          placeholder="17-character VIN"
          className="min-h-11 flex-1 rounded-md border border-white/15 bg-black/30 px-2.5 text-[12px] text-fg outline-none"
        />
        <button
          type="button"
          onClick={() => void onDecode()}
          className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-3 text-[12px] font-bold text-fg"
        >
          Decode
        </button>
      </div>
      {phase === "loading" ? (
        <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Decoding
        </p>
      ) : note ? (
        <p className="mt-2 text-[12px] text-fg">{note}</p>
      ) : null}
    </ExtraShell>
  );
}

function ShareExtra({ coach }: { coach: GrokExtraCoach }) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [note, setNote] = useState("");

  async function onYes() {
    const line = [coach.year, coach.make, coach.model, coach.floorplan]
      .filter(Boolean)
      .join(" ");
    try {
      await navigator.clipboard.writeText(line);
      setNote(`Copied: ${line}`);
    } catch {
      setNote(line);
    }
    setPhase("ready");
  }

  if (phase === "hidden") return null;
  if (phase === "prompt") {
    return (
      <PromptCard
        kind="share"
        onYes={() => void onYes()}
        onNo={() => setPhase("hidden")}
      />
    );
  }
  return (
    <ExtraShell kind="share">
      <p className="text-[12px] font-semibold text-fg">Share</p>
      <p className="mt-1 text-[12px] text-fg">{note}</p>
    </ExtraShell>
  );
}

export function GrokExtrasRail({
  query,
  coach,
  offerVoiceExtras = false,
  voiceExtraStep,
  voiceExtraPick,
}: {
  query: string;
  coach: GrokExtraCoach | null | undefined;
  /** Live Voice spec card — show all five extras as prompts, do not auto-load. */
  offerVoiceExtras?: boolean;
  /** Retired drip index. Ignored. */
  voiceExtraStep?: number;
  /** Named pick. Only this card mounts, and it opens. */
  voiceExtraPick?: GrokExtraKind;
}) {
  const kinds = extrasToOffer({
    query,
    coach,
    offerVoiceExtras,
    voiceExtraStep,
    voiceExtraPick,
  });
  if (!kinds.length || !coach) return null;
  const openNow = Boolean(voiceExtraPick);
  return (
    <div className="mt-3 space-y-2" data-grok-extras="">
      {kinds.map((kind) => {
        if (kind === "ratings") {
          return <RatingsExtra key={kind} coach={coach} openNow={openNow} />;
        }
        if (kind === "video") {
          return (
            <VideoExtra
              key={kind}
              coach={coach}
              promptFirst={offerVoiceExtras && !openNow}
              openNow={openNow}
            />
          );
        }
        if (kind === "nhtsa") {
          return <NhtsaExtra key={kind} coach={coach} openNow={openNow} />;
        }
        if (kind === "market") {
          return <MarketExtra key={kind} coach={coach} openNow={openNow} />;
        }
        if (kind === "reviews") return <ReviewsExtra key={kind} coach={coach} />;
        if (kind === "maintenance") {
          return <MaintenanceExtra key={kind} coach={coach} openNow={openNow} />;
        }
        if (kind === "vin") return <VinExtra key={kind} />;
        return <ShareExtra key={kind} coach={coach} />;
      })}
    </div>
  );
}
