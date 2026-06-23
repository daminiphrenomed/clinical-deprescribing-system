import { http, HttpResponse } from 'msw';
import { patients, prescriptions, dispenseEvents, waitTimeMetric } from './fixtures';
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
];
