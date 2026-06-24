import { http, HttpResponse } from 'msw';
import { patients, prescriptions, dispenseEvents, waitTimeMetric, cdRegisterEntries, stockLines, wholesalerPrices, analyticsKPI, auditEvents, settingsConfig } from './fixtures';
import type { DispenseEvent } from '../../lib/types';

export const handlers = [
  http.get('/api/semble/today-queue', () => {
    return HttpResponse.json(prescriptions);
  }),
  http.get('/api/semble/wait-time', () => {
    return HttpResponse.json(waitTimeMetric);
  }),
  http.get('/api/semble/patient/:id', ({ params }) => {
    const patient = patients.find(p => p.id === params.id);
    if (!patient) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(patient);
  }),
  http.get('/api/semble/patient/:id/prescriptions', ({ params }) => {
    const rxs = prescriptions.filter(p => p.patientId === params.id);
    return HttpResponse.json(rxs);
  }),
  http.get('/api/semble/patient/:id/dispenses', ({ params }) => {
    const events = dispenseEvents.filter(e => e.patientId === params.id);
    return HttpResponse.json(events);
  }),
  http.get('/api/semble/patient/:id/full', ({ params }) => {
    const patient = patients.find(p => p.id === params.id);
    if (!patient) return new HttpResponse(null, { status: 404 });
    const activePrescriptions = prescriptions.filter(p => p.patientId === params.id);
    const recentDispenses = dispenseEvents.filter(e => e.patientId === params.id);
    const reconciliationConflicts = activePrescriptions.filter(p => p.reconciliationConflict);
    return HttpResponse.json({
      patient,
      activePrescriptions,
      recentDispenses,
      reconciliationConflicts,
      accountability: {
        prescriber: patient.registeredGp,
        dispenser: 'U. Fernandez',
        governance: 'Dr S. Kinra',
      },
    });
  }),
  http.get('/api/semble/prescription/:id', ({ params }) => {
    const rx = prescriptions.find(p => p.id === params.id);
    if (!rx) return new HttpResponse(null, { status: 404 });
    const patient = patients.find(p => p.id === rx.patientId);
    return HttpResponse.json({ prescription: rx, patient, stockMatch: { matched: true, lot: 'LOT-2024-MK-001', expiry: '2028-03-15', location: 'CD safe shelf B' } });
  }),
  http.post('/api/semble/dispense', async ({ request }) => {
    const body = await request.json() as { prescriptionId: string; witnessPin?: string };
    const rx = prescriptions.find(p => p.id === body.prescriptionId);
    const event: DispenseEvent = {
      id: `disp-${Date.now()}`,
      prescriptionId: body.prescriptionId,
      patientId: rx?.patientId ?? '',
      dispensedAt: new Date().toISOString(),
      dispensedBy: 'U. Fernandez',
      witness: body.witnessPin ? 'M. Kaur' : undefined,
      packsDispensed: rx?.quantity ?? 1,
      packLots: ['LOT-2024-001'],
      labelPrintEvents: [{ at: new Date().toISOString(), isReprint: false }],
      billingLineId: `bill-${Date.now()}`,
      billingAmount: 23.00,
      stockDecrement: { drug: rx?.drug.name ?? '', from: 8, to: 7 },
      sembleAnnotationWritten: true,
    };
    return HttpResponse.json(event);
  }),
  http.post('/api/semble/scan', async ({ request }) => {
    const body = await request.json() as { prescriptionId: string; mockMode: 'ok' | 'block' };
    const rx = prescriptions.find(p => p.id === body.prescriptionId);
    const isBlock = body.mockMode === 'block';
    return HttpResponse.json({
      scannedPack: {
        drug: rx?.drug.name ?? 'Medikinet XL',
        strength: isBlock ? '30mg' : (rx?.drug.strength ?? '20mg'),
        form: rx?.drug.form ?? 'Modified-release capsules',
        quantity: rx?.quantity ?? 1,
        gtin: isBlock ? '05000456789013' : '05000456789012',
        lot: 'LOT-2024-MK-001',
        expiry: '2028-03-15',
      },
      equivalence: {
        drug: true,
        strength: !isBlock,
        form: true,
        quantity: true,
        patient: true,
      },
      allMatch: !isBlock,
    });
  }),
  // Phase 4 — CD handlers
  http.get('/api/semble/cd-register', () => {
    return HttpResponse.json(cdRegisterEntries);
  }),
  http.post('/api/semble/cd-prescription', async () => {
    return HttpResponse.json({
      prescriptionId: `rx-cd-${Date.now()}`,
      cdRegisterEntryId: `cdreg-${Date.now()}`,
      dispensaryQueueId: `queue-${Date.now()}`,
    });
  }),
  http.post('/api/semble/bnfc-dose', async ({ request }) => {
    const body = await request.json() as { drug: string; patientWeightKg: number };
    const min = Math.round(body.patientWeightKg * 0.3);
    const max = Math.min(Math.round(body.patientWeightKg * 1.0), 60);
    return HttpResponse.json({ withinRange: true, expectedMin: min, expectedMax: max, ref: 'BNFC 2024, Methylphenidate hydrochloride' });
  }),
  // Phase 5 — Inventory + Analytics handlers
  http.get('/api/semble/inventory', () => HttpResponse.json(stockLines)),
  http.get('/api/semble/wholesaler-prices/:gtin', ({ params }) => {
    const prices = wholesalerPrices[params.gtin as string] ?? [
      { wholesaler: 'AAH', pricePerPack: 5.00, cdLicensed: false },
      { wholesaler: 'Alliance', pricePerPack: 5.20, cdLicensed: false },
      { wholesaler: 'Phoenix', pricePerPack: 4.90, cdLicensed: false },
    ];
    return HttpResponse.json(prices);
  }),
  http.get('/api/semble/analytics', () => HttpResponse.json(analyticsKPI)),
  // Phase 6 — Audit + Settings handlers
  http.get('/api/semble/audit/dispense/:dispenseId', ({ params }) => {
    const events = auditEvents.filter(e => e.dispenseId === params.dispenseId);
    return HttpResponse.json(events);
  }),
  http.get('/api/semble/audit/:patientId', ({ params }) => {
    const events = auditEvents.filter(e => e.patientId === params.patientId);
    return HttpResponse.json(events);
  }),
  http.get('/api/settings', () => HttpResponse.json(settingsConfig)),
  http.patch('/api/settings', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...settingsConfig, ...(body as object) });
  }),
];
