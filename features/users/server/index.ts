import { Hono } from "hono";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";

const users = new Hono<{ Variables: AuthVariables }>()
  .use("*", withCurrentUser)
  // GET /api/users/me — mock auth 済みの current user を返す。
  .get("/me", (c) => {
    const currentUser = c.get("currentUser");
    return c.json(currentUser);
  });

export default users;
