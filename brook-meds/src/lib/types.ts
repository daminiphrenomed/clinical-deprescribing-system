export type RxType = 'acute' | 'repeat' | 'cd_acute' | 'cd_repeat';
export type RxPriority = 'urgent' | 'reconcile' | 'standard';

export interface Patient {
  id: string;
  nhsNumber: string;
  name: { first: string; last: string };
  dob: string;
  weightKg?: number;
  allergies: string[];
  registeredGp: string;
  flags: { paediatric: boolean; cdOnRecord: boolean; doubleCheck: boolean; pleHistory: boolean };
}

export interface Prescription {
  id: string;
  patientId: string;
  drug: { name: string; strength: string; form: string };
  dose: string;
  frequency: string;
  quantity: number;
  packSize: string;
  instructions: string;
  indication: string;
  type: RxType;
  priority: RxPriority;
  issuedAt: string;
  issuedBy: string;
  repeat?: { totalAllowed: number; alreadyIssued: number; refillsRemaining: number; reviewDate: string };
  cdSchedule?: 2 | 3;
  criticalFieldsComplete: boolean;
  reconciliationConflict?: { noteDate: string; noteAuthor: string; conflictDescription: string };
}

export interface DispenseEvent {
  id: string;
  prescriptionId: string;
  patientId: string;
  dispensedAt: string;
  dispensedBy: string;
  witness?: string;
  packsDispensed: number;
  packLots: string[];
  labelPrintEvents: { at: string; reason?: string; isReprint: boolean }[];
  billingLineId: string;
  billingAmount: number;
  stockDecrement: { drug: string; from: number; to: number };
  sembleAnnotationWritten: boolean;
  cdRegisterEntryId?: string;
}

export interface WaitTimeMetric {
  avgMinutes: number;
  targetMinutes: number;
  withinTarget: boolean;
  weekAverage?: number;
}
