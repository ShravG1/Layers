import StreakBadge from './StreakBadge.jsx';
import BackfillBanner from './BackfillBanner.jsx';
import EntryCard from './EntryCard.jsx';
import { lastNDaysKeys, todayKey, isSunday, isFirstOfMonth } from '../utils/dates.js';
import { greetingFor } from '../utils/greeting.js';

export default function Home({
  entries,
  streak,
  streakBumped,
  todayEntry,
  missedYesterday,
  onStartToday,
  onBackfill,
  onOpenWeekly,
  onOpenMonthly,
  onOpenSettings,
  summaryFrequency,
}) {
  // A teaser steals room from the recent list, so show fewer rows when shown.
  const showWeeklyTeaser = summaryFrequency !== 'monthly-only' && isSunday();
  const showMonthlyTeaser = isFirstOfMonth();
  const recentCount = (showWeeklyTeaser || showMonthlyTeaser) ? 3 : 5;
  const recent = lastNDaysKeys(recentCount).reverse();

  return (
    <main className="h-dvh flex flex-col overflow-hidden px-5 pt-8 pb-6">
      <header className="flex items-start justify-between mb-6 anim-lift shrink-0">
        <div>
          <div className="label">Reflection</div>
          <h1 className="display-lg mt-2 text-[var(--paper-50)]">{greetingFor()}</h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="w-11 h-11 rounded-full surface-card press flex items-center justify-center"
        >
          <SettingsGlyph />
        </button>
      </header>

      <section className="mb-5 anim-lift delay-100 shrink-0">
        <StreakBadge entries={entries} count={streak.count} bumped={streakBumped} />
      </section>

      {missedYesterday && !todayEntry && (
        <BackfillBanner onTap={onBackfill} />
      )}

      <section className="anim-lift delay-200 shrink-0">
        {todayEntry ? (
          <article className="surface-card rail-ember p-5 anim-glow-rise">
            <div className="label">tonight · saved</div>
            <p className="display-italic text-[19px] leading-relaxed mt-2 text-[var(--paper-50)] line-clamp-3">
              {todayEntry.transcript || 'Saved without a note. Your feelings are logged.'}
            </p>
            <div className="flex gap-2 mt-3">
              <span className="label text-[var(--ember-300)]">mood</span>
              <span className="label text-[var(--moon-300)]">stress</span>
            </div>
          </article>
        ) : (
          <button
            type="button"
            onClick={onStartToday}
            className="block w-full text-left surface-card rail-ember press p-5 group relative overflow-hidden"
            style={{ boxShadow: 'var(--shadow-lg), var(--glow-ember), inset 4px 0 0 var(--ember-500)' }}
          >
            <div className="label">Tonight</div>
            <div className="display-lg mt-2 text-[var(--paper-50)]">Reflect on today</div>
            <p className="body-md mt-1.5 text-[var(--paper-200)]">
              Voice or text. Two soft sliders. Under a minute.
            </p>
            <ChevronGlyph className="absolute top-5 right-5 text-[var(--ember-500)] opacity-80 group-hover:translate-x-1 transition-transform duration-500" />
          </button>
        )}
      </section>

      {showWeeklyTeaser && (
        <SummaryTeaser
          label="Sunday review"
          title="Your week, in review"
          subtitle="Seven nights of small notes, ready to read back."
          onTap={onOpenWeekly}
          tone="moon"
          delay="delay-300"
        />
      )}
      {showMonthlyTeaser && (
        <SummaryTeaser
          label="Month in review"
          title="Sit with the whole month"
          subtitle="Read every day before you reflect."
          onTap={onOpenMonthly}
          tone="ember"
          delay="delay-400"
        />
      )}

      {/* Recent list fills the remaining space without scrolling */}
      <section className="mt-6 anim-lift delay-300 flex-1 min-h-0 flex flex-col">
        <div className="flex items-baseline justify-between mb-2 shrink-0">
          <h2 className="label">Recent nights</h2>
          <div className="flex gap-4">
            <button onClick={onOpenWeekly} className="label draw-underline text-[var(--paper-200)]">Week</button>
            <button onClick={onOpenMonthly} className="label draw-underline text-[var(--paper-200)]">Month</button>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {recent.map((k, i) => (
            <div
              key={k}
              className="anim-lift-soft"
              style={{ animationDelay: `${Math.min(i * 40, 320)}ms` }}
            >
              <EntryCard
                dateKey={k}
                entry={entries[k]}
                isToday={k === todayKey()}
                pending={k === todayKey() && !todayEntry}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function SummaryTeaser({ label, title, subtitle, onTap, tone, delay }) {
  const rail = tone === 'ember' ? 'rail-ember' : 'rail-moon';
  return (
    <button
      type="button"
      onClick={onTap}
      className={`mt-4 w-full text-left surface-card ${rail} p-4 press anim-lift shrink-0 ${delay}`}
    >
      <div className="label">{label}</div>
      <div className="display-sm mt-1.5 text-[var(--paper-50)]">{title}</div>
      <div className="body-sm mt-1 text-[var(--paper-200)]">{subtitle}</div>
    </button>
  );
}

function SettingsGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden
         style={{ color: 'var(--paper-200)' }}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13.6a7.6 7.6 0 0 0 0-3.2l1.6-1.3-1.6-2.8-2 .6a7.7 7.7 0 0 0-2.8-1.6L14 3h-4l-.6 2.3a7.7 7.7 0 0 0-2.8 1.6l-2-.6L3 9.1l1.6 1.3a7.6 7.6 0 0 0 0 3.2L3 14.9l1.6 2.8 2-.6a7.7 7.7 0 0 0 2.8 1.6L10 21h4l.6-2.3a7.7 7.7 0 0 0 2.8-1.6l2 .6L21 14.9l-1.6-1.3z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronGlyph({ className }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
