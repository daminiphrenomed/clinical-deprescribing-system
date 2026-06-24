import type { Prescription, Patient } from '../lib/types';

export function makePatient(overrides: Partial<Patient> = {}): Patient {
  return {
    id: 'pt-test',
    nhsNumber: '000-000-0000',
    name: { first: 'Test', last: 'PATIENT' },
    dob: '1980-01-01',
    allergies: [],
    registeredGp: 'Dr Test',
    flags: { paediatric: false, cdOnRecord: false, doubleCheck: false, pleHistory: false },
    ...overrides,
  };
}

export function makePrescription(overrides: Partial<Prescription> = {}): Prescription {
  return {
    id: 'rx-test',
    patientId: 'pt-test',
    drug: { name: 'Test Drug', strength: '10mg', form: 'Tablets' },
    dose: '10mg once daily',
    frequency: 'Once daily',
    quantity: 1,
    packSize: '28 tabs',
    instructions: 'Take as directed',
    indication: 'Test indication',
    type: 'repeat',
    priority: 'standard',
    issuedAt: '2026-06-23T09:00:00Z',
    issuedBy: 'Dr Test',
    criticalFieldsComplete: true,
    ...overrides,
  };
}
