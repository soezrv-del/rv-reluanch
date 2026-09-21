import { createFileRoute } from "@tanstack/react-router";
import { AccessProvider } from "@/components/access/AccessProvider";
import { NdaGate } from "@/components/access/NdaGate";
import { AppShell } from "@/components/shell/AppShell";

export const Route = createFileRoute("/lot")({
  component: LotPage,
});

function LotPage() {
  return (
    <NdaGate>
      <AccessProvider>
        <AppShell initialTab="rvlot" />
      </AccessProvider>
    </NdaGate>
  );
}
