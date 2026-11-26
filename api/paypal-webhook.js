/**
 * Webhook de PayPal: cada cobro mensual renueva el Pro solo.
 *
 * En PayPal (developer.paypal.com → Apps & Credentials → tu app → Webhooks)
 * se agrega la URL https://matriz-contable-app.vercel.app/api/paypal-webhook
 * con estos eventos:
 *   BILLING.SUBSCRIPTION.ACTIVATED, BILLING.SUBSCRIPTION.RE-ACTIVATED,
 *   BILLING.SUBSCRIPTION.UPDATED, PAYMENT.SALE.COMPLETED,
 *   BILLING.SUBSCRIPTION.CANCELLED, BILLING.SUBSCRIPTION.SUSPENDED,
 *   BILLING.SUBSCRIPTION.EXPIRED
 * y el "Webhook ID" que da PayPal se pone en Vercel como PAYPAL_WEBHOOK_ID.
 *
 * Si cancelan o falla el cobro no se quita nada: el Pro dura hasta el final
 * de lo que ya pagaron y después se apaga solo.
 */
import { tokenPaypal, baseApiPaypal, procesarSuscripcion } from './_paypal.js'

// Vercel tiene que entregar el cuerpo tal cual llegó para revisar la firma
export const config = { api: { bodyParser: false } }

async function cuerpoCrudo(req) {
  const partes = []
  for await (const p of req) partes.push(typeof p === 'string' ? Buffer.from(p) : p)
  return Buffer.concat(partes).toString('utf8')
}

async function firmaValida(req, evento, token) {
  const h = (n) => req.headers[n] || ''
  const r = await fetch(baseApiPaypal() + '/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: h('paypal-auth-algo'),
      cert_url: h('paypal-cert-url'),
      transmission_id: h('paypal-transmission-id'),
      transmission_sig: h('paypal-transmission-sig'),
      transmission_time: h('paypal-transmission-time'),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: evento,
    }),
  })
  const d = await r.json().catch(() => ({}))
  return d.verification_status === 'SUCCESS'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Usá POST' })
    return
  }
  let evento
  try {
    evento = JSON.parse(await cuerpoCrudo(req))
  } catch (e) {
    res.status(400).json({ error: 'Cuerpo inválido' })
    return
  }
  try {
    const token = await tokenPaypal()
    if (!(await firmaValida(req, evento, token))) {
      res.status(401).json({ error: 'Firma inválida' })
      return
    }
    const recurso = evento.resource || {}
    // En los cobros, el ID de la suscripción viene en billing_agreement_id
    const idSus = /^PAYMENT\./.test(evento.event_type) ? recurso.billing_agreement_id : recurso.id
    if (!idSus) {
      res.status(200).json({ ok: true, ignorado: evento.event_type })
      return
    }
    const r = await procesarSuscripcion(idSus)
    res.status(200).json({ ok: true, evento: evento.event_type, resultado: r })
  } catch (err) {
    // 500 hace que PayPal reintente más tarde
    res.status(500).json({ error: String((err && err.message) || err) })
  }
}
