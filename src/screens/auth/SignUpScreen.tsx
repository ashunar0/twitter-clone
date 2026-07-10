import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { signUp } from "@features/users/client/auth-client";
import {
  emailSchema,
  passwordSchema,
  signUpWireSchema,
} from "@features/users/schema";
import { Button } from "@/shared/ui/button";

// signup 画面。better-auth の signUp.email() を叩き、成功で session cookie が発行される。
// signup 成功後は timeline (/) に redirect、cache を全消しして初期 fetch を走らせる。
export function SignUpScreen() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = signUpWireSchema.safeParse({ email, password, name });
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
    const result = await signUp.email({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
    });
    setPending(false);
    if (result.error) {
      setErrors({ _: result.error.message ?? "登録に失敗した" });
      return;
    }
    // session が確定したので stale cache を全消しして root から再 fetch させる。
    // TanStack Router navigate は session cookie 反映と race することがあるので full reload。
    queryClient.clear();
    window.location.href = "/";
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Sign up</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-neutral-700">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
            className="rounded border border-neutral-300 p-2"
          />
          {errors.name ? (
            <span className="text-xs text-red-600">{errors.name}</span>
          ) : null}
        </label>
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
            autoComplete="new-password"
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
          Create account
        </Button>
      </form>
      <div className="mt-4 text-sm text-neutral-600">
        すでに登録済なら{" "}
        <Link to="/signin" className="underline">
          Sign in
        </Link>
      </div>
    </main>
  );

  // schema import 未使用の警告を抑える (client-side pre-check 拡張時に使う想定)。
  void emailSchema;
  void passwordSchema;
}
