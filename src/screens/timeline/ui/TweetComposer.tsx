import { useState, type FormEvent } from "react";
import { Button } from "@/shared/ui/button";
import { useCurrentUserQuery } from "@features/users/client/queries";
import { useCreateTweetMutation } from "@features/tweets/client/mutations";

const MAX_LENGTH = 280;

// 投稿フォーム。current user が取れるまで disabled。
export function TweetComposer() {
  const currentUserQuery = useCurrentUserQuery();
  const currentUser = currentUserQuery.data;
  const createTweet = useCreateTweetMutation(currentUser!);

  const [body, setBody] = useState("");
  const disabled = !currentUser || body.trim().length === 0 || createTweet.isPending;

  // form submit を止めて mutation を発火、成功したら textarea をクリア。
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled || !currentUser) return;
    createTweet.mutate(
      { body: body.trim() },
      { onSuccess: () => setBody("") },
    );
  };

  return (
    <form onSubmit={onSubmit} className="mb-6 flex flex-col gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={currentUser ? "What's happening?" : "Loading…"}
        maxLength={MAX_LENGTH}
        rows={3}
        disabled={!currentUser}
        className="w-full rounded-lg border border-neutral-300 p-3 focus:border-neutral-500 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {body.length}/{MAX_LENGTH}
        </span>
        <Button type="submit" disabled={disabled} loading={createTweet.isPending}>
          Tweet
        </Button>
      </div>
      {createTweet.isError ? (
        <div className="text-sm text-red-600">投稿に失敗した。もう一度。</div>
      ) : null}
    </form>
  );
}
