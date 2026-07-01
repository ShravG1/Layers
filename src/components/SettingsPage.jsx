import { useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications.js'
import { WardrobeSelect } from './WardrobeSelect.jsx'

const LS_SETTINGS_KEY = 'wtw_settings'

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(LS_SETTINGS_KEY)) ?? {}
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))
}

export function SettingsPage({ onResetPrefs, onResetOnboarding, wardrobe = [], onWardrobeChange, customExtras = [], onAddCustom, onRemoveCustom, onShowReinstall, cloudBackup, onEnableNotifications }) {
  const [wardrobeOpen, setWardrobeOpen] = useState(false)
  const [settings, setSettings] = useState(() => ({
    eveningCheckHour: 19,
    eveningTempDrop: 4,
    notifTime: '07:00',
    dressForDayEnabled: true,
    uvAlertsEnabled: true,
    windAdvisoryEnabled: true,
    rainAlertEnabled: true,
    humidityAdvisoryEnabled: true,
    intradayDropEnabled: true,
    tomorrowPreviewEnabled: true,
    weeklyForecastEnabled: true,
    ...loadSettings(),
  }))
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { permission } = usePushNotifications()

  const update = (key, val) => {
    const next = { ...settings, [key]: val }
    setSettings(next)
    saveSettings(next)
  }

  // Normalise a possibly-legacy "HH:MM" value to a whole hour for the select.
  const notifHour = String(parseInt(settings.notifTime, 10) || 7).padStart(2, '0')

  return (
    <div className="overflow-y-auto h-full pb-24 px-4 pt-4">
      <h2 className="text-white font-semibold text-lg mb-5">Settings</h2>

      {/* Wardrobe */}
      <Section title="Wardrobe">
        <button
          onClick={() => setWardrobeOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-zinc-300 text-sm">Edit my wardrobe</span>
          <span className="text-zinc-500 text-xs">{wardrobe.length} items · {wardrobeOpen ? '▲' : '▼'}</span>
        </button>
        {wardrobeOpen && (
          <div className="px-4 pb-4">
            <WardrobeSelect
              selected={wardrobe}
              onChange={onWardrobeChange}
              customExtras={customExtras}
              onAddCustom={onAddCustom}
              onRemoveCustom={onRemoveCustom}
              dense
            />
          </div>
        )}
      </Section>

      {/* Evening alerts */}
      <Section title="Evening Alerts">
        <Row label="Check evening from">
          <select
            value={settings.eveningCheckHour}
            onChange={e => update('eveningCheckHour', Number(e.target.value))}
            className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {[17,18,19,20,21].map(h => (
              <option key={h} value={h}>{h}:00</option>
            ))}
          </select>
        </Row>
        <Row label="Temp drop threshold">
          <select
            value={settings.eveningTempDrop}
            onChange={e => update('eveningTempDrop', Number(e.target.value))}
            className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {[2,3,4,5,6,8].map(v => (
              <option key={v} value={v}>{v}°C</option>
            ))}
          </select>
        </Row>
      </Section>

      {/* Units */}
      <Section title="Units">
        <Row label="Temperature">
          <div className="flex rounded-lg overflow-hidden border border-zinc-700">
            {['°C', '°F'].map(u => (
              <button
                key={u}
                onClick={() => update('tempUnit', u)}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  (settings.tempUnit ?? '°C') === u
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >{u}</button>
            ))}
          </div>
        </Row>
      </Section>

      {/* Daily Features */}
      <Section title="Daily Features">
        <Row label="Outfit recommendations">
          <Toggle value={settings.dressForDayEnabled} onChange={v => update('dressForDayEnabled', v)} />
        </Row>
        <Row label="Tomorrow preview">
          <Toggle value={settings.tomorrowPreviewEnabled} onChange={v => update('tomorrowPreviewEnabled', v)} />
        </Row>
        <Row label="7-day forecast">
          <Toggle value={settings.weeklyForecastEnabled} onChange={v => update('weeklyForecastEnabled', v)} />
        </Row>
        <Row label="Pack reminders">
          <Toggle value={settings.intradayDropEnabled} onChange={v => update('intradayDropEnabled', v)} />
        </Row>
        <Row label="UV alerts">
          <Toggle value={settings.uvAlertsEnabled} onChange={v => update('uvAlertsEnabled', v)} />
        </Row>
        <Row label="Wind advisory">
          <Toggle value={settings.windAdvisoryEnabled} onChange={v => update('windAdvisoryEnabled', v)} />
        </Row>
        <Row label="Rain alerts">
          <Toggle value={settings.rainAlertEnabled} onChange={v => update('rainAlertEnabled', v)} />
        </Row>
        <Row label="Humidity advisory">
          <Toggle value={settings.humidityAdvisoryEnabled} onChange={v => update('humidityAdvisoryEnabled', v)} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row label="Daily outfit time">
          {/* Whole hours only — the worker cron is hourly, so a minute-precise
              picker would promise precision the pipeline can't deliver. */}
          <select
            value={`${notifHour}:00`}
            onChange={e => update('notifTime', e.target.value)}
            className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm"
          >
            {Array.from({ length: 24 }, (_, h) => {
              const val = `${String(h).padStart(2, '0')}:00`
              return <option key={h} value={val}>{val}</option>
            })}
          </select>
        </Row>
        <Row label="Permission">
          <span className={`text-xs px-2 py-1 rounded-full ${
            permission === 'granted' ? 'bg-green-900/50 text-green-300' :
            permission === 'denied'  ? 'bg-red-900/50 text-red-300' :
            'bg-zinc-800 text-zinc-400'
          }`}>
            {permission === 'granted' ? '✓ Enabled' : permission === 'denied' ? 'Blocked' : 'Not set'}
          </span>
        </Row>
        {permission === 'default' && (
          <button
            onClick={() => onEnableNotifications?.()}
            className="w-full mt-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Enable daily notifications
          </button>
        )}
      </Section>

      {/* Backup & Sync */}
      <Section title="Backup & Sync">
        <BackupPanel cloudBackup={cloudBackup} />
      </Section>

      {/* Danger zone */}
      <Section title="Data">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-sm hover:bg-zinc-700 transition-colors mb-2"
        >
          Reset all preferences
        </button>
        <button
          onClick={onResetOnboarding}
          className="w-full py-2.5 bg-zinc-800 text-zinc-500 rounded-xl text-sm hover:bg-zinc-700 transition-colors mb-2"
        >
          Reset onboarding (testing)
        </button>
        <button
          onClick={onShowReinstall}
          className="w-full py-2.5 bg-zinc-800 text-zinc-500 rounded-xl text-sm hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔄</span><span>App not updating? Reinstall guide</span>
        </button>
      </Section>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-xs w-full">
            <p className="text-white font-semibold mb-2">Reset all preferences?</p>
            <p className="text-zinc-400 text-sm mb-5">This will clear all your feedback history and return recommendations to defaults.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-zinc-800 text-zinc-400 rounded-xl text-sm">Cancel</button>
              <button onClick={() => { onResetPrefs(); setShowResetConfirm(false) }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function relTime(ts) {
  if (!ts) return 'never'
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

function BackupPanel({ cloudBackup }) {
  const [copied, setCopied] = useState(false)
  const [restoreOpen, setRestoreOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!cloudBackup?.configured) {
    return (
      <div className="px-4 py-4">
        <p className="text-zinc-400 text-xs leading-relaxed mb-2">
          Automatic backup isn't set up yet. To enable it, add <code className="text-zinc-300">VITE_PUSH_WORKER_URL</code> to your Cloudflare Pages environment variables (your <span className="text-zinc-300">layers-push</span> worker URL), then redeploy.
        </p>
        <p className="text-zinc-600 text-xs">
          Find the worker URL in Cloudflare dashboard → Workers &amp; Pages → layers-push.
        </p>
      </div>
    )
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cloudBackup.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard blocked — code is still visible */ }
  }

  const doRestore = async () => {
    setBusy(true)
    setMsg(null)
    const res = await cloudBackup.restore(input)
    if (res.ok) {
      setMsg({ ok: true, text: 'Restored. Reloading…' })
      setTimeout(() => window.location.reload(), 900)
    } else {
      setMsg({ ok: false, text: res.error })
      setBusy(false)
    }
  }

  const statusText =
    cloudBackup.status === 'saving' ? 'Backing up…' :
    cloudBackup.status === 'error'  ? 'Last backup failed' :
    `Last backed up ${relTime(cloudBackup.lastBackup)}`

  return (
    <div className="px-4 py-4">
      <p className="text-zinc-400 text-xs leading-relaxed mb-3">
        Your data backs up automatically. Save this code — after a reinstall or on a
        new phone, enter it to restore everything.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 bg-zinc-800 text-white text-lg font-mono tracking-widest text-center py-2.5 rounded-xl select-all">
          {cloudBackup.code}
        </code>
        <button
          onClick={copy}
          className="px-3 py-2.5 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs ${cloudBackup.status === 'error' ? 'text-red-400' : 'text-zinc-500'}`}>
          {statusText}
        </span>
        <button
          onClick={cloudBackup.backupNow}
          disabled={cloudBackup.status === 'saving'}
          className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          Back up now
        </button>
      </div>

      <button
        onClick={() => setRestoreOpen(o => !o)}
        className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {restoreOpen ? '▲ Hide restore' : '▼ Restore from a code'}
      </button>

      {restoreOpen && (
        <div className="mt-3">
          <p className="text-amber-400/80 text-[11px] leading-relaxed mb-2">
            Restoring replaces the data on this device with the backup.
          </p>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="XXXX-XXXX"
            autoCapitalize="characters"
            spellCheck={false}
            className="w-full bg-zinc-800 text-white font-mono tracking-widest text-center rounded-xl px-3 py-2.5 text-sm mb-2 placeholder:text-zinc-600"
          />
          {msg && (
            <p className={`text-xs mb-2 ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</p>
          )}
          <button
            onClick={doRestore}
            disabled={busy || !input.trim()}
            className="w-full py-2.5 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-medium hover:bg-white transition-colors disabled:opacity-40"
          >
            {busy ? 'Restoring…' : 'Restore this code'}
          </button>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-zinc-500 text-xs uppercase tracking-wide mb-2">{title}</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
        {children}
      </div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-zinc-300 text-sm">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-indigo-600' : 'bg-zinc-700'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )
}
