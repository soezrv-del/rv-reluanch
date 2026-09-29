import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/access/client";

type KnowledgeRow = {
  key: { year: string; make: string; model: string; floorplan: string };
  promoted?: boolean;
};

/** Admin-only. Marks a saved coach as official catalog data. Does not edit brochures. */
export function PromoteCatalogCard() {
  const [rows, setRows] = useState<KnowledgeRow[]>([]);
  const [picked, setPicked] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void adminFetch("/api/access/admin")
      .then((res) => (res.ok ? res.json() : null))
      .then((body: { coachKnowledge?: KnowledgeRow[] } | null) => {
        setRows(Array.isArray(body?.coachKnowledge) ? body.coachKnowledge : []);
      })
      .catch(() => setRows([]));
  }, []);

  const promote = async () => {
    const row = rows.find((item) => rowId(item) === picked);
    if (!row) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const res = await adminFetch("/api/access/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promote-coach-knowledge",
          year: row.key.year,
          make: row.key.make,
          model: row.key.model,
          floorplan: row.key.floorplan,
        }),
      });
      const body = (await res.json()) as { error?: string; coachKnowledge?: KnowledgeRow[] };
      if (!res.ok) {
        setError(body.error || "Could not promote that coach.");
        return;
      }
      setRows(Array.isArray(body.coachKnowledge) ? body.coachKnowledge : rows);
      setNote("Promoted. Those saved values now count as catalog data.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not promote that coach.");
    } finally {
      setBusy(false);
    }
  };

  if (!rows.length) return null;
  return (
    <section className="glass-prestige space-y-3 rounded-[1.25rem] p-4" data-promote-catalog>
      <p className="text-[10px] font-bold tracking-[0.16em]">PROMOTE TO CATALOG</p>
      <ul className="space-y-2">
        {rows.map((row) => {
          const id = rowId(row);
          return (
            <li key={id} className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={picked === id}
                onChange={() => setPicked(picked === id ? "" : id)}
              />
              <span>
                {[row.key.year, row.key.make, row.key.model, row.key.floorplan]
                  .filter(Boolean)
                  .join(" ")}
                {row.promoted ? " · catalog" : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className="verified-from-web-btn w-full rounded-xl py-2.5 text-[13px] font-bold disabled:opacity-60"
        disabled={!picked || busy}
        onClick={() => void promote()}
      >
        {busy ? "Saving…" : "Promote to catalog"}
      </button>
      {note ? <p className="text-[12px]">{note}</p> : null}
      {error ? <p className="text-[12px] font-semibold text-ruby">{error}</p> : null}
    </section>
  );
}

function rowId(row: KnowledgeRow): string {
  return [row.key.year, row.key.make, row.key.model, row.key.floorplan].join("|");
}
