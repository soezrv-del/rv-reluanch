import { createFileRoute } from "@tanstack/react-router";
import { CoachDetailScreen } from "@/components/CoachDetailScreen";

export const Route = createFileRoute("/coach/cornerstone-45d")({
  component: CoachDetailScreen,
});
