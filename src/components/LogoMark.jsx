// In-app 3D stacked-layers logo mark
export function LogoMark({ size = 28 }) {
  const s = size
  const slabH = s * 0.28, slabW = s * 0.72, rx = s * 0.07
  const cx = s / 2, yBase = s * 0.62
  const gap = s * 0.14

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338ca"/>
          <stop offset="100%" stopColor="#3730a3"/>
        </linearGradient>
        <linearGradient id="lm2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>
        <linearGradient id="lm1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
      </defs>
      {/* Back slab (widest) */}
      <rect
        x={cx - slabW * 0.56} y={yBase}
        width={slabW * 1.12} height={slabH}
        rx={rx} fill="url(#lm3)" opacity="0.6"
      />
      {/* Mid slab */}
      <rect
        x={cx - slabW * 0.5} y={yBase - gap}
        width={slabW} height={slabH}
        rx={rx} fill="url(#lm2)" opacity="0.85"
      />
      {/* Front slab */}
      <rect
        x={cx - slabW * 0.44} y={yBase - gap * 2}
        width={slabW * 0.88} height={slabH}
        rx={rx} fill="url(#lm1)"
      />
    </svg>
  )
}
