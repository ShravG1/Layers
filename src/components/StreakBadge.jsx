export default function StreakBadge({ count, bumped, compact = false }) {
  return (
    <div className={`inline-flex items-center gap-2 ${compact ? '' : 'py-2 px-3'}`}>
      <span
        aria-hidden
        className={`inline-block ${bumped ? 'anim-streak' : 'anim-ember'} text-xl leading-none`}
        style={{ transformOrigin: 'center' }}
      >
        {count > 0 ? '🔥' : '·'}
      </span>
      <div className="leading-tight font-sans">
        <div className={`${compact ? 'text-sm' : 'text-base'} font-medium tracking-tight`}>
          {count > 0 ? `Day ${count}` : 'Start your streak'}
        </div>
        {!compact && (
          <div className="text-xs text-[var(--color-ink-500)]">
            {count > 0 ? 'kept going' : 'one entry begins it'}
          </div>
        )}
      </div>
    </div>
  );
}
