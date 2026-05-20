export default function BackfillBanner({ onTap }) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full text-left folded-note pl-5 pr-4 py-4 mb-5 anim-lift press"
    >
      <div className="flex items-start gap-3">
        <MoonGlyph />
        <div>
          <div className="display-sm text-[var(--ink-900)]">Yesterday is still open</div>
          <div className="body-md text-[var(--ink-900)]/70 mt-1">
            Add an entry before midnight to keep the thread.
          </div>
        </div>
      </div>
    </button>
  );
}

function MoonGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" className="mt-1 shrink-0" aria-hidden>
      <path
        d="M16.5 14.5A8.5 8.5 0 0 1 9.5 4 8 8 0 1 0 20 14.5a8.6 8.6 0 0 1-3.5 0Z"
        fill="#0E1117"
        opacity="0.85"
      />
    </svg>
  );
}
