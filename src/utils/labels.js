// Feeling labels. The user sees only the word; we store a 1-10 value.
// Three vocabulary sets — the underlying 1-10 mapping stays constant so
// historical charts remain accurate when the user switches.

export const VOCAB_SETS = {
  classic: {
    label: 'Classic',
    mood:   ['Awful', 'Poor', 'Neutral', 'Good', 'Excellent'],
    stress: ['Peaceful', 'Calm', 'Balanced', 'Tense', 'Overwhelmed'],
  },
  plain: {
    label: 'Plain',
    mood:   ['Terrible', 'Low', 'Okay', 'Happy', 'Great'],
    stress: ['Relaxed', 'Settled', 'Steady', 'Stressed', 'Maxed Out'],
  },
  soft: {
    label: 'Soft',
    mood:   ['Heavy', 'Flat', 'Steady', 'Bright', 'Glowing'],
    stress: ['Still', 'Easy', 'Holding', 'Stretched', 'Frayed'],
  },
};

export function vocabFor(key) {
  return VOCAB_SETS[key] || VOCAB_SETS.classic;
}

// Backwards-compat exports (default to Classic). New code should prefer
// reading from the LabelsContext so labels respond to user preference.
export const MOOD_LABELS = VOCAB_SETS.classic.mood;
export const STRESS_LABELS = VOCAB_SETS.classic.stress;

// Map slider position 0..1 → 1..10 (continuous storage value).
export function positionToValue(pos) {
  const clamped = Math.max(0, Math.min(1, pos));
  return Math.round(1 + clamped * 9);
}

export function valueToPosition(value) {
  return (value - 1) / 9;
}

// Pick the label closest to the slider position.
export function labelForPosition(labels, pos) {
  const idx = Math.min(labels.length - 1, Math.max(0, Math.round(pos * (labels.length - 1))));
  return { label: labels[idx], index: idx };
}

export function labelForValue(labels, value) {
  return labelForPosition(labels, valueToPosition(value));
}
