import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';

export default function Settings({ settings, onChange, onClose, onExport, entriesCount }) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const askPermission = async () => {
    const r = await requestPermission();
    setPermission(r);
  };

  return (
    <div className="min-h-dvh px-5 pt-6 pb-12 anim-fade">
      <button onClick={onClose} className="text-sm text-[var(--color-ink-500)] font-sans press py-2">← Home</button>
      <h1 className="text-3xl tracking-tight mt-3 anim-slide-up">Settings</h1>

      <section className="mt-8 soft-card p-5 anim-slide-up delay-100">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">summary frequency</div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { v: 'weekly', l: 'Weekly' },
            { v: 'biweekly', l: 'Biweekly' },
            { v: 'monthly-only', l: 'Monthly only' },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => onChange({ summaryFrequency: opt.v })}
              className={`py-3 rounded-xl press text-sm font-sans
                          ${settings.summaryFrequency === opt.v
                            ? 'bg-[var(--color-sage-700)] text-[#faf6ef]'
                            : 'bg-[var(--color-cream-200)] text-[var(--color-ink-700)]'}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-500)] mt-3 font-sans">
          Monthly summaries always run, regardless of this setting.
        </p>
      </section>

      <section className="mt-6 soft-card p-5 anim-slide-up delay-200">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">notification time</div>
        <input
          type="time"
          value={settings.notificationTime}
          onChange={(e) => onChange({ notificationTime: e.target.value })}
          className="w-full p-3 rounded-xl bg-[#fdfaf3] border border-[rgba(93,122,98,0.15)] text-lg"
        />
        <p className="text-xs text-[var(--color-ink-500)] mt-2 font-sans">
          You'll be reminded daily, plus weekly and monthly summaries 30 minutes later.
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-sans">Permission</div>
            <div className="text-xs text-[var(--color-ink-500)] font-sans">
              {permission === 'granted' ? 'Allowed' :
               permission === 'denied' ? 'Blocked — enable in browser settings' :
               permission === 'unsupported' ? 'Not supported on this device' :
               'Not yet asked'}
            </div>
          </div>
          {permission !== 'granted' && permission !== 'denied' && permission !== 'unsupported' && (
            <button onClick={askPermission}
              className="px-4 py-2 rounded-xl bg-[var(--color-sage-700)] text-[#faf6ef] text-sm press font-sans">
              Enable
            </button>
          )}
        </div>
      </section>

      <section className="mt-6 soft-card p-5 anim-slide-up delay-300">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">haptics</div>
        <label className="flex items-center justify-between">
          <span className="font-sans text-sm">Subtle tap feedback</span>
          <Toggle on={settings.hapticsEnabled} onChange={(v) => onChange({ hapticsEnabled: v })} />
        </label>
      </section>

      <section className="mt-6 soft-card p-5 anim-slide-up delay-400">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">claude api key (optional)</div>
        <p className="text-xs text-[var(--color-ink-500)] font-sans mb-3">
          Used to generate weekly and monthly narrative summaries. Stored only on this device. Leave empty to use a local fallback summariser.
        </p>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => onChange({ apiKey: e.target.value.trim() })}
          placeholder="sk-ant-…"
          className="w-full p-3 rounded-xl bg-[#fdfaf3] border border-[rgba(93,122,98,0.15)] text-sm font-sans"
        />
      </section>

      <section className="mt-6 soft-card p-5 anim-slide-up delay-500">
        <div className="text-xs uppercase tracking-widest text-[var(--color-ink-500)] mb-3 font-sans">your data</div>
        <p className="text-sm text-[var(--color-ink-700)] font-sans">
          {entriesCount} {entriesCount === 1 ? 'entry' : 'entries'} stored only on this device.
        </p>
        <button
          onClick={onExport}
          className="mt-3 w-full py-3 rounded-xl bg-[var(--color-dusk-700)] text-[#faf6ef] text-sm press font-sans"
        >
          Export as JSON
        </button>
      </section>

      <p className="mt-8 text-center text-xs text-[var(--color-ink-300)] font-sans">
        Reflection · made for quiet evenings
      </p>
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-12 h-7 rounded-full press relative transition-colors duration-300
                  ${on ? 'bg-[var(--color-sage-500)]' : 'bg-[var(--color-cream-300)]'}`}
      aria-pressed={on}
    >
      <span
        className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-[#fdfaf3] shadow-md transition-transform duration-300"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}
