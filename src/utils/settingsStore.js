// localStorage-backed app settings. Kept out of SettingsPage.jsx so that
// component module only exports components (react-refresh/only-export-components).

const LS_SETTINGS_KEY = 'wtw_settings'

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(LS_SETTINGS_KEY)) ?? {}
  } catch { return {} }
}

export function saveSettings(settings) {
  localStorage.setItem(LS_SETTINGS_KEY, JSON.stringify(settings))
}
