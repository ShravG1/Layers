import { useEffect, useMemo, useRef, useState } from 'react';
import LineChart from './LineChart.jsx';
import VoiceCapture from './VoiceCapture.jsx';
import SkeletonSummary from './SkeletonSummary.jsx';
import EntryCard from './EntryCard.jsx';
import { monthKeys, monthLabel, formatDayShort } from '../utils/dates.js';
import { findHighlights, generateSummary, recurringThemes } from '../utils/summary.js';
import { labelForValue, MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';
import { celebrate } from '../utils/haptics.js';

/**
 * Forced-engagement monthly summary:
 *  1. Scroll through every day of the month
 *  2. When the last entry is on-screen, the "Write your monthly reflection" button unlocks
 *  3. After the user submits a reflection, the AI narrative + charts + highlights appear
 */
export default function MonthlySummary({ entries, apiKey, hapticsEnabled, onClose }) {
  const keys = useMemo(() => monthKeys(), []);
  const period = useMemo(() => keys.map(k => entries[k] || null), [keys, entries]);
  const filled = period.filter(Boolean);

  const [stage, setStage] = useState('feed'); // 'feed' | 'reflect' | 'narrative'
  const [unlocked, setUnlocked] = useState(false);
  const [reflection, setReflection] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const endRef = useRef(null);
  const scrollRef = useRef(null);

  // Observe when the user reaches the bottom of the feed
  useEffect(() => {
    if (stage !== 'feed') return;
    if (!endRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setUnlocked(true);
          celebrate(hapticsEnabled);
        }
      }
    }, { threshold: 0.6 });
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, [stage, hapticsEnabled]);

  const submitReflection = async () => {
    if (!reflection.trim()) return;
    setStage('narrative');
    setLoading(true);
    const text = await generateSummary({ apiKey, entries: filled, kind: 'monthly', userReflection: reflection });
    setSummary(text);
    setLoading(false);
  };

  const { best, hardest } = findHighlights(filled);
  const themes = useMemo(() => recurringThemes(filled, 6), [filled]);

  // Per-week aggregates for "best week / hardest week"
  const weekStats = useMemo(() => weekify(keys, entries), [keys, entries]);

  const moodPoints = period.map((e, i) => ({
    value: e?.mood ?? null,
    label: (i + 1) % 5 === 0 ? `${i + 1}` : '',
  }));
  const stressPoints = period.map((e, i) => ({
    value: e?.stress ?? null,
    label: (i + 1) % 5 === 0 ? `${i + 1}` : '',
  }));

  return (
    <div ref={scrollRef} className="min-h-dvh px-5 pt-6 pb-32 anim-fade-slow">
      <button onClick={onClose} className="text-sm text-[var(--color-ink-500)] font-sans press py-2">← Home</button>

      <h1 className="text-3xl tracking-tight mt-3 anim-slide-up">Your {monthLabel()}</h1>
      <p className="text-sm text-[var(--color-ink-500)] mt-1 font-sans anim-fade delay-100">
        {stage === 'feed' && 'Read each day before reflecting. Take your time.'}
        {stage === 'reflect' && 'A few sentences on the month as a whole.'}
        {stage === 'narrative' && 'Drawn from your words.'}
      </p>

      {stage === 'feed' && (
        <>
          <section className="mt-8 space-y-2">
            {keys.map((k, i) => (
              <div key={k} className="anim-slide-up" style={{ animationDelay: `${Math.min(i * 20, 600)}ms` }}>
                <EntryCard dateKey={k} entry={entries[k]} faded />
              </div>
            ))}
            <div ref={endRef} className="h-1" />
          </section>

          <div className={`fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3
                          bg-gradient-to-t from-[var(--color-cream-100)] to-transparent
                          ${unlocked ? '' : 'pointer-events-none'}`}>
            {unlocked ? (
              <button
                onClick={() => setStage('reflect')}
                className="w-full py-5 rounded-2xl press anim-unlock
                           bg-[var(--color-clay-500)] text-[#faf6ef] text-lg tracking-tight
                           shadow-[0_18px_40px_-18px_rgba(154,110,84,0.55)]"
              >
                Write your monthly reflection
              </button>
            ) : (
              <div className="w-full py-5 rounded-2xl text-center bg-[var(--color-cream-200)] text-[var(--color-ink-500)] font-sans text-sm anim-breathe">
                Keep scrolling — read each day first
              </div>
            )}
          </div>
        </>
      )}

      {stage === 'reflect' && (
        <section className="mt-8 soft-card p-5 anim-slide-up">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">your reflection</div>
          <p className="text-sm text-[var(--color-ink-700)] mb-3">
            Speak or write your thoughts on the month as a whole.
          </p>
          <VoiceCapture
            value={reflection}
            onChange={setReflection}
            hapticsEnabled={hapticsEnabled}
            placeholder="A paragraph on the month."
          />
          <button
            type="button"
            onClick={submitReflection}
            disabled={!reflection.trim()}
            className={`mt-6 w-full py-4 rounded-2xl press
                        bg-[var(--color-sage-700)] text-[#faf6ef]
                        ${!reflection.trim() ? 'opacity-60' : ''}`}
          >
            Reveal the month
          </button>
        </section>
      )}

      {stage === 'narrative' && (
        <>
          <section className="mt-8 soft-card p-5 anim-slide-up">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">narrative</div>
            {loading ? <SkeletonSummary /> : (
              <p className="text-[16px] leading-relaxed whitespace-pre-line anim-fade-slow">{summary}</p>
            )}
          </section>

          <section className="mt-6 soft-card p-5 anim-slide-up delay-200">
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">mood</div>
            <LineChart points={moodPoints} color="#5d7a62" height={160} />
            <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 mt-6 font-sans">stress</div>
            <LineChart points={stressPoints} color="#5c7286" height={160} />
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 anim-slide-up delay-300">
            <WeekHighlight title="Best week" w={weekStats.best} kind="up" />
            <WeekHighlight title="Hardest week" w={weekStats.hardest} kind="down" />
          </section>

          <section className="mt-6 grid grid-cols-2 gap-3 anim-slide-up delay-300">
            <DayHighlight title="Best day" entry={best} kind="up" />
            <DayHighlight title="Hardest day" entry={hardest} kind="down" />
          </section>

          {themes.length > 0 && (
            <section className="mt-6 soft-card p-5 anim-slide-up delay-400">
              <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">recurring patterns</div>
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
        </>
      )}
    </div>
  );
}

function weekify(keys, entries) {
  const weeks = [];
  for (let i = 0; i < keys.length; i += 7) {
    const chunk = keys.slice(i, i + 7).map(k => entries[k]).filter(Boolean);
    if (chunk.length === 0) { weeks.push({ avgMood: null, avgStress: null, start: keys[i], end: keys[Math.min(i + 6, keys.length - 1)] }); continue; }
    const avgMood = chunk.reduce((s, e) => s + e.mood, 0) / chunk.length;
    const avgStress = chunk.reduce((s, e) => s + e.stress, 0) / chunk.length;
    weeks.push({ avgMood, avgStress, start: keys[i], end: keys[Math.min(i + 6, keys.length - 1)], n: chunk.length });
  }
  const eligible = weeks.filter(w => w.avgMood != null);
  if (eligible.length === 0) return { best: null, hardest: null };
  const best = eligible.reduce((b, w) => (w.avgMood > b.avgMood ? w : b), eligible[0]);
  const hardest = eligible.reduce((b, w) => (w.avgMood < b.avgMood ? w : b), eligible[0]);
  return { best, hardest };
}

function WeekHighlight({ title, w, kind }) {
  if (!w) {
    return (
      <div className="soft-card-muted p-4">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">{title}</div>
        <div className="text-sm text-[var(--color-ink-500)] mt-2 italic">no data</div>
      </div>
    );
  }
  const mood = labelForValue(MOOD_LABELS, Math.round(w.avgMood)).label;
  return (
    <div className="soft-card p-4">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">{title}</div>
      <div className="text-lg tracking-tight mt-1">
        {formatDayShort(w.start)} – {formatDayShort(w.end)}
      </div>
      <div className="text-[11px] uppercase tracking-wider mt-1 font-sans"
           style={{ color: kind === 'up' ? 'var(--color-sage-700)' : 'var(--color-clay-700)' }}>
        mostly {mood.toLowerCase()}
      </div>
    </div>
  );
}

function DayHighlight({ title, entry, kind }) {
  if (!entry) return null;
  const mood = labelForValue(MOOD_LABELS, entry.mood).label;
  const stress = labelForValue(STRESS_LABELS, entry.stress).label;
  return (
    <div className="soft-card p-4">
      <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] font-sans">{title}</div>
      <div className="text-lg tracking-tight mt-1">{formatDayShort(entry.date)}</div>
      <div className="text-[11px] uppercase tracking-wider mt-1 font-sans"
           style={{ color: kind === 'up' ? 'var(--color-sage-700)' : 'var(--color-clay-700)' }}>
        {mood} · {stress}
      </div>
      {entry.transcript && (
        <p className="text-[13px] mt-2 text-[var(--color-ink-700)]">
          {entry.transcript.slice(0, 100)}…
        </p>
      )}
    </div>
  );
}
