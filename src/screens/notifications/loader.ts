import type { QueryClient } from "@tanstack/react-query";
import { notificationsListOptions } from "@features/notifications/client/queries";

// /notifications 遷移時に通知一覧を prefetch する。
export async function loadNotifications(queryClient: QueryClient) {
  await queryClient.ensureQueryData(notificationsListOptions());
  return {};
}
