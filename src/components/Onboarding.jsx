import { useState } from 'react';
import { requestPermission } from '../utils/notifications.js';

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: 'A quiet place to reflect',
      body: 'Every evening, take a minute to speak or write about your day. Two soft sliders capture how you felt. That\'s it.',
    },
    {
      title: 'Your words stay yours',
      body: 'Entries live only on this device. You can export them as JSON whenever you want.',
    },
    {
      title: 'A gentle nudge each night',
      body: 'A reminder at 10pm (you can change the time). On iPhone, add Reflection to your Home Screen for the best experience.',
      cta: 'Allow notifications',
      action: async () => { await requestPermission(); },
    },
  ];
  const s = steps[step];

  return (
    <div className="min-h-dvh px-6 flex flex-col items-center justify-center text-center">
      <div key={step} className="anim-fade max-w-sm">
        <div className="anim-breathe inline-block mb-8 w-20 h-20 rounded-full"
             style={{ background: 'radial-gradient(circle, #ddd0b8 0%, #f5efe6 70%)' }} />
        <h1 className="text-3xl tracking-tight">{s.title}</h1>
        <p className="text-[16px] text-[var(--color-ink-700)] mt-4 leading-relaxed font-sans">{s.body}</p>
      </div>

      <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-3">
        <div className="flex gap-2 mb-2" aria-hidden>
          {steps.map((_, i) => (
            <span key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500
                          ${i === step ? 'bg-[var(--color-sage-700)] w-6' : 'bg-[var(--color-cream-300)]'}`} />
          ))}
        </div>
        <button
          onClick={async () => {
            if (s.action) await s.action();
            if (step === steps.length - 1) onDone();
            else setStep(step + 1);
          }}
          className="w-full max-w-sm py-4 rounded-2xl press bg-[var(--color-sage-700)] text-[#faf6ef] text-lg"
        >
          {s.cta || (step === steps.length - 1 ? 'Begin' : 'Next')}
        </button>
        {step < steps.length - 1 && (
          <button onClick={onDone} className="text-xs text-[var(--color-ink-500)] underline font-sans press">
            Skip introduction
          </button>
        )}
      </div>
    </div>
  );
}
