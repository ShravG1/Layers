// Lightweight inline SVG line chart for Mood & Stress.

export default function LineChart({ points, color = '#5d7a62', label, height = 140 }) {
  const width = 320;
  const pad = { l: 28, r: 16, t: 14, b: 22 };
  const inner = { w: width - pad.l - pad.r, h: height - pad.t - pad.b };

  const filled = points.filter(p => p.value != null);
  const xs = points.map((_, i) => pad.l + (points.length === 1 ? inner.w / 2 : (i / (points.length - 1)) * inner.w));
  const y = (v) => pad.t + inner.h - ((v - 1) / 9) * inner.h;

  let d = '';
  let drew = false;
  points.forEach((p, i) => {
    if (p.value == null) { drew = false; return; }
    const cmd = drew ? 'L' : 'M';
    d += `${cmd}${xs[i].toFixed(1)},${y(p.value).toFixed(1)} `;
    drew = true;
  });

  // Gridlines for 1-10 range, drawn as faint horizontal lines
  const grid = [1, 5.5, 10];

  return (
    <div className="w-full">
      {label && <div className="text-xs text-[var(--color-ink-500)] mb-1 font-sans">{label}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={`${label} line chart`}>
        {grid.map((g, i) => (
          <line key={i}
            x1={pad.l} x2={width - pad.r}
            y1={y(g)} y2={y(g)}
            stroke="rgba(45,42,38,0.08)" strokeDasharray="2 4"
          />
        ))}
        {d && (
          <path d={d} fill="none" stroke={color} strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round"
                className="anim-line-draw" />
        )}
        {points.map((p, i) => p.value != null && (
          <circle key={i} cx={xs[i]} cy={y(p.value)} r="3.4" fill={color} className="anim-fade-slow" />
        ))}
        {points.map((p, i) => (
          <text key={`l-${i}`} x={xs[i]} y={height - 6}
                fontSize="9" fill="rgba(45,42,38,0.55)"
                fontFamily="ui-sans-serif, system-ui"
                textAnchor="middle">{p.label}</text>
        ))}
      </svg>
      {filled.length === 0 && (
        <div className="text-center text-xs text-[var(--color-ink-500)] -mt-10 font-sans">no entries yet</div>
      )}
    </div>
  );
}
