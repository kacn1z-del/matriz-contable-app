/**
 * Avisos de cambios (como las "reglas de notificación" de Google Sheets).
 *
 * La hoja llama a esta función cuando alguien edita una matriz compartida.
 * Recibe los tokens de Expo de las personas que pidieron aviso para esa
 * matriz y les manda una notificación push por medio del servicio de Expo.
 *
 * POST /api/notificar-cambio
 *   { "tokens": ["ExponentPushToken[…]"], "titulo": "✏️ Ventas", "cuerpo": "Keny hizo cambios", "datos": { "matrizId": "…" } }
 */

const MAX_TOKENS = 50

function limpiarTexto(t, max) {
  return String(t == null ? '' : t).replace(/[\u0000-\u001f]/g, ' ').slice(0, max)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Usá POST' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = {}
    }
  }
  body = body || {}

  // Solo tokens de Expo con el formato correcto, sin repetidos
  const tokens = Array.isArray(body.tokens)
    ? body.tokens
        .filter((t) => typeof t === 'string' && /^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$/.test(t))
        .filter((t, i, a) => a.indexOf(t) === i)
        .slice(0, MAX_TOKENS)
    : []
  if (!tokens.length) {
    res.status(400).json({ error: 'No hay tokens válidos' })
    return
  }

  const titulo = limpiarTexto(body.titulo || 'Matriz Contable CR', 80)
  const cuerpo = limpiarTexto(body.cuerpo || 'Hubo cambios en una matriz compartida', 180)
  const matrizId = body.datos && typeof body.datos.matrizId === 'string' ? body.datos.matrizId.slice(0, 64) : ''

  const mensajes = tokens.map((to) => ({
    to,
    title: titulo,
    body: cuerpo,
    sound: 'default',
    data: { tipo: 'cambioMatriz', matrizId },
  }))

  try {
    const r = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mensajes),
    })
    const respuesta = await r.json().catch(() => ({}))
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, enviados: tokens.length, expo: respuesta })
  } catch (err) {
    res.status(500).json({ error: String((err && err.message) || err) })
  }
}
