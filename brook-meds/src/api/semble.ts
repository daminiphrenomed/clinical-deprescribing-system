import type { Patient, Prescription, DispenseEvent, WaitTimeMetric } from '../lib/types';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function fetchTodayQueue(): Promise<Prescription[]> {
  return apiFetch('/api/semble/today-queue');
}

export async function fetchPatientWaitTimeMetric(): Promise<WaitTimeMetric> {
  return apiFetch('/api/semble/wait-time');
}

export async function fetchPatient(id: string): Promise<Patient> {
  return apiFetch(`/api/semble/patient/${id}`);
}

export async function fetchPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  return apiFetch(`/api/semble/patient/${patientId}/prescriptions`);
}

export async function fetchRecentDispenses(patientId: string): Promise<DispenseEvent[]> {
  return apiFetch(`/api/semble/patient/${patientId}/dispenses`);
}

export async function fetchPatientFull(id: string): Promise<{
  patient: Patient;
  activePrescriptions: Prescription[];
  recentDispenses: DispenseEvent[];
  reconciliationConflicts: Prescription[];
  accountability: { prescriber: string; dispenser: string; governance: string };
}> {
  return apiFetch(`/api/semble/patient/${id}/full`);
}

export async function fetchPrescriptionForDispense(id: string): Promise<{
  prescription: Prescription;
  patient: Patient;
  stockMatch: { matched: boolean; lot?: string; expiry?: string; location?: string };
}> {
  return apiFetch(`/api/semble/prescription/${id}`);
}

export async function simulateScan(prescriptionId: string, mockMode: 'ok' | 'block'): Promise<{
  scannedPack: { drug: string; strength: string; form: string; quantity: number; gtin: string; lot: string; expiry: string };
  equivalence: { drug: boolean; strength: boolean; form: boolean; quantity: boolean; patient: boolean };
  allMatch: boolean;
}> {
  return apiFetch('/api/semble/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prescriptionId, mockMode }),
  });
}

export async function executeDispense(prescriptionId: string, witnessPin?: string): Promise<DispenseEvent> {
  return apiFetch('/api/semble/dispense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prescriptionId, witnessPin }),
  });
}
