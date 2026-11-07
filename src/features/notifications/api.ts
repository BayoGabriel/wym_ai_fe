import { authRequest } from '../../shared/api/api-client';
import type { Paged } from '../assist/api/assist-api';

export type AppNotification = {
  id: string;
  event: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type NotificationList = Paged<AppNotification> & { unreadCount: number };

export const notificationsApi = {
  list: (params: { page?: number; limit?: number; unread?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.unread) qs.set('unread', 'true');
    const suffix = qs.size ? `?${qs}` : '';
    return authRequest<NotificationList>(`/api/v1/notifications${suffix}`);
  },
  unreadCount: () => authRequest<{ count: number }>('/api/v1/notifications/unread-count'),
  markRead: (id: string) =>
    authRequest<AppNotification>(`/api/v1/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () =>
    authRequest<{ updated: number }>('/api/v1/notifications/read-all', {
      method: 'POST',
      body: {},
    }),
};
