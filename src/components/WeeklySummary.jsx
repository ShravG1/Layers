import { useEffect, useMemo, useState } from 'react';
import LineChart from './LineChart.jsx';
import VoiceCapture from './VoiceCapture.jsx';
import SkeletonSummary from './SkeletonSummary.jsx';
import EntryCard from './EntryCard.jsx';
import { lastNDaysKeys, formatDayShort, formatDate } from '../utils/dates.js';
import { findHighlights, generateSummary, recurringThemes } from '../utils/summary.js';
import { labelForValue, MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';

export default function WeeklySummary({ entries, apiKey, kind = 'weekly', hapticsEnabled, onClose }) {
  const days = kind === 'biweekly' ? 14 : 7;
  const keys = useMemo(() => lastNDaysKeys(days), [days]);
  const period = useMemo(() => keys.map(k => entries[k] || null), [keys, entries]);
  const present = period.filter(Boolean);

  const [reflection, setReflection] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const text = await generateSummary({ apiKey, entries: present, kind });
      if (active) { setSummary(text); setLoading(false); }
    })();
    return () => { active = false; };
  }, [apiKey, kind]); // eslint-disable-line

  const { best, hardest } = findHighlights(present);
  const themes = useMemo(() => recurringThemes(present), [present]);

  const moodPoints = period.map((e, i) => ({
    value: e?.mood ?? null, label: shortLabel(keys[i], days),
  }));
  const stressPoints = period.map((e, i) => ({
    value: e?.stress ?? null, label: shortLabel(keys[i], days),
  }));

  return (
    <main className="min-h-dvh px-5 pt-6 pb-14">
      <button onClick={onClose} className="label draw-underline text-[var(--paper-200)] press py-2">
        ← Home
      </button>

      <header className="mt-5 anim-lift">
        <div className="label">{kind === 'biweekly' ? 'Fortnight in review' : 'Week in review'}</div>
        <h1 className="display-xl mt-3 text-[var(--paper-50)]">
          {kind === 'biweekly' ? 'Your fortnight' : 'Your week'}
        </h1>
        <p className="body-md mt-3 text-[var(--paper-200)]">
          {formatDate(keys[0])} — {formatDate(keys[keys.length - 1])}
        </p>
      </header>

      <section className="mt-9 surface-card p-6 anim-lift delay-100">
        <div className="label mb-4">Narrative</div>
        {loading ? (
          <SkeletonSummary />
        ) : (
          <NarrativeReveal text={summary} />
        )}
      </section>

      <section className="mt-5 surface-card p-6 anim-lift delay-200">
        <div className="label mb-3">Mood</div>
        <LineChart points={moodPoints} variant="mood" height={150} />
        <div className="label mt-7 mb-3">Stress</div>
        <LineChart points={stressPoints} variant="stress" height={150} />
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 anim-lift delay-300">
        <Highlight title="Best day" entry={best} tone="ember" />
        <Highlight title="Hardest day" entry={hardest} tone="moon" />
      </section>

      {themes.length > 0 && (
        <section className="mt-5 surface-card p-6 anim-lift delay-400">
          <div className="label mb-4">Recurring themes</div>
          <div className="flex flex-wrap gap-2">
            {themes.map(t => (
              <span key={t.word}
                className="px-3 py-1 rounded-full body-sm"
                style={{ background: 'var(--ink-700)', color: 'var(--paper-200)' }}>
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-5 surface-card rail-moon p-6 anim-lift delay-400">
        <div className="label mb-3">Your reflection</div>
        <p className="body-md text-[var(--paper-200)] mb-4">
          How did the {kind === 'biweekly' ? 'fortnight' : 'week'} feel, as a whole?
        </p>
        <VoiceCapture
          value={reflection}
          onChange={setReflection}
          hapticsEnabled={hapticsEnabled}
          placeholder="A line or two on the week itself."
        />
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            generateSummary({ apiKey, entries: present, kind, userReflection: reflection })
              .then(text => { setSummary(text); setLoading(false); });
          }}
          disabled={!reflection.trim() || loading}
          className={`mt-5 w-full h-[52px] rounded-full press body-lg
                      ${(!reflection.trim() || loading) ? 'opacity-50' : ''}`}
          style={{
            background: 'linear-gradient(180deg, #B8C7DE 0%, #7B91B0 60%, #4D6280 100%)',
            color: '#0E1117',
            boxShadow: 'var(--shadow-md), var(--glow-moon)',
          }}
        >
          Save reflection
        </button>
      </section>

      <section className="mt-9">
        <div className="label mb-3">Days</div>
        <div>
          {keys.map((k) => (
            <EntryCard key={k} dateKey={k} entry={entries[k]} />
          ))}
        </div>
      </section>
    </main>
  );
}

function NarrativeReveal({ text }) {
  // Stagger by paragraph with ink-bleed
  const paragraphs = text.split(/\n\n+/);
  return (
    <div>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          className="body-lg text-[var(--paper-50)] mb-4 anim-ink-bleed"
          style={{ animationDelay: `${i * 120}ms`, animationDuration: '700ms' }}
        >
          {p}
        </p>
      ))}
    </div>
  );
}

function Highlight({ title, entry, tone }) {
  const rail = tone === 'ember' ? 'rail-ember' : 'rail-moon';
  if (!entry) {
    return (
      <div className={`surface-card ${rail} p-4`}>
        <div className="label">{title}</div>
        <div className="body-sm text-[var(--paper-400)] mt-3 italic">no entries yet</div>
      </div>
    );
  }
  const moodLabel = labelForValue(MOOD_LABELS, entry.mood).label;
  const stressLabel = labelForValue(STRESS_LABELS, entry.stress).label;
  return (
    <div className={`surface-card ${rail} p-4`}>
      <div className="label">{title}</div>
      <div className="display-sm mt-2 text-[var(--paper-50)]">{formatDayShort(entry.date)}</div>
      <div className="label mt-1"
           style={{ color: tone === 'ember' ? 'var(--ember-300)' : 'var(--moon-300)' }}>
        {moodLabel} · {stressLabel}
      </div>
      {entry.transcript && (
        <p className="body-sm mt-2 text-[var(--paper-200)] line-clamp-3">
          {entry.transcript.slice(0, 110)}…
        </p>
      )}
    </div>
  );
}

function shortLabel(key, days) {
  const [, , d] = key.split('-');
  if (days <= 7) return `${parseInt(d, 10)}`;
  return parseInt(d, 10) % 2 === 0 ? '' : `${parseInt(d, 10)}`;
}
