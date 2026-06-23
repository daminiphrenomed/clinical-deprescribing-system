import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { differenceInHours } from 'date-fns';
import { ArrowLeft, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { fetchPatientFull } from '../../api/semble';
import type { Patient, Prescription, DispenseEvent } from '../../lib/types';
import AccountabilityStrip from '../../components/shared/AccountabilityStrip';
import InsightStrip from '../../components/shared/InsightStrip';
import SembleStrip from '../../components/shared/SembleStrip';
import Toast from '../../components/shared/Toast';
import IssueRepeatModal from './IssueRepeatModal';
import ReprintLabelModal from './ReprintLabelModal';
import { fmtDate, fmtDateTime } from '../../lib/formatters';

const REPRINT_WINDOW_HOURS = 72;

interface FullPatientData {
  patient: Patient;
  activePrescriptions: Prescription[];
  recentDispenses: DispenseEvent[];
  reconciliationConflicts: Prescription[];
  accountability: { prescriber: string; dispenser: string; governance: string };
}

export default function PatientScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FullPatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issueModal, setIssueModal] = useState<Prescription | null>(null);
  const [reprintModal, setReprintModal] = useState<DispenseEvent | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPatientFull(id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-muted)' }}>
        Loading patient data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p style={{ color: 'var(--text-muted)' }}>Patient not found</p>
        <button onClick={() => navigate('/today')} className="text-sm" style={{ color: 'var(--accent)' }}>
          Return to Today
        </button>
      </div>
    );
  }

  const { patient, activePrescriptions, recentDispenses, reconciliationConflicts, accountability } = data;
  const fullName = `${patient.name.first} ${patient.name.last}`;
  const readyRx = activePrescriptions.filter(rx => rx.type === 'cd_acute' || rx.type === 'acute');
  const repeatRx = activePrescriptions.filter(rx => rx.type === 'repeat' || rx.type === 'cd_repeat');

  function handleReprintConfirm(reason: string, _notes: string) {
    setToast({
      title: 'Label reprinted',
      message: `Reprint logged. Reason: ${reason}`,
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/today')}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={14} /> Today
        </button>
        <span style={{ color: 'var(--border-strong)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{fullName}</span>
      </div>

      {/* Demographics */}
      <div className="rounded-card border p-5 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--navy)' }}>{fullName}</h1>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>NHS {patient.nhsNumber}</span>
              <span>DOB {fmtDate(patient.dob)}</span>
              {patient.weightKg && <span>{patient.weightKg} kg</span>}
              <span>{patient.registeredGp}</span>
            </div>
            {patient.allergies.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: 'var(--red)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--red)' }}>
                  Allergies: {patient.allergies.join(', ')}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {patient.flags.paediatric && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>Paediatric</span>
            )}
            {patient.flags.cdOnRecord && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>CD on record</span>
            )}
            {patient.flags.doubleCheck && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--red-light)', color: 'var(--red)' }}>Double-check</span>
            )}
            {patient.flags.pleHistory && (
              <span className="text-xs px-2 py-1 rounded" style={{ background: '#F3F4F6', color: 'var(--text-muted)' }}>PLE history</span>
            )}
          </div>
        </div>
      </div>

      {/* Accountability */}
      <AccountabilityStrip
        prescriber={accountability.prescriber}
        dispenser={accountability.dispenser}
        governance={accountability.governance}
      />

      {/* Reconciliation conflicts */}
      {reconciliationConflicts.length > 0 && (
        <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--amber-light)', borderColor: 'var(--amber)' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} style={{ color: 'var(--amber)' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--amber)' }}>Reconciliation required before dispensing</span>
          </div>
          {reconciliationConflicts.map(rx => (
            <div key={rx.id} className="mt-2 text-sm" style={{ color: 'var(--text)' }}>
              <span className="font-medium">{rx.drug.name} {rx.drug.strength}</span>
              {rx.reconciliationConflict && (
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {rx.reconciliationConflict.conflictDescription}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <InsightStrip>
        All active prescriptions are shown together so you can spot interactions, duplicate therapies, and review-date alerts in one glance before dispensing.
      </InsightStrip>

      <SembleStrip
        reads="Active prescriptions, repeat counters, dispense history, clinical notes"
        writes="Dispense event, billing line, CD register entry, label print audit"
      />

      {/* Ready to dispense */}
      {readyRx.length > 0 && (
        <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Ready to dispense</h2>
          <div className="space-y-3">
            {readyRx.map(rx => (
              <div key={rx.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    {rx.drug.name} {rx.drug.strength}
                    {rx.cdSchedule && (
                      <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
                        Schedule {rx.cdSchedule} CD
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {rx.dose} · {rx.packSize} · {rx.indication}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                    Prescribed by {rx.issuedBy} · {fmtDate(rx.issuedAt)}
                  </div>
                  {rx.reconciliationConflict && (
                    <div className="mt-1 text-xs font-medium" style={{ color: 'var(--amber)' }}>
                      Reconcile before dispensing
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/scan?prescription=${rx.id}&quantity=${rx.quantity}`)}
                  className="px-4 py-2 rounded-action text-white text-sm font-medium shrink-0"
                  style={{ background: 'var(--accent)' }}
                >
                  Dispense
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active repeats */}
      {repeatRx.length > 0 && (
        <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Active repeats</h2>
          <div className="space-y-3">
            {repeatRx.map(rx => {
              const r = rx.repeat;
              const reviewWarning = r && differenceInHours(new Date(r.reviewDate), new Date()) / 24 <= 14;
              const reviewOverdue = r && new Date(r.reviewDate) < new Date();
              return (
                <div key={rx.id} className="p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                        {rx.drug.name} {rx.drug.strength}
                        {rx.cdSchedule && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
                            Schedule {rx.cdSchedule} CD
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {rx.dose} · {rx.indication}
                      </div>
                      {r && (
                        <div className="flex items-center gap-4 mt-1.5">
                          <div className="text-xs">
                            <span className="font-medium" style={{ color: 'var(--text)' }}>{r.refillsRemaining}</span>
                            <span style={{ color: 'var(--text-faint)' }}> refills left</span>
                          </div>
                          <div className="text-xs" style={{ color: reviewOverdue ? 'var(--red)' : reviewWarning ? 'var(--amber)' : 'var(--text-faint)' }}>
                            <Clock size={10} className="inline mr-1" />
                            Review {fmtDate(r.reviewDate)}
                            {reviewOverdue && ' (OVERDUE)'}
                            {reviewWarning && !reviewOverdue && ' (soon)'}
                          </div>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(r.alreadyIssued / r.totalAllowed) * 100}%`,
                                background: r.refillsRemaining <= 2 ? 'var(--amber)' : 'var(--green)',
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setIssueModal(rx)}
                      className="px-3 py-1.5 rounded-action text-sm font-medium text-white shrink-0"
                      style={{ background: 'var(--accent)' }}
                    >
                      Issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent dispenses */}
      <div className="rounded-card border p-4 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--navy)' }}>Recent dispenses</h2>
        {recentDispenses.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-faint)' }}>No recent dispenses</p>
        ) : (
          <div className="space-y-3">
            {recentDispenses.map(ev => {
              const hoursAgo = differenceInHours(new Date(), new Date(ev.dispensedAt));
              const withinWindow = hoursAgo <= REPRINT_WINDOW_HOURS;
              return (
                <div key={ev.id} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Dispense #{ev.id}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {fmtDateTime(ev.dispensedAt)} · {ev.dispensedBy}
                      {ev.witness && ` · Witness: ${ev.witness}`}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {ev.packsDispensed} pack(s) · Lots: {ev.packLots.join(', ')}
                      {ev.cdRegisterEntryId && ` · CD reg: ${ev.cdRegisterEntryId}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <button
                      onClick={() => withinWindow && setReprintModal(ev)}
                      title={withinWindow ? 'Reprint label' : 'Reprint window (72h) has closed'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-action text-xs font-medium"
                      style={{
                        background: withinWindow ? 'var(--accent-light)' : 'var(--bg)',
                        color: withinWindow ? 'var(--accent)' : 'var(--text-faint)',
                        border: `1px solid ${withinWindow ? 'var(--accent)' : 'var(--border)'}`,
                        cursor: withinWindow ? 'pointer' : 'not-allowed',
                        opacity: withinWindow ? 1 : 0.5,
                      }}
                    >
                      <RotateCcw size={12} />
                      Reprint
                    </button>
                    {!withinWindow && (
                      <span className="text-xs" style={{ color: 'var(--text-faint)' }}>72h window closed</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {issueModal && (
        <IssueRepeatModal
          prescription={issueModal}
          onClose={() => setIssueModal(null)}
        />
      )}

      {reprintModal && (
        <ReprintLabelModal
          dispenseEvent={reprintModal}
          onClose={() => setReprintModal(null)}
          onConfirm={handleReprintConfirm}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
