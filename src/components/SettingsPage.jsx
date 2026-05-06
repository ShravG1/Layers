import { useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications.js'

const LS_SETTINGS_KEY = 'wtw_settings'

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(LS_SETTINGS_KEY)) ?? {}
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))
}

export function SettingsPage({ onResetPrefs, onResetOnboarding }) {
  const [settings, setSettings] = useState(() => ({
    eveningCheckHour: 19,
    eveningTempDrop: 4,
    notifTime: '07:30',
    dressForDayEnabled: true,
    uvAlertsEnabled: true,
    ...loadSettings(),
  }))
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const { permission, requestPermission, notifSettings } = usePushNotifications()

  const update = (key, val) => {
    const next = { ...settings, [key]: val }
    setSettings(next)
    saveSettings(next)
  }

  return (
    <div className="overflow-y-auto h-full pb-24 px-4 pt-4">
      <h2 className="text-white font-semibold text-lg mb-5">Settings</h2>

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

      {/* Morning features */}
      <Section title="Morning Features">
        <Row label="Dress for the Day mode">
          <Toggle value={settings.dressForDayEnabled} onChange={v => update('dressForDayEnabled', v)} />
        </Row>
        <Row label="UV alerts">
          <Toggle value={settings.uvAlertsEnabled} onChange={v => update('uvAlertsEnabled', v)} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Row label="Daily outfit time">
          <input
            type="time"
            value={settings.notifTime}
            onChange={e => update('notifTime', e.target.value)}
            className="bg-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm"
          />
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
            onClick={requestPermission}
            className="w-full mt-2 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Enable daily notifications
          </button>
        )}
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
          className="w-full py-2.5 bg-zinc-800 text-zinc-500 rounded-xl text-sm hover:bg-zinc-700 transition-colors"
        >
          Reset onboarding (testing)
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
