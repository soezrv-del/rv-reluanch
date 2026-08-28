import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchRecallsViaApi,
  type NhtsaRecall,
  type NhtsaRecallsResult,
} from "@/lib/nhtsa/recalls";

export function NhtsaRecallsPanel({
  year,
  make,
  model,
  compact,
  className,
}: {
  year: string;
  make: string;
  model: string;
  compact?: boolean;
  className?: string;
}) {
  const [data, setData] = useState<NhtsaRecallsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = (bypass = false) => {
    if (!year || !make || !model) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    if (bypass) setData(null);
    fetchRecallsViaApi(year, make, model, ctrl.signal)
      .then((res) => {
        if (!res.ok) {
          setError(res.error);
          setData(null);
          return;
        }
        setData(res.data);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  };

  useEffect(() => {
    return load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, make, model]);

  const count = data?.recallCount ?? 0;
  const hasAlert = count > 0;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border px-4 py-3",
        hasAlert
          ? "border-ruby-border/50 bg-ruby-soft/40"
          : "border-emerald-400/30 bg-emerald-500/10",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={cn(
              "text-[10px] font-bold tracking-[0.14em]",
              hasAlert ? "text-ruby" : "text-emerald-300",
            )}
          >
            NHTSA LIVE RECALLS
          </p>
          <p className="mt-0.5 text-[12px] text-white">
            {year} {make} {model}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={loading}
          className="rounded-full border border-white/20 p-1.5 text-white hover:bg-white/10 disabled:opacity-50"
          aria-label="Refresh recalls"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
        </button>
      </div>

      {loading && !data ? (
        <p className="mt-2 flex items-center gap-2 text-[13px] text-white">
          <Loader2 className="size-4 animate-spin" />
          Checking NHTSA…
        </p>
      ) : error ? (
        <p className="mt-2 text-[13px] text-amber">{error}</p>
      ) : (
        <>
          <p
            className={cn(
              "mt-1 flex items-center gap-1.5 text-[15px] font-bold",
              hasAlert ? "text-ruby" : "text-emerald-300",
            )}
          >
            {hasAlert ? (
              <AlertTriangle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {hasAlert
              ? `${count} NHTSA campaign${count === 1 ? "" : "s"} on record`
              : "No NHTSA recalls found for this vehicle"}
          </p>

          {!compact && data && data.recalls.length > 0 ? (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {data.recalls.map((r) => (
                <RecallCard key={r.campaignNumber || r.summary.slice(0, 40)} r={r} />
              ))}
            </ul>
          ) : null}

          {compact && hasAlert && data ? (
            <ul className="mt-2 space-y-1.5">
              {data.recalls.slice(0, 2).map((r) => (
                <li
                  key={r.campaignNumber}
                  className="text-[11px] leading-snug text-white"
                >
                  <span className="font-bold text-ruby">
                    {r.campaignNumber || "Campaign"}
                  </span>
                  {" · "}
                  {r.component}
                </li>
              ))}
              {count > 2 ? (
                <li className="text-[11px] text-white">+{count - 2} more</li>
              ) : null}
            </ul>
          ) : null}

          {!compact && data && (data.defectCount ?? 0) > 0 ? (
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-[10px] font-bold tracking-[0.12em] text-amber">
                OWNER COMPLAINTS · {data.defectCount}
              </p>
              <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto">
                {(data.defects ?? []).slice(0, 5).map((d, i) => (
                  <li
                    key={d.odiNumber || `${d.date}-${i}`}
                    className="rounded-lg border border-white/10 bg-black/30 px-2.5 py-2 text-[11px] leading-snug text-white"
                  >
                    <span className="font-semibold text-amber">
                      {d.component || "Complaint"}
                    </span>
                    {d.crashFlag || d.fireFlag ? (
                      <span className="ml-1 text-ruby">
                        {d.crashFlag ? " · crash" : ""}
                        {d.fireFlag ? " · fire" : ""}
                      </span>
                    ) : null}
                    {d.summary ? (
                      <p className="mt-0.5 line-clamp-3 text-white/85">{d.summary}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}

      <a
        href="https://www.nhtsa.gov/recalls"
        target="_blank"
        rel="noreferrer"
        className={cn(
          "mt-2 inline-flex items-center gap-1 text-[12px] font-semibold",
          hasAlert ? "text-ruby" : "text-emerald-300",
        )}
      >
        Verify at NHTSA.gov <ExternalLink className="size-3" />
      </a>
    </section>
  );
}

function RecallCard({ r }: { r: NhtsaRecall }) {
  return (
    <li className="rounded-xl border border-white/12 bg-black/35 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ruby/90 px-2 py-0.5 text-[10px] font-bold text-white">
          {r.campaignNumber || "N/A"}
        </span>
        <span className="text-[11px] font-semibold text-white">{r.component}</span>
        {r.reportDate ? (
          <span className="text-[10px] text-white">{r.reportDate}</span>
        ) : null}
      </div>
      {r.summary ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-white">{r.summary}</p>
      ) : null}
      {r.consequence ? (
        <p className="mt-1 text-[11px] leading-relaxed text-amber">
          <span className="font-bold">Risk: </span>
          {r.consequence}
        </p>
      ) : null}
      {r.remedy ? (
        <p className="mt-1 text-[11px] leading-relaxed text-emerald-200">
          <span className="font-bold">Remedy: </span>
          {r.remedy}
        </p>
      ) : null}
    </li>
  );
}
