import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import { usersService } from "./service";

const users = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/users/me — mock auth 済みの current user を返す。
  .get("/me", (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
  })
  // GET /api/users/by-handle/:handle — handle で 1 件取得、404 は HTTPException で。
  .get("/by-handle/:handle", async (c) => {
    const handle = c.req.param("handle");
    const user = await usersService.getByHandle(handle);
    if (!user) throw new HTTPException(404, { message: "user not found" });
    return c.json(user);
  });

export default users;
