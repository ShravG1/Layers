// Local notification scheduler. iOS PWAs only deliver push from a server, so
// we use in-app notifications when the app is open and the Notification API
// when permitted. The companion service worker stub handles future push events.

import { todayKey, isSunday, isFirstOfMonth } from './dates.js';

export async function requestPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const r = await Notification.requestPermission();
    return r;
  } catch { return 'denied'; }
}

export function notificationsAllowed() {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

function fire(title, body) {
  if (!notificationsAllowed()) return false;
  try {
    new Notification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', silent: false });
    return true;
  } catch { return false; }
}

/**
 * Sets up a single-tick checker that runs while the PWA is open. Each minute
 * (or on visibility change) it compares the current time to the user's
 * configured notification time. When the time matches and the relevant
 * notification has not yet fired today, it fires it.
 */
export function startScheduler({ getSettings, getEntries, getStreak, onTrigger }) {
  let interval = null;
  const STORE_KEY = 'reflection.notif.fired.v1';

  const readFired = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
  };
  const writeFired = (v) => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(v)); } catch { /* */ }
  };

  const tick = () => {
    const settings = getSettings();
    const entries = getEntries();
    const streak = getStreak();
    const now = new Date();
    const today = todayKey(now);
    const fired = readFired();

    const [hh, mm] = (settings.notificationTime || '22:00').split(':').map(Number);
    const dailyMatch = now.getHours() === hh && now.getMinutes() === mm;

    // Daily reminder at configured time
    if (dailyMatch && !entries[today] && fired[`daily:${today}`] !== true) {
      const label = streak.count > 0 ? `🔥 Day ${streak.count + 1} — time to reflect` : 'Time to reflect';
      fire(label, 'A few minutes with yourself before bed.');
      fired[`daily:${today}`] = true;
      writeFired(fired);
      onTrigger?.({ kind: 'daily' });
    }

    // Weekly summary — 30 minutes after the daily reminder
    const weeklyMin = (mm + 30) % 60;
    const weeklyHourAdj = mm + 30 >= 60 ? (hh + 1) % 24 : hh;
    if (
      settings.summaryFrequency === 'weekly' &&
      isSunday(now) &&
      now.getHours() === weeklyHourAdj &&
      now.getMinutes() === weeklyMin &&
      fired[`weekly:${today}`] !== true
    ) {
      fire('Your week in review is ready', 'A gentle look back at the last seven days.');
      fired[`weekly:${today}`] = true;
      writeFired(fired);
      onTrigger?.({ kind: 'weekly' });
    }

    // Biweekly — every other Sunday
    if (
      settings.summaryFrequency === 'biweekly' &&
      isSunday(now) &&
      now.getHours() === weeklyHourAdj &&
      now.getMinutes() === weeklyMin &&
      isEvenWeek(now) &&
      fired[`biweekly:${today}`] !== true
    ) {
      fire('Your fortnight in review is ready', 'A look back at the last fourteen days.');
      fired[`biweekly:${today}`] = true;
      writeFired(fired);
      onTrigger?.({ kind: 'biweekly' });
    }

    // Monthly summary — first of the month
    if (
      isFirstOfMonth(now) &&
      now.getHours() === weeklyHourAdj &&
      now.getMinutes() === weeklyMin &&
      fired[`monthly:${today}`] !== true
    ) {
      fire('Your month in review is ready', 'Take time to read your month back to yourself.');
      fired[`monthly:${today}`] = true;
      writeFired(fired);
      onTrigger?.({ kind: 'monthly' });
    }
  };

  interval = setInterval(tick, 30 * 1000); // every 30s — cheap, only while app is open
  document.addEventListener('visibilitychange', tick);
  tick();

  return () => {
    if (interval) clearInterval(interval);
    document.removeEventListener('visibilitychange', tick);
  };
}

function isEvenWeek(d) {
  // ISO week-ish: number of complete weeks since epoch.
  const week = Math.floor((d.getTime() / 86400000 + 4) / 7);
  return week % 2 === 0;
}
