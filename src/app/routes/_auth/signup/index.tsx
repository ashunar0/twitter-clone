import { createFileRoute, redirect } from "@tanstack/react-router";

// /signup 単体は step1 (/signup/email) に飛ばす。wizard entry point。
export const Route = createFileRoute("/_auth/signup/")({
  beforeLoad: () => {
    throw redirect({ to: "/signup/email" });
  },
});
