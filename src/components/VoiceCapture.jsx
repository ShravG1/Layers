import { useEffect, useRef, useState } from 'react';
import { createRecorder } from '../utils/voice.js';
import { tapLight, tapMedium } from '../utils/haptics.js';

const BAR_COUNT = 32;

/**
 * Mic with a living waveform driven directly from the audio analyser.
 * Idle: breath + counter-phase ember glow behind. Press to record; release to stop.
 */
export default function VoiceCapture({
  value, audio, onChange, onAudio,
  hapticsEnabled = true,
  compact = false,
  placeholder = "What's on your mind tonight?",
}) {
  const [mode, setMode] = useState(audio ? 'voice' : (value ? 'text' : 'voice'));
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const barsRef = useRef(null);
  const transcriptRef = useRef(null);
  const lastTranscriptRef = useRef('');

  // Drive bars directly via refs — avoids re-rendering on every animation frame.
  useEffect(() => () => recRef.current?.cancel?.(), []);

  const renderBars = (level) => {
    const el = barsRef.current;
    if (!el) return;
    // Distribute the level across bars with a falloff toward the edges,
    // and modulate per-bar with a sine for organic motion.
    const time = performance.now() / 220;
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      const center = (i - (BAR_COUNT - 1) / 2) / ((BAR_COUNT - 1) / 2);
      const falloff = 1 - Math.abs(center) * 0.35;
      const wobble = 0.5 + 0.5 * Math.sin(time + i * 0.45);
      const h = 6 + level * falloff * (24 + wobble * 18);
      children[i].style.height = `${h}px`;
      children[i].style.opacity = String(0.5 + level * 0.5);
    }
  };

  const start = async () => {
    setError(null);
    tapMedium(hapticsEnabled);
    lastTranscriptRef.current = value || '';
    recRef.current = createRecorder({
      onTranscriptChange: (t) => {
        if (t !== lastTranscriptRef.current) {
          lastTranscriptRef.current = t;
          onChange?.(t);
          // Restart the ink-bleed reveal on the freshly updated transcript node
          if (transcriptRef.current) {
            transcriptRef.current.classList.remove('anim-ink-bleed');
            // force reflow to retrigger
            void transcriptRef.current.offsetWidth;
            transcriptRef.current.classList.add('anim-ink-bleed');
          }
        }
      },
      onLevel: renderBars,
      onError: (e) => {
        if (e === 'mic-denied') setError('Microphone access denied. You can type instead.');
      },
    });
    try {
      await recRef.current.start();
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stop = async () => {
    if (!recRef.current) return;
    tapLight(hapticsEnabled);
    setRecording(false);
    const { transcript, audioDataUrl } = await recRef.current.stop();
    if (transcript) onChange?.(transcript);
    if (audioDataUrl) onAudio?.(audioDataUrl);
    recRef.current = null;
  };

  const orb = compact ? 'w-32 h-32' : 'w-44 h-44';
  const knob = compact ? 'w-24 h-24' : 'w-36 h-36';

  return (
    <div className="w-full anim-lift-soft">
      {mode === 'voice' ? (
        <div className={`flex flex-col items-center ${compact ? 'gap-3' : 'gap-5'}`}>
          <div className={`relative ${orb} flex items-center justify-center`}>
            {/* Counter-phase ember glow */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full anim-breathe-glow"
              style={{
                background: 'radial-gradient(circle, color-mix(in srgb, var(--ember-500) 45%, transparent) 0%, transparent 65%)',
              }}
            />
            <button
              type="button"
              aria-label={recording ? 'Stop recording' : 'Start recording'}
              onPointerDown={start}
              onPointerUp={stop}
              onPointerCancel={stop}
              onTouchStart={(e) => { e.preventDefault(); start(); }}
              onTouchEnd={(e) => { e.preventDefault(); stop(); }}
              className={`relative ${knob} rounded-full
                          flex items-center justify-center
                          ${recording ? '' : 'anim-breathe'}`}
              style={{
                background: recording
                  ? 'radial-gradient(circle at 50% 45%, var(--ember-500) 0%, var(--ember-700) 80%)'
                  : 'radial-gradient(circle at 50% 45%, var(--ink-700) 0%, var(--ink-800) 80%)',
                boxShadow: recording
                  ? 'var(--shadow-lg), 0 0 80px color-mix(in srgb, var(--ember-500) 45%, transparent)'
                  : 'var(--shadow-md), 0 0 32px color-mix(in srgb, var(--ember-500) 20%, transparent)',
              }}
            >
              {recording ? <RecordDot /> : <MicGlyph />}
            </button>
          </div>

          {/* Live waveform */}
          <div
            ref={barsRef}
            aria-hidden
            className={`flex items-end gap-[3px] ${compact ? 'h-7' : 'h-9'} transition-opacity duration-500`}
            style={{ opacity: recording ? 1 : 0.25 }}
          >
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] rounded-full bg-[var(--ember-500)]"
                style={{ height: '6px' }}
              />
            ))}
          </div>

          <div className="label" aria-live="polite">
            {recording ? 'Listening · release to stop' : 'Press and hold to speak'}
          </div>

          {value && (
            <div
              ref={transcriptRef}
              className="w-full px-1 anim-ink-bleed"
            >
              <p className={`display-italic text-[17px] leading-[1.5] text-[var(--paper-50)] ${compact ? 'line-clamp-2' : ''}`}>
                {value}
              </p>
            </div>
          )}

          {error && (
            <div className="body-sm text-[var(--ember-300)]">{error}</div>
          )}

          <button
            type="button"
            onClick={() => { setMode('text'); tapLight(hapticsEnabled); }}
            className="label draw-underline text-[var(--ember-300)]"
          >
            Prefer to type · switch to text
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={compact ? 3 : 6}
            className="w-full p-4 text-[16px] leading-relaxed body-lg"
          />
          <button
            type="button"
            onClick={() => { setMode('voice'); tapLight(hapticsEnabled); }}
            className="self-end label draw-underline text-[var(--ember-300)]"
          >
            Switch back to voice
          </button>
        </div>
      )}
    </div>
  );
}

function MicGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden
         style={{ color: 'var(--paper-50)' }}>
      <rect x="9" y="3" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RecordDot() {
  return <span className="w-4 h-4 rounded-sm" style={{ background: 'var(--on-warm)' }} />;
}
