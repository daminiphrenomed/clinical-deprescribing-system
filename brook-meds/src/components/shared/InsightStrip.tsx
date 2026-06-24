import { type ReactNode } from 'react';

interface Props { children: ReactNode; }

export default function InsightStrip({ children }: Props) {
  return (
    <div className="px-4 py-3 rounded-lg mb-4 text-sm" style={{ background: 'var(--accent-light)', color: 'var(--accent)', borderLeft: '3px solid var(--accent)' }}>
      <span className="font-semibold">Why this is better · </span>{children}
    </div>
  );
}
