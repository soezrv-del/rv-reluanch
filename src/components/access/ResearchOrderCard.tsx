import { useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import { adminFetch } from "@/lib/access/client";
import type { ResearchOrder, ResearchOrderStatus } from "@/lib/rvgrok/researchOrder";

const OPTIONS = [
  ["search-first", "Search first"],
  ["catalog-first", "Catalog first"],
] as const;

function savedNote(order: ResearchOrder): string {
  return order === "catalog-first"
    ? "Saved. Research now prefers brochure / Neon pins, live only on miss."
    : "Saved. Research now browses live first.";
}

function effectiveLabel(status: ResearchOrderStatus): string {
  const mode =
    status.effective === "catalog-first"
      ? "Catalog first (pins, then live on miss)"
      : "Search first (live browse)";
  return status.override
    ? `Effective now: ${mode} · override ${
        status.override === "catalog-first" ? "Catalog first" : "Search first"
      }`
    : `Effective now: ${mode} · deploy default`;
}

/** Admin-only search-first / catalog-first toggle. Same card on ACCESS and in the list sheet. */
export function ResearchOrderCard({
  surface,
}: {
  surface: "more" | "sheet";
}) {
  const [order, setOrder] = useState<ResearchOrderStatus | null>(null);
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
          researchOrder?: ResearchOrderStatus;
          error?: string;
          message?: string;
        };
        if (!res.ok) {
          throw new Error(data.message || data.error || "Could not load.");
        }
        if (!cancelled) setOrder(data.researchOrder ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load the research order.",
          );
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelect = async (next: ResearchOrder) => {
    setError("");
    setNote("");
    setBusy(true);
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "PATCH",
        body: JSON.stringify({ researchOrder: next }),
      });
      const data = (await res.json()) as {
        researchOrder?: ResearchOrderStatus;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.message || data.error || "Could not save.");
      }
      if (data.researchOrder) setOrder(data.researchOrder);
      setNote(savedNote(next));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the research order.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-research-order
      data-research-order-surface={surface}
      data-research-order-override={order?.override ?? "search-first"}
      data-research-order-effective={order?.effective ?? "search-first"}
      className="glass-prestige space-y-3 rounded-[1.25rem] p-4"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <ListOrdered className="size-4 text-amber" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.16em] text-white/90">
            RESEARCH ORDER
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-white/80">
            Live browse first while catalogs fill. Switch to catalogs first
            when compounding is ready — live still runs on a miss.
          </p>
        </div>
      </div>
      <p
        data-research-order-effective-label
        className="text-[12px] font-semibold text-white"
      >
        {order
          ? effectiveLabel(order)
          : error
            ? "Effective now: unavailable"
            : "Effective now: …"}
      </p>
      <div
        className="grid grid-cols-2 gap-2"
        role="group"
        aria-label="Research order"
      >
        {OPTIONS.map(([value, label]) => {
          const selected = (order?.override ?? "search-first") === value;
          return (
            <button
              key={value}
              type="button"
              data-research-order-option={value}
              aria-pressed={selected}
              disabled={busy || !order}
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
          data-research-order-saved
          className="text-[12px] font-semibold text-white"
        >
          {note}
        </p>
      ) : null}
      {error ? (
        <p
          data-research-order-error
          className="text-[12px] font-semibold text-ruby"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
