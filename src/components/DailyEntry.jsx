import { useState } from 'react';
import VoiceCapture from './VoiceCapture.jsx';
import FeelingSlider from './FeelingSlider.jsx';
import { MOOD_LABELS, STRESS_LABELS } from '../utils/labels.js';
import { formatDate, todayKey } from '../utils/dates.js';
import { celebrate } from '../utils/haptics.js';

/**
 * Daily input screen. Used for both today and the missed-day backfill.
 * `targetDate` may be today (default) or yesterday in backfill mode.
 */
export default function DailyEntry({ targetDate, onSave, onCancel, hapticsEnabled = true, existing }) {
  const date = targetDate || todayKey();
  const isBackfill = date !== todayKey();

  const [transcript, setTranscript] = useState(existing?.transcript || '');
  const [audio, setAudio] = useState(existing?.audioDataUrl || null);
  const [mood, setMood] = useState(existing?.mood ?? 6); // start near "Good"
  const [stress, setStress] = useState(existing?.stress ?? 5);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    celebrate(hapticsEnabled);
    await new Promise(r => setTimeout(r, 280));
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

  return (
    <div className="min-h-dvh flex flex-col px-5 pt-6 pb-8 anim-fade">
      <div className="flex items-center justify-between mb-2 font-sans">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-[var(--color-ink-500)] press py-2 px-1"
        >
          ← Back
        </button>
        <div className="text-xs text-[var(--color-ink-500)]">
          {isBackfill ? 'Backfilling' : 'Tonight'}
        </div>
      </div>

      <h1 className="text-3xl tracking-tight mb-1 anim-slide-up">
        {formatDate(date)}
      </h1>
      <p className="text-sm text-[var(--color-ink-500)] mb-8 font-sans anim-fade delay-100">
        {isBackfill
          ? 'A gentle note for yesterday — save before midnight to keep your streak.'
          : 'Speak or write a few sentences. No one else will see this.'}
      </p>

      <div className="anim-slide-up delay-200">
        <VoiceCapture
          value={transcript}
          audio={audio}
          onChange={setTranscript}
          onAudio={setAudio}
          hapticsEnabled={hapticsEnabled}
        />
      </div>

      <div className="mt-10 space-y-8">
        <div className="anim-slide-up delay-300">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-2 font-sans">Mood</div>
          <FeelingSlider
            labels={MOOD_LABELS}
            value={mood}
            onChange={setMood}
            color="var(--color-sage-700)"
            hapticsEnabled={hapticsEnabled}
          />
        </div>

        <div className="anim-slide-up delay-400">
          <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-2 font-sans">Stress</div>
          <FeelingSlider
            labels={STRESS_LABELS}
            value={stress}
            onChange={setStress}
            color="var(--color-dusk-700)"
            trackClass="stress-track"
            hapticsEnabled={hapticsEnabled}
          />
        </div>
      </div>

      <div className="mt-12 anim-slide-up delay-500">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className={`w-full py-5 rounded-2xl text-lg tracking-tight press
                      bg-[var(--color-sage-700)] text-[#faf6ef]
                      shadow-[0_10px_30px_-12px_rgba(93,122,98,0.6)]
                      ${saving ? 'opacity-70' : ''}`}
        >
          {saving ? 'Saving…' : isBackfill ? 'Save yesterday' : 'Save today'}
        </button>
      </div>
    </div>
  );
}
