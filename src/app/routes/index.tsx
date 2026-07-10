import { createFileRoute } from "@tanstack/react-router";
import { TimelineScreen } from "@/screens/timeline/TimelineScreen";

export const Route = createFileRoute("/")({
  component: TimelineScreen,
});
