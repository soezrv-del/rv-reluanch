import { createFileRoute } from "@tanstack/react-router";
import { CoachDetailScreen } from "@/components/CoachDetailScreen";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return <CoachDetailScreen />;
}
