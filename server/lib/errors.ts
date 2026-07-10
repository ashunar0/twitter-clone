import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

// 統一 error レスポンスの body 形。全 endpoint がこの shape で 4xx/5xx を返す。
// - code: 機械可読の分類 (FE で switch する)
// - message: 人間向け 1 行 (toast にそのまま出せる)
// - fields: validation_failed の時だけ、field 名 → メッセージの map
export type ApiErrorBody = {
  code:
    | "validation_failed"
    | "conflict"
    | "not_found"
    | "forbidden"
    | "internal";
  message: string;
  fields?: Record<string, string>;
};

const CODE_TO_STATUS = {
  validation_failed: 400,
  conflict: 409,
  not_found: 404,
  forbidden: 403,
  internal: 500,
} as const satisfies Record<ApiErrorBody["code"], number>;

// throw して onError で捕まえる。route / usecase / service から使う。
export class ApiError extends Error {
  readonly body: ApiErrorBody;
  readonly status: number;
  constructor(body: ApiErrorBody) {
    super(body.message);
    this.body = body;
    this.status = CODE_TO_STATUS[body.code];
  }
  // 入力形式 NG (zod 失敗 or 明示的な bad request)。fields を必ず付ける想定。
  static validationFailed(
    fields: Record<string, string>,
    message = "invalid input",
  ) {
    return new ApiError({ code: "validation_failed", message, fields });
  }
  // 業務ルール違反 (self-follow, handle 重複, など)。fields は任意。
  static conflict(message: string, fields?: Record<string, string>) {
    return new ApiError({ code: "conflict", message, fields });
  }
  // resource が見つからない。
  static notFound(message: string) {
    return new ApiError({ code: "not_found", message });
  }
  // 認可不足。今は未使用、auth 導入時に。
  static forbidden(message: string) {
    return new ApiError({ code: "forbidden", message });
  }
}

// Hono の app.onError に登録するグローバルハンドラ。
// - ApiError → その body / status で返す
// - HTTPException → shape に reshape (message はそのまま、code は status から推定)
// - それ以外 → internal 500 で fallback (message は開発中のみ露出)
export function apiErrorHandler(err: Error, c: Context) {
  if (err instanceof ApiError) {
    return c.json(err.body, err.status as 400 | 403 | 404 | 409 | 500);
  }
  if (err instanceof HTTPException) {
    const status = err.status;
    const code = statusToCode(status);
    const body: ApiErrorBody = {
      code,
      message: err.message || defaultMessage(code),
    };
    return c.json(body, status);
  }
  console.error("[unhandled]", err);
  const body: ApiErrorBody = {
    code: "internal",
    message: "internal server error",
  };
  return c.json(body, 500);
}

// HTTP status から code へのざっくり対応 (HTTPException 経由の互換用)。
function statusToCode(status: number): ApiErrorBody["code"] {
  if (status === 400) return "validation_failed";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  return "internal";
}

function defaultMessage(code: ApiErrorBody["code"]): string {
  return code.replace(/_/g, " ");
}
