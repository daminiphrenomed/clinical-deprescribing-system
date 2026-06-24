import type { Patient, Prescription, DispenseEvent, WaitTimeMetric, CDRegisterEntry, CDPrescriptionDraft, BNFCDoseResult, StockLine, AnalyticsKPI, AuditEvent, SettingsConfig } from '../lib/types';

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

// Phase 4
export async function fetchCDRegister(): Promise<CDRegisterEntry[]> {
  return apiFetch('/api/semble/cd-register');
}

export async function submitCDPrescription(draft: CDPrescriptionDraft): Promise<{
  prescriptionId: string; cdRegisterEntryId: string; dispensaryQueueId: string;
}> {
  return apiFetch('/api/semble/cd-prescription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });
}

export async function calculateBNFCDose(drug: string, patientWeightKg: number): Promise<BNFCDoseResult> {
  return apiFetch('/api/semble/bnfc-dose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drug, patientWeightKg }),
  });
}

// Phase 5
export async function fetchInventory(): Promise<StockLine[]> {
  return apiFetch('/api/semble/inventory');
}

export async function fetchAnalytics(): Promise<AnalyticsKPI> {
  return apiFetch('/api/semble/analytics');
}

// Phase 6
export async function fetchAuditTrail(patientId: string): Promise<AuditEvent[]> {
  return apiFetch(`/api/semble/audit/${patientId}`);
}

export async function fetchDispenseAudit(dispenseId: string): Promise<AuditEvent[]> {
  return apiFetch(`/api/semble/audit/dispense/${dispenseId}`);
}

export async function fetchSettings(): Promise<SettingsConfig> {
  return apiFetch('/api/settings');
}

export async function updateSettings(patch: Partial<SettingsConfig>): Promise<SettingsConfig> {
  return apiFetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
}
