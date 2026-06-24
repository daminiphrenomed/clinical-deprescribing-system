import type { CDRegisterEntry } from '../../lib/types';
import { fmtDateTime } from '../../lib/formatters';

interface Props {
  entries: CDRegisterEntry[];
}

function actionBg(action: CDRegisterEntry['action']): string {
  if (action === 'issued') return 'var(--amber-light)';
  if (action === 'received') return 'var(--green-light)';
  return 'var(--red-light)';
}

function actionColor(action: CDRegisterEntry['action']): string {
  if (action === 'issued') return 'var(--amber)';
  if (action === 'received') return 'var(--green)';
  return 'var(--red)';
}

export default function CDRegister({ entries }: Props) {
  function handleExport() {
    console.log('Export for CQC', entries);
  }

  return (
    <div className="rounded-card border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>CD Register</h2>
        <button
          onClick={handleExport}
          className="text-xs px-3 py-1.5 rounded-action border font-medium"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}
        >
          Export for CQC
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left pb-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Date/Time</th>
              <th className="text-left pb-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Drug</th>
              <th className="text-left pb-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Action</th>
              <th className="text-left pb-2 pr-3 font-medium" style={{ color: 'var(--text-muted)' }}>Who</th>
              <th className="text-right pb-2 pr-3 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>Packs Δ</th>
              <th className="text-right pb-2 font-medium tabular-nums" style={{ color: 'var(--text-muted)' }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <tr
                key={entry.id}
                style={{ background: actionBg(entry.action), borderBottom: '1px solid var(--border)' }}
              >
                <td className="py-2 pr-3" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {fmtDateTime(entry.dateTime)}
                </td>
                <td className="py-2 pr-3">
                  <div className="font-medium" style={{ color: 'var(--text)' }}>{entry.drug.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{entry.drug.strength}</div>
                </td>
                <td className="py-2 pr-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                    style={{ background: 'white', color: actionColor(entry.action), border: `1px solid ${actionColor(entry.action)}` }}
                  >
                    {entry.action}
                  </span>
                </td>
                <td className="py-2 pr-3" style={{ color: 'var(--text-muted)' }}>
                  {entry.action === 'issued' && (
                    <div>
                      <div>{entry.patient}</div>
                      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {entry.dispenser}{entry.witness && ` / ${entry.witness}`}
                      </div>
                    </div>
                  )}
                  {entry.action === 'received' && (
                    <div>
                      <div>{entry.supplier}</div>
                      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{entry.invoiceRef}</div>
                    </div>
                  )}
                  {entry.action === 'destroyed' && (
                    <div>
                      <div>{entry.destructionAuthRef}</div>
                      <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                        {entry.dispenser}{entry.witness && ` / ${entry.witness}`}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums font-medium" style={{ color: entry.packsDelta < 0 ? 'var(--red)' : 'var(--green)' }}>
                  {entry.packsDelta > 0 ? '+' : ''}{entry.packsDelta}
                </td>
                <td className="py-2 text-right tabular-nums font-semibold" style={{ color: 'var(--navy)' }}>
                  {entry.runningBalance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
