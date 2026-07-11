import { profilesService } from "../../features/profiles/server/service";
import type { OnboardingHooks } from "./auth";

// signup onboarding の cross-feature 配線。composition root 相当 —
// server/infra は features を組み合わせる唯一の場所として認めておく (features 同士は互いを知らない)。
// - handle 空き check → profiles service に委譲
// - user 作成後の profile 生成 → profiles service に委譲
export const onboardingHooks: OnboardingHooks = {
  ensureHandleAvailable: (db, handle) =>
    profilesService.ensureHandleAvailableForOnboard(db, handle),
  onUserCreated: (db, userId, handle) =>
    profilesService.onboardWithHandle(db, userId, handle),
};
