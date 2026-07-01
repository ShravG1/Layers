// Minimal Web Push (RFC 8030 + VAPID + aes128gcm) for Cloudflare Workers.
// Uses Web Crypto API only.

function b64uToBytes(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  while (s.length % 4) s += '='
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}
function bytesToB64u(bytes) {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function concat(...arrs) {
  let len = 0
  for (const a of arrs) len += a.length
  const out = new Uint8Array(len)
  let o = 0
  for (const a of arrs) { out.set(a, o); o += a.length }
  return out
}
function utf8(s) { return new TextEncoder().encode(s) }

// Sign VAPID JWT (ES256) with a JWK private key.
async function signVapidJwt({ aud, sub }, jwkPrivate) {
  const header = { alg: 'ES256', typ: 'JWT' }
  const exp = Math.floor(Date.now() / 1000) + 12 * 3600
  const payload = { aud, exp, sub }
  const signingInput =
    bytesToB64u(utf8(JSON.stringify(header))) + '.' +
    bytesToB64u(utf8(JSON.stringify(payload)))

  const key = await crypto.subtle.importKey(
    'jwk',
    jwkPrivate,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, utf8(signingInput))
  )
  return signingInput + '.' + bytesToB64u(sig)
}

// HKDF (RFC 5869) using SHA-256 — used by aes128gcm content encoding.
async function hkdf(salt, ikm, info, length) {
  const baseKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info },
    baseKey,
    length * 8
  )
  return new Uint8Array(bits)
}

// aes128gcm content encoding (RFC 8188) for a single record.
async function encryptAes128Gcm(payload, recipientPubBytes, authSecret) {
  // Generate ephemeral ECDH key pair
  const ephem = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const ephemPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', ephem.publicKey))

  // Import recipient public key (uncompressed P-256, 65 bytes)
  const recipientKey = await crypto.subtle.importKey(
    'raw',
    recipientPubBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  )
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: recipientKey }, ephem.privateKey, 256)
  )

  // PRK_key = HKDF(authSecret, sharedSecret, "WebPush: info\0" || ua_public || as_public, 32)
  const keyInfo = concat(
    utf8('WebPush: info\0'),
    recipientPubBytes,
    ephemPubRaw,
  )
  const ikm = await hkdf(authSecret, sharedSecret, keyInfo, 32)

  // Salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // CEK = HKDF(salt, ikm, "Content-Encoding: aes128gcm\0", 16)
  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16)
  // Nonce = HKDF(salt, ikm, "Content-Encoding: nonce\0", 12)
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12)

  // Plaintext is payload || 0x02 (last record marker)
  const plaintext = concat(payload, new Uint8Array([0x02]))
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext)
  )

  // Header = salt(16) || rs(4 BE = 4096) || idlen(1) || keyid(idlen)
  // For aes128gcm, "keyid" is the as_public (65 bytes uncompressed).
  const header = new Uint8Array(16 + 4 + 1 + ephemPubRaw.length)
  header.set(salt, 0)
  // rs = 4096
  header[16] = 0x00; header[17] = 0x00; header[18] = 0x10; header[19] = 0x00
  header[20] = ephemPubRaw.length
  header.set(ephemPubRaw, 21)

  return concat(header, ciphertext)
}

// Send a Web Push message to a subscription.
//   subscription: { endpoint, keys: { p256dh, auth } }   (p256dh and auth are base64url)
//   payload:      string
//   vapid:        { publicKey: 'b64u', privateJwk: <JWK>, subject: 'mailto:you@example.com' }
export async function sendPush(subscription, payload, vapid, options = {}) {
  const url = new URL(subscription.endpoint)
  const aud = `${url.protocol}//${url.host}`

  const jwt = await signVapidJwt({ aud, sub: vapid.subject }, vapid.privateJwk)

  const recipientPub = b64uToBytes(subscription.keys.p256dh)
  const authSecret = b64uToBytes(subscription.keys.auth)
  const body = await encryptAes128Gcm(utf8(payload), recipientPub, authSecret)

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type':     'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL':              String(options.ttl ?? 60 * 60 * 12),
      'Urgency':          options.urgency ?? 'normal',
      'Authorization':    `vapid t=${jwt}, k=${vapid.publicKey}`,
    },
    body,
  })
  return res
}
