export function UpdateBanner({ onApply }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-[max(env(safe-area-inset-top),0.75rem)] animate-slide-down pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md bg-indigo-600 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <p className="text-white text-sm font-medium">Update ready</p>
        </div>
        <button
          onClick={onApply}
          className="bg-white text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-xl active:scale-95 transition-transform flex-shrink-0"
        >
          Apply now
        </button>
      </div>
    </div>
  )
}
