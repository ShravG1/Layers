import { useEffect, useState } from 'react';
import Home from './components/Home.jsx';
import DailyEntry from './components/DailyEntry.jsx';
import WeeklySummary from './components/WeeklySummary.jsx';
import MonthlySummary from './components/MonthlySummary.jsx';
import Settings from './components/Settings.jsx';
import Onboarding from './components/Onboarding.jsx';
import { useReflection } from './hooks/useReflection.js';
import { storage } from './utils/storage.js';
import { startScheduler } from './utils/notifications.js';
import { todayKey, yesterdayKey } from './utils/dates.js';

export default function App() {
  const r = useReflection();
  const [view, setView] = useState({ name: 'home' });
  const [onboarded, setOnboarded] = useState(() => storage.loadOnboarded());

  useEffect(() => {
    const stop = startScheduler({
      getSettings: () => r.settings,
      getEntries: () => r.entries,
      getStreak: () => r.streak,
      onTrigger: ({ kind }) => {
        if (kind === 'weekly' || kind === 'biweekly') setView({ name: 'weekly', kind });
        else if (kind === 'monthly') setView({ name: 'monthly' });
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

  if (!onboarded) {
    return (
      <Onboarding onDone={() => {
        storage.saveOnboarded(true);
        setOnboarded(true);
      }} />
    );
  }

  if (view.name === 'entry') {
    return (
      <DailyEntry
        targetDate={view.date}
        existing={r.entries[view.date]}
        hapticsEnabled={r.settings.hapticsEnabled}
        onSave={(payload) => {
          r.saveEntry(payload);
          setView({ name: 'home' });
        }}
        onCancel={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'weekly') {
    return (
      <WeeklySummary
        entries={r.entries}
        apiKey={r.settings.apiKey}
        kind={view.kind || 'weekly'}
        hapticsEnabled={r.settings.hapticsEnabled}
        onClose={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'monthly') {
    return (
      <MonthlySummary
        entries={r.entries}
        apiKey={r.settings.apiKey}
        hapticsEnabled={r.settings.hapticsEnabled}
        onClose={() => setView({ name: 'home' })}
      />
    );
  }

  if (view.name === 'settings') {
    return (
      <Settings
        settings={r.settings}
        onChange={r.updateSettings}
        onClose={() => setView({ name: 'home' })}
        onExport={handleExport}
        entriesCount={Object.keys(r.entries).length}
      />
    );
  }

  return (
    <Home
      entries={r.entries}
      streak={r.streak}
      streakBumped={r.streakBumped}
      todayEntry={r.todayEntry}
      missedYesterday={r.missedYesterday}
      summaryFrequency={r.settings.summaryFrequency}
      onStartToday={() => setView({ name: 'entry', date: todayKey() })}
      onBackfill={() => setView({ name: 'entry', date: yesterdayKey() })}
      onOpenWeekly={() => setView({ name: 'weekly', kind: r.settings.summaryFrequency === 'biweekly' ? 'biweekly' : 'weekly' })}
      onOpenMonthly={() => setView({ name: 'monthly' })}
      onOpenSettings={() => setView({ name: 'settings' })}
    />
  );
}
