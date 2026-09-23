import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { adminFetch } from "@/lib/access/client";
import type {
  ResearchProvider,
  ResearchProviderStatus,
} from "@/lib/rvgrok/geminiResearch";

const OPTIONS = [
  ["gemini", "Gemini"],
  ["xai", "XAI"],
  ["auto", "Auto"],
] as const;

function savedNote(
  provider: ResearchProvider,
  status: ResearchProviderStatus | undefined,
): string {
  const effective = status?.effective === "xai" ? "XAI" : "Gemini";
  return provider === "auto"
    ? `Saved. Using deploy default — effective ${effective}.`
    : `Saved. Research now uses ${effective}.`;
}

/** Admin-only Gemini / XAI / Auto research toggle. Same card on ACCESS and in the list sheet. */
export function ResearchProviderCard({
  surface,
}: {
  surface: "more" | "sheet";
}) {
  const [research, setResearch] = useState<ResearchProviderStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setError("");
      try {
        const res = await adminFetch("/api/access/admin");
        const data = (await res.json()) as {
          researchProvider?: ResearchProviderStatus;
          error?: string;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(data.message || data.error || "Could not load.");
        }
        if (!cancelled) setResearch(data.researchProvider ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the research provider.",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelect = async (provider: ResearchProvider) => {
    setError("");
    setNote("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "PATCH",
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json()) as {
        researchProvider?: ResearchProviderStatus;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message || data.error || "Could not save.");
      }
      if (data.researchProvider) setResearch(data.researchProvider);
      setNote(savedNote(provider, data.researchProvider));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the research provider.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-research-provider
      data-research-provider-surface={surface}
      data-research-provider-override={research?.override ?? "auto"}
      data-research-provider-effective={research?.effective}
      className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Search className="size-4 text-amber" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.16em] text-white/90">
            RESEARCH PROVIDER
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/80">
            Browse / research only. Chat personality and Live Voice stay on xAI
            Grok.
          </p>
        </div>
      </div>
      <p
        data-research-provider-effective-label
        className="text-[12px] font-semibold text-white"
      >
        {research
          ? `Effective now: ${
              research.effective === "xai"
                ? "XAI web_search"
                : "Gemini (Google Search)"
            }${
              research.override
                ? ` · override ${research.override === "xai" ? "XAI" : "Gemini"}`
                : " · deploy default"
            }`
          : error
            ? "Effective now: unavailable"
            : "Effective now: …"}
      </p>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Research provider"
      >
        {OPTIONS.map(([value, label]) => {
          const selected = (research?.override ?? "auto") === value;
          return (
            <button
              key={value}
              type="button"
              data-research-provider-option={value}
              aria-pressed={selected}
              disabled={busy || !research}
              onClick={() => void onSelect(value)}
              className={`rounded-xl py-2.5 text-[12px] font-bold disabled:opacity-60 ${
                selected
                  ? "bg-blue text-white"
                  : "border border-white/20 bg-white/5 text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {note ? (
        <p
          data-research-provider-saved
          className="text-[12px] font-semibold text-white"
        >
          {note}
        </p>
      ) : null}
      {error ? (
        <p
          data-research-provider-error
          className="text-[12px] font-semibold text-ruby"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
