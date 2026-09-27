import type { ShareReport } from "./shareReport.ts";
import { buildShareReportPdf, shareReportPdfName } from "./shareReportPdf.ts";

export function isShareAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  if (name === "AbortError") return true;
  const message = "message" in error ? String(error.message) : "";
  return /AbortError|cancel/i.test(message);
}

export function reportAbsoluteUrl(path: string): string {
  return new URL(path, window.location.origin).href;
}

export async function shareReportLink(
  report: ShareReport,
): Promise<"shared" | "copied" | "aborted" | "failed"> {
  const url = reportAbsoluteUrl(report.path);
  const payload = {
    title: report.shareTitle,
    text: report.shareText,
    url,
  };
  if (typeof navigator.share === "function") {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (isShareAbortError(error)) return "aborted";
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

export async function shareReportPdfFile(
  report: ShareReport,
): Promise<"shared" | "downloaded" | "aborted" | "failed"> {
  const bytes = await buildShareReportPdf(report);
  const file = new File([new Uint8Array(bytes)], shareReportPdfName(report), {
    type: "application/pdf",
  });
  const payload = {
    files: [file],
    title: report.shareTitle,
    text: report.shareText,
  };
  const canShare =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(payload);
  if (canShare) {
    try {
      await navigator.share(payload);
      return "shared";
    } catch (error) {
      if (isShareAbortError(error)) return "aborted";
    }
  }
  try {
    const href = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = href;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(href);
    return "downloaded";
  } catch {
    return "failed";
  }
}
