import { createFileRoute } from "@tanstack/react-router";
import { SignInScreen } from "@/screens/auth/SignInScreen";

export const Route = createFileRoute("/signin/")({
  component: SignInScreen,
});
