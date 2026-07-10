import { Hono } from "hono";
import { ApiError } from "../../../server/lib/errors";
import { zv } from "../../../server/lib/zv";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { updateProfileWireSchema } from "../schema";
import { usersService } from "./service";

const users = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/users/me — mock auth 済みの current user を返す。
  .get("/me", (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
  })
  // GET /api/users/by-handle/:handle — handle で 1 件取得、無ければ ApiError.notFound。
  .get("/by-handle/:handle", async (c) => {
    const handle = c.req.param("handle");
    const db = c.get("db");
    const user = await usersService.getByHandle(db, handle);
    if (!user) throw ApiError.notFound("user not found");
    return c.json(user);
  })
  // PUT /api/users/me — current user の name / handle を更新する。
  // handle 重複は 409 conflict + fields.handle、format NG は 400 validation_failed + fields。
  .put("/me", zv("json", updateProfileWireSchema), async (c) => {
    const input = c.req.valid("json");
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const updated = await usersService.updateProfile(db, currentUser.id, input);
    return c.json(updated);
  });

export default users;
