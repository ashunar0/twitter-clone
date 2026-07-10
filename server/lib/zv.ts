import { zValidator as origZValidator } from "@hono/zod-validator";
import type { ZodType } from "zod";
import { ApiError } from "./errors";

// 全 endpoint 共通の zValidator wrapper。失敗時に ApiError.validationFailed に変換する。
// zod の issues を { field名: メッセージ } に flatten して fields に載せる (1 field 1 メッセージ、後勝ち)。
// hook は zod-validator 純正の 3rd 引数、result.success=false で throw すれば onError に流れる。
export function zv<T extends ZodType, Target extends "json" | "query" | "param" | "form" | "header" | "cookie">(
  target: Target,
  schema: T,
) {
  return origZValidator(target, schema, (result) => {
    if (result.success) return;
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      // path は ["body"] や ["handle"] のような配列、"." で join して 1 key に。
      const key = issue.path.length ? issue.path.join(".") : "_";
      fields[key] = issue.message;
    }
    throw ApiError.validationFailed(fields, "invalid input");
  });
}
