import { useCallback, useEffect, useRef, useState } from 'react';
import { labelForPosition, positionToValue, valueToPosition } from '../utils/labels.js';
import { tapLight } from '../utils/haptics.js';

/**
 * A horizontal "scroll bar" the user drags. We show only the feeling label —
 * never numbers. Five label markers sit beneath the track as gentle hints.
 */
export default function FeelingSlider({ labels, value, onChange, trackClass, color, hapticsEnabled = true }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localPos, setLocalPos] = useState(null); // overrides controlled value while dragging
  const lastLabelIdx = useRef(-1);
  const pos = localPos != null ? localPos : (value != null ? valueToPosition(value) : 0.5);

  const setFromClientX = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const raw = (clientX - rect.left) / rect.width;
    const next = Math.max(0, Math.min(1, raw));
    setLocalPos(next);
    const { index } = labelForPosition(labels, next);
    if (index !== lastLabelIdx.current) {
      lastLabelIdx.current = index;
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

  const { label } = labelForPosition(labels, pos);

  return (
    <div className="w-full select-none">
      <div className="flex items-baseline justify-between mb-3">
        <div
          key={label}
          className="text-2xl tracking-tight anim-fade"
          style={{ color }}
        >
          {label}
        </div>
      </div>

      <div className="relative py-4"
        onPointerDown={(e) => { setDragging(true); setFromClientX(e.clientX); }}
        onTouchStart={(e) => { setDragging(true); setFromClientX(e.touches[0].clientX); }}
      >
        <div ref={trackRef} className={`feeling-track ${trackClass || ''}`} />
        <div
          aria-hidden
          className={`thumb absolute top-1/2 -translate-y-1/2 ${dragging ? 'dragging' : ''}`}
          style={{ left: `calc(${pos * 100}% - 19px)` }}
        />
      </div>

      <div className="flex justify-between mt-1 font-sans">
        {labels.map((l, i) => (
          <span key={l}
            className={`text-[10px] ${labelForPosition(labels, pos).index === i ? 'text-[var(--color-ink-700)]' : 'text-[var(--color-ink-300)]'} transition-colors`}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
