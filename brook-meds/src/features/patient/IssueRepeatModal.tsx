import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';
import type { Prescription } from '../../lib/types';
import { fmtDate } from '../../lib/formatters';

interface Props {
  prescription: Prescription;
  onClose: () => void;
}

export default function IssueRepeatModal({ prescription, onClose }: Props) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(prescription.quantity);
  const repeat = prescription.repeat;

  const reviewDateStatus = (() => {
    if (!repeat) return 'ok';
    const daysUntil = differenceInDays(parseISO(repeat.reviewDate), new Date());
    if (daysUntil < 0) return 'fail';
    if (daysUntil <= 14) return 'warn';
    return 'ok';
  })();

  const checks = [
    {
      label: 'Refills remaining',
      pass: repeat ? repeat.refillsRemaining > 0 : false,
      detail: repeat ? `${repeat.refillsRemaining} of ${repeat.totalAllowed} remaining (${repeat.alreadyIssued} issued)` : 'No repeat data',
    },
    {
      label: 'Review date',
      pass: reviewDateStatus !== 'fail',
      warn: reviewDateStatus === 'warn',
      detail: repeat
        ? reviewDateStatus === 'fail'
          ? `Review was due ${fmtDate(repeat.reviewDate)} — cannot dispense`
          : reviewDateStatus === 'warn'
          ? `Review due ${fmtDate(repeat.reviewDate)} — within 14 days, use caution`
          : `Review due ${fmtDate(repeat.reviewDate)}`
        : 'No review date',
    },
    {
      label: 'No reconciliation conflicts',
      pass: !prescription.reconciliationConflict,
      detail: prescription.reconciliationConflict
        ? prescription.reconciliationConflict.conflictDescription
        : 'No conflicts found',
    },
  ];

  const canProceed = checks.every(c => c.pass);
  const exhaustWarning = repeat && quantity >= repeat.refillsRemaining;

  function handleConfirm() {
    navigate(`/scan?prescription=${prescription.id}&quantity=${quantity}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-card p-6 max-w-lg w-full mx-4" style={{ background: 'var(--surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--navy)' }}>Issue Repeat</h2>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-faint)' }}>&#x2715;</button>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--accent-light)' }}>
          <div className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>
            {prescription.drug.name} {prescription.drug.strength}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {prescription.dose} · {prescription.packSize}
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {checks.map((check) => (
            <div
              key={check.label}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{
                background: check.pass
                  ? (check.warn ? 'var(--amber-light)' : 'var(--green-light)')
                  : 'var(--red-light)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ background: check.pass ? (check.warn ? 'var(--amber)' : 'var(--green)') : 'var(--red)' }}
              >
                {check.pass ? (check.warn ? '!' : '✓') : '✗'}
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: check.pass ? (check.warn ? 'var(--amber)' : 'var(--green)') : 'var(--red)' }}>
                  {check.label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{check.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Quantity (packs)
          </label>
          <input
            type="number"
            min={1}
            max={repeat?.refillsRemaining ?? 99}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-input border text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
          {exhaustWarning && (
            <div className="mt-1 text-xs" style={{ color: 'var(--amber)' }}>
              Warning: this will exhaust or exceed remaining refills
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-action text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className="flex-1 px-4 py-2 rounded-action text-sm font-medium text-white"
            style={{
              background: canProceed ? 'var(--accent)' : 'var(--border-strong)',
              cursor: canProceed ? 'pointer' : 'not-allowed',
            }}
          >
            Proceed to dispense
          </button>
        </div>
      </div>
    </div>
  );
}
