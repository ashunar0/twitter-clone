import { Hono } from "hono";
import { zv } from "../../../server/lib/zv";
import { createLikeWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { likesService } from "./service";

const likes = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // POST /api/likes — body の tweetId に current user 名義で like を追加。
  .post("/", zv("json", createLikeWireSchema), async (c) => {
    const { tweetId } = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await likesService.add(db, tweetId, currentUser.id);
    return c.json({ ok: true }, 201);
  })
  // DELETE /api/likes/:tweetId — current user の like を外す。
  .delete("/:tweetId", async (c) => {
    const tweetId = c.req.param("tweetId");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await likesService.remove(db, tweetId, currentUser.id);
    return c.body(null, 204);
  });

export default likes;
