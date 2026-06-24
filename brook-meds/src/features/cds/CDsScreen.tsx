import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import InsightStrip from '../../components/shared/InsightStrip';
import SembleStrip from '../../components/shared/SembleStrip';
import CDPrescriptionForm from './CDPrescriptionForm';
import CDRegister from './CDRegister';
import { fetchCDRegister } from '../../api/semble';
import type { CDRegisterEntry } from '../../lib/types';

export default function CDsScreen() {
  const [entries, setEntries] = useState<CDRegisterEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCDRegister().then(setEntries);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--navy)' }}>Controlled Drugs</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>CD register, PIN-authenticated prescribing, and dual sign-off dispense</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-action text-white text-sm font-medium"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={16} /> New CD prescription
        </button>
      </div>

      <InsightStrip>
        All CD prescriptions are PIN-authenticated, require dual sign-off at dispense, and create a tamper-evident register entry. Every entry is auditable against the CDROM.
      </InsightStrip>

      <SembleStrip
        reads="Patient demographics, weight, allergies, CD prescription history, allergies"
        writes="CD prescription to Semble medication list, register entry, dispensary queue item"
      />

      <div className="grid gap-6" style={{ gridTemplateColumns: '60% 40%' }}>
        <div>
          {showForm ? (
            <CDPrescriptionForm />
          ) : (
            <div
              className="rounded-card border p-8 flex flex-col items-center gap-3 cursor-pointer"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', borderStyle: 'dashed' }}
              onClick={() => setShowForm(true)}
            >
              <Plus size={24} style={{ color: 'var(--text-faint)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Click "+ New CD prescription" to open the prescribing form</span>
            </div>
          )}
        </div>
        <div>
          <CDRegister entries={entries} />
        </div>
      </div>
    </div>
  );
}
