// Inline SVG line chart with gradient fill and stroke-dash line-draw on mount.

export default function LineChart({ points, variant = 'mood', label, height = 160 }) {
  const color = variant === 'mood' ? '#E8894A' : '#7B91B0';
  const gradId = `grad-${variant}`;
  const width = 320;
  const pad = { l: 22, r: 14, t: 14, b: 26 };
  const inner = { w: width - pad.l - pad.r, h: height - pad.t - pad.b };

  const xs = points.map((_, i) =>
    pad.l + (points.length === 1 ? inner.w / 2 : (i / (points.length - 1)) * inner.w)
  );
  const y = (v) => pad.t + inner.h - ((v - 1) / 9) * inner.h;

  // Build line segments; if a point is missing the path breaks
  const segments = [];
  let current = [];
  points.forEach((p, i) => {
    if (p.value == null) {
      if (current.length) { segments.push(current); current = []; }
      return;
    }
    current.push({ x: xs[i], y: y(p.value) });
  });
  if (current.length) segments.push(current);

  const linePath = segments
    .map(seg => seg.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' '))
    .join(' ');

  // Fill polygon under the line
  const fillPath = segments
    .map(seg => {
      if (seg.length < 2) return '';
      const start = `M${seg[0].x.toFixed(1)},${(pad.t + inner.h).toFixed(1)}`;
      const top = seg.map((pt, i) => `${i === 0 ? 'L' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
      const end = `L${seg[seg.length - 1].x.toFixed(1)},${(pad.t + inner.h).toFixed(1)} Z`;
      return `${start} ${top} ${end}`;
    })
    .join(' ');

  const grid = [1, 5.5, 10];
  const filled = points.filter(p => p.value != null);

  return (
    <div className="w-full">
      {label && <div className="label mb-2">{label}</div>}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label={`${variant} chart`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"  stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {grid.map((g, i) => (
          <line key={i}
            x1={pad.l} x2={width - pad.r}
            y1={y(g)} y2={y(g)}
            stroke="rgba(168,154,130,0.10)"
            strokeDasharray={i === 1 ? '0' : '2 5'}
          />
        ))}

        {fillPath && (
          <path d={fillPath} fill={`url(#${gradId})`} className="anim-ink-fade" />
        )}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anim-line-draw"
          />
        )}
        {points.map((p, i) => p.value != null && (
          <circle
            key={i}
            cx={xs[i]} cy={y(p.value)} r="3"
            fill={color}
            className="anim-ink-fade"
            style={{ animationDelay: `${500 + i * 30}ms` }}
          />
        ))}
        {points.map((p, i) => p.label && (
          <text key={`lab-${i}`} x={xs[i]} y={height - 8}
                fontSize="10" fill="var(--paper-400)"
                fontFamily="Inter Variable, system-ui"
                textAnchor="middle">
            {p.label}
          </text>
        ))}
      </svg>
      {filled.length === 0 && (
        <div className="text-center body-sm text-[var(--paper-400)] -mt-12">no entries yet</div>
      )}
    </div>
  );
}
