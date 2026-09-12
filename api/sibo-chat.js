/**
 * Chat de Sibö conectado a Claude Haiku 4.5 (API de Anthropic).
 * La API key vive solo acá en el servidor (nunca en la app), leída de
 * la variable de entorno ANTHROPIC_API_KEY que configurás en el
 * dashboard de Vercel (Project → Settings → Environment Variables).
 *
 * Body esperado (POST):
 *   { "message": "texto del usuario", "history": [{user:true/false, texto:"..."}] }
 * Devuelve:
 *   { "text": "respuesta de Sibö" }
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido, usá POST.' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Falta configurar ANTHROPIC_API_KEY en Vercel.' })
    return
  }

  const { message, history } = req.body || {}
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Falta "message" en el body.' })
    return
  }

  // Convierte el historial guardado en la hoja al formato que espera la API
  const pastMessages = (Array.isArray(history) ? history : [])
    .slice(-10)
    .map((h) => ({ role: h.user ? 'user' : 'assistant', content: String(h.texto || '') }))
  pastMessages.push({ role: 'user', content: message })

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system:
          'Sos Sibö, el asistente contable de la app Matriz Contable CR (Costa Rica). ' +
          'Respondé siempre en español costarricense, de forma breve, clara y práctica. ' +
          'Tu especialidad es contabilidad, IVA (13%), CCSS, planillas, facturación electrónica ' +
          '4.3, aguinaldo, cesantía, preaviso, renta del trabajo, y el uso de las fórmulas y ' +
          'plantillas de esta hoja de cálculo. Si te preguntan algo totalmente fuera de ese tema, ' +
          'respondé brevemente igual pero redirigí con amabilidad hacia temas contables.',
        messages: pastMessages,
      }),
    })
    const data = await apiRes.json()
    if (data.error) {
      res.status(502).json({ error: data.error.message || 'Error de la API de Anthropic.' })
      return
    }
    const text = (data.content || []).map((b) => b.text || '').join('')
    res.status(200).json({ text: text || '(sin respuesta)' })
  } catch (err) {
    res.status(502).json({ error: 'No se pudo contactar a la API de Anthropic.', detail: String(err) })
  }
}
