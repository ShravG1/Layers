import { useState } from 'react';
import VoiceCapture from './VoiceCapture.jsx';
import FeelingSlider from './FeelingSlider.jsx';
import { MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';
import { formatDate, todayKey } from '../utils/dates.js';
import { celebrate } from '../utils/haptics.js';

export default function DailyEntry({ targetDate, onSave, onCancel, hapticsEnabled = true, existing, entryCount }) {
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
    <main className="min-h-dvh flex flex-col px-5 pt-6 pb-44">
      <div className="flex items-center justify-between mb-7">
        <button
          type="button"
          onClick={onCancel}
          className="label draw-underline text-[var(--paper-200)] press py-2"
        >
          ← Back
        </button>
        <div className="label">{isBackfill ? 'Backfilling' : 'Tonight'}</div>
      </div>

      <div className="anim-lift">
        <div className="label mb-3">
          ENTRY {entryN} · DAY {weekdayIndex} OF YOUR WEEK
        </div>
        <h1 className="display-xl text-[var(--paper-50)]">{formatDate(date)}</h1>
        <p className="body-md text-[var(--paper-200)] mt-3 max-w-[28ch]">
          {isBackfill
            ? 'A note for yesterday. Save before midnight to keep the thread.'
            : 'Speak or write a few sentences. No one else will see this.'}
        </p>
      </div>

      <div className="mt-10 anim-lift delay-100">
        <VoiceCapture
          value={transcript}
          audio={audio}
          onChange={setTranscript}
          onAudio={setAudio}
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      <div className="mt-12 anim-lift delay-200">
        <div className="label mb-4">Mood</div>
        <FeelingSlider
          labels={MOOD_LABELS}
          value={mood}
          onChange={setMood}
          variant="mood"
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      <div className="mt-10 anim-lift delay-300">
        <div className="label mb-4">Stress</div>
        <FeelingSlider
          labels={STRESS_LABELS}
          value={stress}
          onChange={setStress}
          variant="stress"
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      {/* Anchored save bar */}
      <div
        className="fixed left-0 right-0 bottom-0 px-5 pt-4 pb-6"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom) + 16px)`,
          background: 'linear-gradient(180deg, rgba(14,17,23,0) 0%, var(--ink-900) 35%)',
        }}
      >
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className={`w-full rounded-[999px] press
                      flex items-center justify-center
                      h-[60px] display-md
                      ${saving ? 'opacity-80' : ''}`}
          style={{
            background: 'linear-gradient(180deg, #F4B98A 0%, #E8894A 60%, #B45F2A 100%)',
            color: '#1A0F08',
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
