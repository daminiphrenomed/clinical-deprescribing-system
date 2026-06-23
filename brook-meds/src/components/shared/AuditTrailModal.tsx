import { fmtDateTime } from '../../lib/formatters';
import type { DispenseEvent } from '../../lib/types';

interface Props {
  events: DispenseEvent[];
  onClose: () => void;
}

export default function AuditTrailModal({ events, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-card p-6 max-w-lg w-full mx-4" style={{ background: 'var(--surface)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: 'var(--navy)' }}>Audit Trail</h2>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--text-faint)' }}>&#x2715;</button>
        </div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {events.map(ev => (
            <div key={ev.id} className="p-3 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between mb-1">
                <span className="font-medium" style={{ color: 'var(--text)' }}>Dispense #{ev.id}</span>
                <span style={{ color: 'var(--text-faint)' }}>{fmtDateTime(ev.dispensedAt)}</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>By {ev.dispensedBy}{ev.witness ? ` · Witness: ${ev.witness}` : ''}</div>
              <div style={{ color: 'var(--text-muted)' }}>{ev.packsDispensed} pack(s) · Lots: {ev.packLots.join(', ')}</div>
              {ev.cdRegisterEntryId && (
                <div className="mt-1 text-xs" style={{ color: 'var(--amber)' }}>CD Register: {ev.cdRegisterEntryId}</div>
              )}
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center py-6" style={{ color: 'var(--text-faint)' }}>No audit entries</p>
          )}
        </div>
      </div>
    </div>
  );
}
