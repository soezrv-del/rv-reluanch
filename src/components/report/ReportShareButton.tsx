import { useState } from "react";
import { Link2, FileText, Share2 } from "lucide-react";
import type { ShareReport } from "@/lib/rv/shareReport";
import {
  shareReportLink,
  shareReportPdfFile,
} from "@/lib/rv/shareReportSend";

export function ReportShareButton({
  report,
  label = "Share",
}: {
  report: ShareReport | null;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const flash = (message: string | null) => {
    setToast(message);
    if (!message) return;
    window.setTimeout(() => setToast(null), 1800);
  };

  const onLink = async () => {
    if (!report || busy) return;
    setBusy(true);
    try {
      const out = await shareReportLink(report);
      if (out === "aborted") return;
      if (out === "copied") flash("Copied");
      else if (out === "shared") flash("Sent");
      else flash("Couldn’t share");
    } finally {
      setBusy(false);
    }
  };

  const onPdf = async () => {
    if (!report || busy) return;
    setBusy(true);
    try {
      const out = await shareReportPdfFile(report);
      if (out === "aborted") return;
      if (out === "downloaded") flash("PDF saved");
      else if (out === "shared") flash("Sent");
      else flash("Couldn’t share");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="report-share" data-report-share>
      <button
        type="button"
        className="report-share-main"
        disabled={!report}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Share2 className="size-4" />
        {label}
      </button>
      {open && report ? (
        <div className="report-share-menu" role="group" aria-label="Share report">
          <button type="button" onClick={() => void onLink()} data-share-link>
            <Link2 className="size-4" />
            Share link
          </button>
          <button type="button" onClick={() => void onPdf()} data-share-pdf>
            <FileText className="size-4" />
            Share PDF
          </button>
        </div>
      ) : null}
      {toast ? (
        <p className="report-share-toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
