import { Hono } from "hono";
import { tweetsService } from "./service";

const tweets = new Hono()
  // GET /api/tweets — 直近 tweets + author summary を返す (public timeline)。
  .get("/", async (c) => {
    const data = await tweetsService.list();
    return c.json(data);
  });

export default tweets;
