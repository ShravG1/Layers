const STEPS = [
  { n: '1', icon: '📱', text: 'On your home screen, hold the Layers app icon until a menu appears' },
  { n: '2', icon: '🗑️', text: 'Tap "Remove App" or "Delete App" and confirm' },
  { n: '3', icon: '🌐', text: 'Open Safari and go to layers-app-aft.pages.dev' },
  { n: '4', icon: '⬆️', text: 'Tap the Share button (box with arrow) at the bottom of Safari' },
  { n: '5', icon: '➕', text: 'Tap "Add to Home Screen" then "Add"' },
]

export function ReinstallSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#111116] rounded-t-3xl border-t border-zinc-800 pb-[max(env(safe-area-inset-bottom),1.5rem)] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mt-4 mb-5"/>

        <div className="px-5">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔄</span>
            <div>
              <h3 className="text-white font-bold text-base">Reinstall Layers</h3>
              <p className="text-zinc-500 text-xs">Fixes persistent loading or display issues</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-3 items-start">
                <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex-shrink-0 flex items-center justify-center">
                  <span className="text-indigo-400 text-xs font-bold">{s.n}</span>
                </div>
                <div className="flex gap-2 items-start flex-1">
                  <span className="text-lg leading-tight">{s.icon}</span>
                  <p className="text-zinc-300 text-sm leading-snug">{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              <span className="text-zinc-300 font-medium">Note:</span> Your history and preferences are saved locally — reinstalling resets them. Export your wardrobe first if you want to keep it.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-zinc-800 text-zinc-400 rounded-2xl text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
