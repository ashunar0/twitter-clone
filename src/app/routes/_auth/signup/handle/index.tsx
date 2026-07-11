import { createFileRoute } from "@tanstack/react-router";
import { SignupStep2Screen } from "@/screens/auth/signup-wizard/SignupStep2Screen";

// step2 (/signup/handle) は step1 の入力が context に無いと意味がない。
// beforeLoad は React context を触れないので、SignupStep2Screen 内の useEffect で redirect する。
export const Route = createFileRoute("/_auth/signup/handle/")({
  component: SignupStep2Screen,
});
