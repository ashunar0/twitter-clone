import { Hono } from "hono";
import { zv } from "../../../server/lib/zv";
import { createFollowWireSchema } from "../schema";
import { withCurrentUser, type AuthVariables } from "../../../server/infra/currentUser";
import { followsService } from "./service";
import { followUser } from "./usecases/followUser";

const follows = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // POST /api/follows — followUser usecase 経由 (follow 作成 + 通知発火)。
  .post("/", zv("json", createFollowWireSchema), async (c) => {
    const { followeeId } = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await followUser(db, currentUser.id, followeeId);
    return c.json({ ok: true }, 201);
  })
  // DELETE /api/follows/:userId — follow を外す (単一 feature 完結、usecase 不要)。
  .delete("/:userId", async (c) => {
    const followeeId = c.req.param("userId");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    await followsService.unfollow(db, currentUser.id, followeeId);
    return c.body(null, 204);
  })
  // GET /api/follows/counts/:userId — followers / following 数を返す。
  .get("/counts/:userId", async (c) => {
    const userId = c.req.param("userId");
    const db = c.get("db");
    const counts = await followsService.counts(db, userId);
    return c.json(counts);
  })
  // GET /api/follows/mine/:userId — current user が対象 user を follow しているか。
  .get("/mine/:userId", async (c) => {
    const userId = c.req.param("userId");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const isFollowing = await followsService.isFollowing(db, currentUser.id, userId);
    return c.json({ isFollowing });
  });

export default follows;
