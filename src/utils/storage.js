const KEY_ENTRIES = 'reflection.entries.v1';
const KEY_SETTINGS = 'reflection.settings.v1';
const KEY_STREAK = 'reflection.streak.v1';
const KEY_LAST_WEEKLY = 'reflection.lastWeekly.v1';
const KEY_LAST_MONTHLY = 'reflection.lastMonthly.v1';
const KEY_ONBOARDED = 'reflection.onboarded.v1';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
}

export const storage = {
  loadEntries() { return read(KEY_ENTRIES, {}); },
  saveEntries(entries) { write(KEY_ENTRIES, entries); },

  loadSettings() {
    const defaults = {
      summaryFrequency: 'weekly', // 'weekly' | 'biweekly' | 'monthly-only'
      notificationTime: '22:00',
      apiKey: '',
      hapticsEnabled: true,
      vocabulary: 'classic',      // 'classic' | 'plain' | 'soft'
      theme: 'garden',            // 'garden' | 'tide' | 'paper'
      paperAccent: 'rust',        // 'rust' | 'olive' | 'plum' — used by the Paper theme
    };
    return { ...defaults, ...read(KEY_SETTINGS, {}) };
  },
  saveSettings(s) { write(KEY_SETTINGS, s); },

  loadStreak() { return read(KEY_STREAK, { count: 0, lastEntryDate: null }); },
  saveStreak(s) { write(KEY_STREAK, s); },

  loadLastWeekly() { return read(KEY_LAST_WEEKLY, null); },
  saveLastWeekly(v) { write(KEY_LAST_WEEKLY, v); },

  loadLastMonthly() { return read(KEY_LAST_MONTHLY, null); },
  saveLastMonthly(v) { write(KEY_LAST_MONTHLY, v); },

  loadOnboarded() { return read(KEY_ONBOARDED, false); },
  saveOnboarded(v) { write(KEY_ONBOARDED, v); },

  exportAll() {
    return {
      exportedAt: new Date().toISOString(),
      entries: storage.loadEntries(),
      settings: storage.loadSettings(),
      streak: storage.loadStreak(),
    };
  },
};
