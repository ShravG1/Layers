import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';
import VocabularyPicker from './VocabularyPicker.jsx';
import ThemePicker from './ThemePicker.jsx';
import SwipePager from './SwipePager.jsx';
import Dots from './Dots.jsx';

export default function Settings({ settings, onChange, onClose, onExport, entriesCount }) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [page, setPage] = useState(0);

  const askPermission = async () => setPermission(await requestPermission());

  const panels = [
    // ---- Panel 1: Appearance ----
    <div key="appearance" className="h-full flex flex-col px-5 overflow-hidden">
      <div className="label shrink-0">Appearance</div>
      <p className="body-sm text-[var(--paper-400)] mt-1.5 mb-3 shrink-0">
        Applies instantly across the whole app.
      </p>
      <div className="flex-1 min-h-0">
        <ThemePicker
          value={settings.theme}
          accent={settings.paperAccent}
          onChange={({ theme, accent }) => onChange({ theme, paperAccent: accent })}
          hapticsEnabled={settings.hapticsEnabled}
          compact
        />
      </div>
    </div>,

    // ---- Panel 2: Words & rhythm ----
    <div key="words" className="h-full flex flex-col px-5 overflow-hidden">
      <div className="label shrink-0">Rating style</div>
      <p className="body-sm text-[var(--paper-400)] mt-1.5 mb-3 shrink-0">
        Switching keeps every past entry — only the wording changes.
      </p>
      <VocabularyPicker
        value={settings.vocabulary}
        onChange={(v) => onChange({ vocabulary: v })}
        hapticsEnabled={settings.hapticsEnabled}
      />
      <div className="label mt-6 mb-3 shrink-0">Summary frequency</div>
      <div className="grid grid-cols-3 gap-2 shrink-0">
        {[
          { v: 'weekly', l: 'Weekly' },
          { v: 'biweekly', l: 'Biweekly' },
          { v: 'monthly-only', l: 'Monthly' },
        ].map(opt => {
          const active = settings.summaryFrequency === opt.v;
          return (
            <button
              key={opt.v}
              onClick={() => onChange({ summaryFrequency: opt.v })}
              className="py-3 rounded-[var(--r-md)] press body-md"
              style={{
                background: active ? 'var(--ember-500)' : 'var(--ink-700)',
                color: active ? 'var(--on-warm)' : 'var(--paper-200)',
                boxShadow: active ? 'var(--shadow-sm), var(--glow-ember)' : 'var(--shadow-sm)',
              }}
            >
              {opt.l}
            </button>
          );
        })}
      </div>
      <p className="body-sm mt-2.5 text-[var(--paper-400)] shrink-0">
        Monthly summaries always run, regardless of this setting.
      </p>
    </div>,

    // ---- Panel 3: Reminders & data ----
    <div key="reminders" className="h-full flex flex-col px-5 overflow-hidden">
      <div className="label shrink-0">Reminders</div>
      <div className="mt-3 surface-card p-5 shrink-0">
        <div className="body-md text-[var(--paper-50)] mb-2">Notification time</div>
        <input
          type="time"
          value={settings.notificationTime}
          onChange={(e) => onChange({ notificationTime: e.target.value })}
          className="w-full px-4 py-3 body-lg"
          style={{ colorScheme: settings.theme === 'tide' ? 'dark' : 'light' }}
        />
        <p className="body-sm mt-2 text-[var(--paper-400)]">
          Reminders fire at this time. Summaries 30 minutes later.
        </p>
        <Row
          label="Permission"
          hint={permissionText(permission)}
          action={
            permission === 'default' && (
              <button onClick={askPermission}
                className="px-4 py-2 rounded-[var(--r-md)] press body-md"
                style={{ background: 'var(--ember-500)', color: 'var(--on-warm)', boxShadow: 'var(--shadow-sm)' }}>
                Enable
              </button>
            )
          }
        />
        <Row
          label="Subtle haptics"
          hint="Soft vibration on slider ticks"
          action={<Toggle on={settings.hapticsEnabled} onChange={(v) => onChange({ hapticsEnabled: v })} />}
        />
      </div>

      <div className="label mt-6 mb-3 shrink-0">Claude API key</div>
      <div className="surface-card p-5 shrink-0">
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value.trim() })}
          placeholder="sk-ant-…"
          className="w-full px-4 py-3 body-md"
        />
        <p className="body-sm mt-2 text-[var(--paper-400)]">
          Optional · powers the narratives. Stored only on this device — a local fallback is used without it.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between shrink-0">
        <div className="label">
          {entriesCount} {entriesCount === 1 ? 'entry' : 'entries'} · on this device
        </div>
        <button
          onClick={onExport}
          className="px-5 h-11 rounded-full press body-md"
          style={{
            background: 'var(--grad-cool)',
            color: 'var(--on-cool)',
            boxShadow: 'var(--shadow-sm), var(--glow-moon)',
          }}
        >
          Export JSON
        </button>
      </div>
    </div>,
  ];

  return (
    <main className="h-dvh flex flex-col overflow-hidden pt-5 pb-5 anim-ink-fade">
      <div className="px-5 shrink-0">
        <button onClick={onClose} aria-label="Back to home"
                className="label draw-underline text-[var(--paper-200)] press py-1 flex items-center gap-1.5">
          <BackArrow /> Home
        </button>
        <header className="mt-3 anim-lift">
          <div className="label">Settings</div>
          <h1 className="display-lg mt-1.5 text-[var(--paper-50)]">Adjust the room</h1>
        </header>
      </div>

      <div className="flex-1 min-h-0 mt-4">
        <SwipePager index={page} count={panels.length} onIndexChange={setPage}>
          {panels}
        </SwipePager>
      </div>

      <div className="shrink-0 flex items-center justify-between px-5 pt-3">
        <Dots count={panels.length} index={page} onJump={setPage} />
        <span className="label">Swipe</span>
      </div>
    </main>
  );
}

function Row({ label, hint, action }) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-[var(--ink-600)]">
      <div className="min-w-0">
        <div className="body-md text-[var(--paper-50)]">{label}</div>
        {hint && <div className="body-sm text-[var(--paper-400)] mt-0.5">{hint}</div>}
      </div>
      {action}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className="w-12 h-7 rounded-full press relative shrink-0"
      style={{
        background: on ? 'var(--ember-500)' : 'var(--ink-600)',
        boxShadow: on ? 'var(--shadow-sm), var(--glow-ember)' : 'var(--shadow-sm)',
        transition: 'background 320ms var(--ease-out-soft), box-shadow 320ms var(--ease-out-soft)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-[var(--paper-50)]"
        style={{
          transform: on ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 320ms var(--ease-out-soft)',
          boxShadow: 'var(--shadow-sm)',
        }}
      />
    </button>
  );
}

function permissionText(p) {
  if (p === 'granted') return 'Allowed';
  if (p === 'denied') return 'Blocked · enable in browser settings';
  if (p === 'unsupported') return 'Not supported on this device';
  return 'Not yet asked';
}

function BackArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
