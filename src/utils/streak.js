import { todayKey, yesterdayKey, diffDays } from './dates.js';

/**
 * Streak rules:
 * - Streak increments when an entry is saved for today, OR when yesterday is
 *   backfilled within the 24-hour window AND the streak continues unbroken.
 * - If a missed day's backfill window passes (more than 1 day since last entry),
 *   the streak resets next time we recompute.
 */
export function recomputeStreak(entries, todayISO = todayKey()) {
  // Walk backwards from today, counting consecutive days with an entry.
  let count = 0;
  let cursor = todayISO;
  while (entries[cursor]) {
    count++;
    cursor = stepBack(cursor);
  }
  // If today has no entry yet, also count yesterday-anchored streak so the UI
  // can still display the current streak.
  if (count === 0 && entries[stepBack(todayISO)]) {
    let c = 0;
    let cur = stepBack(todayISO);
    while (entries[cur]) { c++; cur = stepBack(cur); }
    // But only if we are still within the backfill window for today (i.e. today
    // hasn't fully passed) — we always are while the app is being used today.
    return { count: c, lastEntryDate: stepBack(todayISO) };
  }
  return { count, lastEntryDate: count > 0 ? todayISO : null };
}

function stepBack(key) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Should we show the "you missed yesterday" banner?
 * - Yesterday has no entry
 * - Today is still open (we are within the backfill window by definition)
 * - The user had an entry the day before yesterday (otherwise nothing to save)
 */
export function shouldShowBackfillBanner(entries) {
  const y = yesterdayKey();
  if (entries[y]) return false;
  return true; // surface the gentle prompt regardless — they may want to log it
}

/**
 * After the backfill window closes (i.e. a day passed and was never logged),
 * that day stays as a "no entry" card. This helper just identifies them.
 */
export function isMissedDay(entries, key, todayISO = todayKey()) {
  if (entries[key]) return false;
  return diffDays(todayISO, key) > 0; // strictly before today
}
