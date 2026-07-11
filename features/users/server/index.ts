import { Hono } from "hono";
import type { DbVariables } from "../../../server/infra/withDb";
import { getAuth } from "../../../server/infra/auth";
import { onboardingHooks } from "../../../server/infra/authOnboarding";

// features/users は "auth" ドメイン。better-auth の handler をここで request に流す。
// app.ts では `.route("/api/auth", users)` で mount する。
// per-request で c.env.BETTER_AUTH_SECRET を取り出して getAuth に渡す (Workers)。
// Node dev は secret 未設定でも better-auth が warn しつつ動く。
type WorkerEnv = { BETTER_AUTH_SECRET?: string };

const users = new Hono<{ Variables: DbVariables }>()
  .on(["POST", "GET"], "/*", (c) => {
    const db = c.get("db");
    const env = c.env as WorkerEnv | undefined;
    return getAuth(db, {
      secret: env?.BETTER_AUTH_SECRET,
      onboarding: onboardingHooks,
    }).handler(c.req.raw);
  });

export default users;
