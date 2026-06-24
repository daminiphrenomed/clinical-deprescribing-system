import { useEffect, useState } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import InsightStrip from '../../components/shared/InsightStrip';
import { fetchSettings, updateSettings } from '../../api/semble';
import type { SettingsConfig } from '../../lib/types';
import { patients } from '../../api/mocks/fixtures';
import { fmtDateTime } from '../../lib/formatters';

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-card border text-sm font-medium"
      style={{ background: 'var(--green-light)', borderColor: 'var(--green)', color: 'var(--green)' }}>
      <CheckCircle size={16} /> {message}
    </div>
  );
}

export default function SettingsScreen() {
  const [config, setConfig] = useState<SettingsConfig | null>(null);
  const [markupRates, setMarkupRates] = useState({ default: 35, controlled: 28, specialty: 42 });
  const [reprintWindow, setReprintWindow] = useState(72);
  const [manualPolicy, setManualPolicy] = useState<SettingsConfig['manualEntryPolicy']>('lead_override');
  const [toast, setToast] = useState<string | null>(null);
  const [sensitivePatients, setSensitivePatients] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings().then(cfg => {
      setConfig(cfg);
      setMarkupRates(cfg.markupRates);
      setReprintWindow(cfg.reprintWindowHours);
      setManualPolicy(cfg.manualEntryPolicy);
      setSensitivePatients(cfg.sensitivePatients);
    });
  }, []);

  async function saveSection(patch: Partial<SettingsConfig>, label: string) {
    const updated = await updateSettings(patch);
    setConfig(updated);
    setToast(`${label} saved`);
  }

  const inputStyle = {
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    color: 'var(--text)',
    background: 'var(--bg)',
  };

  const sectionStyle = {
    background: 'var(--surface)',
    borderColor: 'var(--border)',
  };

  if (!config) {
    return <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>Loading settings…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Dispensary configuration and governance</p>
      </div>

      <InsightStrip>
        All setting changes are audit-logged. No change is silent.
      </InsightStrip>

      <div className="space-y-5">
        {/* Label template */}
        <div className="rounded-card border p-5" style={sectionStyle}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Label template</h2>
          <pre className="text-xs rounded-input p-3 mb-3 overflow-x-auto" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'monospace' }}>
            {config.labelTemplate.content}
          </pre>
          <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
            Template ID: {config.labelTemplate.templateId} · Last modified by {config.labelTemplate.lastModifiedBy} on {fmtDateTime(config.labelTemplate.lastModifiedAt)}
          </div>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>Label template editing is available from Phase 7 onwards.</div>
        </div>

        {/* Markup rates */}
        <div className="rounded-card border p-5" style={sectionStyle}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Markup rates</h2>
          <div className="grid grid-cols-3 gap-4 mb-3">
            {(['default', 'controlled', 'specialty'] as const).map(key => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1 capitalize" style={{ color: 'var(--text-muted)' }}>{key}</label>
                <div className="flex items-center gap-1">
                  <input
                    style={{ ...inputStyle, width: 70 }}
                    type="number"
                    min={0}
                    max={100}
                    value={markupRates[key]}
                    onChange={e => setMarkupRates(r => ({ ...r, [key]: Number(e.target.value) }))}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-faint)' }}>
            Example: Cost £8.40 → sell at £{(8.40 * (1 + markupRates.default / 100)).toFixed(2)} (default markup)
          </div>
          <button
            onClick={() => saveSection({ markupRates }, 'Markup rates')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-action text-white font-medium"
            style={{ background: 'var(--accent)' }}
          >
            <Save size={12} /> Save changes
          </button>
        </div>

        {/* Sensitive patients */}
        <div className="rounded-card border p-5" style={sectionStyle}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Sensitive patients</h2>
          <div className="space-y-2 mb-3">
            {sensitivePatients.map(pid => {
              const p = patients.find(pt => pt.id === pid);
              return (
                <div key={pid} className="flex items-center justify-between text-sm p-2 rounded-input" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text)' }}>{p ? `${p.name.last} ${p.name.first}` : pid}</span>
                  <button
                    onClick={() => setSensitivePatients(sp => sp.filter(s => s !== pid))}
                    className="text-xs"
                    style={{ color: 'var(--red)' }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            {sensitivePatients.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>No sensitive patients configured.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              style={{ ...inputStyle, flex: 1 }}
              defaultValue=""
              onChange={e => {
                const val = e.target.value;
                if (val && !sensitivePatients.includes(val)) {
                  setSensitivePatients(sp => [...sp, val]);
                }
                e.target.value = '';
              }}
            >
              <option value="">Add patient…</option>
              {patients.filter(p => !sensitivePatients.includes(p.id)).map(p => (
                <option key={p.id} value={p.id}>{p.name.last} {p.name.first}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reprint window */}
        <div className="rounded-card border p-5" style={sectionStyle}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Reprint window</h2>
          <div className="flex items-center gap-3 mb-3">
            <input
              style={{ ...inputStyle, width: 80 }}
              type="number"
              min={1}
              value={reprintWindow}
              onChange={e => setReprintWindow(Number(e.target.value))}
            />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>hours</span>
          </div>
          <button
            onClick={() => saveSection({ reprintWindowHours: reprintWindow }, 'Reprint window')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-action text-white font-medium"
            style={{ background: 'var(--accent)' }}
          >
            <Save size={12} /> Save changes
          </button>
        </div>

        {/* Manual entry policy */}
        <div className="rounded-card border p-5" style={sectionStyle}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Manual entry policy</h2>
          <select
            style={{ ...inputStyle, marginBottom: 12 }}
            value={manualPolicy}
            onChange={e => setManualPolicy(e.target.value as SettingsConfig['manualEntryPolicy'])}
          >
            <option value="allowed">Allowed — any dispenser</option>
            <option value="lead_override">Lead override — dispensary lead must authorise</option>
            <option value="blocked">Blocked — no manual entry permitted</option>
          </select>
          <div>
            <button
              onClick={() => saveSection({ manualEntryPolicy: manualPolicy }, 'Manual entry policy')}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-action text-white font-medium"
              style={{ background: 'var(--accent)' }}
            >
              <Save size={12} /> Save changes
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
