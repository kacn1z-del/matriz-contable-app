/**
 * Activa el plan Pro apenas la persona aprueba la suscripción en PayPal.
 *
 * POST /api/paypal-suscripcion  { "subscriptionID": "I-XXXXXXXX" }
 *
 * No confía en lo que manda el navegador: le pregunta a PayPal por esa
 * suscripción, revisa que sea del plan Pro y que esté activa, y la cuenta
 * que se activa es la que va dentro de la suscripción (custom_id = uid).
 */
import { ponerCors, leerCuerpo, procesarSuscripcion } from './_paypal.js'

export default async function handler(req, res) {
  ponerCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Usá POST' })
    return
  }
  try {
    const { subscriptionID } = leerCuerpo(req)
    // Justo después de aprobar, PayPal puede tardar unos segundos en marcarla activa
    let r = await procesarSuscripcion(subscriptionID)
    for (let i = 0; i < 3 && !r.activo && r.estado === 'APPROVED'; i++) {
      await new Promise((ok) => setTimeout(ok, 2500))
      r = await procesarSuscripcion(subscriptionID)
    }
    res.status(200).json(r)
  } catch (err) {
    res.status(400).json({ error: String((err && err.message) || err) })
  }
}
