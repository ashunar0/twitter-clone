import { Hono } from "hono";
import { ApiError } from "../../../server/lib/errors";
import { zv } from "../../../server/lib/zv";
import { z } from "zod";
import { createTweetWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { tweetsService } from "./service";
import { decodeTweetCursor } from "./cursor";
import { createTweet } from "./usecases/createTweet";

// list の query param 検証。authorId で filter 可、cursor で seek pagination。
const listQuerySchema = z.object({
  authorId: z.string().optional(),
  cursor: z.string().optional(),
});

const tweets = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/tweets?authorId=&cursor=... — 1 page 分の tweets + author summary + likeState + nextCursor。
  .get("/", zv("query", listQuerySchema), async (c) => {
    const { authorId, cursor } = c.req.valid("query");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    // cursor 有りなら decode、壊れてたら 400。
    let decoded: { createdAt: string; id: string } | undefined;
    if (cursor) {
      const parsed = decodeTweetCursor(cursor);
      if (!parsed) throw ApiError.validationFailed({ cursor: "invalid cursor" });
      decoded = parsed;
    }
    const data = await tweetsService.list(db, currentUser.id, {
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
  });

export default tweets;
