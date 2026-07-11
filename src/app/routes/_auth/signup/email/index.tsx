import { createFileRoute } from "@tanstack/react-router";
import { SignupStep1Screen } from "@/screens/auth/signup-wizard/SignupStep1Screen";

// step1 は wizard entry point なので guard 無し。email + name を受け取って context に stash する。
export const Route = createFileRoute("/_auth/signup/email/")({
  component: SignupStep1Screen,
});
