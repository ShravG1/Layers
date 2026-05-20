import { lastNDaysKeys, todayKey } from '../utils/dates.js';

/**
 * Spark-thread: 7 dots representing the last 7 nights.
 * - Filled (ember + glow) = entry that night
 * - Hollow (1px paper-400 ring) = missed
 * - Today pulses gently; if it's the freshest entry, the dot is rendered with
 *   the `spark` keyframe to celebrate the new tick.
 */
export default function StreakBadge({ entries, count, bumped }) {
  const days = lastNDaysKeys(7);
  const today = todayKey();

  return (
    <div className="flex items-center gap-5">
      <div className="flex items-center gap-2.5" aria-label={`Streak: ${count} consecutive nights`}>
        {days.map((k, i) => {
          const filled = !!entries[k];
          const isToday = k === today;
          const isFreshTick = isToday && filled && bumped;
          return (
            <span
              key={k}
              className={`relative inline-block w-3 h-3 rounded-full
                          ${filled ? 'bg-[var(--ember-500)]' : 'bg-transparent'}
                          ${filled ? '' : 'ring-1 ring-[var(--paper-400)]/40'}
                          ${isToday && filled ? 'anim-ember' : ''}
                          ${isFreshTick ? 'anim-spark' : ''}`}
              style={{ animationDelay: `${i * 70}ms` }}
              aria-hidden
            >
              {isToday && !filled && (
                <span className="absolute inset-0 rounded-full ring-1 ring-[var(--ember-500)] anim-ember" />
              )}
            </span>
          );
        })}
      </div>

      <div>
        <div className="display-md text-[var(--paper-50)] leading-none">
          {count > 0 ? `Day ${count}` : 'Begin'}
        </div>
        <div className="label mt-1">
          {count > 0 ? 'consecutive nights' : 'tonight starts the thread'}
        </div>
      </div>
    </div>
  );
}
