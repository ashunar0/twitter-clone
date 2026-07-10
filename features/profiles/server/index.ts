import { Hono } from "hono";
import { ApiError } from "../../../server/lib/errors";
import { zv } from "../../../server/lib/zv";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { updateProfileWireSchema } from "../schema";
import { profilesService } from "./service";

const profiles = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/profiles/me — current user の profile を返す。
  .get("/me", async (c) => {
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const profile = await profilesService.getByUserId(db, currentUser.id);
    if (!profile) throw ApiError.notFound("profile not found");
    return c.json(profile);
  })
  // GET /api/profiles/by-handle/:handle — handle で 1 件取得、無ければ 404。
  .get("/by-handle/:handle", async (c) => {
    const handle = c.req.param("handle");
    const db = c.get("db");
    const profile = await profilesService.getByHandle(db, handle);
    if (!profile) throw ApiError.notFound("profile not found");
    return c.json(profile);
  })
  // PUT /api/profiles/me — 自分の profile (handle + name) を更新する。
  // handle 重複は 409 conflict + fields.handle、format NG は 400 validation_failed + fields。
  .put("/me", zv("json", updateProfileWireSchema), async (c) => {
    const input = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const updated = await profilesService.updateMe(db, currentUser.id, input);
    return c.json(updated);
  });

export default profiles;
