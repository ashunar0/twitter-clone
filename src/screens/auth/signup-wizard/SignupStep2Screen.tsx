import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Bird, Check, X } from "lucide-react";
import { signUpStep2Schema, type SignUpStep2 } from "@features/users/schema";
import { handleSchema } from "@features/profiles/schema";
import { profilesRpc } from "@features/profiles/client/rpc";
import { Field } from "@/shared/ui/field";
import { Button } from "@/shared/ui/button";
import { useSignupWizard } from "./context";

// signup wizard step2: handle 入力 + availability check。
// - client-side format validate (handleSchema) が通ってから availability query を有効化
// - typing の間は debounce 400ms、確定した handle で /api/profiles/handle-availability を叩く
// - 空きなら ✓、使用中なら ✗ を inline 表示、「続ける」は format OK && available のみ enable
export function SignupStep2Screen() {
  const navigate = useNavigate();
  const { state, update } = useSignupWizard();

  // wizard 直リンク救済: step1 の入力 (email + name) が context に無ければ /signup/email へ戻す。
  // beforeLoad は React context を触れないので component 側で見張る。
  useEffect(() => {
    if (!state.email || !state.name) {
      navigate({ to: "/signup/email", replace: true });
    }
  }, [state.email, state.name, navigate]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpStep2>({
    resolver: zodResolver(signUpStep2Schema),
    mode: "onChange",
    defaultValues: { handle: state.handle ?? "" },
  });

  const handle = watch("handle");
  const formatOk = handleSchema.safeParse(handle).success;
  const debounced = useDebouncedValue(handle, 400);
  const availability = useQuery({
    // format 通過 & debounce 一致 の時だけ query 発火 (typing 中の無駄叩きを抑制)。
    queryKey: ["signup", "handle-availability", debounced],
    queryFn: () => profilesRpc.handleAvailability(debounced),
    enabled: formatOk && debounced === handle,
    staleTime: 30_000,
  });

  const isChecking = formatOk && (availability.isFetching || debounced !== handle);
  const available = availability.data?.available ?? null;

  const onSubmit = handleSubmit((values) => {
    // submit 時点で available が false なら弾く (button disabled の防衛的な二重チェック)。
    if (available === false) return;
    update({ handle: values.handle });
    navigate({ to: "/signup/password" });
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <Bird className="size-10" aria-hidden />
        <h1 className="text-2xl font-bold">ユーザー ID を決める</h1>
        <p className="text-sm text-fg-muted">Step 2 / 3</p>
      </div>
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-6" noValidate>
        <Field.Root invalid={!!errors.handle || available === false}>
          <Field.Label>ユーザー ID</Field.Label>
          <Field.Input
            autoComplete="username"
            placeholder="asahi_dev"
            disabled={isSubmitting}
            {...register("handle")}
          />
          {errors.handle ? (
            <Field.ErrorText>{errors.handle.message}</Field.ErrorText>
          ) : handle ? (
            <AvailabilityHint
              handle={handle}
              formatOk={formatOk}
              isChecking={isChecking}
              available={available}
            />
          ) : (
            <Field.HelperText>
              @ から始まる一意の識別子。URL や mention に使います。3〜15 文字の英数字と _。
            </Field.HelperText>
          )}
        </Field.Root>
        <Button
          type="submit"
          className="font-bold"
          disabled={isSubmitting || !formatOk || available !== true}
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

// availability の 4 状態 (empty / checking / available / taken) を短いテキストで表す。
function AvailabilityHint({
  handle,
  formatOk,
  isChecking,
  available,
}: {
  handle: string;
  formatOk: boolean;
  isChecking: boolean;
  available: boolean | null;
}) {
  if (!handle || !formatOk) return null;
  if (isChecking) {
    return <span className="text-xs text-fg-muted">確認中…</span>;
  }
  if (available === true) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
        <Check className="size-3" /> このユーザー ID は使えます
      </span>
    );
  }
  if (available === false) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
        <X className="size-3" /> このユーザー ID は使われています
      </span>
    );
  }
  return null;
}

// 汎用 debounce hook。value 変化から delay 経過後に反映する。
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
