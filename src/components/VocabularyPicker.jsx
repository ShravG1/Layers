import { VOCAB_SETS } from '../utils/labels.js';
import { tapLight } from '../utils/haptics.js';

const ORDER = ['classic', 'plain', 'soft'];

// "Choose your words" — three vocabulary sets, each with a live preview of
// how the Mood and Stress scroll bars will read. The underlying 1-10 values
// never change, so switching later keeps historical charts accurate.
export default function VocabularyPicker({ value, onChange, hapticsEnabled = true }) {
  return (
    <div className="flex flex-col gap-3">
      {ORDER.map(key => {
        const set = VOCAB_SETS[key];
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => { onChange(key); tapLight(hapticsEnabled); }}
            className={`text-left surface-card p-4 press ${selected ? 'rail-ember' : ''}`}
            style={selected ? { boxShadow: 'var(--shadow-md), var(--glow-ember), inset 4px 0 0 var(--ember-500)' } : undefined}
            aria-pressed={selected}
          >
            <div className="flex items-center justify-between">
              <div className="display-sm text-[var(--paper-50)]">{set.label}</div>
              <Tick on={selected} />
            </div>

            <div className="mt-3">
              <MiniBar labels={set.mood} activeIndex={3} variant="mood" />
              <div className="h-3" />
              <MiniBar labels={set.stress} activeIndex={1} variant="stress" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MiniBar({ labels, activeIndex, variant }) {
  const pos = activeIndex / (labels.length - 1);
  const fill = variant === 'mood' ? 'var(--ember-500)' : 'var(--moon-500)';
  return (
    <div>
      <div className="relative h-3 rounded-full" style={{ background: 'var(--ink-700)' }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pos * 100}%`, background: fill, opacity: 0.85 }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full"
          style={{
            left: `calc(${pos * 100}% - 8px)`,
            transform: 'translateY(-50%)',
            background: 'var(--paper-50)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        {labels.map((l, i) => (
          <span
            key={l}
            className="label"
            style={{
              fontSize: '8px',
              letterSpacing: '0.06em',
              color: i === activeIndex ? 'var(--paper-200)' : 'var(--paper-400)',
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Tick({ on }) {
  return (
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: on ? 'var(--ember-500)' : 'transparent',
        border: on ? 'none' : '1px solid var(--ink-600)',
        transition: 'background 280ms var(--ease-out-soft)',
      }}
    >
      {on && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12l5 5 9-10" stroke="var(--on-warm)" strokeWidth="2.6"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
