import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import InsightStrip from '../../components/shared/InsightStrip';
import SembleStrip from '../../components/shared/SembleStrip';
import { fetchAnalytics } from '../../api/semble';
import type { AnalyticsKPI } from '../../lib/types';

export default function AnalyticsScreen() {
  const [kpi, setKpi] = useState<AnalyticsKPI | null>(null);

  useEffect(() => {
    fetchAnalytics().then(setKpi);
  }, []);

  if (!kpi) {
    return <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>Loading analytics…</div>;
  }

  const compliance = kpi.compliance;

  const complianceItems = [
    { label: 'CD register reconciled', ok: compliance.cdRegisterReconciled },
    { label: 'Cold chain log current', ok: compliance.coldChainCurrent },
    { label: `SOPs current (${compliance.sopsCurrent}/12)`, ok: compliance.sopsCurrent === 12 },
    { label: `Significant events 90d (${compliance.significantEvents90d})`, ok: compliance.significantEvents90d === 0 },
    { label: 'Audit trail exportable', ok: true },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Analytics</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dispensing metrics, margin tracking, and compliance status</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-action text-white text-sm font-medium"
          style={{ background: 'var(--accent)' }}
          onClick={() => console.log('Export for CQC inspection')}
        >
          <Download size={16} /> Export for CQC inspection
        </button>
      </div>

      <InsightStrip>
        Real-time dispensing metrics, margin tracking, and CQC-ready compliance status — all derived from the dispense events Brook Meds records.
      </InsightStrip>

      <SembleStrip
        reads="Billing line items written by Brook Meds for revenue reconciliation"
        writes="None"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Items dispensed (month)</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--navy)' }}>{kpi.itemsDispensed.month.toLocaleString()}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--green)' }}>+{kpi.itemsDispensed.deltaPctVsPrior}% vs prior month</div>
        </div>
        <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Gross margin (month)</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--navy)' }}>{kpi.grossMargin.actualPct}%</div>
          <div className="text-xs mt-1" style={{ color: kpi.grossMargin.actualPct >= kpi.grossMargin.targetPct ? 'var(--green)' : 'var(--amber)' }}>
            Target {kpi.grossMargin.targetPct}%
          </div>
        </div>
        <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Dispensing errors (30d)</div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: kpi.dispensingErrors.past30Days === 0 ? 'var(--green)' : 'var(--red)' }}>
            {kpi.dispensingErrors.past30Days}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{kpi.dispensingErrors.past60Days} in 60d</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-card border p-4 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>14-day daily dispense volume</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={kpi.dailyVolume} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-faint)' }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-faint)' }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--border)' }}
              formatter={(v) => [v as number, 'Dispenses']}
            />
            <Bar dataKey="total" radius={[3, 3, 0, 0]}>
              {kpi.dailyVolume.map((entry, i) => {
                const d = new Date(entry.date);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return <Cell key={i} fill={isWeekend ? '#9CA3AF' : 'var(--navy)'} opacity={isWeekend ? 0.4 : 1} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top dispensed lines */}
        <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Top dispensed lines</h2>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left pb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Drug</th>
                <th className="text-right pb-2 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>Packs</th>
                <th className="text-right pb-2 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {kpi.topDispensedLines.map(line => (
                <tr key={line.drug} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--text)' }}>{line.drug}</td>
                  <td className="py-2 text-right tabular-nums" style={{ color: 'var(--text-muted)' }}>{line.packs}</td>
                  <td className="py-2 text-right tabular-nums font-medium" style={{ color: 'var(--green)' }}>{line.marginPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Compliance status */}
        <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Compliance status</h2>
          <div className="space-y-3">
            {complianceItems.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                {item.ok
                  ? <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  : <XCircle size={16} style={{ color: 'var(--red)', flexShrink: 0 }} />
                }
                <span className="text-sm" style={{ color: item.ok ? 'var(--text)' : 'var(--red)' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
