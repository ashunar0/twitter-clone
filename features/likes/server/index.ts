import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createLikeWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { likesService } from "./service";

const likes = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // POST /api/likes — body の tweetId に current user 名義で like を追加。
  .post("/", zValidator("json", createLikeWireSchema), async (c) => {
    const { tweetId } = c.req.valid("json");
    const currentUser = c.get("currentUser");
    await likesService.add(tweetId, currentUser.id);
    return c.json({ ok: true }, 201);
  })
  // DELETE /api/likes/:tweetId — current user の like を外す。
  .delete("/:tweetId", async (c) => {
    const tweetId = c.req.param("tweetId");
    const currentUser = c.get("currentUser");
    await likesService.remove(tweetId, currentUser.id);
    return c.body(null, 204);
  });

export default likes;
