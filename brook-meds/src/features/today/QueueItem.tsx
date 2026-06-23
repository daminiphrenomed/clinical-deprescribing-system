import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Prescription } from '../../lib/types';

const typeColors: Record<string, string> = {
  urgent: 'var(--red)',
  reconcile: 'var(--amber)',
  standard: 'var(--accent)',
};

const typeTags: Record<string, { label: string; bg: string; color: string }> = {
  cd_acute: { label: 'CD · Acute', bg: 'var(--amber-light)', color: 'var(--amber)' },
  cd_repeat: { label: 'CD · Repeat', bg: 'var(--amber-light)', color: 'var(--amber)' },
  acute: { label: 'Acute', bg: 'var(--accent-light)', color: 'var(--accent)' },
  repeat: { label: 'Repeat', bg: '#F3F4F6', color: 'var(--text-muted)' },
};

export default function QueueItem({ rx }: { rx: Prescription }) {
  const navigate = useNavigate();
  const tag = typeTags[rx.type];
  const barColor = typeColors[rx.priority] ?? 'var(--accent)';

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="w-1 h-10 rounded-full shrink-0" style={{ background: barColor }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            {rx.drug.name} {rx.drug.strength}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: tag.bg, color: tag.color }}>{tag.label}</span>
          {rx.reconciliationConflict && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>Reconcile</span>
          )}
        </div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Patient ID {rx.patientId} · {rx.issuedBy} · {rx.dose}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs tabular-nums mb-1" style={{ color: 'var(--text-faint)' }}>
          {format(new Date(rx.issuedAt), 'HH:mm')}
        </div>
        <button
          onClick={() => navigate(`/patient/${rx.patientId}`)}
          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors text-white"
          style={{ background: 'var(--accent)' }}
        >
          Open
        </button>
      </div>
    </div>
  );
}
