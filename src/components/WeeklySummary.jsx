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

  // Generate AI-narrative on mount (without weekly reflection — that comes from the user themselves)
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
    value: e?.mood ?? null,
    label: shortLabel(keys[i], days),
  }));
  const stressPoints = period.map((e, i) => ({
    value: e?.stress ?? null,
    label: shortLabel(keys[i], days),
  }));

  return (
    <div className="min-h-dvh px-5 pt-6 pb-12 anim-fade-slow">
      <button onClick={onClose} className="text-sm text-[var(--color-ink-500)] font-sans press py-2">← Home</button>

      <h1 className="text-3xl tracking-tight mt-3 anim-slide-up">
        {kind === 'biweekly' ? 'Your fortnight' : 'Your week'}
      </h1>
      <p className="text-sm text-[var(--color-ink-500)] mt-1 font-sans anim-fade delay-100">
        {formatDate(keys[0])} — {formatDate(keys[keys.length - 1])}
      </p>

      <section className="mt-8 soft-card p-5 anim-slide-up delay-200">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">narrative</div>
        {loading ? (
          <SkeletonSummary />
        ) : (
          <p className="text-[16px] leading-relaxed whitespace-pre-line anim-fade-slow">{summary}</p>
        )}
      </section>

      <section className="mt-6 soft-card p-5 anim-slide-up delay-300">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">mood</div>
        <LineChart points={moodPoints} color="#5d7a62" />
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 mt-6 font-sans">stress</div>
        <LineChart points={stressPoints} color="#5c7286" />
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 anim-slide-up delay-400">
        <Highlight title="Best day" entry={best} kind="mood-up" />
        <Highlight title="Hardest day" entry={hardest} kind="mood-down" />
      </section>

      {themes.length > 0 && (
        <section className="mt-6 soft-card p-5 anim-slide-up delay-500">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">recurring themes</div>
          <div className="flex flex-wrap gap-2">
            {themes.map(t => (
              <span key={t.word}
                className="px-3 py-1 rounded-full text-sm bg-[var(--color-cream-200)] text-[var(--color-ink-700)] font-sans">
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 soft-card p-5 anim-slide-up delay-500">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">your reflection</div>
        <p className="text-sm text-[var(--color-ink-700)] mb-3">
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
            // Regenerate narrative with the user's reflection folded in
            setLoading(true);
            generateSummary({ apiKey, entries: present, kind, userReflection: reflection })
              .then(text => { setSummary(text); setLoading(false); });
          }}
          disabled={!reflection.trim() || loading}
          className={`mt-4 w-full py-4 rounded-2xl press
                      bg-[var(--color-dusk-700)] text-[#faf6ef]
                      ${(!reflection.trim() || loading) ? 'opacity-60' : ''}`}
        >
          Save reflection
        </button>
      </section>

      <section className="mt-8">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">days</div>
        <div className="space-y-2">
          {keys.map((k, i) => (
            <div key={k} className="anim-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <EntryCard dateKey={k} entry={entries[k]} faded />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Highlight({ title, entry, kind }) {
  if (!entry) {
    return (
      <div className="soft-card-muted p-4">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">{title}</div>
        <div className="text-sm text-[var(--color-ink-500)] mt-2 italic">no entries yet</div>
      </div>
    );
  }
  const moodLabel = labelForValue(MOOD_LABELS, entry.mood).label;
  const stressLabel = labelForValue(STRESS_LABELS, entry.stress).label;
  return (
    <div className="soft-card p-4">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">{title}</div>
      <div className="text-lg tracking-tight mt-1">{formatDayShort(entry.date)}</div>
      <div className="text-[11px] uppercase tracking-wider mt-1 font-sans"
           style={{ color: kind === 'mood-up' ? 'var(--color-sage-700)' : 'var(--color-clay-700)' }}>
        {moodLabel} · {stressLabel}
      </div>
      {entry.transcript && (
        <p className="text-[13px] mt-2 text-[var(--color-ink-700)] line-clamp-3">
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
