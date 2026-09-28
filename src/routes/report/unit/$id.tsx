import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ShareReportPage } from "@/components/report/ShareReportPage";
import {
  LOT_SNAPSHOT_URL,
  parseLotSnapshotJson,
} from "@/lib/lot/ownLotPage";
import {
  buildUnitShareReport,
  findLotUnit,
  reportShareIconLinks,
  type ShareReport,
} from "@/lib/rv/shareReport";

export const Route = createFileRoute("/report/unit/$id")({
  head: () => ({ links: reportShareIconLinks() }),
  component: UnitReportRoute,
});

function UnitReportRoute() {
  const { id } = Route.useParams();
  const [report, setReport] = useState<ShareReport | null>(null);
  const [pending, setPending] = useState(true);
  const [missing, setMissing] = useState<string | undefined>();

  useEffect(() => {
    let cancel = false;
    setPending(true);
    void (async () => {
      try {
        const res = await fetch(LOT_SNAPSHOT_URL, {
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) throw new Error("snapshot");
        const snap = parseLotSnapshotJson(await res.json());
        const unit = findLotUnit(snap.units, id);
        if (cancel) return;
        if (!unit) {
          setReport(null);
          setMissing("That stock number is not on the lot.");
        } else {
          setReport(buildUnitShareReport(unit));
          setMissing(undefined);
        }
      } catch {
        if (!cancel) {
          setReport(null);
          setMissing("The lot report could not be opened.");
        }
      } finally {
        if (!cancel) setPending(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  return (
    <ShareReportPage report={report} pending={pending} missing={missing} />
  );
}
