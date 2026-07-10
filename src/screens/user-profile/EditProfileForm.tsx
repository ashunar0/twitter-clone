import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Profile } from "@features/profiles/type";
import {
  handleSchema,
  nameSchema,
  type UpdateProfileWire,
} from "@features/profiles/schema";
import { useUpdateProfileMutation } from "@features/profiles/client/mutations";
import { ApiError } from "@/lib/hono/apiError";
import { Button } from "@/shared/ui/button";

// 自分の profile (handle + name) を編集する inline form。
// - client 側 zod で先に validate、失敗なら送らず inline エラー表示
// - server 400 (validation_failed) / 409 (conflict) は ApiError.fields を form に反映
// - handle が変わったら /u/新handle に redirect (現 URL の handle と乖離するため)
export function EditProfileForm({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const updateProfile = useUpdateProfileMutation();
  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // client 側 validate → server POST → success/error のいずれかを inline に反映。
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nameResult = nameSchema.safeParse(name);
    const handleResult = handleSchema.safeParse(handle);
    const local: Record<string, string> = {};
    if (!nameResult.success) local.name = nameResult.error.issues[0]?.message ?? "invalid";
    if (!handleResult.success) local.handle = handleResult.error.issues[0]?.message ?? "invalid";
    if (Object.keys(local).length) {
      setErrors(local);
      return;
    }
    setErrors({});
    if (!nameResult.success || !handleResult.success) return;
    const input: UpdateProfileWire = {
      name: nameResult.data,
      handle: handleResult.data,
    };
    updateProfile.mutate(input, {
      onSuccess: (updated) => {
        onDone();
        if (updated.handle !== profile.handle) {
          navigate({ to: "/u/$handle", params: { handle: updated.handle } });
        }
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          if (err.fields) {
            setErrors(err.fields);
            return;
          }
          setErrors({ _: err.message });
          return;
        }
        setErrors({ _: "更新に失敗した。もう一度。" });
      },
    });
  };

  const pending = updateProfile.isPending;

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
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
        <span className="text-sm text-neutral-700">Handle</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          disabled={pending}
          className="rounded border border-neutral-300 p-2 font-mono"
        />
        {errors.handle ? (
          <span className="text-xs text-red-600">{errors.handle}</span>
        ) : null}
      </label>
      {errors._ ? (
        <div className="text-sm text-red-600">{errors._}</div>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="text-sm text-neutral-600 hover:text-neutral-900"
          disabled={pending}
        >
          Cancel
        </button>
        <Button type="submit" disabled={pending} loading={pending}>
          Save
        </Button>
      </div>
    </form>
  );
}
