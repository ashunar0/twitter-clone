// BE が返す統一 error レスポンスを FE で扱いやすい形に持ち込む layer。
// server/lib/errors.ts の ApiErrorBody と shape を揃えている (両側の乖離があれば手動で追従)。

export type ApiErrorCode =
  | "validation_failed"
  | "conflict"
  | "not_found"
  | "forbidden"
  | "internal";

export type ApiErrorBody = {
  code: ApiErrorCode;
  message: string;
  fields?: Record<string, string>;
};

// FE 側で throw / catch する error 型。code / status / fields で switch できる。
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;
  constructor(body: ApiErrorBody, status: number) {
    super(body.message);
    this.name = "ApiError";
    this.code = body.code;
    this.status = status;
    this.fields = body.fields;
  }
}

// Response を確認して、!ok なら body を parse して ApiError を throw する。
// body が壊れてる (JSON でない / 想定外) 場合は internal 扱いで throw する。
export async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  let body: ApiErrorBody;
  try {
    body = (await res.json()) as ApiErrorBody;
    if (typeof body?.code !== "string" || typeof body?.message !== "string") {
      throw new Error("invalid error body");
    }
  } catch {
    throw new ApiError(
      { code: "internal", message: `HTTP ${res.status}` },
      res.status,
    );
  }
  throw new ApiError(body, res.status);
}
