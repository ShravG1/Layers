import { useCallback, useEffect, useState } from 'react';
import Home from './components/Home.jsx';
import DailyEntry from './components/DailyEntry.jsx';
import WeeklySummary from './components/WeeklySummary.jsx';
import MonthlySummary from './components/MonthlySummary.jsx';
import Settings from './components/Settings.jsx';
import Onboarding from './components/Onboarding.jsx';
import Grain from './components/Grain.jsx';
import { useReflection } from './hooks/useReflection.js';
import { storage } from './utils/storage.js';
import { startScheduler } from './utils/notifications.js';
import { todayKey, yesterdayKey } from './utils/dates.js';

export default function App() {
  const r = useReflection();
  const [view, setView] = useState({ name: 'home' });
  const [onboarded, setOnboarded] = useState(() => storage.loadOnboarded());

  // Route changes use the View Transitions API where supported,
  // falling back to a plain set otherwise. Matches the ink-fade language.
  const navigate = useCallback((next) => {
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => setView(next));
    } else {
      setView(next);
    }
  }, []);

  useEffect(() => {
    const stop = startScheduler({
      getSettings: () => r.settings,
      getEntries: () => r.entries,
      getStreak: () => r.streak,
      onTrigger: ({ kind }) => {
        if (kind === 'weekly' || kind === 'biweekly') navigate({ name: 'weekly', kind });
        else if (kind === 'monthly') navigate({ name: 'monthly' });
      },
    });
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [r.settings.notificationTime, r.settings.summaryFrequency]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(r.exportAll(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reflection-export-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  let screen;
  if (!onboarded) {
    screen = (
      <Onboarding onDone={() => {
        storage.saveOnboarded(true);
        setOnboarded(true);
      }} />
    );
  } else if (view.name === 'entry') {
    screen = (
      <DailyEntry
        targetDate={view.date}
        existing={r.entries[view.date]}
        entryCount={Object.keys(r.entries).length}
        hapticsEnabled={r.settings.hapticsEnabled}
        onSave={(payload) => {
          r.saveEntry(payload);
          navigate({ name: 'home' });
        }}
        onCancel={() => navigate({ name: 'home' })}
      />
    );
  } else if (view.name === 'weekly') {
    screen = (
      <WeeklySummary
        entries={r.entries}
        apiKey={r.settings.apiKey}
        kind={view.kind || 'weekly'}
        hapticsEnabled={r.settings.hapticsEnabled}
        onClose={() => navigate({ name: 'home' })}
      />
    );
  } else if (view.name === 'monthly') {
    screen = (
      <MonthlySummary
        entries={r.entries}
        apiKey={r.settings.apiKey}
        hapticsEnabled={r.settings.hapticsEnabled}
        onClose={() => navigate({ name: 'home' })}
      />
    );
  } else if (view.name === 'settings') {
    screen = (
      <Settings
        settings={r.settings}
        onChange={r.updateSettings}
        onClose={() => navigate({ name: 'home' })}
        onExport={handleExport}
        entriesCount={Object.keys(r.entries).length}
      />
    );
  } else {
    screen = (
      <Home
        entries={r.entries}
        streak={r.streak}
        streakBumped={r.streakBumped}
        todayEntry={r.todayEntry}
        missedYesterday={r.missedYesterday}
        summaryFrequency={r.settings.summaryFrequency}
        onStartToday={() => navigate({ name: 'entry', date: todayKey() })}
        onBackfill={() => navigate({ name: 'entry', date: yesterdayKey() })}
        onOpenWeekly={() => navigate({ name: 'weekly', kind: r.settings.summaryFrequency === 'biweekly' ? 'biweekly' : 'weekly' })}
        onOpenMonthly={() => navigate({ name: 'monthly' })}
        onOpenSettings={() => navigate({ name: 'settings' })}
      />
    );
  }

  return (
    <>
      <Grain />
      <div className="app-shell">{screen}</div>
    </>
  );
}
