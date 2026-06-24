import { describe, it, expect } from 'vitest';
import { getMissingFields } from '../features/cds/criticalInstructionSet';
import type { CDPrescriptionDraft } from '../lib/types';

const emptyDraft: CDPrescriptionDraft = {
  patientId: '', drug: '', dose: '', frequency: '', quantityPacks: '',
  refills: '', indication: '', reviewDate: '', dosesCheckedAgainstBNFC: false, prescriberPin: '',
};

describe('getMissingFields', () => {
  it('returns all required fields when draft is empty', () => {
    const missing = getMissingFields(emptyDraft, false);
    expect(missing).toContain('patientId');
    expect(missing).toContain('drug');
    expect(missing).toContain('prescriberPin');
  });

  it('requires dosesCheckedAgainstBNFC for paed patients', () => {
    const draft = { ...emptyDraft };
    const missing = getMissingFields(draft, true);
    expect(missing).toContain('dosesCheckedAgainstBNFC');
  });

  it('returns empty array when all fields complete (non-paed)', () => {
    const complete: CDPrescriptionDraft = {
      patientId: 'pt-001', drug: 'Medikinet XL', dose: '20mg', frequency: 'Once daily',
      quantityPacks: 1, refills: 3, indication: 'ADHD', reviewDate: '2026-12-01',
      dosesCheckedAgainstBNFC: false, prescriberPin: '1234',
    };
    expect(getMissingFields(complete, false)).toHaveLength(0);
  });
});
