import { createFileRoute } from "@tanstack/react-router";
import { SignupStep3Screen } from "@/screens/auth/signup-wizard/SignupStep3Screen";

// step3 (/signup/password) は直リンク救済を Screen 側の useEffect でやる。
export const Route = createFileRoute("/_auth/signup/password/")({
  component: SignupStep3Screen,
});
