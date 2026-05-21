import { useRef, useState } from 'react';

/**
 * Horizontal swipe pager. Renders every panel side by side and translates
 * the strip. Controlled: parent owns `index`. Swipe past the edge resists.
 * Each panel is full-viewport width; the strip never scrolls vertically.
 */
export default function SwipePager({ index, count, onIndexChange, children }) {
  const [drag, setDrag] = useState(0);
  const start = useRef(null);
  const axisLocked = useRef(null); // 'x' | 'y' | null

  const begin = (x, y) => { start.current = { x, y }; axisLocked.current = null; setDrag(0); };

  const move = (x, y) => {
    if (!start.current) return;
    const dx = x - start.current.x;
    const dy = y - start.current.y;
    if (!axisLocked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      axisLocked.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (axisLocked.current !== 'x') return;
    let d = dx;
    if ((index === 0 && dx > 0) || (index === count - 1 && dx < 0)) d = dx * 0.28;
    setDrag(d);
  };

  const end = () => {
    if (axisLocked.current === 'x') {
      const threshold = Math.min(110, window.innerWidth * 0.22);
      if (drag <= -threshold && index < count - 1) onIndexChange(index + 1);
      else if (drag >= threshold && index > 0) onIndexChange(index - 1);
    }
    start.current = null;
    axisLocked.current = null;
    setDrag(0);
  };

  return (
    <div
      className="overflow-hidden w-full h-full"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={(e) => begin(e.clientX, e.clientY)}
      onPointerMove={(e) => { if (start.current) move(e.clientX, e.clientY); }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        className="flex h-full"
        style={{
          width: `${count * 100}%`,
          transform: `translateX(calc(${(-index * 100) / count}% + ${drag}px))`,
          transition: drag ? 'none' : 'transform 440ms var(--ease-out-soft)',
        }}
      >
        {children.map((panel, i) => (
          <div key={i} className="h-full" style={{ width: `${100 / count}%` }}>
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
