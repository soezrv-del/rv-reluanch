import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShareReportPage } from "@/components/report/ShareReportPage";
import { getSpec } from "@/lib/rv/catalog";
import { ensureCatalogLoaded } from "@/lib/rv/catalogLoad";
import {
  buildFactsShareReport,
  type ShareReport,
} from "@/lib/rv/shareReport";

type FactsSearch = {
  make: string;
  series: string;
  year: string;
  floorplan: string;
};

function searchText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export const Route = createFileRoute("/report/facts")({
  validateSearch: (search: Record<string, unknown>): FactsSearch => ({
    make: searchText(search.make),
    series: searchText(search.series),
    year: searchText(search.year),
    floorplan: searchText(search.floorplan),
  }),
  component: FactsReportRoute,
});

function FactsReportRoute() {
  const search = Route.useSearch();
  const [report, setReport] = useState<ShareReport | null>(null);
  const [pending, setPending] = useState(true);
  const [missing, setMissing] = useState<string | undefined>();

  useEffect(() => {
    let cancel = false;
    setPending(true);
    void (async () => {
      if (!search.year || !search.make || !search.series) {
        if (!cancel) {
          setReport(null);
          setMissing("This report link is missing a year, make, or series.");
          setPending(false);
        }
        return;
      }
      await ensureCatalogLoaded();
      const spec = getSpec(search.make, search.series);
      if (cancel) return;
      if (!spec) {
        setReport(null);
        setMissing("No RvFAX record for that coach.");
        setPending(false);
        return;
      }
      setReport(
        buildFactsShareReport({
          year: search.year,
          make: search.make,
          series: search.series,
          floorplan: search.floorplan,
          spec,
        }),
      );
      setMissing(undefined);
      setPending(false);
    })();
    return () => {
      cancel = true;
    };
  }, [search.floorplan, search.make, search.series, search.year]);

  return (
    <ShareReportPage report={report} pending={pending} missing={missing} />
  );
}
