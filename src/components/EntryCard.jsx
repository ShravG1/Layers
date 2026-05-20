import { labelForValue, MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';
import { formatDayShort } from '../utils/dates.js';

export default function EntryCard({ entry, dateKey, isToday, pending }) {
  if (!entry) {
    // Honest absence — no dashed borders, no fill, just a thin rule.
    return (
      <div className="flex items-center justify-between py-3 border-b border-[var(--ink-600)]">
        <div className="flex items-center gap-3">
          {isToday && pending && (
            <span aria-hidden className="w-2 h-2 rounded-full bg-[var(--ember-500)] anim-ember" />
          )}
          <span className="body-md text-[var(--paper-400)]">
            {formatDayShort(dateKey)}
          </span>
        </div>
        <span className="display-italic text-[14px] text-[var(--moon-700)]">—</span>
      </div>
    );
  }

  const mood = labelForValue(MOOD_LABELS, entry.mood).label;
  const stress = labelForValue(STRESS_LABELS, entry.stress).label;
  const preview = (entry.transcript || '').trim();

  return (
    <div className="py-3 border-b border-[var(--ink-600)]">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="body-lg text-[var(--paper-50)]">{formatDayShort(dateKey)}</span>
          {entry.backfilled && <span className="label text-[var(--paper-400)]">backfilled</span>}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Chip tone="ember" label={mood} />
          <Chip tone="moon" label={stress} />
        </div>
      </div>
      {preview && (
        <p className="body-md text-[var(--paper-200)] mt-1.5 truncate">
          {preview}
        </p>
      )}
    </div>
  );
}

function Chip({ label, tone }) {
  const color = tone === 'ember' ? 'var(--ember-300)' : 'var(--moon-300)';
  const bg    = tone === 'ember' ? 'rgba(232,137,74,0.12)' : 'rgba(123,145,176,0.12)';
  return (
    <span
      className="px-2 py-0.5 rounded-full label"
      style={{ color, backgroundColor: bg, letterSpacing: '0.10em' }}
    >
      {label}
    </span>
  );
}
