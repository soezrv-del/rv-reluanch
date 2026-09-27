import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og/report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { renderReportOg } = await import("@/lib/rv/reportOgImage");
        return renderReportOg(request);
      },
    },
  },
});
