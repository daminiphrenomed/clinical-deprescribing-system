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

// Phase 4 — CD Prescribing
export interface CDRegisterEntry {
  id: string;
  dateTime: string;
  drug: { name: string; strength: string };
  action: 'issued' | 'received' | 'destroyed';
  patient?: string;
  prescriber?: string;
  dispenser?: string;
  witness?: string;
  supplier?: string;
  invoiceRef?: string;
  destructionAuthRef?: string;
  packsDelta: number;
  runningBalance: number;
}

export interface CDPrescriptionDraft {
  patientId: string;
  drug: string;
  dose: string;
  frequency: string;
  quantityPacks: number | '';
  refills: number | '';
  indication: string;
  reviewDate: string;
  dosesCheckedAgainstBNFC: boolean;
  prescriberPin: string;
}

export interface BNFCDoseResult {
  withinRange: boolean;
  expectedMin: number;
  expectedMax: number;
  ref: string;
}

// Phase 5 — Inventory + Analytics
export interface StockLine {
  gtin: string;
  drug: { name: string; strength: string };
  packSize: string;
  location: string;
  packCount: number;
  packsByLot: { lot: string; expiry: string; count: number }[];
  costPerPack: number;
  isCd: boolean;
  reorderPoint: number;
  suggestedReorderQty?: number;
}

export interface WholesalerPrice {
  wholesaler: 'AAH' | 'Alliance' | 'Phoenix';
  pricePerPack: number;
  cdLicensed: boolean;
}

export interface ReorderSuggestion {
  stockLine: StockLine;
  suggestedQty: number;
  bestPrice: WholesalerPrice;
  allPrices: WholesalerPrice[];
  usagePerMonth: number;
  leadTimeDays: number;
}

export interface AnalyticsKPI {
  itemsDispensed: { month: number; deltaPctVsPrior: number };
  grossMargin: { month: number; targetPct: number; actualPct: number };
  dispensingErrors: { past30Days: number; past60Days: number };
  dailyVolume: { date: string; total: number; cdCount: number }[];
  topDispensedLines: { drug: string; packs: number; marginPct: number }[];
  compliance: {
    cdRegisterReconciled: boolean;
    coldChainCurrent: boolean;
    sopsCurrent: number;
    significantEvents90d: number;
  };
}

// Phase 6 — Audit Trail + Settings
export type AuditActor = 'system' | 'semble' | string;

export interface AuditEvent {
  id: string;
  timestamp: string;
  section: 'prescription_origin' | 'transfer' | 'dispense' | 'reprint' | 'override' | 'reconciliation';
  event: string;
  detail: string;
  actor: AuditActor;
  dispenseId?: string;
  prescriptionId?: string;
  patientId: string;
  overrideContext?: { fieldName: string; oldValue: string; newValue: string; reason: string };
}

export interface SettingsConfig {
  labelTemplate: { templateId: string; content: string; lastModifiedBy: string; lastModifiedAt: string };
  markupRates: { default: number; controlled: number; specialty: number };
  sensitivePatients: string[];
  reprintWindowHours: number;
  manualEntryPolicy: 'allowed' | 'lead_override' | 'blocked';
}
