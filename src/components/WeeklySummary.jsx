import { useEffect, useMemo, useState } from 'react';
import LineChart from './LineChart.jsx';
import VoiceCapture from './VoiceCapture.jsx';
import SkeletonSummary from './SkeletonSummary.jsx';
import SwipePager from './SwipePager.jsx';
import Dots from './Dots.jsx';
import { lastNDaysKeys, formatDayShort, formatDate } from '../utils/dates.js';
import { findHighlights, generateSummary, recurringThemes } from '../utils/summary.js';
import { labelForValue } from '../utils/labels.js';
import { useLabels } from '../utils/labelsContext.js';

export default function WeeklySummary({ entries, apiKey, kind = 'weekly', hapticsEnabled, onClose }) {
  const labels = useLabels();
  const days = kind === 'biweekly' ? 14 : 7;
  const keys = useMemo(() => lastNDaysKeys(days), [days]);
  const period = useMemo(() => keys.map(k => entries[k] || null), [keys, entries]);
  const present = period.filter(Boolean);

  const [reflection, setReflection] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const text = await generateSummary({ apiKey, entries: present, kind, labels });
      if (active) { setSummary(text); setLoading(false); }
    })();
    return () => { active = false; };
  }, [apiKey, kind]); // eslint-disable-line

  const { best, hardest } = findHighlights(present);
  const themes = useMemo(() => recurringThemes(present), [present]);

  const moodPoints = period.map((e, i) => ({ value: e?.mood ?? null, label: shortLabel(keys[i], days) }));
  const stressPoints = period.map((e, i) => ({ value: e?.stress ?? null, label: shortLabel(keys[i], days) }));

  const periodWord = kind === 'biweekly' ? 'fortnight' : 'week';

  const panels = [
    // ---- Panel 1: narrative ----
    <div key="narrative" className="h-full flex flex-col px-5">
      <div className="label shrink-0">Narrative</div>
      <div className="mt-3 flex-1 min-h-0 overflow-y-auto no-scrollbar surface-card p-5">
        {loading ? <SkeletonSummary /> : <NarrativeReveal text={summary} />}
      </div>
    </div>,

    // ---- Panel 2: patterns ----
    <div key="patterns" className="h-full flex flex-col px-5 overflow-hidden">
      <div className="label shrink-0">Patterns</div>
      <div className="mt-3 surface-card p-4 shrink-0">
        <div className="label mb-1">Mood</div>
        <LineChart points={moodPoints} variant="mood" height={104} />
        <div className="label mt-3 mb-1">Stress</div>
        <LineChart points={stressPoints} variant="stress" height={104} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 shrink-0">
        <Highlight title="Best day" entry={best} tone="ember" />
        <Highlight title="Hardest day" entry={hardest} tone="moon" />
      </div>
      {themes.length > 0 && (
        <div className="mt-3 surface-card p-4 shrink-0">
          <div className="label mb-2.5">Recurring themes</div>
          <div className="flex flex-wrap gap-2">
            {themes.map(t => (
              <span key={t.word} className="px-3 py-1 rounded-full body-sm"
                    style={{ background: 'var(--ink-700)', color: 'var(--paper-200)' }}>
                {t.word} · {t.count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>,

    // ---- Panel 3: your reflection ----
    <div key="reflection" className="h-full flex flex-col px-5">
      <div className="label shrink-0">Your reflection</div>
      <p className="body-sm text-[var(--paper-200)] mt-1.5 shrink-0">
        How did the {periodWord} feel, as a whole?
      </p>
      <div className="mt-3 flex-1 min-h-0 flex flex-col justify-center">
        <VoiceCapture
          value={reflection}
          onChange={setReflection}
          hapticsEnabled={hapticsEnabled}
          compact
          placeholder="A line or two on the week itself."
        />
      </div>
      <button
        type="button"
        onClick={() => {
          setLoading(true);
          setPage(0);
          generateSummary({ apiKey, entries: present, kind, userReflection: reflection, labels })
            .then(text => { setSummary(text); setLoading(false); });
        }}
        disabled={!reflection.trim() || loading}
        className={`mt-3 mb-1 w-full h-[52px] rounded-full press body-lg shrink-0
                    ${(!reflection.trim() || loading) ? 'opacity-50' : ''}`}
        style={{
          background: 'var(--grad-cool)',
          color: 'var(--on-cool)',
          boxShadow: 'var(--shadow-md), var(--glow-moon)',
        }}
      >
        Save reflection
      </button>
    </div>,
  ];

  return (
    <main className="h-dvh flex flex-col overflow-hidden pt-5 pb-5">
      <div className="px-5 shrink-0">
        <button onClick={onClose} aria-label="Back to home"
                className="label draw-underline text-[var(--paper-200)] press py-1 flex items-center gap-1.5">
          <BackArrow /> Home
        </button>
        <header className="mt-3 anim-lift">
          <div className="label">{kind === 'biweekly' ? 'Fortnight in review' : 'Week in review'}</div>
          <h1 className="display-lg mt-1.5 text-[var(--paper-50)]">
            {kind === 'biweekly' ? 'Your fortnight' : 'Your week'}
          </h1>
          <p className="body-sm mt-1 text-[var(--paper-400)]">
            {formatDate(keys[0])} — {formatDate(keys[keys.length - 1])}
          </p>
        </header>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <SwipePager index={page} count={panels.length} onIndexChange={setPage}>
          {panels}
        </SwipePager>
      </div>

      <div className="shrink-0 flex items-center justify-between px-5 pt-3">
        <Dots count={panels.length} index={page} onJump={setPage} />
        <span className="label">Swipe</span>
      </div>
    </main>
  );
}

function NarrativeReveal({ text }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div>
      {paragraphs.map((p, i) => (
        <p key={i}
           className="body-lg text-[var(--paper-50)] mb-4 last:mb-0 anim-ink-bleed"
           style={{ animationDelay: `${i * 120}ms`, animationDuration: '700ms' }}>
          {p}
        </p>
      ))}
    </div>
  );
}

function Highlight({ title, entry, tone }) {
  const labels = useLabels();
  const rail = tone === 'ember' ? 'rail-ember' : 'rail-moon';
  if (!entry) {
    return (
      <div className={`surface-card ${rail} p-4`}>
        <div className="label">{title}</div>
        <div className="body-sm text-[var(--paper-400)] mt-3 italic">no entries yet</div>
      </div>
    );
  }
  const moodLabel = labelForValue(labels.mood, entry.mood).label;
  const stressLabel = labelForValue(labels.stress, entry.stress).label;
  return (
    <div className={`surface-card ${rail} p-4`}>
      <div className="label">{title}</div>
      <div className="display-sm mt-2 text-[var(--paper-50)]">{formatDayShort(entry.date)}</div>
      <div className="label mt-1"
           style={{ color: tone === 'ember' ? 'var(--ember-300)' : 'var(--moon-300)' }}>
        {moodLabel} · {stressLabel}
      </div>
      {entry.transcript && (
        <p className="body-sm mt-2 text-[var(--paper-200)] line-clamp-2">
          {entry.transcript.slice(0, 100)}…
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

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
