interface EquivalenceField {
  label: string;
  prescribed: string;
  scanned: string;
  match: boolean;
}

interface Props {
  fields: EquivalenceField[];
}

function MatchDot({ match }: { match: boolean }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-2"
      style={{ background: match ? 'var(--green)' : 'var(--red)' }}
    />
  );
}

export default function EquivalencePanel({ fields }: Props) {
  return (
    <div className="rounded-card border overflow-hidden mb-4" style={{ borderColor: 'var(--border)' }}>
      <div className="grid grid-cols-2">
        <div className="p-3 text-xs font-semibold uppercase tracking-wide border-b border-r" style={{ color: 'var(--semble-blue)', background: 'var(--semble-light)', borderColor: 'var(--border)' }}>
          Semble prescription
        </div>
        <div className="p-3 text-xs font-semibold uppercase tracking-wide border-b" style={{ color: 'var(--text-muted)', background: '#F9FAFB', borderColor: 'var(--border)' }}>
          Scanned pack
        </div>
      </div>
      {fields.map((field) => (
        <div key={field.label} className="grid grid-cols-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
          <div className="p-3 border-r" style={{ borderColor: 'var(--border)', borderLeft: '3px solid var(--semble-blue)' }}>
            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>{field.label}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{field.prescribed}</div>
          </div>
          <div className="p-3">
            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-faint)' }}>{field.label}</div>
            <div className="text-sm font-medium flex items-center" style={{ color: field.match ? 'var(--green)' : 'var(--red)' }}>
              <MatchDot match={field.match} />
              {field.scanned}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
