import { useState } from 'react';
import type { DispenseEvent } from '../../lib/types';
import { fmtDateTime } from '../../lib/formatters';

interface Props {
  dispenseEvent: DispenseEvent;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
}

const REPRINT_REASONS = [
  'Label damaged',
  'Label illegible',
  'Patient request',
  'Dispensing error correction',
  'Label lost',
  'Other',
];

export default function ReprintLabelModal({ dispenseEvent, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  function handleConfirm() {
    if (reason) {
      onConfirm(reason, notes);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-card p-6 max-w-lg w-full mx-4" style={{ background: 'var(--surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--navy)' }}>Reprint Label</h2>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-faint)' }}>&#x2715;</button>
        </div>

        <div className="mb-4 p-3 rounded-lg" style={{ background: 'var(--amber-light)', borderLeft: '3px solid var(--amber)' }}>
          <div className="text-sm font-semibold mb-1" style={{ color: 'var(--amber)' }}>Reprint audit notice</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Every reprint is logged in the audit trail with a mandatory reason. Original dispense: {fmtDateTime(dispenseEvent.dispensedAt)} by {dispenseEvent.dispensedBy}.
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Reason for reprint <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 rounded-input border text-sm"
            style={{ borderColor: reason ? 'var(--border)' : 'var(--red)', color: 'var(--text)' }}
          >
            <option value="">Select reason...</option>
            {REPRINT_REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
            Additional notes
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes..."
            className="w-full px-3 py-2 rounded-input border text-sm resize-none"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          />
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
            disabled={!reason}
            className="flex-1 px-4 py-2 rounded-action text-sm font-medium text-white"
            style={{
              background: reason ? 'var(--accent)' : 'var(--border-strong)',
              cursor: reason ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm reprint
          </button>
        </div>
      </div>
    </div>
  );
}
