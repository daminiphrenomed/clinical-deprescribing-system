import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Shield } from 'lucide-react';
import { simulateScan, fetchPrescriptionForDispense } from '../../api/semble';
import type { Patient, Prescription } from '../../lib/types';
import EquivalencePanel from '../../components/shared/EquivalencePanel';
import Toast from '../../components/shared/Toast';
import { executeDispense } from './executeDispense';
import { fmtDate } from '../../lib/formatters';
import { useDispenseStore } from '../../stores/dispenseStore';

type ScanMode = 'ok' | 'block';

interface ScanResult {
  scannedPack: { drug: string; strength: string; form: string; quantity: number; gtin: string; lot: string; expiry: string };
  equivalence: { drug: boolean; strength: boolean; form: boolean; quantity: boolean; patient: boolean };
  allMatch: boolean;
}

export default function ScanScreen() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addDispense = useDispenseStore(s => s.addDispense);

  const prescriptionId = searchParams.get('prescription') ?? 'rx-001';
  const [mode, setMode] = useState<ScanMode>('ok');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [witnessPin, setWitnessPin] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    fetchPrescriptionForDispense(prescriptionId).then(data => {
      setPrescription(data.prescription);
      setPatient(data.patient);
    });
  }, [prescriptionId]);

  async function handleScan() {
    if (!prescriptionId) return;
    const result = await simulateScan(prescriptionId, mode);
    setScanResult(result);
    setScanned(true);
  }

  async function handleDispense() {
    if (!prescription || !scanResult?.allMatch) return;
    setDispensing(true);
    try {
      const isCD = prescription.type === 'cd_acute' || prescription.type === 'cd_repeat';
      const event = await executeDispense(prescriptionId, isCD ? witnessPin || undefined : undefined);
      addDispense(event);
      setToast({
        title: 'Dispense recorded',
        message: 'Label printed · £23.00 billed · Semble annotated',
      });
      setTimeout(() => navigate('/today'), 2000);
    } finally {
      setDispensing(false);
    }
  }

  const isCD = prescription?.type === 'cd_acute' || prescription?.type === 'cd_repeat';

  const equivalenceFields = prescription && scanResult ? [
    {
      label: 'Drug',
      prescribed: `${prescription.drug.name}`,
      scanned: scanResult.scannedPack.drug,
      match: scanResult.equivalence.drug,
    },
    {
      label: 'Strength',
      prescribed: prescription.drug.strength,
      scanned: scanResult.scannedPack.strength,
      match: scanResult.equivalence.strength,
    },
    {
      label: 'Form',
      prescribed: prescription.drug.form,
      scanned: scanResult.scannedPack.form,
      match: scanResult.equivalence.form,
    },
    {
      label: 'Quantity',
      prescribed: `${prescription.quantity} × ${prescription.packSize}`,
      scanned: `${scanResult.scannedPack.quantity} pack(s)`,
      match: scanResult.equivalence.quantity,
    },
    {
      label: 'Patient',
      prescribed: patient ? `${patient.name.first} ${patient.name.last}` : '',
      scanned: patient ? `${patient.name.first} ${patient.name.last}` : '',
      match: scanResult.equivalence.patient,
    },
  ] : [];

  const fourWayChecks = scanResult ? [
    { label: 'Drug name', pass: scanResult.equivalence.drug },
    { label: 'Strength', pass: scanResult.equivalence.strength },
    { label: 'Form', pass: scanResult.equivalence.form },
    { label: 'Patient ID', pass: scanResult.equivalence.patient },
  ] : [];

  const effects = [
    { label: 'Label print', description: 'GS1-compliant label generated', done: true },
    { label: 'Stock decrement', description: `${prescription?.drug.name ?? ''} stock updated`, done: true },
    { label: 'CD register', description: isCD ? 'Entry written to controlled drugs register' : 'Not applicable', done: isCD },
    { label: 'Semble annotation', description: 'Dispense recorded on clinical record', done: true },
    { label: 'Billing line', description: '£23.00 charged to patient account', done: true },
    { label: 'Audit log', description: `Dispense by U. Fernandez at ${new Date().toLocaleTimeString()}`, done: true },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back
        </button>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Dispense</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Barcode verification</h1>
        {/* Demo mode toggle */}
        <div className="flex items-center gap-2 p-1 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setMode('ok'); setScanned(false); setScanResult(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: mode === 'ok' ? 'var(--green-light)' : 'transparent', color: mode === 'ok' ? 'var(--green)' : 'var(--text-muted)' }}
          >
            Demo: OK
          </button>
          <button
            onClick={() => { setMode('block'); setScanned(false); setScanResult(null); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: mode === 'block' ? 'var(--red-light)' : 'transparent', color: mode === 'block' ? 'var(--red)' : 'var(--text-muted)' }}
          >
            Demo: Block
          </button>
        </div>
      </div>

      {/* Scan context */}
      {prescription && patient && (
        <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Scan context</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>Patient</div>
              <div style={{ color: 'var(--text)' }}>{patient.name.first} {patient.name.last}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>NHS {patient.nhsNumber} · DOB {fmtDate(patient.dob)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>Prescribed drug</div>
              <div style={{ color: 'var(--text)' }}>{prescription.drug.name} {prescription.drug.strength}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{prescription.drug.form}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>Prescriber</div>
              <div style={{ color: 'var(--text)' }}>{prescription.issuedBy}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>Dispenser</div>
              <div style={{ color: 'var(--text)' }}>U. Fernandez</div>
            </div>
          </div>
        </div>
      )}

      {/* Scan button */}
      {!scanned && (
        <button
          onClick={handleScan}
          className="w-full py-4 rounded-card text-white font-semibold text-base mb-4 flex items-center justify-center gap-3"
          style={{ background: 'var(--navy)' }}
        >
          <Shield size={20} />
          Simulate barcode scan ({mode === 'ok' ? 'will pass' : 'will block'})
        </button>
      )}

      {/* Scan result */}
      {scanResult && (
        <>
          {/* Result banner */}
          <div
            className="flex items-center gap-3 p-4 rounded-card mb-4 font-semibold"
            style={{
              background: scanResult.allMatch ? 'var(--green-light)' : 'var(--red-light)',
              color: scanResult.allMatch ? 'var(--green)' : 'var(--red)',
            }}
          >
            {scanResult.allMatch
              ? <CheckCircle size={20} />
              : <XCircle size={20} />
            }
            {scanResult.allMatch ? 'All checks passed — safe to dispense' : 'BLOCKED — Mismatch detected. Do not dispense.'}
          </div>

          {/* Equivalence panel */}
          <EquivalencePanel fields={equivalenceFields} />

          {/* Four-way check grid */}
          <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Four-way check</h2>
            <div className="grid grid-cols-2 gap-3">
              {fourWayChecks.map(check => (
                <div key={check.label} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: check.pass ? 'var(--green-light)' : 'var(--red-light)' }}>
                  {check.pass
                    ? <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                    : <XCircle size={16} style={{ color: 'var(--red)' }} />
                  }
                  <span className="text-sm font-medium" style={{ color: check.pass ? 'var(--green)' : 'var(--red)' }}>{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Effects strip */}
          <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>On confirm, these 6 things happen</h2>
            <div className="space-y-2">
              {effects.map((effect, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'var(--green-light)', color: 'var(--green)' }}>
                    {i + 1}
                  </div>
                  <span className="font-medium" style={{ color: 'var(--text)' }}>{effect.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ color: 'var(--text-muted)' }}>{effect.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CD dual sign-off */}
          {isCD && scanResult.allMatch && (
            <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--amber-light)', borderColor: 'var(--amber)' }}>
              <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--amber)' }}>
                Controlled Drug — witness sign-off required
              </h2>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                A second authorised person must witness dispensing of Schedule {prescription?.cdSchedule} CDs.
              </p>
              <input
                type="password"
                placeholder="Enter witness PIN"
                value={witnessPin}
                onChange={e => setWitnessPin(e.target.value)}
                className="w-full px-3 py-2 rounded-input border text-sm"
                style={{ borderColor: 'var(--amber)', color: 'var(--text)' }}
              />
            </div>
          )}

          {/* Re-scan / Confirm */}
          <div className="flex gap-3">
            <button
              onClick={() => { setScanned(false); setScanResult(null); }}
              className="flex-1 px-4 py-3 rounded-action border text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Re-scan
            </button>
            {scanResult.allMatch && (
              <button
                onClick={handleDispense}
                disabled={dispensing || (isCD && !witnessPin)}
                className="flex-1 px-4 py-3 rounded-action text-white text-sm font-semibold"
                style={{
                  background: dispensing || (isCD && !witnessPin) ? 'var(--border-strong)' : 'var(--green)',
                  cursor: dispensing || (isCD && !witnessPin) ? 'not-allowed' : 'pointer',
                }}
              >
                {dispensing ? 'Recording...' : 'Confirm dispense'}
              </button>
            )}
          </div>
        </>
      )}

      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
