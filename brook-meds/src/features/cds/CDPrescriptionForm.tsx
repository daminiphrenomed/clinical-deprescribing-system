import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { patients } from '../../api/mocks/fixtures';
import type { CDPrescriptionDraft, BNFCDoseResult } from '../../lib/types';
import { submitCDPrescription, calculateBNFCDose } from '../../api/semble';
import { getMissingFields } from './criticalInstructionSet';

const CD_DRUGS = [
  { label: 'Medikinet XL (methylphenidate) — Sch 2', value: 'Medikinet XL' },
  { label: 'Equasym XL (methylphenidate) — Sch 2', value: 'Equasym XL' },
  { label: 'Ritalin (methylphenidate) — Sch 2', value: 'Ritalin' },
  { label: 'Morphine Sulfate — Sch 2', value: 'Morphine Sulfate' },
  { label: 'Diazepam — Sch 3', value: 'Diazepam' },
  { label: 'Buprenorphine — Sch 3', value: 'Buprenorphine' },
  { label: 'Temazepam — Sch 3', value: 'Temazepam' },
];

const EMPTY_DRAFT: CDPrescriptionDraft = {
  patientId: '',
  drug: '',
  dose: '',
  frequency: '',
  quantityPacks: '',
  refills: '',
  indication: '',
  reviewDate: '',
  dosesCheckedAgainstBNFC: false,
  prescriberPin: '',
};

export default function CDPrescriptionForm() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<CDPrescriptionDraft>(EMPTY_DRAFT);
  const [bnfcResult, setBnfcResult] = useState<BNFCDoseResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedPatient = patients.find(p => p.id === draft.patientId);
  const isPaed = selectedPatient?.flags.paediatric ?? false;
  const missing = getMissingFields(draft, isPaed);
  const canSubmit = missing.length === 0;

  function set<K extends keyof CDPrescriptionDraft>(key: K, value: CDPrescriptionDraft[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  // Fetch BNFC dose when drug + paed patient selected
  useEffect(() => {
    if (!isPaed || !draft.drug || !selectedPatient?.weightKg) {
      setBnfcResult(null);
      return;
    }
    calculateBNFCDose(draft.drug, selectedPatient.weightKg).then(setBnfcResult).catch(() => setBnfcResult(null));
  }, [draft.drug, draft.patientId, isPaed, selectedPatient]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await submitCDPrescription(draft);
      setSuccess(true);
      setTimeout(() => navigate('/today'), 2000);
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '6px 10px',
    width: '100%',
    fontSize: 13,
    color: 'var(--text)',
    background: 'var(--bg)',
  };

  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 };

  if (success) {
    return (
      <div className="rounded-card border p-6 flex flex-col items-center gap-3" style={{ background: 'var(--green-light)', borderColor: 'var(--green)' }}>
        <CheckCircle size={32} style={{ color: 'var(--green)' }} />
        <div className="font-semibold" style={{ color: 'var(--green)' }}>CD Prescription submitted</div>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>CD register entry created. Returning to Today…</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--navy)' }}>New CD Prescription</h2>

      <div className="space-y-3">
        {/* Patient */}
        <div>
          <label style={labelStyle}>Patient</label>
          <select style={inputStyle} value={draft.patientId} onChange={e => set('patientId', e.target.value)}>
            <option value="">Select patient…</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name.last} {p.name.first} ({p.nhsNumber})</option>
            ))}
          </select>
          {isPaed && (
            <div className="mt-1 flex items-center gap-1.5 text-xs" style={{ color: 'var(--accent)' }}>
              <AlertTriangle size={12} /> Paediatric patient — BNFC dose check required
            </div>
          )}
        </div>

        {/* Drug */}
        <div>
          <label style={labelStyle}>Controlled Drug</label>
          <select style={inputStyle} value={draft.drug} onChange={e => set('drug', e.target.value)}>
            <option value="">Select drug…</option>
            {CD_DRUGS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {/* Dose + Frequency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Dose</label>
            <input style={inputStyle} type="text" placeholder="e.g. 20mg" value={draft.dose} onChange={e => set('dose', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Frequency</label>
            <input style={inputStyle} type="text" placeholder="e.g. Once daily" value={draft.frequency} onChange={e => set('frequency', e.target.value)} />
          </div>
        </div>

        {/* Quantity + Refills */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Quantity (packs)</label>
            <input style={inputStyle} type="number" min={1} placeholder="1" value={draft.quantityPacks} onChange={e => set('quantityPacks', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <label style={labelStyle}>Refills</label>
            <input style={inputStyle} type="number" min={0} placeholder="0" value={draft.refills} onChange={e => set('refills', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        {/* Indication */}
        <div>
          <label style={labelStyle}>Indication</label>
          <input style={inputStyle} type="text" placeholder="e.g. ADHD" value={draft.indication} onChange={e => set('indication', e.target.value)} />
        </div>

        {/* Review date */}
        <div>
          <label style={labelStyle}>Review date</label>
          <input style={inputStyle} type="date" value={draft.reviewDate} onChange={e => set('reviewDate', e.target.value)} />
        </div>

        {/* BNFC dose panel for paeds */}
        {isPaed && draft.drug && (
          <div className="rounded-input p-3 border" style={{ background: 'var(--accent-light)', borderColor: 'var(--accent)' }}>
            <div className="text-xs font-semibold mb-1" style={{ color: 'var(--navy)' }}>BNFC Dose Calculator</div>
            {!selectedPatient?.weightKg && (
              <div className="text-xs" style={{ color: 'var(--amber)' }}>No weight on record — cannot calculate dose range.</div>
            )}
            {bnfcResult && (
              <div className="text-xs space-y-1">
                <div style={{ color: 'var(--text-muted)' }}>
                  Expected range: <span className="tabular-nums font-medium" style={{ color: 'var(--text)' }}>{bnfcResult.expectedMin}–{bnfcResult.expectedMax} mg/day</span>
                </div>
                <div style={{ color: bnfcResult.withinRange ? 'var(--green)' : 'var(--amber)' }}>
                  {bnfcResult.withinRange ? '✓ Within expected range' : '⚠ Outside expected range — review dose'}
                </div>
                <div style={{ color: 'var(--text-faint)' }}>Ref: {bnfcResult.ref}</div>
              </div>
            )}
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft.dosesCheckedAgainstBNFC}
                onChange={e => set('dosesCheckedAgainstBNFC', e.target.checked)}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--navy)' }}>
                I confirm doses checked against BNFC 2024
              </span>
            </label>
          </div>
        )}

        {/* Prescriber PIN */}
        <div>
          <label style={labelStyle}>Prescriber PIN</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            value={draft.prescriberPin}
            onChange={e => set('prescriberPin', e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="relative group">
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full py-2.5 rounded-action text-sm font-semibold text-white"
            style={{
              background: canSubmit ? 'var(--accent)' : 'var(--border-strong)',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit CD Prescription'}
          </button>
          {!canSubmit && missing.length > 0 && (
            <div
              className="absolute bottom-full left-0 mb-1 w-full rounded p-2 text-xs z-10 hidden group-hover:block"
              style={{ background: 'var(--navy)', color: 'white' }}
            >
              Missing: {missing.join(', ')}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
