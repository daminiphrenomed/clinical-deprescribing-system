import type { Prescription } from '../../lib/types';

export function detectReconciliationConflict(rx: Prescription): boolean {
  return !!rx.reconciliationConflict;
}

export function isDispenseBlocked(rx: Prescription): boolean {
  return detectReconciliationConflict(rx);
}
