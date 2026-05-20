import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../utils/storage.js';
import { todayKey, yesterdayKey } from '../utils/dates.js';
import { recomputeStreak } from '../utils/streak.js';

/**
 * Central app state. Entries are keyed by their original local date so a
 * backfilled entry is correctly attributed to the day it covers.
 */
export function useReflection() {
  const [entries, setEntries] = useState(() => storage.loadEntries());
  const [settings, setSettings] = useState(() => storage.loadSettings());
  const [streak, setStreak] = useState(() => storage.loadStreak());
  const lastBumpRef = useRef(streak.count);
  const [streakBumped, setStreakBumped] = useState(false);

  // Persist on change
  useEffect(() => { storage.saveEntries(entries); }, [entries]);
  useEffect(() => { storage.saveSettings(settings); }, [settings]);
  useEffect(() => { storage.saveStreak(streak); }, [streak]);

  // Recompute streak when entries change
  useEffect(() => {
    const next = recomputeStreak(entries);
    setStreak(prev => {
      if (next.count > prev.count) {
        lastBumpRef.current = next.count;
        setStreakBumped(true);
        setTimeout(() => setStreakBumped(false), 1000);
      }
      return next;
    });
  }, [entries]);

  const saveEntry = useCallback(({ date, mood, stress, transcript, audioDataUrl, source, backfilled }) => {
    setEntries(prev => ({
      ...prev,
      [date]: {
        date,
        mood,
        stress,
        transcript: (transcript || '').trim(),
        audioDataUrl: audioDataUrl || null,
        source: source || 'voice', // 'voice' | 'text'
        backfilled: !!backfilled,
        savedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const updateSettings = useCallback((patch) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const missedYesterday = useMemo(() => {
    const y = yesterdayKey();
    return !entries[y];
  }, [entries]);

  const todayEntry = entries[todayKey()] || null;

  return {
    entries,
    settings,
    streak,
    streakBumped,
    todayEntry,
    missedYesterday,
    saveEntry,
    updateSettings,
    exportAll: () => storage.exportAll(),
  };
}
