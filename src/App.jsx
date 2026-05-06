import { useState, useEffect, useCallback } from 'react'
import { useWeather }           from './hooks/useWeather.js'
import { usePreferences }       from './hooks/usePreferences.js'
import { useOutfitEngine }      from './hooks/useOutfitEngine.js'
import { useEveningForecast }   from './hooks/useEveningForecast.js'
import { useMorningPeak }       from './hooks/useMorningPeak.js'
import { usePushNotifications } from './hooks/usePushNotifications.js'

import { WeatherDisplay }      from './components/WeatherDisplay.jsx'
import { OutfitCard }          from './components/OutfitCard.jsx'
import { FeedbackRow }         from './components/FeedbackRow.jsx'
import { PackSomethingBanner } from './components/PackSomethingBanner.jsx'
import { MorningPeakBanner }   from './components/MorningPeakBanner.jsx'
import { UVAlert }             from './components/UVAlert.jsx'
import { OnboardingScreen }    from './components/OnboardingScreen.jsx'
import { LocationSearch }      from './components/LocationSearch.jsx'
import { Toast }               from './components/Toast.jsx'
import { HistoryPage, saveHistoryEntry, loadHistory } from './components/HistoryPage.jsx'
import { SettingsPage, loadSettings } from './components/SettingsPage.jsx'

const TABS = ['home', 'history', 'settings']
const TAB_ICONS  = { home: '🏠', history: '📋', settings: '⚙️' }

export default function App() {
  const [tab, setTab]                       = useState('home')
  const [settings, setSettings]             = useState(loadSettings)
  const [notifPromptShown, setNotifPromptShown] = useState(false)

  const {
    weather, hourly, location, loading, error,
    geoBlocked, searchLocation, selectLocation, refresh,
  } = useWeather()

  const {
    prefs, setThermalProfile, recordFeedback,
    clearPendingToast, resetPreferences, resetOnboarding,
  } = usePreferences()

  const { permission, notifSettings, requestPermission } = usePushNotifications()

  const outfitData = useOutfitEngine({ weather, hourly, preferences: prefs, settings })

  const eveningAlert = useEveningForecast({
    hourly,
    currentFeelsLike: weather?.apparent_temperature,
    settings,
  })

  const morningPeak = useMorningPeak({
    hourly,
    currentFeelsLike: weather?.apparent_temperature,
    settings,
  })

  // Re-read settings from localStorage when tab changes
  useEffect(() => {
    setSettings(loadSettings())
  }, [tab])

  // Save history entry when outfit first loads
  useEffect(() => {
    if (!outfitData || !weather) return
    const history = loadHistory()
    const last    = history[0]
    const now     = Date.now()
    // Deduplicate within 30 minutes
    if (last && now - last.timestamp < 30 * 60 * 1000) return
    saveHistoryEntry({
      timestamp:        now,
      feelsLike:        outfitData.feelsLike,
      bucket:           outfitData.bucket,
      recommendedItems: outfitData.items.map(i => i.name),
      wornItems:        null,
      feedback:         null,
    })
  }, [outfitData?.bucket]) // eslint-disable-line

  // Show notification prompt after onboarding
  useEffect(() => {
    if (prefs.onboardingDone && !notifSettings.prompted) {
      const t = setTimeout(() => setNotifPromptShown(true), 1500)
      return () => clearTimeout(t)
    }
  }, [prefs.onboardingDone, notifSettings.prompted])

  const handleFeedback = useCallback((val) => {
    if (!outfitData) return
    recordFeedback(outfitData.bucket, outfitData.feelsLike, val)
    const history = loadHistory()
    if (history[0]) {
      history[0].feedback = val
      localStorage.setItem('wtw_history', JSON.stringify(history))
    }
  }, [outfitData, recordFeedback])

  const handleLogWorn = useCallback((worn) => {
    const history = loadHistory()
    if (history[0]) {
      history[0].wornItems = worn
      localStorage.setItem('wtw_history', JSON.stringify(history))
    }
  }, [])

  if (!prefs.onboardingDone) {
    return <OnboardingScreen onSelect={setThermalProfile} />
  }

  return (
    <div className="flex flex-col h-full max-w-[420px] mx-auto relative bg-[#0f0f0f]">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-zinc-900 flex-shrink-0">
        <h1 className="text-white font-bold text-xl tracking-tight">WhatToWear</h1>
        <button
          onClick={refresh}
          className="text-zinc-500 hover:text-white transition-colors text-xl"
          title="Refresh weather"
        >
          🔄
        </button>
      </header>

      {/* Main content area */}
      <main className="flex-1 min-h-0 relative">
        {/* HOME TAB */}
        {tab === 'home' && (
          <div className="h-full overflow-y-auto pb-6">
            {loading && !weather && (
              <div className="flex flex-col items-center justify-center h-48 gap-3 mt-8">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 text-sm">Getting your weather...</p>
              </div>
            )}

            {error && !loading && (
              <div className="mx-4 mt-6 bg-red-900/30 border border-red-800 rounded-2xl p-4 text-center">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={refresh} className="mt-2 text-xs text-red-300 underline">Try again</button>
              </div>
            )}

            {geoBlocked && !weather && !loading && (
              <LocationSearch onSearch={searchLocation} onSelect={selectLocation} />
            )}

            {weather && (
              <>
                <WeatherDisplay weather={weather} location={location} />
                <OutfitCard outfitData={outfitData} onLogWorn={handleLogWorn} />
                <PackSomethingBanner alert={eveningAlert} />
                <MorningPeakBanner peak={morningPeak} />
                <UVAlert weather={weather} hourly={hourly} settings={settings} />
                <FeedbackRow onFeedback={handleFeedback} />
              </>
            )}

            {/* Notification opt-in prompt */}
            {notifPromptShown && permission === 'default' && weather && (
              <div className="mx-4 mt-4 rounded-2xl bg-zinc-900 border border-zinc-700 p-4 animate-fade-in">
                <p className="text-white text-sm font-medium mb-1">Daily outfit heads-up?</p>
                <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
                  Want a daily outfit hint at 7:30am? We'll keep it to one line.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNotifPromptShown(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-500 text-xs"
                  >
                    No thanks
                  </button>
                  <button
                    onClick={async () => {
                      await requestPermission()
                      setNotifPromptShown(false)
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-medium"
                  >
                    Yes, enable
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && <HistoryPage />}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <SettingsPage
            onResetPrefs={resetPreferences}
            onResetOnboarding={resetOnboarding}
          />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="flex border-t border-zinc-900 bg-zinc-950 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs flex flex-col items-center gap-0.5 transition-colors
              ${tab === t ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <span className="text-xl leading-none">{TAB_ICONS[t]}</span>
            <span className="capitalize">{t}</span>
          </button>
        ))}
      </nav>

      {/* Toast for preference auto-adjustments */}
      {prefs.pendingToast && (
        <Toast
          message={`Updated your ${prefs.pendingToast} recommendation based on your feedback`}
          onDone={clearPendingToast}
        />
      )}
    </div>
  )
}
