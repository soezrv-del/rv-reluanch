import { createFileRoute } from "@tanstack/react-router";
import { AccessProvider } from "@/components/access/AccessProvider";
import { NdaGate } from "@/components/access/NdaGate";
import { AppShell } from "@/components/shell/AppShell";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <NdaGate>
      <AccessProvider>
        <AppShell />
      </AccessProvider>
    </NdaGate>
  );
}
