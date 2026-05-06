import { sendPush } from './webpush.js'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}

function vapidFromEnv(env) {
  return {
    publicKey:  env.VAPID_PUBLIC_KEY,
    privateJwk: JSON.parse(env.VAPID_PRIVATE_KEY),
    subject:    env.VAPID_SUBJECT,
  }
}

// HTTP routes
async function handleHttp(request, env) {
  const url = new URL(request.url)
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors })

  // Public VAPID key for the frontend to subscribe with
  if (url.pathname === '/vapid-public-key') {
    return json({ publicKey: env.VAPID_PUBLIC_KEY })
  }

  // Save a subscription
  // body: { subscription, lat, lon, city, localHour (0-23), tzOffsetMin }
  if (url.pathname === '/subscribe' && request.method === 'POST') {
    const body = await request.json()
    if (!body?.subscription?.endpoint) return json({ error: 'bad subscription' }, 400)
    const id = await hashEndpoint(body.subscription.endpoint)
    await env.SUBS.put(id, JSON.stringify({
      subscription: body.subscription,
      lat:          body.lat ?? null,
      lon:          body.lon ?? null,
      city:         body.city ?? null,
      localHour:    body.localHour ?? 7,
      tzOffsetMin:  body.tzOffsetMin ?? 0,
      createdAt:    Date.now(),
    }))
    return json({ ok: true, id })
  }

  // Remove a subscription
  if (url.pathname === '/unsubscribe' && request.method === 'POST') {
    const body = await request.json()
    const id = await hashEndpoint(body.endpoint)
    await env.SUBS.delete(id)
    return json({ ok: true })
  }

  // Test push to a single subscription
  if (url.pathname === '/test' && request.method === 'POST') {
    const body = await request.json()
    const id = await hashEndpoint(body.endpoint)
    const raw = await env.SUBS.get(id)
    if (!raw) return json({ error: 'not found' }, 404)
    const sub = JSON.parse(raw)
    const res = await sendOutfitPush(sub, vapidFromEnv(env))
    return json({ status: res.status })
  }

  return new Response('Layers push service', { headers: cors })
}

async function hashEndpoint(endpoint) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
}

// Cron: every hour, send to subs whose localHour matches their local time now.
async function handleCron(env) {
  const vapid = vapidFromEnv(env)
  const nowUtcHour = new Date().getUTCHours()

  let cursor
  do {
    const list = await env.SUBS.list({ cursor, limit: 1000 })
    for (const k of list.keys) {
      const raw = await env.SUBS.get(k.name)
      if (!raw) continue
      const sub = JSON.parse(raw)
      const localHour = ((nowUtcHour * 60 + sub.tzOffsetMin) / 60 + 24) % 24
      if (Math.floor(localHour) !== sub.localHour) continue

      try {
        const res = await sendOutfitPush(sub, vapid)
        if (res.status === 404 || res.status === 410) {
          await env.SUBS.delete(k.name) // gone
        }
      } catch (e) {
        console.log('push error', e?.message)
      }
    }
    cursor = list.list_complete ? null : list.cursor
  } while (cursor)
}

async function fetchWeather(lat, lon) {
  if (lat == null || lon == null) return null
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,precipitation_probability,weather_code&timezone=auto`
  try {
    const r = await fetch(u)
    if (!r.ok) return null
    const j = await r.json()
    return j.current
  } catch { return null }
}

function suggestionFromTemp(feels) {
  if (feels < 4)  return 'Big jacket + thick layers today.'
  if (feels < 10) return 'Hoodie + jacket weather.'
  if (feels < 15) return 'Hoodie or light jacket should do it.'
  if (feels < 20) return 'Long-sleeve, light layer.'
  if (feels < 25) return 'T-shirt and joggers.'
  return "Vest weather — it's warm out."
}

async function sendOutfitPush(sub, vapid) {
  const w = await fetchWeather(sub.lat, sub.lon)
  const feels = w?.apparent_temperature ?? w?.temperature_2m ?? null
  const rain = w?.precipitation_probability ?? 0

  const title = '👕 Layers'
  const body = feels != null
    ? `${Math.round(feels)}°C feels-like. ${suggestionFromTemp(feels)}${rain > 40 ? ' Bring a rain layer.' : ''}`
    : 'Open Layers for today\'s outfit.'

  const payload = JSON.stringify({ title, body, url: '/' })
  return sendPush(sub.subscription, payload, vapid)
}

export default {
  async fetch(request, env) {
    return handleHttp(request, env)
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleCron(env))
  },
}
