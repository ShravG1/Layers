// localStorage-backed outfit history. Kept out of HistoryPage.jsx so that
// component module only exports components (react-refresh/only-export-components).

const LS_KEY = 'wtw_history'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ?? []
  } catch { return [] }
}

export function saveHistoryEntry(entry) {
  const history = loadHistory()
  history.unshift({ ...entry, id: Date.now() })
  localStorage.setItem(LS_KEY, JSON.stringify(history.slice(0, 90)))
}
