import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bird } from "lucide-react";
import { signUpStep1Schema, type SignUpStep1 } from "@features/users/schema";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { useSignupWizard } from "./context";

// signup wizard step1: name + email 入力。context に stash して /signup/handle へ進む。
export function SignupStep1Screen() {
  const navigate = useNavigate();
  const { state, update } = useSignupWizard();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpStep1>({
    resolver: zodResolver(signUpStep1Schema),
    defaultValues: { name: state.name ?? "", email: state.email ?? "" },
  });

  // step の役割は「入力を context に保存 → 次 step へ navigate」だけ。
  const onSubmit = handleSubmit((values) => {
    update({ name: values.name, email: values.email });
    navigate({ to: "/signup/handle" });
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">アカウントを作成</h1>
        <p className="text-sm text-fg-muted">Step 1 / 3</p>
      </div>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-6" noValidate>
        <Field.Root invalid={!!errors.name}>
          <Field.Label>名前</Field.Label>
          <Field.Input
            autoComplete="name"
            placeholder="あさひ"
            disabled={isSubmitting}
            {...register("name")}
          />
          {errors.name ? (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          ) : (
            <Field.HelperText>
              ツイート横に表示される名前です。いつでも変更できます。
            </Field.HelperText>
          )}
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
        <Button
          type="submit"
          className="font-bold"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          続ける
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
