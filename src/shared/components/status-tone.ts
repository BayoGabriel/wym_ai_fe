export type StatusTone = 'ok' | 'warn' | 'err' | 'info' | 'neutral';

const TONE_BY_STATUS: Record<string, StatusTone> = {
  // ok
  active: 'ok', confirmed: 'ok', completed: 'ok', converted: 'ok', approved: 'ok',
  resolved: 'ok', processed: 'ok', success: 'ok', published: 'ok', open: 'ok',
  // warn
  queued: 'warn', requested: 'warn', assigned: 'warn', pending: 'warn',
  draft: 'warn', trialing: 'warn', in_progress: 'warn', processing: 'warn',
  // err
  lost: 'err', rejected: 'err', cancelled: 'err', suspended: 'err',
  failed: 'err', no_show: 'err', expired: 'err', overdue: 'err',
  // info
  new: 'info', contacted: 'info', qualified: 'info', uploaded: 'info', read: 'info',
  // neutral
  closed: 'neutral', inactive: 'neutral', none: 'neutral', archived: 'neutral',
};

export function toneForStatus(status: string): StatusTone {
  return TONE_BY_STATUS[status.toLowerCase()] ?? 'neutral';
}
