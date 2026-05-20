import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      kicker: 'Welcome',
      title: 'A late room of your own',
      body: 'Each night, take a minute to speak or write about your day. Two soft sliders capture how you felt. That is all.',
    },
    {
      kicker: 'Private by default',
      title: 'Your words stay yours',
      body: 'Entries live only on this device. You can export them as JSON whenever you want.',
    },
    {
      kicker: 'Tonight at ten',
      title: 'A gentle nudge each night',
      body: 'A reminder fires at 10pm — you can change this. On iPhone, add Reflection to your Home Screen for the best experience.',
      cta: 'Allow notifications',
      action: async () => { await requestPermission(); },
    },
  ];

  const s = steps[step];

  return (
    <main className="min-h-dvh px-6 flex flex-col items-start justify-center">
      <div key={step} className="anim-lift max-w-sm">
        <div className="relative w-24 h-24 mb-10">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full anim-breathe-glow"
            style={{ background: 'radial-gradient(circle, rgba(232,137,74,0.55) 0%, rgba(232,137,74,0) 70%)' }}
          />
          <span
            aria-hidden
            className="absolute inset-2 rounded-full anim-breathe"
            style={{ background: 'radial-gradient(circle at 50% 45%, #1F2731 0%, #161B23 80%)', boxShadow: 'var(--shadow-md)' }}
          />
        </div>

        <div className="label">{s.kicker}</div>
        <h1 className="display-lg mt-3 text-[var(--paper-50)]">{s.title}</h1>
        <p className="body-lg text-[var(--paper-200)] mt-5 leading-relaxed">{s.body}</p>
      </div>

      <div className="absolute left-6 right-6 bottom-10 flex flex-col items-stretch gap-4">
        <div className="flex gap-2 self-start" aria-hidden>
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
        <button
          onClick={async () => {
            if (s.action) await s.action();
            if (step === steps.length - 1) onDone(); else setStep(step + 1);
          }}
          className="w-full h-[56px] rounded-full press body-lg"
          style={{
            background: 'linear-gradient(180deg, #F4B98A 0%, #E8894A 60%, #B45F2A 100%)',
            color: '#1A0F08',
            boxShadow: 'var(--shadow-lg), var(--glow-ember)',
          }}
        >
          {s.cta || (step === steps.length - 1 ? 'Begin' : 'Continue')}
        </button>
        {step < steps.length - 1 && (
          <button onClick={onDone} className="label draw-underline text-[var(--paper-400)] press self-center">
            Skip introduction
          </button>
        )}
      </div>
    </main>
  );
}
