export default function BackfillBanner({ onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full text-left soft-card px-4 py-3 mb-4 press anim-slide-down"
      style={{ borderColor: 'rgba(200, 154, 124, 0.45)' }}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-xl mt-0.5">🌙</span>
        <div className="font-sans">
          <div className="text-[15px] text-[var(--color-ink-900)]">You missed yesterday</div>
          <div className="text-[13px] text-[var(--color-ink-500)] mt-0.5">
            Add an entry before midnight to keep your streak.
          </div>
        </div>
      </div>
    </button>
  );
}
