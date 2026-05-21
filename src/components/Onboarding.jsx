import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';
import VocabularyPicker from './VocabularyPicker.jsx';
import ThemePicker from './ThemePicker.jsx';
import SwipePager from './SwipePager.jsx';
import Dots from './Dots.jsx';

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
      body: 'A reminder fires at 10pm — change it any time. On iPhone, add Reflection to your Home Screen for the best experience.',
      cta: 'Allow notifications',
      action: async () => { await requestPermission(); },
    },
    {
      type: 'vocab',
      kicker: 'Choose your words',
      title: 'How should your feelings read?',
      body: 'Pick the wording for the Mood and Stress bars. Change it later — your history stays accurate.',
    },
    {
      type: 'theme',
      kicker: 'Pick your feel',
      title: 'Choose the room you write in',
      body: 'Colour, type and motion together. Change it any time in Settings.',
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  const goTo = (i) => setStep(Math.max(0, Math.min(steps.length - 1, i)));
  const advance = async () => {
    if (s.action) await s.action();
    if (isLast) onDone(); else goTo(step + 1);
  };

  const panels = steps.map((st) => {
    if (st.type === 'info') {
      return (
        <div className="h-full flex flex-col items-start justify-center px-6">
          <div className="max-w-sm">
            <div className="relative w-24 h-24 mb-9">
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
            <div className="label">{st.kicker}</div>
            <h1 className="display-lg mt-3 text-[var(--paper-50)]">{st.title}</h1>
            <p className="body-lg text-[var(--paper-200)] mt-5">{st.body}</p>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col px-6 pt-4">
        <div className="shrink-0">
          <div className="label">{st.kicker}</div>
          <h1 className="display-md mt-2 text-[var(--paper-50)]">{st.title}</h1>
          <p className="body-sm text-[var(--paper-200)] mt-2">{st.body}</p>
        </div>
        <div className="mt-5 flex-1 min-h-0">
          {st.type === 'vocab' ? (
            <VocabularyPicker
              value={settings.vocabulary}
              onChange={(v) => onChange({ vocabulary: v })}
              hapticsEnabled={settings.hapticsEnabled}
            />
          ) : (
            <ThemePicker
              value={settings.theme}
              accent={settings.paperAccent}
              onChange={({ theme, accent }) => onChange({ theme, paperAccent: accent })}
              hapticsEnabled={settings.hapticsEnabled}
              compact
            />
          )}
        </div>
      </div>
    );
  });

  return (
    <main className="h-dvh flex flex-col overflow-hidden">
      {/* Top bar — back button */}
      <div className="shrink-0 h-12 flex items-center px-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            aria-label="Back"
            className="press flex items-center gap-1.5 label text-[var(--paper-200)] py-2 pr-2"
          >
            <BackArrow /> Back
          </button>
        ) : <span />}
      </div>

      {/* Swipeable content */}
      <div className="flex-1 min-h-0">
        <SwipePager index={step} count={steps.length} onIndexChange={goTo}>
          {panels}
        </SwipePager>
      </div>

      {/* Bottom chrome */}
      <div
        className="shrink-0 px-6 pt-4 flex flex-col gap-3"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
      >
        <div className="flex items-center justify-between">
          <Dots count={steps.length} index={step} onJump={goTo} />
          <span className="label">Swipe or tap</span>
        </div>
        <button
          onClick={advance}
          className="w-full h-[54px] rounded-full press body-lg"
          style={{
            background: 'var(--grad-warm)',
            color: 'var(--on-warm)',
            boxShadow: 'var(--shadow-lg), var(--glow-ember)',
          }}
        >
          {s.cta || (isLast ? 'Begin' : 'Continue')}
        </button>
        {step < 2 && (
          <button onClick={() => goTo(3)} className="label draw-underline text-[var(--paper-400)] press self-center">
            Skip introduction
          </button>
        )}
      </div>
    </main>
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
