import { useEffect, useRef, useState } from 'react';
import { createRecorder, isSpeechRecognitionSupported } from '../utils/voice.js';
import { tapLight, tapMedium } from '../utils/haptics.js';

/**
 * Voice-first capture with a text fallback. The user can:
 *  - Hold and release the mic to record (auto-transcribed)
 *  - Tap the text icon to type instead
 */
export default function VoiceCapture({ value, audio, onChange, onAudio, hapticsEnabled = true, placeholder = "What's on your mind tonight?" }) {
  const [mode, setMode] = useState(audio ? 'voice' : (value ? 'text' : 'voice')); // 'voice' | 'text'
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(0);
  const recRef = useRef(null);
  const startedAtRef = useRef(0);

  // Auto-fall back to text if no SR support
  useEffect(() => {
    if (!isSpeechRecognitionSupported() && mode === 'voice' && !audio) {
      // still allow recording audio without transcription, but warn
    }
  }, [mode, audio]);

  const start = async () => {
    setError(null);
    tapMedium(hapticsEnabled);
    recRef.current = createRecorder({
      onTranscriptChange: (t) => onChange?.(t),
      onLevel: (v) => setLevel(v),
      onError: (e) => { if (e === 'mic-denied') setError('Microphone access denied. You can type instead.'); },
    });
    try {
      await recRef.current.start();
      startedAtRef.current = Date.now();
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

  useEffect(() => () => { recRef.current?.cancel?.(); }, []);

  return (
    <div className="w-full anim-fade">
      {mode === 'voice' ? (
        <div className="flex flex-col items-center gap-4 py-2">
          <button
            type="button"
            aria-label={recording ? 'Stop recording' : 'Start recording'}
            onPointerDown={start}
            onPointerUp={stop}
            onPointerCancel={stop}
            onTouchStart={(e) => { e.preventDefault(); start(); }}
            onTouchEnd={(e) => { e.preventDefault(); stop(); }}
            className={`relative w-28 h-28 rounded-full press press-grow flex items-center justify-center
                       ${recording ? 'anim-rec-pulse' : ''}`}
            style={{
              background: recording
                ? 'radial-gradient(circle at center, #c89a7c 0%, #9a6e54 100%)'
                : 'radial-gradient(circle at center, #fdfaf3 0%, #ece3d3 100%)',
              border: '1px solid rgba(93,122,98,0.20)',
              boxShadow: '0 10px 28px -14px rgba(45,42,38,0.4)',
            }}
          >
            <MicIcon active={recording} />
            {recording && (
              <span
                aria-hidden
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(255,255,255,${0.18 + level * 0.4}) 0%, transparent 65%)`,
                  transition: 'background 200ms ease-out',
                }}
              />
            )}
          </button>

          <div className="text-sm text-[var(--color-ink-500)] font-sans h-4">
            {recording ? 'Listening… release to stop' : 'Press and hold to speak'}
          </div>

          {value && (
            <div className="w-full soft-card-muted p-3 text-[15px] leading-relaxed anim-fade">
              <div className="text-[10px] uppercase tracking-wider text-[var(--color-ink-500)] mb-1 font-sans">transcript</div>
              {value}
            </div>
          )}

          {error && <div className="text-xs text-[var(--color-clay-700)] font-sans">{error}</div>}

          <button
            type="button"
            onClick={() => { setMode('text'); tapLight(hapticsEnabled); }}
            className="text-xs underline text-[var(--color-ink-500)] font-sans"
          >
            Prefer to type? Switch to text
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className="w-full p-4 rounded-2xl bg-[#fdfaf3] border border-[rgba(93,122,98,0.15)]
                       text-[16px] leading-relaxed focus:outline-none focus:border-[var(--color-sage-500)]
                       transition-colors"
          />
          <button
            type="button"
            onClick={() => { setMode('voice'); tapLight(hapticsEnabled); }}
            className="self-end text-xs underline text-[var(--color-ink-500)] font-sans"
          >
            Switch back to voice
          </button>
        </div>
      )}
    </div>
  );
}

function MicIcon({ active }) {
  const stroke = active ? '#fdfaf3' : '#5b554b';
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="12" rx="3" stroke={stroke} strokeWidth="1.8" />
      <path d="M5 11a7 7 0 0 0 14 0" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 18v3" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
