import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Bird } from "lucide-react";
import { signUp } from "@features/users/client/auth-client";
import { signUpStep3Schema, type SignUpStep3 } from "@features/users/schema";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { Button } from "@/shared/ui/button";
import { toaster } from "@/shared/ui/toast";
import { useSignupWizard } from "./context";

// signup wizard step3: password 入力 + 最終 submit。ここまでで context に email/name/handle が揃っている。
// 成功で toast + queryClient.clear() → / への full reload。失敗は toast のみ (画面留まる)。
export function SignupStep3Screen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state, reset } = useSignupWizard();

  // 前 step 未入力の直リンク救済。email/name/handle いずれか欠けたら step1 に戻す。
  useEffect(() => {
    if (!state.email || !state.name || !state.handle) {
      navigate({ to: "/signup/email", replace: true });
    }
  }, [state.email, state.name, state.handle, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpStep3>({
    resolver: zodResolver(signUpStep3Schema),
    defaultValues: { password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!state.email || !state.name || !state.handle) return;
    // better-auth の signUp.email() に additionalFields (handle) を追加で流す。
    // client 型では未宣言なので cast、server 側 additionalFields 宣言と一致していれば通る。
    const result = await signUp.email({
      email: state.email,
      password: values.password,
      name: state.name,
      handle: state.handle,
    } as Parameters<typeof signUp.email>[0] & { handle: string });
    if (result.error) {
      toaster.create({
        type: "error",
        title: "登録に失敗しました",
        description: result.error.message ?? undefined,
      });
      return;
    }
    toaster.create({ type: "success", title: "登録しました" });
    reset();
    queryClient.clear();
    window.location.href = "/";
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">パスワードを決める</h1>
        <p className="text-sm text-fg-muted">Step 3 / 3</p>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-6"
        noValidate
      >
        <PasswordInput.Root>
          <PasswordInput.Label>パスワード</PasswordInput.Label>
          <PasswordInput.Control>
            <PasswordInput.Input
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <PasswordInput.VisibilityTrigger />
          </PasswordInput.Control>
          {errors.password ? (
            <span className="text-xs text-red-600 dark:text-red-400">
              {errors.password.message}
            </span>
          ) : null}
        </PasswordInput.Root>
        <Button
          type="submit"
          className="font-bold"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          アカウント作成
        </Button>
      </form>
      <p className="text-sm text-fg-muted">
        アカウントをお持ちなら{" "}
        <Link to="/signin" className="font-medium text-blue-600 underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
