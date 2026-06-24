interface Props { prescriber: string; dispenser: string; governance: string; }

export default function AccountabilityStrip({ prescriber, dispenser, governance }: Props) {
  return (
    <div className="flex gap-6 px-4 py-3 rounded-lg mb-4" style={{ background: '#F3F4F6', border: '1px solid var(--border)' }}>
      {[
        { label: 'Clinical responsibility', name: prescriber },
        { label: 'Execution (dispenser)', name: dispenser },
        { label: 'Governance oversight', name: governance },
      ].map(({ label, name }) => (
        <div key={label}>
          <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>{label}</div>
          <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{name}</div>
        </div>
      ))}
    </div>
  );
}
