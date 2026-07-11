import { Hono } from "hono";
import { ApiError } from "../../../server/lib/errors";
import { zv } from "../../../server/lib/zv";
import { z } from "zod";
import { createTweetWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/infra/currentUser";
import type { StorageVariables } from "../../../server/infra/withStorage";
import type { DbVariables } from "../../../server/infra/withDb";
import { tweetsService } from "./service";
import { decodeTweetCursor } from "./cursor";
import { createTweet } from "./usecases/createTweet";
import { retweetTweet } from "./usecases/retweetTweet";
import { unretweetTweet } from "./usecases/unretweetTweet";

// list の query param 検証。authorId で filter 可、cursor で seek pagination。
const listQuerySchema = z.object({
  authorId: z.string().optional(),
  cursor: z.string().optional(),
});

const tweets = new Hono<{
  Variables: AuthVariables & DbVariables & StorageVariables;
}>()
  .use("*", withCurrentUser)
  // GET /api/tweets?authorId=&cursor=... — 1 page 分の tweets + author summary + likeState + nextCursor。
  .get("/", zv("query", listQuerySchema), async (c) => {
    const { authorId, cursor } = c.req.valid("query");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const storage = c.get("storage");
    // cursor 有りなら decode、壊れてたら 400。
    let decoded: { createdAt: string; id: string } | undefined;
    if (cursor) {
      const parsed = decodeTweetCursor(cursor);
      if (!parsed) throw ApiError.validationFailed({ cursor: "invalid cursor" });
      decoded = parsed;
    }
    const data = await tweetsService.list(db, storage, currentUser.id, {
      authorId,
      cursor: decoded,
    });
    return c.json(data);
  })
  // POST /api/tweets — current user 名義で 1 件作成、作成された Tweet を返す。
  // parentId 有りなら reply として usecase 側で親確認 + 通知発火。
  .post("/", zv("json", createTweetWireSchema), async (c) => {
    const input = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const tweet = await createTweet(db, input, currentUser.id);
    return c.json(tweet, 201);
  })
  // POST /api/tweets/:id/retweet — current user が元 tweet を RT する (冪等)。
  .post("/:id/retweet", async (c) => {
    const id = c.req.param("id");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await retweetTweet(db, id, currentUser.id);
    return c.json({ ok: true }, 201);
  })
  // DELETE /api/tweets/:id/retweet — current user の RT を外す (冪等、通知履歴は残す)。
  .delete("/:id/retweet", async (c) => {
    const id = c.req.param("id");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await unretweetTweet(db, id, currentUser.id);
    return c.body(null, 204);
  });

export default tweets;
