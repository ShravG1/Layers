import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';
import VocabularyPicker from './VocabularyPicker.jsx';
import ThemePicker from './ThemePicker.jsx';

export default function Onboarding({ settings, onChange, onDone }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      type: 'info',
      kicker: 'Welcome',
      title: 'A late room of your own',
      body: 'Each night, take a minute to speak or write about your day. Two soft sliders capture how you felt. That is all.',
    },
    {
      type: 'info',
      kicker: 'Private by default',
      title: 'Your words stay yours',
      body: 'Entries live only on this device. You can export them as JSON whenever you want.',
    },
    {
      type: 'info',
      kicker: 'Tonight at ten',
      title: 'A gentle nudge each night',
      body: 'A reminder fires at 10pm — you can change this. On iPhone, add Reflection to your Home Screen for the best experience.',
      cta: 'Allow notifications',
      action: async () => { await requestPermission(); },
    },
    {
      type: 'vocab',
      kicker: 'Choose your words',
      title: 'How should your feelings read?',
      body: 'Pick the wording for the Mood and Stress bars. You can change this later — your history stays accurate.',
    },
    {
      type: 'theme',
      kicker: 'Pick your feel',
      title: 'Choose the room you write in',
      body: 'A complete look — colour, type, and motion. Change it any time in Settings.',
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;
  const advance = async () => {
    if (s.action) await s.action();
    if (isLast) onDone(); else setStep(step + 1);
  };

  const Dots = (
    <div className="flex gap-2" aria-hidden>
      {steps.map((_, i) => (
        <span key={i}
          className="h-1.5 rounded-full"
          style={{
            width: i === step ? 28 : 8,
            background: i === step ? 'var(--ember-500)' : 'var(--ink-600)',
            transition: 'width 380ms var(--ease-out-soft), background 380ms var(--ease-out-soft)',
          }} />
      ))}
    </div>
  );

  const CTA = (
    <button
      onClick={advance}
      className="w-full h-[56px] rounded-full press body-lg"
      style={{
        background: 'var(--grad-warm)',
        color: 'var(--on-warm)',
        boxShadow: 'var(--shadow-lg), var(--glow-ember)',
      }}
    >
      {s.cta || (isLast ? 'Begin' : 'Continue')}
    </button>
  );

  // ---- Picker steps: scrollable, header at top, CTA anchored ----
  if (s.type === 'vocab' || s.type === 'theme') {
    return (
      <main className="min-h-dvh flex flex-col px-6 pt-10 pb-32">
        <div key={step} className="anim-lift">
          <div className="label">{s.kicker}</div>
          <h1 className="display-lg mt-2 text-[var(--paper-50)]">{s.title}</h1>
          <p className="body-md text-[var(--paper-200)] mt-3">{s.body}</p>
        </div>

        <div className="mt-7 anim-lift delay-100">
          {s.type === 'vocab' ? (
            <VocabularyPicker
              value={settings.vocabulary}
              onChange={(v) => onChange({ vocabulary: v })}
            />
          ) : (
            <ThemePicker
              value={settings.theme}
              accent={settings.paperAccent}
              onChange={({ theme, accent }) => onChange({ theme, paperAccent: accent })}
            />
          )}
        </div>

        <div
          className="fixed left-0 right-0 bottom-0 px-6 pt-6 flex flex-col gap-4"
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
            background: 'linear-gradient(180deg, transparent 0%, var(--ink-900) 38%)',
          }}
        >
          {Dots}
          {CTA}
        </div>
      </main>
    );
  }

  // ---- Info steps: centred ----
  return (
    <main className="min-h-dvh px-6 flex flex-col items-start justify-center">
      <div key={step} className="anim-lift max-w-sm">
        <div className="relative w-24 h-24 mb-10">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full anim-breathe-glow"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--ember-500) 55%, transparent) 0%, transparent 70%)' }}
          />
          <span
            aria-hidden
            className="absolute inset-2 rounded-full anim-breathe"
            style={{ background: 'radial-gradient(circle at 50% 45%, var(--ink-700) 0%, var(--ink-800) 80%)', boxShadow: 'var(--shadow-md)' }}
          />
        </div>

        <div className="label">{s.kicker}</div>
        <h1 className="display-lg mt-3 text-[var(--paper-50)]">{s.title}</h1>
        <p className="body-lg text-[var(--paper-200)] mt-5 leading-relaxed">{s.body}</p>
      </div>

      <div className="absolute left-6 right-6 bottom-10 flex flex-col items-stretch gap-4">
        {Dots}
        {CTA}
        {step < 2 && (
          <button onClick={() => setStep(3)} className="label draw-underline text-[var(--paper-400)] press self-center">
            Skip introduction
          </button>
        )}
      </div>
    </main>
  );
}
