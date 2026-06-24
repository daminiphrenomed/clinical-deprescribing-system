interface Props {
  label: string;
  value: string | number;
  foot?: string;
  variant?: 'urgent' | 'warn' | 'info' | 'default';
}

const variantStyles = {
  urgent: { bg: 'var(--red-light)', val: 'var(--red)' },
  warn: { bg: 'var(--amber-light)', val: 'var(--amber)' },
  info: { bg: 'var(--accent-light)', val: 'var(--accent)' },
  default: { bg: 'var(--surface)', val: 'var(--text)' },
};

export default function StatCard({ label, value, foot, variant = 'default' }: Props) {
  const s = variantStyles[variant];
  return (
    <div className="rounded-card p-4 border" style={{ background: s.bg, borderColor: 'var(--border)' }}>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-3xl font-bold tabular-nums mb-1" style={{ color: s.val }}>{value}</div>
      {foot && <div className="text-xs" style={{ color: 'var(--text-faint)' }}>{foot}</div>}
    </div>
  );
}
