import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import type { AuditEvent } from '../../lib/types';
import { fetchAuditTrail, fetchDispenseAudit } from '../../api/semble';
import { fmtDateTime } from '../../lib/formatters';

interface Props {
  dispenseId?: string;
  patientId?: string;
  onClose: () => void;
}

const SECTION_ORDER: AuditEvent['section'][] = [
  'prescription_origin', 'transfer', 'dispense', 'reprint', 'reconciliation', 'override',
];

function sectionLabel(s: AuditEvent['section']): string {
  const map: Record<AuditEvent['section'], string> = {
    prescription_origin: 'Prescription origin',
    transfer: 'Transfer',
    dispense: 'Dispense',
    reprint: 'Reprint',
    reconciliation: 'Reconciliation',
    override: 'Override',
  };
  return map[s];
}

function actorColor(actor: string): string {
  if (actor === 'semble') return 'var(--semble-blue)';
  if (actor === 'system') return 'var(--accent)';
  return 'var(--text-muted)';
}

function actorDotColor(actor: string): string {
  if (actor === 'semble') return 'var(--semble-blue)';
  if (actor === 'system') return 'var(--accent)';
  return '#9CA3AF';
}

function downloadJson(events: AuditEvent[], id: string) {
  const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-trail-${id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AuditTrailModal({ dispenseId, patientId, onClose }: Props) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const titleId = dispenseId ?? patientId ?? 'unknown';

  useEffect(() => {
    setLoading(true);
    const fetch = dispenseId
      ? fetchDispenseAudit(dispenseId)
      : fetchAuditTrail(patientId ?? '');
    fetch.then(setEvents).finally(() => setLoading(false));
  }, [dispenseId, patientId]);

  // Group by section
  const grouped = SECTION_ORDER.reduce<Record<string, AuditEvent[]>>((acc, s) => {
    const sEvents = events.filter(e => e.section === s);
    if (sEvents.length > 0) acc[s] = sEvents;
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="rounded-card w-full mx-4 flex flex-col"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          border: '1px solid var(--border)',
          maxWidth: 640,
          maxHeight: '85vh',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>
            Audit trail · {titleId}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-faint)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading audit trail…</p>
          )}
          {!loading && events.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-faint)' }}>No audit entries found.</p>
          )}
          {!loading && Object.entries(grouped).map(([section, sEvents]) => (
            <div key={section} className="mb-5">
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-faint)' }}>
                {sectionLabel(section as AuditEvent['section'])}
              </div>
              <div className="space-y-3">
                {sEvents.map(ev => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: actorDotColor(ev.actor) }} />
                      <div className="flex-1 w-px mt-1" style={{ background: 'var(--border)' }} />
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{ev.event}</span>
                        <span className="text-xs tabular-nums" style={{ color: 'var(--text-faint)' }}>{fmtDateTime(ev.timestamp)}</span>
                      </div>
                      <div className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>{ev.detail}</div>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: actorColor(ev.actor) }}
                      >
                        {ev.actor}
                      </span>
                      {ev.overrideContext && (
                        <div className="mt-2 rounded p-2 text-xs" style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
                          <div className="font-medium mb-1" style={{ color: 'var(--amber)' }}>Field: {ev.overrideContext.fieldName}</div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium">Before:</span> {ev.overrideContext.oldValue}
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium">After:</span> {ev.overrideContext.newValue}
                          </div>
                          <div className="mt-1" style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium">Reason:</span> {ev.overrideContext.reason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
            This audit trail is a tamper-evident record. No entry can be modified or deleted. Downstream uneditability principle per Dr S. Kinra, MBA project 'Managing the Firm' (The Brook Surgery, 2026).
          </p>
          <button
            onClick={() => downloadJson(events, titleId)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-action border font-medium"
            style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
          >
            <Download size={12} /> Export for CQC review (JSON)
          </button>
        </div>
      </div>
    </div>
  );
}
