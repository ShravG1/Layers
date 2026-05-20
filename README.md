# Reflection

A calm, mobile-first PWA for daily mental wellbeing journaling. Speak or write a sentence each night, drag two soft sliders for mood and stress, and Reflection quietly composes weekly and monthly summaries from your own words.

## Features

- **Daily voice (or text) entry** — auto-transcribed via Web Speech API, both audio and transcript stored.
- **Feeling sliders** — mood (Awful → Excellent) and stress (Peaceful → Overwhelmed). The user only ever sees the word; a 1–10 value is stored for later charting.
- **Streak** — visible on home and inside every notification.
- **Missed-day backfill** — gentle banner the morning after; one 24-hour window to keep the streak alive.
- **Weekly / biweekly summaries** — AI narrative (Claude) that references your actual words, plus mood & stress line charts, highlights, and recurring themes.
- **Monthly reflection** — forced-engagement flow: scroll through every day of the month before unlocking the reflection prompt. Your own thoughts feed the AI narrative.
- **Local-first** — entries live in `localStorage`. JSON export available in settings. No cloud sync by default.
- **Offline-capable** — entry capture works offline; summaries require connectivity.

## Stack

- React 19 + Vite 8
- Tailwind CSS v4 (CSS-first animations)
- vite-plugin-pwa (Workbox) — installable on iPhone via *Add to Home Screen*
- Web Speech API (transcription), MediaRecorder (audio)
- Anthropic Claude API (user-supplied key in settings; local fallback summariser otherwise)

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## iOS PWA notes

iOS 16.4+ supports Web Push, but only after the app is installed via *Share → Add to Home Screen*. While the PWA is open, in-page reminders fire at the configured time directly from the client.
