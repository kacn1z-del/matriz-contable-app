/**
 * api/consultar-estado.js
 *
 * Consulta ante Hacienda el estado actual de un comprobante ya enviado,
 * usando su "clave" de 50 dígitos. Sirve para dos casos:
 *  - Cuando firmar-factura.js devolvió "pendiente" (Hacienda no confirmó
 *    dentro de los 55s que dura esa función serverless).
 *  - Para revisar el estado de cualquier factura/tiquete/nota vieja.
 *
 * No firma ni envía nada nuevo — solo pregunta. Usa las mismas
 * credenciales de Hacienda del cliente (usuario/contraseña de API,
 * ambiente) que ya están guardadas en el Worker de Cloudflare, así que
 * necesita el mismo uid que usa "Firmar y Enviar (real)".
 *
 * Variables de entorno (las mismas que firmar-factura.js):
 * - CERTIFICADOS_WORKER_URL
 * - FIRMA_SERVICE_SECRET
 */

const CERTIFICADOS_WORKER_URL = (
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'
)
  .trim()
  .replace(/\/+$/, '')

// Lee la respuesta como texto y trata de convertirla a JSON, para que un
// error de red o de servidor no reviente con un mensaje confuso.
async function leerJsonSeguro(respuesta) {
  const texto = await respuesta.text()
  try {
    return JSON.parse(texto)
  } catch {
    return { error: 'Respuesta no válida (' + respuesta.status + '): ' + texto.slice(0, 200) }
  }
}

// Igual que en firmar-factura.js: decodifica entidades HTML/XML del
// mensaje de Hacienda para que se lea bien en una alerta.
function limpiarMensajeHacienda(texto) {
  if (!texto) return texto
  return String(texto)
    .replace(/&#13;/g, '\n')
    .replace(/&#10;/g, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

async function obtenerAccessToken(entorno, usuario, password) {
  const realm = entorno === 'production' ? 'rut' : 'rut-stag'
  const clientId = entorno === 'production' ? 'api-prod' : 'api-stag'

  const cuerpo = new URLSearchParams({
    grant_type: 'password',
    client_id: clientId,
    username: usuario,
    password: password,
  })

  const respuesta = await fetch(
    'https://idp.comprobanteselectronicos.go.cr/auth/realms/' + realm + '/protocol/openid-connect/token',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo.toString(),
    }
  )

  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '')
    throw new Error(
      'No se pudo autenticar con Hacienda (status ' + respuesta.status + '): ' + (texto || respuesta.statusText)
    )
  }

  const datos = await respuesta.json()
  return datos.access_token
}

// Igual que en firmar-factura.js: nunca se confía en un uid suelto en
// el body — se verifica el idToken contra Firebase y se usa el uid que
// esa verificación devuelva.
async function verificarIdToken(idToken) {
  if (!idToken || !process.env.FIREBASE_API_KEY) return null
  try {
    const respuesta = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + process.env.FIREBASE_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    )
    if (!respuesta.ok) return null
    const datos = await respuesta.json()
    const usuario = datos.users && datos.users[0]
    return usuario ? usuario.localId : null
  } catch {
    return null
  }
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
    res.status(405).json({ error: 'Método no permitido, usá POST.' })
    return
  }
  if (!process.env.FIRMA_SERVICE_SECRET) {
    res.status(500).json({ error: 'Falta configurar FIRMA_SERVICE_SECRET en Vercel.' })
    return
  }

  try {
    const { idToken, clave } = req.body || {}

    const uid = await verificarIdToken(idToken)
    if (!uid) {
      res.status(401).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión e intentá de nuevo.' })
      return
    }
    if (!clave) {
      res.status(400).json({ error: 'Falta la clave a consultar.' })
      return
    }
    const claveLimpia = String(clave).replace(/[^0-9]/g, '')
    if (claveLimpia.length !== 50) {
      res.status(400).json({ error: 'La clave debe tener 50 dígitos. Revisá que la copiaste completa.' })
      return
    }

    // ── 1. Pedirle al Worker las credenciales de Hacienda de este cliente ──
    const respCert = await fetch(CERTIFICADOS_WORKER_URL + '/obtener-certificado-firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid, secreto: process.env.FIRMA_SERVICE_SECRET }),
    })
    const datosCert = await leerJsonSeguro(respCert)
    if (!respCert.ok) {
      res.status(502).json({
        error: 'No se pudo obtener tus credenciales de Hacienda: ' + (datosCert.error || 'error desconocido'),
      })
      return
    }

    const { usuarioHacienda, passwordHacienda, ambiente } = datosCert
    if (!usuarioHacienda || !passwordHacienda) {
      res.status(400).json({
        error: 'Este usuario todavía no completó su configuración de Hacienda. Andá a "Factura Electrónica" en la app y completá esos datos primero.',
      })
      return
    }

    const entorno = ambiente === 'production' ? 'production' : 'sandbox'
    const baseUrl =
      entorno === 'production'
        ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
        : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    // ── 2. Autenticarse y consultar el estado del comprobante ──
    const token = await obtenerAccessToken(entorno, usuarioHacienda, passwordHacienda)

    const consultaRes = await fetch(baseUrl + '/recepcion/' + claveLimpia, {
      headers: { Authorization: 'Bearer ' + token },
    })

    if (consultaRes.status === 404) {
      res.status(200).json({
        ok: true,
        estado: 'no_encontrado',
        clave: claveLimpia,
        ambiente: entorno,
        mensaje: 'Hacienda no tiene ningún comprobante con esa clave en este ambiente (' + entorno + '). Revisá que la clave esté completa y que sea del ambiente correcto (sandbox vs producción).',
      })
      return
    }

    if (!consultaRes.ok) {
      const texto = await consultaRes.text().catch(() => '')
      throw new Error('Hacienda respondió con status ' + consultaRes.status + ': ' + texto)
    }

    const datosEstado = await consultaRes.json()
    const indEstado = datosEstado['ind-estado'] // 'recibido' | 'procesando' | 'aceptado' | 'rechazado' | 'error'

    let motivoRechazo = null
    if (indEstado === 'rechazado' && datosEstado['respuesta-xml']) {
      try {
        const xmlRespuesta = Buffer.from(datosEstado['respuesta-xml'], 'base64').toString('utf-8')
        const coincidencia = xmlRespuesta.match(/<DetalleMensaje>([^<]*)<\/DetalleMensaje>/i)
        if (coincidencia) motivoRechazo = limpiarMensajeHacienda(coincidencia[1])
      } catch {
        // Si no se puede leer el detalle, se deja sin motivo.
      }
    }

    res.status(200).json({
      ok: true,
      estado: indEstado || 'desconocido',
      motivoRechazo: motivoRechazo,
      clave: claveLimpia,
      ambiente: entorno,
    })
  } catch (err) {
    console.error('Error al consultar estado:', err)
    res.status(500).json({
      error: 'No se pudo consultar el estado: ' + (err && err.message ? err.message : String(err)),
    })
  }
}
