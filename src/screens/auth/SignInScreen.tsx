import { Bird } from "lucide-react";
import { Field } from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { Button } from "@/shared/ui/button";

// signin 画面。ロジックは未実装、UI 骨組みだけ。
export function SignInScreen() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">Bird にログイン</h1>
      </div>
      <form className="flex w-full flex-col gap-6">
        <Field.Root>
          <Field.Label>メールアドレス</Field.Label>
          <Field.Input type="email" placeholder="you@example.com" />
        </Field.Root>
        <PasswordInput.Root>
          <PasswordInput.Label>パスワード</PasswordInput.Label>
          <PasswordInput.Control>
            <PasswordInput.Input placeholder="••••••••" />
            <PasswordInput.VisibilityTrigger />
          </PasswordInput.Control>
        </PasswordInput.Root>
        <Button type="submit" className="font-bold">
          ログイン
        </Button>
      </form>
    </div>
  );
}
