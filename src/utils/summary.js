// Anthropic Claude summary client — runs entirely in the browser using a
// user-supplied API key from settings. If no key is configured, falls back to
// a local heuristic summariser so the feature still works offline.

import { labelForValue, MOOD_LABELS, STRESS_LABELS } from './labels.js';
import { formatDate } from './dates.js';

const CLAUDE_MODEL = 'claude-opus-4-5';
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

function buildPrompt(entries, kind, userReflection) {
  const lines = entries
    .filter(e => e)
    .map(e => {
      const mood = labelForValue(MOOD_LABELS, e.mood).label;
      const stress = labelForValue(STRESS_LABELS, e.stress).label;
      const transcript = (e.transcript || '').trim();
      return `- ${formatDate(e.date, { weekday: 'short' })} — mood: ${mood}, stress: ${stress}${transcript ? ` — "${transcript.slice(0, 600)}"` : ' — (no note)'}`;
    })
    .join('\n');

  const period = kind === 'weekly' ? 'past week' : kind === 'biweekly' ? 'past fortnight' : 'past month';

  const reflectionLine = userReflection
    ? `\n\nThe user's own reflection on the ${period}:\n"${userReflection.trim()}"\n`
    : '';

  return `You are a warm, perceptive companion summarising someone's journal in UK English.
Write a short narrative (3-5 short paragraphs) reflecting on their ${period}.
Reference specific things they said. Avoid generic platitudes and self-help clichés.
Be honest about hard days. Use gentle, grounded language. No emoji. No headings.
${reflectionLine}
Their daily entries:
${lines}`;
}

export async function generateSummary({ apiKey, entries, kind, userReflection }) {
  if (!apiKey) return localSummary(entries, kind, userReflection);

  try {
    const res = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        messages: [{ role: 'user', content: buildPrompt(entries, kind, userReflection) }],
      }),
    });
    if (!res.ok) throw new Error(`Claude API ${res.status}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    console.warn('Falling back to local summary:', err);
    return localSummary(entries, kind, userReflection);
  }
}

function localSummary(entries, kind, userReflection) {
  const period = kind === 'weekly' ? 'this week' : kind === 'biweekly' ? 'this fortnight' : 'this month';
  const filled = entries.filter(e => e);
  if (filled.length === 0) {
    return `Quiet ${period}. No entries to draw from yet — when you start logging, this space will fill with reflections that draw on your own words.`;
  }
  const avgMood = filled.reduce((s, e) => s + e.mood, 0) / filled.length;
  const avgStress = filled.reduce((s, e) => s + e.stress, 0) / filled.length;
  const moodLabel = labelForValue(MOOD_LABELS, Math.round(avgMood)).label;
  const stressLabel = labelForValue(STRESS_LABELS, Math.round(avgStress)).label;

  const best = filled.reduce((b, e) => (e.mood > b.mood ? e : b), filled[0]);
  const hardest = filled.reduce((b, e) => (e.mood < b.mood ? e : b), filled[0]);

  const bestSnippet = (best.transcript || '').trim().split('.').filter(Boolean)[0];
  const hardSnippet = (hardest.transcript || '').trim().split('.').filter(Boolean)[0];

  const refl = userReflection?.trim()
    ? `\n\nYou wrote in your reflection: "${userReflection.trim().slice(0, 240)}". That sits alongside everything above — your own framing matters as much as the data.`
    : '';

  return `Across ${period}, your mood mostly sat around ${moodLabel.toLowerCase()} and your stress tended toward ${stressLabel.toLowerCase()}. You logged ${filled.length} ${filled.length === 1 ? 'entry' : 'entries'}.

The lightest day was ${formatDate(best.date, { weekday: 'long' })}${bestSnippet ? ` — you said "${bestSnippet.trim()}"` : ''}.

The heaviest day was ${formatDate(hardest.date, { weekday: 'long' })}${hardSnippet ? ` — you said "${hardSnippet.trim()}"` : ''}.${refl}

No platitudes from me — only what your own words point to. Take a breath. The next ${period === 'this week' ? 'week' : 'stretch'} starts whenever you want it to.`;
}

export function findHighlights(entries) {
  const filled = entries.filter(e => e);
  if (filled.length === 0) return { best: null, hardest: null };
  const best = filled.reduce((b, e) => (e.mood > b.mood ? e : b), filled[0]);
  const hardest = filled.reduce((b, e) => (e.mood < b.mood ? e : b), filled[0]);
  return { best, hardest };
}

const STOPWORDS = new Set(('the a an and or but if of to in on for with at by from is was were be been being have has had do did doing not so just very really feel feeling felt today yesterday day it that this i me my am are will would could should about like up down out then them they we us our your you he she his her again still here there what when how why because as which who whose into over also some any all any one two three').split(' '));

export function recurringThemes(entries, limit = 4) {
  const counts = new Map();
  for (const e of entries) {
    if (!e?.transcript) continue;
    const words = e.transcript.toLowerCase().split(/[^a-z']+/).filter(w => w.length > 3 && !STOPWORDS.has(w));
    const seen = new Set();
    for (const w of words) {
      if (seen.has(w)) continue;
      seen.add(w);
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}
