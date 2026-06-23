import { describe, it, expect } from 'vitest';
import { sortQueue } from '../features/today/sortQueue';
import type { Prescription } from '../lib/types';

const make = (id: string, priority: Prescription['priority'], type: Prescription['type'], issuedAt: string): Prescription => ({
  id, patientId: 'p1', drug: { name: 'Drug', strength: '10mg', form: 'tabs' },
  dose: '10mg', frequency: 'daily', quantity: 1, packSize: '28 tabs',
  instructions: '', indication: '', type, priority, issuedAt, issuedBy: 'Dr X', criticalFieldsComplete: true,
});

describe('sortQueue', () => {
  it('puts urgent before reconcile before standard', () => {
    const queue = [
      make('c', 'standard', 'repeat', '2026-06-23T10:00:00Z'),
      make('b', 'reconcile', 'repeat', '2026-06-23T09:00:00Z'),
      make('a', 'urgent', 'cd_acute', '2026-06-23T11:00:00Z'),
    ];
    const sorted = sortQueue(queue);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
    expect(sorted[2].id).toBe('c');
  });

  it('sorts by issuedAt when priority is equal', () => {
    const queue = [
      make('b', 'urgent', 'cd_acute', '2026-06-23T11:00:00Z'),
      make('a', 'urgent', 'cd_acute', '2026-06-23T09:00:00Z'),
    ];
    const sorted = sortQueue(queue);
    expect(sorted[0].id).toBe('a');
    expect(sorted[1].id).toBe('b');
  });

  it('does not mutate the original array', () => {
    const queue = [
      make('b', 'standard', 'repeat', '2026-06-23T10:00:00Z'),
      make('a', 'urgent', 'cd_acute', '2026-06-23T09:00:00Z'),
    ];
    const original = [...queue];
    sortQueue(queue);
    expect(queue[0].id).toBe(original[0].id);
  });
});
