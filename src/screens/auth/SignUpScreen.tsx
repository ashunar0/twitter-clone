import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Bird } from "lucide-react";
import { signUp } from "@features/users/client/auth-client";
import { signUpWireSchema, type SignUpWire } from "@features/users/schema";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { Button } from "@/shared/ui/button";
import { toaster } from "@/shared/ui/toast";

// signup 画面。RHF + zodResolver で client-side validate、better-auth の signUp.email() で session cookie を発行。
// 成功時は queryClient.clear() → / への full reload で cookie 反映と router state を同期する。
export function SignUpScreen() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpWire>({
    resolver: zodResolver(signUpWireSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // submit handler。better-auth 呼び出し → 成功で toast + full reload、失敗で toast だけ。
  const onSubmit = handleSubmit(async (values) => {
    const result = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });
    if (result.error) {
      toaster.create({
        type: "error",
        title: "登録に失敗した",
        description: result.error.message ?? undefined,
      });
      return;
    }
    toaster.create({ type: "success", title: "登録しました" });
    queryClient.clear();
    window.location.href = "/";
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">Twitter に登録</h1>
      </div>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-6"
        noValidate
      >
        <Field.Root invalid={!!errors.name}>
          <Field.Label>名前</Field.Label>
          <Field.Input
            autoComplete="name"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name ? (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          ) : null}
        </Field.Root>
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
    </div>
  );
}
