import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShareReportPage } from "@/components/report/ShareReportPage";
import { getSpec } from "@/lib/rv/catalog";
import { ensureCatalogLoaded } from "@/lib/rv/catalogLoad";
import {
  buildFactsShareReport,
  factsReportSearch,
  type FactsReportSearch,
  type ShareReport,
} from "@/lib/rv/shareReport";

export const Route = createFileRoute("/report/facts")({
  validateSearch: (search: Record<string, unknown>): FactsReportSearch =>
    factsReportSearch(search),
  head: ({ match }) => {
    const title = [match.search.year, match.search.make, match.search.series, match.search.floorplan]
      .filter((part) => part != null && String(part).trim())
      .join(" ");
    return { meta: [{ title: title || "RvFAX vehicle report" }] };
  },
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
