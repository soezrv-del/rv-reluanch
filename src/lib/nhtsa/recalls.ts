/**
 * Shared NHTSA recalls helpers (browser + types).
 * Server fetch lives in /api/nhtsa/recalls and /api/nhtsa/vin.
 */

export type NhtsaRecall = {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
  manufacturer: string;
};

export type NhtsaComplaint = {
  component: string;
  summary: string;
  date: string;
  crashFlag: boolean;
  fireFlag: boolean;
  odiNumber?: string;
};

export type NhtsaRecallsResult = {
  year: string;
  make: string;
  model: string;
  recalls: NhtsaRecall[];
  recallCount: number;
  defects?: NhtsaComplaint[];
  defectCount?: number;
  source: "nhtsa";
  fetchedAt: string;
  cached?: boolean;
  /** How the lookup resolved (exact vs parent broaden vs empty after try list) */
  searchNote?: string;
  triedQueries?: string[];
};

export type NhtsaRecallsResponse =
  | { ok: true; data: NhtsaRecallsResult }
  | { ok: false; error: string; status?: number; aborted?: boolean };

export function normalizeMakeModel(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

/** Client → /api/nhtsa/recalls */
export async function fetchRecallsViaApi(
  year: string,
  make: string,
  model: string,
  signal?: AbortSignal,
): Promise<NhtsaRecallsResponse> {
  const y = year.trim();
  const mk = normalizeMakeModel(make);
  const md = normalizeMakeModel(model);
  if (!y || !mk || !md) {
    return { ok: false, error: "Year, make, and model are required." };
  }

  try {
    const qs = new URLSearchParams({ year: y, make: mk, model: md });
    const resp = await fetch(`/api/nhtsa/recalls?${qs}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    const json = (await resp.json()) as
      | { data: NhtsaRecallsResult }
      | { error: string };

    if (!resp.ok || "error" in json) {
      return {
        ok: false,
        error:
          "error" in json && json.error
            ? json.error
            : `NHTSA recalls failed (${resp.status})`,
        status: resp.status,
      };
    }
    return { ok: true, data: json.data };
  } catch (e) {
    if (
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && e.name === "AbortError")
    ) {
      return { ok: false, error: "Request cancelled.", aborted: true };
    }
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Network error talking to NHTSA.",
    };
  }
}
