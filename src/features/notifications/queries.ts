import { notificationsApi } from './api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (unread?: boolean) => ['notifications', 'list', unread ?? 'all'] as const,
  unreadCount: ['notifications', 'unread-count'] as const,
};

export const notificationQueries = {
  list: (unread?: boolean) => ({
    queryKey: notificationKeys.list(unread),
    queryFn: () => notificationsApi.list({ limit: 15, unread }),
    refetchInterval: 30_000,
  }),
  unreadCount: {
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
  },
};
