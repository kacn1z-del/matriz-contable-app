/**
 * Ayudantes compartidos para cobrar el plan Pro de Matriz Contable CR con
 * suscripciones de PayPal. (Vercel no publica como función los archivos que
 * empiezan con guion bajo, así que este archivo solo lo usan los demás.)
 *
 * Variables en Vercel (Settings → Environment Variables):
 *   PAYPAL_CLIENT_ID          Client ID de la app REST de PayPal (el mismo de kenychinchilla.com)
 *   PAYPAL_SECRET             Secret de esa misma app
 *   PAYPAL_PLAN_ID            ID del plan de $21/mes (empieza con P-)
 *   PAYPAL_WEBHOOK_ID         ID del webhook (lo da PayPal al crearlo)
 *   PAYPAL_ENTORNO            "live" (cobros reales) o "sandbox" (pruebas)
 *   FIREBASE_SERVICE_ACCOUNT  El JSON completo de la cuenta de servicio de Firebase
 */
import crypto from 'crypto'

const PROYECTO_FIREBASE = 'matriz-contable-cr-app'

export function baseApiPaypal() {
  return process.env.PAYPAL_ENTORNO === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'
}

export function ponerCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export function leerCuerpo(req) {
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = {}
    }
  }
  return body || {}
}

// ── PayPal ─────────────────────────────────────────────────
export async function tokenPaypal() {
  const credencial = Buffer.from(process.env.PAYPAL_CLIENT_ID + ':' + process.env.PAYPAL_SECRET).toString('base64')
  const r = await fetch(baseApiPaypal() + '/v1/oauth2/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + credencial, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const d = await r.json()
  if (!r.ok || !d.access_token) throw new Error('PayPal no dio acceso: revisá PAYPAL_CLIENT_ID y PAYPAL_SECRET')
  return d.access_token
}

export async function leerSuscripcion(id, token) {
  if (!/^I-[A-Z0-9]+$/.test(String(id || ''))) throw new Error('ID de suscripción inválido')
  const r = await fetch(baseApiPaypal() + '/v1/billing/subscriptions/' + encodeURIComponent(id), {
    headers: { Authorization: 'Bearer ' + (token || (await tokenPaypal())), 'Content-Type': 'application/json' },
  })
  const d = await r.json()
  if (!r.ok) throw new Error('PayPal no encontró la suscripción')
  return d
}

// Hasta cuándo queda pagado el Pro según la suscripción (con 3 días de gracia
// para que un cobro que se atrasa un poco no le apague el Pro a nadie)
export function pagadoHastaDeSuscripcion(s) {
  const prox = s && s.billing_info && s.billing_info.next_billing_time
  const ultimo = s && s.billing_info && s.billing_info.last_payment && s.billing_info.last_payment.time
  let base = prox ? new Date(prox) : null
  if (!base && ultimo) {
    base = new Date(ultimo)
    base.setMonth(base.getMonth() + 1)
  }
  if (!base || isNaN(base)) return null
  return new Date(base.getTime() + 3 * 86400000)
}

// ── Firebase (con la cuenta de servicio; no pasa por las rules) ──
let tokenGoogleCache = { token: null, vence: 0 }

function base64url(x) {
  return Buffer.from(x).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function tokenGoogle() {
  if (tokenGoogleCache.token && Date.now() < tokenGoogleCache.vence) return tokenGoogleCache.token
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  if (!sa.client_email || !sa.private_key) throw new Error('Falta FIREBASE_SERVICE_ACCOUNT en Vercel')
  const ahora = Math.floor(Date.now() / 1000)
  const cabecera = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const datos = base64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: ahora,
    exp: ahora + 3600,
  }))
  const firma = crypto.createSign('RSA-SHA256').update(cabecera + '.' + datos).sign(sa.private_key.replace(/\\n/g, '\n'))
  const jwt = cabecera + '.' + datos + '.' + base64url(firma)
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=' + jwt,
  })
  const d = await r.json()
  if (!r.ok || !d.access_token) throw new Error('Google no aceptó la cuenta de servicio')
  tokenGoogleCache = { token: d.access_token, vence: Date.now() + 50 * 60000 }
  return d.access_token
}

// Guarda en planes/{uid} hasta cuándo está pagado (solo agranda, nunca acorta)
export async function activarPlanPro(uid, hasta, datosSuscripcion) {
  if (!/^[A-Za-z0-9]{10,64}$/.test(String(uid || ''))) throw new Error('La suscripción no trae una cuenta válida')
  const token = await tokenGoogle()
  const url = 'https://firestore.googleapis.com/v1/projects/' + PROYECTO_FIREBASE + '/databases/(default)/documents/planes/' + uid
  const actual = await fetch(url, { headers: { Authorization: 'Bearer ' + token } }).then((r) => (r.ok ? r.json() : null))
  const anterior = actual && actual.fields && actual.fields.pagadoHasta && actual.fields.pagadoHasta.timestampValue
  if (anterior && new Date(anterior) > hasta) hasta = new Date(anterior)
  const campos = {
    pagadoHasta: { timestampValue: hasta.toISOString() },
    paypalSuscripcion: { stringValue: datosSuscripcion.id || '' },
    paypalEstado: { stringValue: datosSuscripcion.status || '' },
    actualizadoPor: { stringValue: 'paypal' },
    actualizado: { timestampValue: new Date().toISOString() },
  }
  const mascara = Object.keys(campos).map((k) => 'updateMask.fieldPaths=' + k).join('&')
  const r = await fetch(url + '?' + mascara, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: campos }),
  })
  if (!r.ok) throw new Error('No se pudo guardar el plan en Firebase (' + r.status + ')')
  return hasta
}

// Revisa la suscripción en PayPal y, si está activa, le da el Pro a su cuenta
export async function procesarSuscripcion(id) {
  const token = await tokenPaypal()
  const s = await leerSuscripcion(id, token)
  if (process.env.PAYPAL_PLAN_ID && s.plan_id !== process.env.PAYPAL_PLAN_ID) throw new Error('Esa suscripción no es del plan Pro')
  if (s.status !== 'ACTIVE') return { activo: false, estado: s.status }
  const hasta = pagadoHastaDeSuscripcion(s)
  if (!hasta) return { activo: false, estado: 'SIN_FECHA' }
  const final = await activarPlanPro(s.custom_id, hasta, s)
  return { activo: true, hasta: final.toISOString(), uid: s.custom_id }
}
