import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createTweetWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { tweetsService } from "./service";
import { createTweet } from "./usecases/createTweet";

// list の query param 検証。authorId で filter 可 (省略時は全 timeline)。
const listQuerySchema = z.object({ authorId: z.string().optional() });

const tweets = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/tweets?authorId=... — 直近 tweets + author summary + likeState を返す。
  .get("/", zValidator("query", listQuerySchema), async (c) => {
    const { authorId } = c.req.valid("query");
    const currentUser = c.get("currentUser");
    const data = await tweetsService.list(
      currentUser.id,
      authorId ? { authorId } : undefined,
    );
    return c.json(data);
  })
  // POST /api/tweets — current user 名義で 1 件作成、作成された Tweet を返す。
  // parentId 有りなら reply として usecase 側で親確認 + 通知発火。
  .post("/", zValidator("json", createTweetWireSchema), async (c) => {
    const input = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const tweet = await createTweet(input, currentUser.id);
    return c.json(tweet, 201);
  });

export default tweets;
