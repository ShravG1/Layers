import { useState } from 'react';
import VoiceCapture from './VoiceCapture.jsx';
import FeelingSlider from './FeelingSlider.jsx';
import { formatDate, todayKey } from '../utils/dates.js';
import { celebrate } from '../utils/haptics.js';
import { useLabels } from '../utils/labelsContext.js';

export default function DailyEntry({ targetDate, onSave, onCancel, hapticsEnabled = true, existing, entryCount }) {
  const labels = useLabels();
  const date = targetDate || todayKey();
  const isBackfill = date !== todayKey();

  const [transcript, setTranscript] = useState(existing?.transcript || '');
  const [audio, setAudio] = useState(existing?.audioDataUrl || null);
  const [mood, setMood] = useState(existing?.mood ?? 6);
  const [stress, setStress] = useState(existing?.stress ?? 5);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    celebrate(hapticsEnabled);
    await new Promise(r => setTimeout(r, 250));
    onSave({
      date,
      mood,
      stress,
      transcript,
      audioDataUrl: audio,
      source: transcript && !audio ? 'text' : 'voice',
      backfilled: isBackfill,
    });
  };

  // "ENTRY n · DAY w OF YOUR WEEK" — week begins Monday in UK convention
  const entryN = entryCount ? entryCount + 1 : 1;
  const [y, m, d] = date.split('-').map(Number);
  const weekdayIndex = ((new Date(y, m - 1, d).getDay() + 6) % 7) + 1; // Mon=1..Sun=7

  return (
    <main className="h-dvh flex flex-col overflow-hidden px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back"
          className="label draw-underline text-[var(--paper-200)] press py-2 flex items-center gap-1.5"
        >
          <BackArrow /> Back
        </button>
        <div className="label">{isBackfill ? 'Backfilling' : 'Tonight'}</div>
      </div>

      <div className="anim-lift shrink-0">
        <div className="label mb-1.5">
          ENTRY {entryN} · DAY {weekdayIndex} OF YOUR WEEK
        </div>
        <h1 className="display-lg text-[var(--paper-50)]">{formatDate(date)}</h1>
      </div>

      {/* Voice capture takes the flexible middle */}
      <div className="mt-4 anim-lift delay-100 flex-1 min-h-0 flex flex-col justify-center">
        <VoiceCapture
          value={transcript}
          audio={audio}
          onChange={setTranscript}
          onAudio={setAudio}
          hapticsEnabled={hapticsEnabled}
          compact
        />
      </div>

      <div className="mt-4 anim-lift delay-200 shrink-0">
        <div className="label mb-2">Mood</div>
        <FeelingSlider
          labels={labels.mood}
          value={mood}
          onChange={setMood}
          variant="mood"
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      <div className="mt-3 anim-lift delay-300 shrink-0">
        <div className="label mb-2">Stress</div>
        <FeelingSlider
          labels={labels.stress}
          value={stress}
          onChange={setStress}
          variant="stress"
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      <div className="mt-4 shrink-0">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className={`w-full rounded-[999px] press
                      flex items-center justify-center
                      h-[58px] display-md
                      ${saving ? 'opacity-80' : ''}`}
          style={{
            background: 'var(--grad-warm)',
            color: 'var(--on-warm)',
            boxShadow: 'var(--shadow-lg), var(--glow-ember)',
            fontSize: '20px',
          }}
        >
          {saving ? 'Saving…' : isBackfill ? 'Save yesterday' : 'Save tonight’s entry'}
        </button>
      </div>
    </main>
  );
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
