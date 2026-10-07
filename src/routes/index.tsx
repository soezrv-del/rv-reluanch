import { createFileRoute } from "@tanstack/react-router";
import { AccessProvider } from "@/components/access/AccessProvider";
import { NdaGate } from "@/components/access/NdaGate";
import { AppShell } from "@/components/shell/AppShell";
import { HOME_THEME_COLOR } from "@/lib/theme";

export const Route = createFileRoute("/")({
  // Home is the dark showroom: Safari 15-18 tint the status bar / toolbar
  // from theme-color at load, so the server HTML carries the dark one
  // (replaces the root's light #ffffff; same name, deepest route wins).
  head: () => ({
    meta: [{ name: "theme-color", content: HOME_THEME_COLOR }],
  }),
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
