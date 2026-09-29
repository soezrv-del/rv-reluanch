import { useEffect, useState } from "react";
import {
  knowledgeDisplayRows,
  type KnowledgeDisplayRow,
} from "@/lib/rvgrok/coachKnowledgeDisplay";
import { VerifiedFromWeb } from "./VerifiedFromWeb";

/**
 * Saved rvgrok_coach_knowledge for this coach.
 * Brochure rows stay on their own labels. This block is only the sidecar.
 */
export function CoachKnowledgeFacts({
  year,
  make,
  model,
  floorplan,
}: {
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
}) {
  const [rows, setRows] = useState<KnowledgeDisplayRow[]>([]);

  useEffect(() => {
    const y = String(year ?? "").trim();
    const mk = String(make ?? "").trim();
    const md = String(model ?? "").trim();
    if (!y || !mk || !md) {
      setRows([]);
      return;
    }
    let cancel = false;
    const params = new URLSearchParams({
      knowledge: "1",
      year: y,
      make: mk,
      model: md,
      floorplan: String(floorplan ?? ""),
    });
    void fetch(`/api/rvgrok/web-research?${params.toString()}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { rows?: KnowledgeDisplayRow[] } | null) => {
        if (!cancel) setRows(Array.isArray(body?.rows) ? body.rows : []);
      })
      .catch(() => {
        if (!cancel) setRows([]);
      });
    return () => {
      cancel = true;
    };
  }, [year, make, model, floorplan]);

  if (!rows.length) return null;
  return (
    <div className="coach-knowledge-facts mt-4 border-t border-current/15 pt-3" data-coach-knowledge>
      {rows.map((row) => (
        <div
          key={row.field}
          className="flex items-baseline justify-between gap-4 border-b border-current/10 py-2.5 last:border-0"
          data-coach-knowledge-field={row.field}
        >
          <span className="text-[13px] font-medium uppercase tracking-[0.08em]">
            {row.label}
          </span>
          <span className="inline-flex max-w-[68%] flex-wrap items-center justify-end gap-2 text-right text-[14px] font-medium">
            {row.value}
            {row.verified ? (
              <VerifiedFromWeb sourceUrl={row.sourceUrl} foundAt={row.foundAt} />
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}
