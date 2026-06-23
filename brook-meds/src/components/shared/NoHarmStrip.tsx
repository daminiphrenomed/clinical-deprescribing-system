interface Props { avgMinutes: number; targetMinutes: number; withinTarget: boolean; }

export default function NoHarmStrip({ avgMinutes, targetMinutes, withinTarget }: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg mb-4" style={{ background: withinTarget ? 'var(--green-light)' : 'var(--red-light)' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: withinTarget ? 'var(--green)' : 'var(--red)' }} />
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold" style={{ color: withinTarget ? 'var(--green)' : 'var(--red)' }}>
          No-harm metric
        </span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ color: 'var(--text)' }}>
          <strong className="font-semibold tabular-nums">{avgMinutes} min</strong> today avg
        </span>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{ color: withinTarget ? 'var(--green)' : 'var(--red)' }}>
          {withinTarget ? `within ${targetMinutes} min target` : `exceeds ${targetMinutes} min target`}
        </span>
      </div>
    </div>
  );
}
