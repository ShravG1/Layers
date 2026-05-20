// All dates are stored as local-day ISO strings: YYYY-MM-DD.

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(d = new Date()) {
  const y = new Date(d);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return todayKey(dt);
}

export function diffDays(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((da - db) / 86400000);
}

export function formatDate(key, opts = {}) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', {
    weekday: opts.weekday || 'long',
    day: 'numeric',
    month: 'long',
    ...opts,
  });
}

export function formatDayShort(key) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function isSunday(d = new Date()) { return d.getDay() === 0; }

export function isFirstOfMonth(d = new Date()) { return d.getDate() === 1; }

export function startOfWeek(d = new Date()) {
  // Week begins Monday in UK convention; window for the "past 7 days" is simpler.
  const out = new Date(d);
  out.setDate(out.getDate() - 6);
  return todayKey(out);
}

export function rangeKeys(startKey, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(addDays(startKey, i));
  return out;
}

export function lastNDaysKeys(n, end = new Date()) {
  const endKey = todayKey(end);
  const start = addDays(endKey, -(n - 1));
  return rangeKeys(start, n);
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function monthKeys(d = new Date()) {
  const year = d.getFullYear();
  const m = d.getMonth();
  const dim = daysInMonth(year, m);
  const keys = [];
  for (let i = 1; i <= dim; i++) {
    keys.push(`${year}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
  }
  return keys;
}

export function monthLabel(d = new Date()) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
