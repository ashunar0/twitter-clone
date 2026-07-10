import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { signIn } from "@features/users/client/auth-client";
import { signInWireSchema } from "@features/users/schema";
import { Button } from "@/shared/ui/button";

// signin 画面。better-auth の signIn.email() で cookie session を確立、成功で timeline へ。
export function SignInScreen() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signInWireSchema.safeParse({ email, password });
    if (!parsed.success) {
      const local: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        local[issue.path[0] as string] = issue.message;
      }
      setErrors(local);
      return;
    }
    setErrors({});
    setPending(true);
    const result = await signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setPending(false);
    if (result.error) {
      setErrors({ _: result.error.message ?? "ログインに失敗した" });
      return;
    }
    queryClient.clear();
    // session cookie 確立を確実に反映させるため full reload で / へ (TanStack Router navigate が race する)。
    window.location.href = "/";
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
            autoComplete="email"
            className="rounded border border-neutral-300 p-2"
          />
          {errors.email ? (
            <span className="text-xs text-red-600">{errors.email}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={pending}
            autoComplete="current-password"
            className="rounded border border-neutral-300 p-2"
          />
          {errors.password ? (
            <span className="text-xs text-red-600">{errors.password}</span>
          ) : null}
        </label>
        {errors._ ? (
          <div className="text-sm text-red-600">{errors._}</div>
        ) : null}
        <Button type="submit" disabled={pending} loading={pending}>
          Sign in
        </Button>
      </form>
      <div className="mt-4 text-sm text-neutral-600">
        アカウントがないなら{" "}
        <Link to="/signup" className="underline">
          Sign up
        </Link>
      </div>
    </main>
  );
}
