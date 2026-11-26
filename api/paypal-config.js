/**
 * Datos públicos para dibujar el botón de suscripción de PayPal en la página
 * de pago (el Client ID y el ID del plan no son secretos).
 *
 * GET /api/paypal-config → { clientId, planId, entorno }
 */
import { ponerCors } from './_paypal.js'

export default function handler(req, res) {
  ponerCors(res)
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.status(200).json({
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    planId: process.env.PAYPAL_PLAN_ID || '',
    entorno: process.env.PAYPAL_ENTORNO === 'sandbox' ? 'sandbox' : 'live',
  })
}
