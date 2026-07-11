import { createFileRoute } from "@tanstack/react-router";
import { SignUpScreen } from "@/screens/auth/SignUpScreen";

export const Route = createFileRoute("/_auth/signup/")({
  component: SignUpScreen,
});
