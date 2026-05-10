import { useState, useEffect, useCallback, useRef } from 'react'
import { useWeather }           from './hooks/useWeather.js'
import { usePreferences }       from './hooks/usePreferences.js'
import { useOutfitEngine }      from './hooks/useOutfitEngine.js'
import { useEveningForecast }   from './hooks/useEveningForecast.js'
import { useMorningPeak }       from './hooks/useMorningPeak.js'
import { usePushNotifications } from './hooks/usePushNotifications.js'
import { usePullToRefresh }     from './hooks/usePullToRefresh.js'
import { useAppUpdate }        from './hooks/useAppUpdate.js'

import { WeatherDisplay }      from './components/WeatherDisplay.jsx'
import { OutfitCard }          from './components/OutfitCard.jsx'
import { PackSomethingBanner } from './components/PackSomethingBanner.jsx'
import { MorningPeakBanner }   from './components/MorningPeakBanner.jsx'
import { UVAlert }             from './components/UVAlert.jsx'
import { OnboardingScreen }    from './components/OnboardingScreen.jsx'
import { LocationSearch }      from './components/LocationSearch.jsx'
import { Toast }               from './components/Toast.jsx'
import { HistoryPage, saveHistoryEntry, loadHistory } from './components/HistoryPage.jsx'
import { SettingsPage, loadSettings } from './components/SettingsPage.jsx'
import { DailyMoodPrompt } from './components/DailyMoodPrompt.jsx'
import { InstallHint } from './components/InstallHint.jsx'
import { TomorrowCard } from './components/TomorrowCard.jsx'
import { WeeklyPattern } from './components/WeeklyPattern.jsx'
import { WeeklyForecast } from './components/WeeklyForecast.jsx'
import { RainTimeline } from './components/RainTimeline.jsx'
import { SavedLocations } from './components/SavedLocations.jsx'
import { LogoMark } from './components/LogoMark.jsx'
import { UpdateBanner } from './components/UpdateBanner.jsx'
import { ReinstallSheet } from './components/ReinstallSheet.jsx'

const TABS = ['home', 'history', 'settings']
const TAB_LABELS = { home: 'Home', history: 'History', settings: 'Settings' }
const TAB_ICONS  = { home: '🏠', history: '📅', settings: '⚙️' }

