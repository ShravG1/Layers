// Feeling labels. The user sees only the word; we store a 1-10 value.
// Five labels span 1-10: positions map to centres of equal bands.

export const MOOD_LABELS = ['Awful', 'Poor', 'Neutral', 'Good', 'Excellent'];
export const STRESS_LABELS = ['Peaceful', 'Calm', 'Balanced', 'Tense', 'Overwhelmed'];

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
