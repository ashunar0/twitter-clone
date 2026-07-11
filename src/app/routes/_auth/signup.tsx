import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SignupWizardProvider } from "@/screens/auth/signup-wizard/context";

// /signup 配下 (step1〜3) の layout。wizard 用の React Context を掛ける。
// URL に state を出したくない (password を含めない) ので in-memory のみ、refresh で state は失う。
export const Route = createFileRoute("/_auth/signup")({
  component: SignupLayout,
});

function SignupLayout() {
  return (
    <SignupWizardProvider>
      <Outlet />
    </SignupWizardProvider>
  );
}
