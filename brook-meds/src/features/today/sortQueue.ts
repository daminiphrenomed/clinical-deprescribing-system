import type { Prescription } from '../../lib/types';

export function sortQueue(queue: Prescription[]): Prescription[] {
  const priority = (rx: Prescription): number => {
    if (rx.priority === 'urgent') return 0;
    if (rx.priority === 'reconcile') return 1;
    if (rx.type === 'acute' || rx.type === 'cd_acute') return 2;
    return 3;
  };
  return [...queue].sort((a, b) => {
    const pd = priority(a) - priority(b);
    if (pd !== 0) return pd;
    return new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime();
  });
}
