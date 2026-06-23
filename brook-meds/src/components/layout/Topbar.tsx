export default function Topbar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--navy)' }}>B</div>
          <span className="font-semibold text-sm" style={{ color: 'var(--navy)' }}>The Brook Surgery</span>
        </div>
        <div className="w-px h-5" style={{ background: 'var(--border)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Medicines Management Portal <span style={{ color: 'var(--text-faint)' }}>v3.2</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>U. Fernandez</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Senior Dispenser</div>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: 'var(--accent)' }}>UF</div>
      </div>
    </header>
  );
}
