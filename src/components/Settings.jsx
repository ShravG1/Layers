import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';

export default function Settings({ settings, onChange, onClose, onExport, entriesCount }) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const askPermission = async () => setPermission(await requestPermission());

  return (
    <main className="min-h-dvh px-5 pt-6 pb-12 anim-ink-fade">
      <button onClick={onClose} className="label draw-underline text-[var(--paper-200)] press py-2">
        ← Home
      </button>

      <header className="mt-5 anim-lift">
        <div className="label">Settings</div>
        <h1 className="display-xl mt-3 text-[var(--paper-50)]">Adjust the room</h1>
      </header>

      <Section title="Summary frequency" delay="delay-100">
        <div className="grid grid-cols-3 gap-2">
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
                  color: active ? '#1A0F08' : 'var(--paper-200)',
                  boxShadow: active ? 'var(--shadow-sm), var(--glow-ember)' : 'var(--shadow-sm)',
                }}
              >
                {opt.l}
              </button>
            );
          })}
        </div>
        <p className="body-sm mt-3 text-[var(--paper-400)]">
          Monthly summaries always run, regardless of this setting.
        </p>
      </Section>

      <Section title="Notification time" delay="delay-200">
        <input
          type="time"
          value={settings.notificationTime}
          onChange={(e) => onChange({ notificationTime: e.target.value })}
          className="w-full px-4 py-3 body-lg"
          style={{ colorScheme: 'dark' }}
        />
        <p className="body-sm mt-2 text-[var(--paper-400)]">
          Reminders fire at this time. Weekly and monthly summaries 30 minutes later.
        </p>
        <Row
          label="Permission"
          hint={permissionText(permission)}
          action={
            permission === 'default' && (
              <button onClick={askPermission}
                className="px-4 py-2 rounded-[var(--r-md)] press body-md"
                style={{ background: 'var(--ember-500)', color: '#1A0F08', boxShadow: 'var(--shadow-sm)' }}>
                Enable
              </button>
            )
          }
        />
      </Section>

      <Section title="Feel" delay="delay-300">
        <Row
          label="Subtle haptics"
          hint="Soft vibration when sliders cross a tick"
          action={<Toggle on={settings.hapticsEnabled} onChange={(v) => onChange({ hapticsEnabled: v })} />}
        />
      </Section>

      <Section title="Claude API key" hint="Optional · powers the weekly and monthly narratives. Stored only on this device." delay="delay-400">
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value.trim() })}
          placeholder="sk-ant-…"
          className="w-full px-4 py-3 body-md"
        />
        <p className="body-sm mt-2 text-[var(--paper-400)]">
          Without a key, a local fallback summariser is used.
        </p>
      </Section>

      <Section title="Your data" delay="delay-500">
        <p className="body-md text-[var(--paper-200)]">
          {entriesCount} {entriesCount === 1 ? 'entry' : 'entries'} live only on this device.
        </p>
        <button
          onClick={onExport}
          className="mt-4 w-full h-12 rounded-full press body-md"
          style={{
            background: 'linear-gradient(180deg, #B8C7DE 0%, #7B91B0 60%, #4D6280 100%)',
            color: '#0E1117',
            boxShadow: 'var(--shadow-sm), var(--glow-moon)',
          }}
        >
          Export as JSON
        </button>
      </Section>

      <p className="mt-10 text-center label">Reflection · made for quiet evenings</p>
    </main>
  );
}

function Section({ title, hint, delay, children }) {
  return (
    <section className={`mt-8 anim-lift ${delay || ''}`}>
      <div className="label mb-4">{title}</div>
      {hint && <p className="body-sm text-[var(--paper-400)] -mt-2 mb-4">{hint}</p>}
      <div className="surface-card p-5">{children}</div>
    </section>
  );
}

function Row({ label, hint, action }) {
  return (
    <div className="flex items-center justify-between gap-4 pt-4 mt-4 border-t border-[var(--ink-600)] first:pt-0 first:mt-0 first:border-t-0">
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
