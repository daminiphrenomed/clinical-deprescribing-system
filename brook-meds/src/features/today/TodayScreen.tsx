import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Scan } from 'lucide-react';
import { fetchTodayQueue, fetchPatientWaitTimeMetric } from '../../api/semble';
import type { Prescription, WaitTimeMetric } from '../../lib/types';
import NoHarmStrip from '../../components/shared/NoHarmStrip';
import InsightStrip from '../../components/shared/InsightStrip';
import SembleStrip from '../../components/shared/SembleStrip';
import StatCard from './StatCard';
import QueueItem from './QueueItem';
import { sortQueue } from './sortQueue';

export default function TodayScreen() {
  const [queue, setQueue] = useState<Prescription[]>([]);
  const [metric, setMetric] = useState<WaitTimeMetric | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayQueue().then(q => setQueue(sortQueue(q)));
    fetchPatientWaitTimeMetric().then(setMetric);
  }, []);

  const urgentCount = queue.filter(r => r.priority === 'urgent').length;
  const reconcileCount = queue.filter(r => r.reconciliationConflict).length;
  const awaitingCount = queue.length;
  const expiringCount = 3;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Today</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{format(new Date(), 'EEEE d MMMM yyyy')}</p>
        </div>
        <button
          onClick={() => navigate('/scan')}
          className="flex items-center gap-2 px-4 py-2 rounded-action text-white text-sm font-medium"
          style={{ background: 'var(--accent)' }}
        >
          <Scan size={16} /> Scan barcode to dispense
        </button>
      </div>

      {metric && (
        <NoHarmStrip
          avgMinutes={metric.avgMinutes}
          targetMinutes={metric.targetMinutes}
          withinTarget={metric.withinTarget}
        />
      )}

      <InsightStrip>
        Every prescription arrives here from Semble the moment the doctor signs it — no phone call, no paper, no delay. Priority sorted so paediatric CDs are always first.
      </InsightStrip>

      <SembleStrip
        reads="Active prescriptions, patient demographics, repeat metadata, dispensing history"
        writes="Dispense annotation on clinical record, billing line items, CD register entries"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Urgent (paeds + CDs)" value={urgentCount} foot="See first" variant="urgent" />
        <StatCard label="Reconciliation needed" value={reconcileCount} foot="Review before dispensing" variant="warn" />
        <StatCard label="Awaiting dispense" value={awaitingCount} foot="Total in queue" variant="info" />
        <StatCard label="Stock expiring ≤30 days" value={expiringCount} foot="Check inventory" variant="warn" />
      </div>

      <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>Priority queue</h2>
          <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{queue.length} prescriptions</span>
        </div>
        {queue.map(rx => <QueueItem key={rx.id} rx={rx} />)}
      </div>
    </div>
  );
}
