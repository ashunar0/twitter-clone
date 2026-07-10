import { Hono } from "hono";
import { ApiError } from "../../../server/lib/errors";
import { withCurrentUser, type AuthVariables } from "../../../server/lib/currentUser";
import type { StorageVariables } from "../../../server/lib/withStorage";
import type { DbVariables } from "../../../server/lib/withDb";
import { mediaService } from "./service";

// media sub-app。multipart form の file を受けて storage に put + media 行を作る。
const media = new Hono<{
  Variables: AuthVariables & DbVariables & StorageVariables;
}>()
  .use("*", withCurrentUser)
  // POST /api/media — multipart form (field=file) を受けて、upload record を返す。
  .post("/", async (c) => {
    const form = await c.req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      throw ApiError.validationFailed({ file: "file is required" });
    }
    const currentUser = c.get("currentUser");
    const db = c.get("db");
    const storage = c.get("storage");
    const wire = await mediaService.upload(db, storage, file, currentUser.id);
    return c.json(wire, 201);
  });

export default media;
