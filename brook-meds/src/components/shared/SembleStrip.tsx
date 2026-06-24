interface Props { reads: string; writes: string; }

export default function SembleStrip({ reads, writes }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 px-4 py-3 rounded-lg mb-4 text-sm" style={{ background: 'var(--semble-light)' }}>
      <div>
        <div className="font-semibold mb-1" style={{ color: 'var(--semble-blue)' }}>Semble reads</div>
        <div style={{ color: 'var(--text-muted)' }}>{reads}</div>
      </div>
      <div>
        <div className="font-semibold mb-1" style={{ color: 'var(--semble-blue)' }}>Semble writes</div>
        <div style={{ color: 'var(--text-muted)' }}>{writes}</div>
      </div>
    </div>
  );
}