export default function App() {
  const [tab, setTab]                       = useState('home')
  const [settings, setSettings]             = useState(loadSettings)
  const [notifPromptShown, setNotifPromptShown] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [showReinstall, setShowReinstall]   = useState(false)

  const { needsReload, applyUpdate } = useAppUpdate()

  const {
    weather, hourly, daily, location, loading, error,
    geoBlocked, searchLocation, selectLocation, refresh,
    savedLocations, saveCurrentLocation, removeSavedLocation, switchToSaved,
  } = useWeather()

  const homeScrollRef = useRef(null)
  const { pull, refreshing, triggerDistance } = usePullToRefresh(homeScrollRef, refresh)

  const {
    prefs, completeOnboarding, recordFeedback, logDailyMood, acknowledgeColdDrop,
    setWardrobe, addCustomExtra, removeCustomExtra,
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

  // Show notification prompt after onboarding OR on first standalone (PWA) launch
  useEffect(() => {
    if (!prefs.onboardingDone) return
    if (permission !== 'default') return
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (!standalone && notifSettings.prompted) return
    const t = setTimeout(() => setNotifPromptShown(true), 1500)
    return () => clearTimeout(t)
  }, [prefs.onboardingDone, notifSettings.prompted, permission])

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
    return <OnboardingScreen onComplete={completeOnboarding} />
  }

  return (
    <div className="flex flex-col h-full max-w-[420px] mx-auto relative bg-[#0a0a0a]">
      {/* Header */}
      <header className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-zinc-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <LogoMark size={28}/>
          <h1 className="text-white font-bold text-lg tracking-tight">Layers</h1>
        </div>
        <button onClick={refresh} className="text-zinc-600 hover:text-white transition-colors text-base" title="Refresh">
          ↻
        </button>
      </header>

      {/* Main content area */}
      <main className="flex-1 min-h-0 relative">
        {/* HOME TAB */}
        {tab === 'home' && (
          <div ref={homeScrollRef} className="h-full overflow-y-auto pb-6 relative" style={{ transform: `translateY(${pull}px)`, transition: pull === 0 ? 'transform 0.2s ease' : 'none' }}>
            {/* Pull-to-refresh indicator */}
            {(pull > 0 || refreshing) && (
              <div className="absolute -top-12 left-0 right-0 flex justify-center" style={{ opacity: Math.min(pull / triggerDistance, 1) }}>
                <div className={`w-8 h-8 border-2 rounded-full ${refreshing ? 'border-indigo-500 border-t-transparent animate-spin' : 'border-zinc-600 border-t-indigo-500'}`} style={{ transform: refreshing ? 'none' : `rotate(${pull * 4}deg)` }}/>
              </div>
            )}
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
                <SavedLocations
                  saved={savedLocations}
                  current={location}
                  onSwitch={switchToSaved}
                  onSave={saveCurrentLocation}
                  onRemove={removeSavedLocation}
                />
                <WeatherDisplay
                  weather={weather}
                  location={location}
                  hourly={hourly}
                  unit={settings.tempUnit ?? '°C'}
                  onLocationTap={() => setShowLocationSearch(true)}
                />
                <OutfitCard
                  outfitData={outfitData}
                  onLogWorn={handleLogWorn}
                  ownedIds={prefs.wardrobe}
                  onFeedback={handleFeedback}
                  feedbackLog={prefs.feedbackLog}
                />
                {(settings.tomorrowPreviewEnabled ?? true) && <TomorrowCard hourly={hourly} preferences={prefs}/>}
                {(settings.intradayDropEnabled ?? true) && <PackSomethingBanner alert={eveningAlert} />}
                <MorningPeakBanner peak={morningPeak} />
                {(settings.uvAlertsEnabled ?? true) && <UVAlert weather={weather} hourly={hourly} settings={settings} />}
                {(settings.rainAlertEnabled ?? true) && <RainTimeline hourly={hourly}/>}
                {(settings.weeklyForecastEnabled ?? true) && <WeeklyForecast daily={daily} unit={settings.tempUnit ?? '°C'}/>}
                <WeeklyPattern feedbackLog={prefs.feedbackLog} bucketAdjustments={prefs.bucketAdjustments}/>
                <DailyMoodPrompt
                  hour={outfitData?.hour ?? new Date().getHours()}
                  dailyMoodLog={prefs.dailyMoodLog}
                  morningPeak={morningPeak}
                  currentFeelsLike={weather.apparent_temperature}
                  acknowledgedDrop={prefs.acknowledgedDrop}
                  onLog={logDailyMood}
                  onAcknowledgeDrop={acknowledgeColdDrop}
                />
                <InstallHint />
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
                      const hour = parseInt((settings.notifTime || '07:30').split(':')[0]) || 7
                      await requestPermission({
                        lat: location?.lat,
                        lon: location?.lon,
                        city: location?.name,
                        localHour: hour,
                      })
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
            wardrobe={prefs.wardrobe ?? []}
            onWardrobeChange={setWardrobe}
            customExtras={prefs.customExtras ?? []}
            onAddCustom={addCustomExtra}
            onRemoveCustom={removeCustomExtra}
            onShowReinstall={() => setShowReinstall(true)}
          />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="flex border-t border-zinc-800/60 bg-zinc-950 flex-shrink-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 pt-3 pb-3 text-[11px] flex flex-col items-center gap-1.5 transition-colors active:scale-95
              ${tab === t ? 'text-indigo-400' : 'text-zinc-600'}`}
          >
            <span className={`text-xl leading-none transition-transform ${tab === t ? 'scale-110' : 'scale-100 opacity-50'}`}>
              {TAB_ICONS[t]}
            </span>
            <span className={`font-medium ${tab === t ? 'text-indigo-400' : 'text-zinc-600'}`}>{TAB_LABELS[t]}</span>
            {tab === t && <span className="w-1 h-1 rounded-full bg-indigo-400"/>}
          </button>
        ))}
      </nav>

      {/* Update banner */}
      {needsReload && <UpdateBanner onApply={applyUpdate}/>}

      {/* Reinstall guide */}
      {showReinstall && <ReinstallSheet onClose={() => setShowReinstall(false)}/>}

      {/* Location change overlay */}
      {showLocationSearch && (
        <div className="fixed inset-0 z-50 bg-zinc-950/95 flex flex-col pt-[max(env(safe-area-inset-top),1rem)]">
          <div className="px-4 pb-3 flex items-center gap-3 border-b border-zinc-800">
            <button onClick={() => setShowLocationSearch(false)} className="text-zinc-400 text-sm">← Back</button>
            <h2 className="text-white font-semibold text-sm">Change location</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <LocationSearch
              onSearch={searchLocation}
              onSelect={(loc) => { selectLocation(loc); setShowLocationSearch(false) }}
              hint="Search for a city or postcode"
            />
          </div>
        </div>
      )}

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
