import { tapLight } from '../utils/haptics.js';

const THEMES = [
  {
    key: 'garden',
    name: 'Garden',
    blurb: 'Warm creams and dusty sage. Journaling at a kitchen table, unhurried.',
  },
  {
    key: 'tide',
    name: 'Tide',
    blurb: 'Deep navy and slate blue. Calm and contemplative, like writing by the sea.',
  },
  {
    key: 'paper',
    name: 'Paper',
    blurb: 'Off-white and charcoal with one quiet accent. A private notebook.',
  },
];

const ACCENTS = [
  { key: 'rust',  name: 'Rust' },
  { key: 'olive', name: 'Olive' },
  { key: 'plum',  name: 'Plum' },
];

// "Pick your feel" — three complete design systems. Each preview tile is
// scoped with its own data-theme attribute, so it renders in that theme
// regardless of the app's current one.
export default function ThemePicker({ value, accent, onChange, hapticsEnabled = true }) {
  return (
    <div className="flex flex-col gap-3">
      {THEMES.map(theme => {
        const selected = value === theme.key;
        return (
          <div key={theme.key}>
            <button
              type="button"
              onClick={() => { onChange({ theme: theme.key, accent }); tapLight(hapticsEnabled); }}
              className={`w-full text-left surface-card p-4 press ${selected ? 'rail-ember' : ''}`}
              style={selected ? { boxShadow: 'var(--shadow-md), var(--glow-ember), inset 4px 0 0 var(--ember-500)' } : undefined}
              aria-pressed={selected}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="display-sm text-[var(--paper-50)]">{theme.name}</div>
                <Tick on={selected} />
              </div>
              <ThemeMock theme={theme.key} accent={accent} />
              <p className="body-sm text-[var(--paper-400)] mt-3">{theme.blurb}</p>
            </button>

            {theme.key === 'paper' && selected && (
              <div className="mt-2 surface-card p-4 anim-lift-soft">
                <div className="label mb-3">Accent colour</div>
                <div className="grid grid-cols-3 gap-2">
                  {ACCENTS.map(a => {
                    const aSel = accent === a.key;
                    return (
                      <button
                        key={a.key}
                        type="button"
                        onClick={() => { onChange({ theme: 'paper', accent: a.key }); tapLight(hapticsEnabled); }}
                        className="flex flex-col items-center gap-2 py-3 rounded-[var(--r-md)] press"
                        style={{
                          background: 'var(--ink-700)',
                          boxShadow: aSel ? 'var(--shadow-sm), var(--glow-ember)' : 'var(--shadow-sm)',
                          outline: aSel ? '2px solid var(--ember-500)' : '2px solid transparent',
                          outlineOffset: '-2px',
                        }}
                        aria-pressed={aSel}
                      >
                        <span
                          aria-hidden
                          data-theme="paper"
                          data-accent={a.key}
                          className="w-7 h-7 rounded-full"
                          style={{ background: 'var(--ember-500)', boxShadow: 'var(--shadow-sm)' }}
                        />
                        <span className="label" style={{ fontSize: '9px' }}>{a.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// A miniature of the home + daily screens, scoped to a theme.
function ThemeMock({ theme, accent }) {
  return (
    <div
      data-theme={theme}
      data-accent={accent}
      className="grid grid-cols-2 gap-2 rounded-[var(--r-md)] p-2"
      style={{ background: 'var(--ink-900)' }}
    >
      {/* Home panel */}
      <div className="rounded-[10px] p-2.5" style={{ background: 'var(--ink-800)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="h-2 w-10 rounded-full" style={{ background: 'var(--paper-50)' }} />
        <div className="flex gap-1 mt-2">
          {[1, 1, 1, 0, 0].map((on, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: on ? 'var(--ember-500)' : 'transparent',
                           border: on ? 'none' : '1px solid var(--paper-400)' }} />
          ))}
        </div>
        <div className="mt-2 rounded-[7px] p-1.5"
             style={{ background: 'var(--ink-700)', boxShadow: 'inset 3px 0 0 var(--ember-500)' }}>
          <div className="h-1.5 w-9 rounded-full" style={{ background: 'var(--paper-200)' }} />
          <div className="h-1.5 w-6 rounded-full mt-1" style={{ background: 'var(--paper-400)' }} />
        </div>
      </div>

      {/* Daily panel */}
      <div className="rounded-[10px] p-2.5 flex flex-col items-center"
           style={{ background: 'var(--ink-800)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="w-8 h-8 rounded-full"
             style={{ background: 'radial-gradient(circle at 50% 45%, var(--ink-700), var(--ink-800))',
                      boxShadow: 'var(--shadow-sm)' }} />
        <div className="w-full h-2 rounded-full mt-2.5"
             style={{ background: 'linear-gradient(90deg, var(--ember-700), var(--sage-500))' }} />
        <div className="w-full h-2 rounded-full mt-1.5"
             style={{ background: 'linear-gradient(90deg, var(--sage-500), var(--ember-700))' }} />
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
