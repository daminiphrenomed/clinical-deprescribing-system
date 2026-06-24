import type { CDPrescriptionDraft } from '../../lib/types';

export const CD_REQUIRED_FIELDS: (keyof CDPrescriptionDraft)[] = [
  'patientId', 'drug', 'dose', 'frequency', 'quantityPacks', 'refills', 'indication', 'reviewDate', 'prescriberPin',
];

export const CD_PAED_REQUIRED_FIELDS: (keyof CDPrescriptionDraft)[] = [
  ...CD_REQUIRED_FIELDS, 'dosesCheckedAgainstBNFC',
];

export function getMissingFields(draft: CDPrescriptionDraft, isPaed: boolean): string[] {
  const required = isPaed ? CD_PAED_REQUIRED_FIELDS : CD_REQUIRED_FIELDS;
  return required.filter(f => {
    const val = draft[f];
    if (typeof val === 'boolean') return isPaed && f === 'dosesCheckedAgainstBNFC' && !val;
    return val === '' || val === null || val === undefined;
  });
}
