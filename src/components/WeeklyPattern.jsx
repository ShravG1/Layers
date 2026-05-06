import { useMemo } from 'react'
import { BUCKET_LABELS } from '../utils/outfitLogic.js'

export function WeeklyPattern({ feedbackLog = [], bucketAdjustments = {} }) {
  const insight = useMemo(() => {
    if (feedbackLog.length < 5) return null
    const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000
    const recent = feedbackLog.filter(l => l.timestamp > sevenDaysAgo)
    if (recent.length < 3) return null

    const counts = {}
    for (const l of recent) {
      if (!counts[l.bucket]) counts[l.bucket] = { cold: 0, warm: 0, ok: 0 }
      counts[l.bucket][l.feedback]++
    }

    // Find the bucket with strongest signal
    let bestBucket = null, bestSignal = 0, bestType = null
    for (const [bucket, c] of Object.entries(counts)) {
      const total = c.cold + c.warm + c.ok
      if (total < 2) continue
      if (c.cold / total > 0.6 && c.cold > bestSignal) { bestBucket = bucket; bestSignal = c.cold; bestType = 'cold' }
      if (c.warm / total > 0.6 && c.warm > bestSignal) { bestBucket = bucket; bestSignal = c.warm; bestType = 'warm' }
    }
    if (!bestBucket) return null

    const adj = bucketAdjustments[bestBucket] ?? 0
    const alreadyAdjusted = (bestType === 'cold' && adj > 0) || (bestType === 'warm' && adj < 0)

    return {
      bucket: BUCKET_LABELS[bestBucket] ?? bestBucket,
      type: bestType,
      signal: bestSignal,
      adjusted: alreadyAdjusted,
    }
  }, [feedbackLog, bucketAdjustments])

  if (!insight) return null

  return (
    <div className="mx-4 mt-3 rounded-2xl glass-card px-4 py-3 animate-fade-in">
      <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Pattern detected</p>
      <p className="text-zinc-300 text-sm leading-relaxed">
        {insight.type === 'cold'
          ? `You've felt cold ${insight.signal}× this week in the ${insight.bucket} range.`
          : `You've been too warm ${insight.signal}× this week in the ${insight.bucket} range.`}
        {' '}
        {insight.adjusted
          ? <span className="text-indigo-400">Layers has already adjusted your recs. ✓</span>
          : <span className="text-amber-400">Keep logging and it'll auto-adjust.</span>
        }
      </p>
    </div>
  )
}
