/**
 * Función puente para SERVICIOWEB() / WEBSERVICE() dentro de la hoja de
 * cálculo. Corre del lado del servidor para evitar los bloqueos de CORS
 * que impiden hacer fetch() directo a otros dominios desde el WebView.
 *
 * Uso desde la hoja:
 *   =SERVICIOWEB("https://ejemplo.com/datos.json")
 *
 * La app llama a este endpoint pasando la URL como query param `url`,
 * y esta función la descarga y devuelve el contenido como texto plano.
 */

const functions = require('firebase-functions')

// Lista de dominios permitidos, por seguridad (evita que alguien use tu
// función como proxy abierto hacia cualquier sitio). Agregá los que
// necesites acá.
const ALLOWED_HOSTS = [
  'api.hacienda.go.cr',
  'www.bccr.fi.cr',
  'gee.bccr.fi.cr',
  'api.exchangerate-api.com',
  'restcountries.com',
]

function isAllowed(urlStr) {
  try {
    const u = new URL(urlStr)
    if (u.protocol !== 'https:') return false
    return ALLOWED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))
  } catch (e) {
    return false
  }
}

exports.webproxy = functions
  .region('us-central1')
  .runWith({ timeoutSeconds: 15, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    // CORS abierto para que el WebView de la app pueda llamarlo
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'GET')
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    const targetUrl = req.query.url
    if (!targetUrl || typeof targetUrl !== 'string') {
      res.status(400).json({ error: 'Falta el parámetro ?url=' })
      return
    }

    if (!isAllowed(targetUrl)) {
      res.status(403).json({
        error: 'Dominio no permitido. Agregalo a ALLOWED_HOSTS en functions/index.js.',
        host: (() => { try { return new URL(targetUrl).hostname } catch (e) { return null } })(),
      })
      return
    }

    try {
      const response = await fetch(targetUrl, {
        headers: { 'User-Agent': 'MatrizContableCR/1.0' },
      })
      const text = await response.text()
      res.set('Content-Type', 'text/plain; charset=utf-8')
      res.status(response.status).send(text)
    } catch (err) {
      res.status(502).json({ error: 'No se pudo obtener el recurso.', detail: String(err) })
    }
  })
