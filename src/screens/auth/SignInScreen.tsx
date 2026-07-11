import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Bird } from "lucide-react";
import { signIn } from "@features/users/client/auth-client";
import { signInWireSchema, type SignInWire } from "@features/users/schema";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { Button } from "@/shared/ui/button";
import { toaster } from "@/shared/ui/toast";

// signin 画面。RHF + zodResolver で client-side validate、better-auth の signIn.email() で cookie session を確立。
// session cookie 反映と TanStack Router navigate が race するので成功時は full reload で / へ。
// 成否は toaster で通知、field-level validation は Field.ErrorText で inline 表示。
export function SignInScreen() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInWire>({
    resolver: zodResolver(signInWireSchema),
    defaultValues: { email: "", password: "" },
  });

  // submit handler。better-auth 呼び出し → 成功で toast + full reload、失敗で toast だけ。
  const onSubmit = handleSubmit(async (values) => {
    const result = await signIn.email({
      email: values.email,
      password: values.password,
    });
    if (result.error) {
      toaster.create({
        type: "error",
        title: "ログインに失敗した",
        description: result.error.message ?? undefined,
      });
      return;
    }
    toaster.create({ type: "success", title: "ログインしました" });
    queryClient.clear();
    window.location.href = "/";
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">Bird にログイン</h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-6"
        noValidate
      >
        <Field.Root invalid={!!errors.email}>
          <Field.Label>メールアドレス</Field.Label>
          <Field.Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
            {...register("email")}
          />
          {errors.email ? (
            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
          ) : null}
        </Field.Root>
        <PasswordInput.Root>
          <PasswordInput.Label>パスワード</PasswordInput.Label>
          <PasswordInput.Control>
            <PasswordInput.Input
              placeholder="••••••••"
              autoComplete="current-password"
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
          ログイン
        </Button>
      </form>
    </div>
  );
}
