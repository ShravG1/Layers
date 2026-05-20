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
  const recent = lastNDaysKeys(7).reverse();
  const showWeeklyTeaser = summaryFrequency !== 'monthly-only' && isSunday();
  const showMonthlyTeaser = isFirstOfMonth();

  return (
    <main className="min-h-dvh px-5 pt-9 pb-12">
      <header className="flex items-start justify-between mb-9 anim-lift">
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

      <section className="mb-7 anim-lift delay-100">
        <StreakBadge entries={entries} count={streak.count} bumped={streakBumped} />
      </section>

      {missedYesterday && !todayEntry && (
        <BackfillBanner onTap={onBackfill} />
      )}

      <section className="anim-lift delay-200">
        {todayEntry ? (
          <article className="surface-card rail-ember p-6 anim-glow-rise">
            <div className="label">tonight · saved</div>
            <p className="display-italic text-[20px] leading-relaxed mt-3 text-[var(--paper-50)]">
              {todayEntry.transcript || 'Saved without a note. Your feelings are logged.'}
            </p>
            <div className="flex gap-2 mt-4">
              <span className="label text-[var(--ember-300)]">mood</span>
              <span className="label text-[var(--moon-300)]">stress</span>
            </div>
          </article>
        ) : (
          <button
            type="button"
            onClick={onStartToday}
            className="block w-full text-left surface-card rail-ember press p-6 group relative overflow-hidden"
            style={{ boxShadow: 'var(--shadow-lg), var(--glow-ember), inset 4px 0 0 var(--ember-500)' }}
          >
            <div className="label">Tonight</div>
            <div className="display-lg mt-3 text-[var(--paper-50)]">Reflect on today</div>
            <p className="body-md mt-2 text-[var(--paper-200)]">
              Voice or text. Two soft sliders. Under a minute.
            </p>
            <ChevronGlyph className="absolute top-6 right-6 text-[var(--ember-500)] opacity-80 group-hover:translate-x-1 transition-transform duration-500" />
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

      <section className="mt-10 anim-lift delay-300">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="label">Recent nights</h2>
          <div className="flex gap-4">
            <button onClick={onOpenWeekly} className="label draw-underline text-[var(--paper-200)]">Week</button>
            <button onClick={onOpenMonthly} className="label draw-underline text-[var(--paper-200)]">Month</button>
          </div>
        </div>
        <div>
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
      className={`mt-5 w-full text-left surface-card ${rail} p-5 press anim-lift ${delay}`}
    >
      <div className="label">{label}</div>
      <div className="display-md mt-2 text-[var(--paper-50)]">{title}</div>
      <div className="body-md mt-1.5 text-[var(--paper-200)]">{subtitle}</div>
    </button>
  );
}

function SettingsGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="#DFD3BE" strokeWidth="1.6" />
      <path
        d="M19.4 13.6a7.6 7.6 0 0 0 0-3.2l1.6-1.3-1.6-2.8-2 .6a7.7 7.7 0 0 0-2.8-1.6L14 3h-4l-.6 2.3a7.7 7.7 0 0 0-2.8 1.6l-2-.6L3 9.1l1.6 1.3a7.6 7.6 0 0 0 0 3.2L3 14.9l1.6 2.8 2-.6a7.7 7.7 0 0 0 2.8 1.6L10 21h4l.6-2.3a7.7 7.7 0 0 0 2.8-1.6l2 .6L21 14.9l-1.6-1.3z"
        stroke="#DFD3BE" strokeWidth="1.3" strokeLinejoin="round" />
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
