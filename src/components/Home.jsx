import StreakBadge from './StreakBadge.jsx';
import BackfillBanner from './BackfillBanner.jsx';
import EntryCard from './EntryCard.jsx';
import { lastNDaysKeys, todayKey, yesterdayKey, formatDate } from '../utils/dates.js';
import { isSunday, isFirstOfMonth } from '../utils/dates.js';

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
  const greeting = pickGreeting();

  const showWeeklyTeaser = summaryFrequency !== 'monthly-only';
  const showMonthlyTeaser = true;

  return (
    <div className="min-h-dvh flex flex-col px-5 pt-8 pb-10">
      <header className="flex items-center justify-between mb-6 anim-fade">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-ink-500)] font-sans">
            Reflection
          </div>
          <h1 className="text-3xl tracking-tight mt-0.5">{greeting}</h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Settings"
          className="w-10 h-10 rounded-full bg-[#fdfaf3] border border-[rgba(93,122,98,0.15)] press flex items-center justify-center"
        >
          <SettingsIcon />
        </button>
      </header>

      <div className="mb-6 anim-fade delay-100">
        <StreakBadge count={streak.count} bumped={streakBumped} />
      </div>

      {missedYesterday && !todayEntry && (
        <BackfillBanner onTap={onBackfill} />
      )}

      <section className="anim-slide-up delay-200">
        {todayEntry ? (
          <div className="soft-card p-5">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-2 font-sans">
              {formatDate(todayKey())}
            </div>
            <p className="text-[17px] leading-relaxed text-[var(--color-ink-900)]">
              {todayEntry.transcript || 'Saved without a note — your feelings are logged.'}
            </p>
            <div className="mt-3 flex gap-3 text-[11px] uppercase tracking-wider font-sans">
              <span className="text-[var(--color-sage-700)]">mood logged</span>
              <span className="text-[var(--color-dusk-700)]">stress logged</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStartToday}
            className="w-full p-6 rounded-3xl press text-left
                       bg-[var(--color-sage-700)] text-[#faf6ef]
                       shadow-[0_18px_40px_-18px_rgba(93,122,98,0.55)]"
          >
            <div className="anim-breathe inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#faf6ef]/80" />
              <span className="text-xs uppercase tracking-[0.2em]">tonight</span>
            </div>
            <div className="mt-3 text-2xl tracking-tight">Reflect on today</div>
            <div className="mt-1 text-sm opacity-80 font-sans">
              Voice or text. Two soft sliders. Under a minute.
            </div>
          </button>
        )}
      </section>

      {(showWeeklyTeaser && isSunday()) && (
        <SummaryTeaser
          title="Your week in review"
          subtitle="Seven days of small notes, ready to read back."
          onTap={onOpenWeekly}
          delay="delay-300"
        />
      )}
      {(showMonthlyTeaser && isFirstOfMonth()) && (
        <SummaryTeaser
          title="Your month in review"
          subtitle="Sit with the whole month before reflecting on it."
          onTap={onOpenMonthly}
          delay="delay-400"
        />
      )}

      <section className="mt-8 anim-fade delay-300">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm uppercase tracking-widest text-[var(--color-ink-500)] font-sans">Recent days</h2>
          <div className="flex gap-2">
            <button onClick={onOpenWeekly}
              className="text-xs underline text-[var(--color-ink-500)] font-sans press">Week</button>
            <button onClick={onOpenMonthly}
              className="text-xs underline text-[var(--color-ink-500)] font-sans press">Month</button>
          </div>
        </div>
        <div className="space-y-2">
          {recent.map((k, i) => (
            <div key={k} className="anim-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <EntryCard
                dateKey={k}
                entry={entries[k]}
                faded={!entries[k] && k !== todayKey() && k !== yesterdayKey()}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryTeaser({ title, subtitle, onTap, delay }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`mt-4 w-full text-left soft-card p-5 press anim-slide-up ${delay}`}
      style={{ background: 'linear-gradient(180deg, #fdfaf3 0%, #f5efe6 100%)' }}
    >
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">ready</div>
      <div className="mt-1 text-xl tracking-tight">{title}</div>
      <div className="text-sm text-[var(--color-ink-500)] mt-0.5 font-sans">{subtitle}</div>
    </button>
  );
}

function pickGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Late night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Quiet night';
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="#5b554b" strokeWidth="1.6" />
      <path d="M19.4 13.6a7.6 7.6 0 0 0 0-3.2l1.6-1.3-1.6-2.8-2 .6a7.7 7.7 0 0 0-2.8-1.6L14 3h-4l-.6 2.3a7.7 7.7 0 0 0-2.8 1.6l-2-.6L3 9.1l1.6 1.3a7.6 7.6 0 0 0 0 3.2L3 14.9l1.6 2.8 2-.6a7.7 7.7 0 0 0 2.8 1.6L10 21h4l.6-2.3a7.7 7.7 0 0 0 2.8-1.6l2 .6L21 14.9l-1.6-1.3z"
        stroke="#5b554b" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
