import { labelForValue, MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';
import { formatDayShort } from '../utils/dates.js';

export default function EntryCard({ entry, dateKey, faded }) {
  if (!entry) {
    return (
      <div className={`soft-card-muted px-4 py-3 ${faded ? 'opacity-60' : ''}`}>
        <div className="flex items-baseline justify-between font-sans">
          <div className="text-sm text-[var(--color-ink-500)]">{formatDayShort(dateKey)}</div>
          <div className="text-xs text-[var(--color-ink-300)] italic">no entry</div>
        </div>
      </div>
    );
  }
  const mood = labelForValue(MOOD_LABELS, entry.mood).label;
  const stress = labelForValue(STRESS_LABELS, entry.stress).label;
  const preview = (entry.transcript || '').slice(0, 140);
  return (
    <div className="soft-card px-4 py-3">
      <div className="flex items-baseline justify-between font-sans">
        <div className="text-sm text-[var(--color-ink-700)]">
          {formatDayShort(dateKey)}
          {entry.backfilled && <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--color-ink-300)]">backfilled</span>}
        </div>
        <div className="flex gap-3 text-[11px] uppercase tracking-wider">
          <span className="text-[var(--color-sage-700)]">{mood}</span>
          <span className="text-[var(--color-dusk-700)]">{stress}</span>
        </div>
      </div>
      {preview && (
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-700)]">
          {preview}{entry.transcript.length > 140 ? '…' : ''}
        </p>
      )}
    </div>
  );
}
