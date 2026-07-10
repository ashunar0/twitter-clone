import { createFileRoute } from "@tanstack/react-router";
import { SignUpScreen } from "@/screens/auth/SignUpScreen";

export const Route = createFileRoute("/signup/")({
  component: SignUpScreen,
});
