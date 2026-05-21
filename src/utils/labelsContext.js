import { createContext, useContext } from 'react';
import { VOCAB_SETS } from './labels.js';

// Provides the active vocabulary's mood/stress label arrays so components
// don't each need to know the user's setting.
export const LabelsContext = createContext({
  mood: VOCAB_SETS.classic.mood,
  stress: VOCAB_SETS.classic.stress,
});

export function useLabels() {
  return useContext(LabelsContext);
}
