import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createTweetWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { tweetsService } from "./service";

const tweets = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/tweets — 直近 tweets + author summary + likeState を返す。
  .get("/", async (c) => {
    const currentUser = c.get("currentUser");
    const data = await tweetsService.list(currentUser.id);
    return c.json(data);
  })
  // POST /api/tweets — current user 名義で 1 件作成、作成された Tweet を返す。
  .post("/", zValidator("json", createTweetWireSchema), async (c) => {
    const input = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const tweet = await tweetsService.create(input, currentUser.id);
    return c.json(tweet, 201);
  });

export default tweets;
