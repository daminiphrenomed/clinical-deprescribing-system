interface Props { title: string; message: string; onClose: () => void; }

export default function Toast({ title, message, onClose }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-xl shadow-lg" style={{ background: 'var(--surface)', borderLeft: '4px solid var(--green)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--green)' }}>{title}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</div>
        </div>
        <button onClick={onClose} className="text-sm font-medium shrink-0" style={{ color: 'var(--text-faint)' }}>&#x2715;</button>
      </div>
    </div>
  );
}
