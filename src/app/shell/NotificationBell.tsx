import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Popover from '@radix-ui/react-popover';
import { Bell, CalendarDays, CheckCheck, FileInput, ListChecks, UserRound, Headset } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { notificationKeys, notificationQueries } from '../../features/notifications/queries';
import { notificationsApi, type AppNotification } from '../../features/notifications/api';
import { EmptyState } from '../../shared/components/States';

const EVENT_ICON: Record<string, typeof Bell> = {
  'lead.created': UserRound,
  'handoff.requested': Headset,
  'appointment.requested': CalendarDays,
  'flow.instance.submitted': FileInput,
  'flow.step.advanced': ListChecks,
  'flow.task.reminder': ListChecks,
};

function NotificationRow({ n, onOpen }: { n: AppNotification; onOpen: (n: AppNotification) => void }) {
  const Icon = EVENT_ICON[n.event] ?? Bell;
  return (
    <button className={`notif-row${n.readAt ? '' : ' is-unread'}`} onClick={() => onOpen(n)}>
      <span className="notif-row__icon">
        <Icon size={14} />
      </span>
      <span className="notif-row__body">
        <span className="notif-row__title">{n.title}</span>
        {n.body && <span className="notif-row__text">{n.body}</span>}
        <span className="notif-row__time">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
      </span>
      {!n.readAt && <span className="notif-row__dot" aria-label="Unread" />}
    </button>
  );
}

export function NotificationBell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const count = useQuery(notificationQueries.unreadCount);
  const list = useQuery({ ...notificationQueries.list(), enabled: (count.data?.count ?? 0) >= 0 });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });

  const open = (n: AppNotification) => {
    if (!n.readAt) markRead.mutate(n.id);
    if (n.link) navigate(n.link);
  };

  const unread = count.data?.count ?? 0;

  return (
    <Popover.Root>
      <Popover.Trigger className="topbar-iconbtn" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
        <Bell size={16} />
        {unread > 0 && <span className="topbar-iconbtn__dot">{unread > 9 ? '9+' : unread}</span>}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="notif-panel" align="end" sideOffset={8}>
          <div className="notif-panel__head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button className="notif-panel__markall" onClick={() => markAll.mutate()}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>
          <div className="notif-panel__list">
            {list.data && list.data.items.length === 0 && (
              <EmptyState compact icon={<Bell size={18} />} title="All caught up" message="New leads, handoffs and tasks will land here." />
            )}
            {list.data?.items.map((n) => <NotificationRow key={n.id} n={n} onOpen={open} />)}
            {list.isPending && <div className="notif-panel__loading">Loading…</div>}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
