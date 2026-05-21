// Page-position dots. The active dot stretches into a short bar.
export default function Dots({ count, index, onJump }) {
  return (
    <div className="flex gap-2" role="tablist" aria-label="Pages">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === index;
        const dot = (
          <span
            className="h-1.5 rounded-full block"
            style={{
              width: active ? 26 : 7,
              background: active ? 'var(--ember-500)' : 'var(--ink-600)',
              transition: 'width 380ms var(--ease-out-soft), background 380ms var(--ease-out-soft)',
            }}
          />
        );
        return onJump ? (
          <button key={i} type="button" aria-label={`Page ${i + 1}`} aria-selected={active}
                  onClick={() => onJump(i)} className="press py-1">
            {dot}
          </button>
        ) : (
          <span key={i} aria-hidden>{dot}</span>
        );
      })}
    </div>
  );
}
