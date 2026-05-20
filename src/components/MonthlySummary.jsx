import { useEffect, useMemo, useRef, useState } from 'react';
import LineChart from './LineChart.jsx';
import VoiceCapture from './VoiceCapture.jsx';
import SkeletonSummary from './SkeletonSummary.jsx';
import EntryCard from './EntryCard.jsx';
import { monthKeys, monthLabel, formatDayShort } from '../utils/dates.js';
import { findHighlights, generateSummary, recurringThemes } from '../utils/summary.js';
import { labelForValue, MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';

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

  useEffect(() => {
    if (stage !== 'feed' || !endRef.current) return;
    const obs = new IntersectionObserver((items) => {
      for (const e of items) if (e.isIntersecting) setUnlocked(true);
    }, { threshold: 0.6 });
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, [stage]);

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
    <main className="min-h-dvh px-5 pt-6 pb-36 anim-ink-fade">
      <button onClick={onClose} className="label draw-underline text-[var(--paper-200)] press py-2">
        ← Home
      </button>

      <header className="mt-5 anim-lift">
        <div className="label">Month in review</div>
        <h1 className="display-xl mt-3 text-[var(--paper-50)]">Your {monthLabel()}</h1>
        <p className="body-md mt-3 text-[var(--paper-200)] max-w-[36ch]">
          {stage === 'feed' && 'Read each day before reflecting. Take your time.'}
          {stage === 'reflect' && 'A few sentences on the month as a whole.'}
          {stage === 'narrative' && 'Drawn from your words.'}
        </p>
      </header>

      {stage === 'feed' && (
        <>
          <section className="mt-9">
            {keys.map((k, i) => (
              <div key={k} className="anim-lift-soft" style={{ animationDelay: `${Math.min(i * 15, 400)}ms` }}>
                <EntryCard dateKey={k} entry={entries[k]} />
              </div>
            ))}
            <div ref={endRef} className="h-1" />
          </section>

          {/* Two-phase ceremonial unlock */}
          <div
            className="fixed left-0 right-0 bottom-0 px-5 pt-8 pb-6"
            style={{
              paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
              background: 'linear-gradient(180deg, rgba(14,17,23,0) 0%, var(--ink-900) 40%)',
              pointerEvents: unlocked ? 'auto' : 'none',
            }}
          >
            {unlocked ? (
              <div className="relative anim-glow-rise">
                <div
                  aria-hidden
                  className="absolute -inset-x-4 -inset-y-3 rounded-[36px]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(123,145,176,0.30) 0%, rgba(123,145,176,0) 70%)',
                  }}
                />
                <button
                  onClick={() => setStage('reflect')}
                  className="relative w-full h-[60px] rounded-full press display-md"
                  style={{
                    background: 'linear-gradient(180deg, #B8C7DE 0%, #7B91B0 60%, #4D6280 100%)',
                    color: '#0E1117',
                    boxShadow: 'var(--shadow-lg), var(--glow-moon)',
                    fontSize: '20px',
                  }}
                >
                  Write your monthly reflection
                </button>
              </div>
            ) : (
              <div className="w-full h-[60px] rounded-full surface-card flex items-center justify-center body-md text-[var(--paper-400)] anim-breathe">
                Keep reading · scroll to the end
              </div>
            )}
          </div>
        </>
      )}

      {stage === 'reflect' && (
        <section className="mt-9 surface-card rail-moon p-6 anim-lift">
          <div className="label mb-3">Your reflection</div>
          <p className="body-md text-[var(--paper-200)] mb-4">
            Speak or write your thoughts on the month as a whole.
          </p>
          <VoiceCapture
            value={reflection}
            onChange={setReflection}
            hapticsEnabled={hapticsEnabled}
            placeholder="A paragraph on the month."
          />
          <button
            onClick={submitReflection}
            disabled={!reflection.trim()}
            className={`mt-6 w-full h-[56px] rounded-full press body-lg
                        ${!reflection.trim() ? 'opacity-50' : ''}`}
            style={{
              background: 'linear-gradient(180deg, #F4B98A 0%, #E8894A 60%, #B45F2A 100%)',
              color: '#1A0F08',
              boxShadow: 'var(--shadow-md), var(--glow-ember)',
            }}
          >
            Reveal the month
          </button>
        </section>
      )}

      {stage === 'narrative' && (
        <>
          <section className="mt-9 surface-card p-6 anim-lift">
            <div className="label mb-4">Narrative</div>
            {loading ? <SkeletonSummary /> : (
              <div>
                {summary.split(/\n\n+/).map((p, i) => (
                  <p key={i}
                     className="body-lg text-[var(--paper-50)] mb-4 anim-ink-bleed"
                     style={{ animationDelay: `${i * 120}ms`, animationDuration: '700ms' }}>
                    {p}
                  </p>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 surface-card p-6 anim-lift delay-200">
            <div className="label mb-3">Mood</div>
            <LineChart points={moodPoints} variant="mood" height={170} />
            <div className="label mt-7 mb-3">Stress</div>
            <LineChart points={stressPoints} variant="stress" height={170} />
          </section>

          <section className="mt-5 grid grid-cols-2 gap-3 anim-lift delay-300">
            <WeekHighlight title="Best week" w={weekStats.best} tone="ember" />
            <WeekHighlight title="Hardest week" w={weekStats.hardest} tone="moon" />
          </section>

          <section className="mt-3 grid grid-cols-2 gap-3 anim-lift delay-300">
            <DayHighlight title="Best day" entry={best} tone="ember" />
            <DayHighlight title="Hardest day" entry={hardest} tone="moon" />
          </section>

          {themes.length > 0 && (
            <section className="mt-5 surface-card p-6 anim-lift delay-400">
              <div className="label mb-4">Recurring patterns</div>
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
        </>
      )}
    </main>
  );
}

function weekify(keys, entries) {
  const weeks = [];
  for (let i = 0; i < keys.length; i += 7) {
    const chunk = keys.slice(i, i + 7).map(k => entries[k]).filter(Boolean);
    if (chunk.length === 0) { weeks.push({ avgMood: null, start: keys[i], end: keys[Math.min(i + 6, keys.length - 1)] }); continue; }
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

function WeekHighlight({ title, w, tone }) {
  const rail = tone === 'ember' ? 'rail-ember' : 'rail-moon';
  if (!w) {
    return (
      <div className={`surface-card ${rail} p-4`}>
        <div className="label">{title}</div>
        <div className="body-sm text-[var(--paper-400)] mt-2 italic">no data</div>
      </div>
    );
  }
  const mood = labelForValue(MOOD_LABELS, Math.round(w.avgMood)).label;
  return (
    <div className={`surface-card ${rail} p-4`}>
      <div className="label">{title}</div>
      <div className="display-sm mt-2 text-[var(--paper-50)]">
        {formatDayShort(w.start)} – {formatDayShort(w.end)}
      </div>
      <div className="label mt-1"
           style={{ color: tone === 'ember' ? 'var(--ember-300)' : 'var(--moon-300)' }}>
        mostly {mood.toLowerCase()}
      </div>
    </div>
  );
}

function DayHighlight({ title, entry, tone }) {
  if (!entry) return null;
  const rail = tone === 'ember' ? 'rail-ember' : 'rail-moon';
  const mood = labelForValue(MOOD_LABELS, entry.mood).label;
  const stress = labelForValue(STRESS_LABELS, entry.stress).label;
  return (
    <div className={`surface-card ${rail} p-4`}>
      <div className="label">{title}</div>
      <div className="display-sm mt-2 text-[var(--paper-50)]">{formatDayShort(entry.date)}</div>
      <div className="label mt-1"
           style={{ color: tone === 'ember' ? 'var(--ember-300)' : 'var(--moon-300)' }}>
        {mood} · {stress}
      </div>
      {entry.transcript && (
        <p className="body-sm mt-2 text-[var(--paper-200)]">
          {entry.transcript.slice(0, 100)}…
        </p>
      )}
    </div>
  );
}
