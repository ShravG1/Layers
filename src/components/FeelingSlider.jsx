import { useCallback, useEffect, useRef, useState } from 'react';
import { labelForPosition, positionToValue, valueToPosition } from '../utils/labels.js';
import { tapLight } from '../utils/haptics.js';

/**
 * Full-bleed feeling slider.
 * - 56px track, fill gradient interpolates ember-700 → sage-500 (mood) or
 *   sage-500 → ember-700 (stress)
 * - Crossfading display-md label above
 * - Haptic tap each time the handle crosses a tick
 */
export default function FeelingSlider({
  labels,
  value,
  onChange,
  variant = 'mood', // 'mood' | 'stress'
  hapticsEnabled = true,
}) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localPos, setLocalPos] = useState(null);
  const lastIdxRef = useRef(-1);
  const pos = localPos != null ? localPos : (value != null ? valueToPosition(value) : 0.5);

  // Continuous label index (float) for the crossfade
  const idxFloat = pos * (labels.length - 1);
  const idxA = Math.floor(idxFloat);
  const idxB = Math.min(labels.length - 1, idxA + 1);
  const fade = idxFloat - idxA;

  const setFromClientX = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    const next = Math.max(0, Math.min(1, raw));
    setLocalPos(next);
    const { index } = labelForPosition(labels, next);
    if (index !== lastIdxRef.current) {
      lastIdxRef.current = index;
      tapLight(hapticsEnabled);
    }
    onChange?.(positionToValue(next));
  }, [labels, onChange, hapticsEnabled]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      setFromClientX(x);
    };
    const end = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, [dragging, setFromClientX]);

  // Gradient endpoints come from the active theme. Mood runs ember → sage,
  // stress runs sage → ember; the fill mask reveals the slice up to the handle.
  const isMood = variant === 'mood';
  const gradFrom = isMood ? 'var(--ember-700)' : 'var(--sage-500)';
  const gradTo   = isMood ? 'var(--sage-500)'  : 'var(--ember-700)';

  const accent = isMood ? 'var(--ember-500)' : 'var(--moon-500)';
  const thumbClass = isMood ? 'ember' : 'moon';

  return (
    <div className="w-full select-none">
      {/* Crossfading label */}
      <div className="relative h-[36px] mb-4">
        <span
          key={`a-${idxA}`}
          className="display-md absolute left-0"
          style={{ color: accent, opacity: 1 - fade, transition: 'opacity 220ms var(--ease-out-soft)' }}
        >
          {labels[idxA]}
        </span>
        {idxB !== idxA && (
          <span
            key={`b-${idxB}`}
            className="display-md absolute left-0"
            style={{ color: accent, opacity: fade, transition: 'opacity 220ms var(--ease-out-soft)' }}
          >
            {labels[idxB]}
          </span>
        )}
      </div>

      {/* Track + handle */}
      <div
        className="relative py-3 touch-none"
        onPointerDown={(e) => { setDragging(true); setFromClientX(e.clientX); e.currentTarget.setPointerCapture?.(e.pointerId); }}
        onTouchStart={(e) => { setDragging(true); setFromClientX(e.touches[0].clientX); }}
      >
        <div
          ref={trackRef}
          className="feeling-track"
          style={{
            '--fill-pct': `${pos * 100}%`,
            '--grad-from': gradFrom,
            '--grad-to': gradTo,
          }}
        />
        <div
          aria-hidden
          className={`feeling-thumb ${thumbClass} ${dragging ? 'dragging' : ''}`}
          style={{ left: `calc(${pos * 100}%)` }}
        />
      </div>

      {/* Tick labels */}
      <div className="flex justify-between mt-3">
        {labels.map((l, i) => {
          const active = labelForPosition(labels, pos).index === i;
          return (
            <span
              key={l}
              className="label"
              style={{
                color: active ? 'var(--paper-200)' : 'var(--paper-400)',
                opacity: active ? 1 : 0.7,
                transition: 'color 320ms var(--ease-out-soft), opacity 320ms var(--ease-out-soft)',
              }}
            >
              {l}
            </span>
          );
        })}
      </div>
    </div>
  );
}
