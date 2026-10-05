/**
 * api/revisar-pendientes.js
 *
 * Revisa contra Hacienda todas las facturas que quedaron "pendiente"
 * (Hacienda no confirmó dentro de los 55s que dura firmar-factura.js) y,
 * si ya se resolvieron, actualiza el historial y manda una notificación
 * push. Pensado para que lo dispare un job programado — NO un usuario
 * ni la app — por eso se protege con un secreto distinto (CRON_SECRET),
 * no con idToken.
 *
 * ¿Por qué no un Cron Job de Vercel? El plan gratis (Hobby) de Vercel
 * solo permite correr cron jobs UNA VEZ AL DÍA — inútil para algo que
 * debería revisarse cada 10-15 minutos. En su lugar, esto lo dispara un
 * GitHub Action programado (gratis, sin ese límite) que le pega a esta
 * URL con el secreto correcto.
 *
 * Variables de entorno: las mismas que firmar-factura.js
 * (CERTIFICADOS_WORKER_URL, FIRMA_SERVICE_SECRET, FIREBASE_API_KEY),
 * más una nueva: CRON_SECRET (cualquier string largo al azar, solo lo
 * conocen Vercel y el GitHub Action que dispara esto).
 */

const CERTIFICADOS_WORKER_URL = (
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'
)
  .trim()
  .replace(/\/+$/, '')

async function leerJsonSeguro(respuesta) {
  const texto = await respuesta.text()
  try {
    return JSON.parse(texto)
  } catch {
    return { error: 'Respuesta no válida (' + respuesta.status + '): ' + texto.slice(0, 200) }
  }
}

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
  const cuerpo = new URLSearchParams({ grant_type: 'password', client_id: clientId, username: usuario, password })
  const respuesta = await fetch(
    'https://idp.comprobanteselectronicos.go.cr/auth/realms/' + realm + '/protocol/openid-connect/token',
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: cuerpo.toString() }
  )
  if (!respuesta.ok) throw new Error('No se pudo autenticar con Hacienda (status ' + respuesta.status + ')')
  const datos = await respuesta.json()
  return datos.access_token
}

// Multi-emisor: cédula del emisor dentro de una clave de 50 dígitos (posiciones 10–21, con ceros a la izquierda).
// El Worker compara ignorando ceros a la izquierda y verifica que esa cédula pertenezca al negocio del usuario.
function cedulaDeClave(clave) {
  const d = String(clave || '').replace(/[^0-9]/g, '')
  return d.length === 50 ? d.substr(9, 12) : ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido.' })
    return
  }
  if (!process.env.CRON_SECRET) {
    res.status(500).json({ error: 'Falta configurar CRON_SECRET en Vercel.' })
    return
  }
  // El secreto viaja en un header (más difícil que quede en logs de URL
  // que en un query param), pero se acepta también por query por si el
  // disparador que uses no permite headers fácil.
  const secretoRecibido = req.headers['x-cron-secret'] || req.query.secreto
  if (secretoRecibido !== process.env.CRON_SECRET) {
    res.status(403).json({ error: 'No autorizado.' })
    return
  }

  const resultado = { revisadas: 0, resueltas: 0, errores: [] }

  try {
    const respPendientes = await fetch(CERTIFICADOS_WORKER_URL + '/listar-pendientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secreto: process.env.FIRMA_SERVICE_SECRET }),
    })
    const datosPendientes = await leerJsonSeguro(respPendientes)
    if (!respPendientes.ok) {
      res.status(502).json({ error: 'No se pudo listar pendientes: ' + (datosPendientes.error || 'error desconocido') })
      return
    }

    const pendientes = datosPendientes.pendientes || []

    for (const item of pendientes) {
      resultado.revisadas++
      try {
        // 1. Certificado/credenciales del negocio dueño de esta factura.
        const respCert = await fetch(CERTIFICADOS_WORKER_URL + '/obtener-certificado-firma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: item.negocioId, secreto: process.env.FIRMA_SERVICE_SECRET, cedulaEmisor: cedulaDeClave(item.clave) || undefined }),
        })
        const datosCert = await leerJsonSeguro(respCert)
        if (!respCert.ok || !datosCert.usuarioHacienda) {
          resultado.errores.push(item.clave + ': sin certificado disponible')
          continue
        }

        const entorno = datosCert.ambiente === 'production' ? 'production' : 'sandbox'
        const baseUrl = entorno === 'production'
          ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
          : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

        // 2. Un solo chequeo de estado (no hace falta el loop de 55s de
        // firmar-factura.js — si sigue pendiente, el próximo disparo del
        // job lo vuelve a intentar).
        const token = await obtenerAccessToken(entorno, datosCert.usuarioHacienda, datosCert.passwordHacienda)
        const consultaRes = await fetch(baseUrl + '/recepcion/' + item.clave, {
          headers: { Authorization: 'Bearer ' + token },
        })
        if (!consultaRes.ok) {
          resultado.errores.push(item.clave + ': Hacienda respondió ' + consultaRes.status)
          continue
        }
        const estadoHacienda = await consultaRes.json()
        const indEstado = estadoHacienda['ind-estado']

        if (indEstado !== 'aceptado' && indEstado !== 'rechazado') {
          continue // Sigue pendiente — se revisa de nuevo en el próximo disparo.
        }

        let motivoRechazo = null
        if (indEstado === 'rechazado' && estadoHacienda['respuesta-xml']) {
          try {
            const xmlRespuesta = Buffer.from(estadoHacienda['respuesta-xml'], 'base64').toString('utf-8')
            const coincidencia = xmlRespuesta.match(/<DetalleMensaje>([^<]*)<\/DetalleMensaje>/i)
            if (coincidencia) motivoRechazo = limpiarMensajeHacienda(coincidencia[1])
          } catch { /* se deja sin motivo detallado */ }
        }

        // 3. Actualizar el historial y notificar a los dispositivos del negocio.
        await fetch(CERTIFICADOS_WORKER_URL + '/actualizar-historial-y-notificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secreto: process.env.FIRMA_SERVICE_SECRET,
            clave: item.clave,
            negocioId: item.negocioId,
            estado: indEstado,
            motivoRechazo,
          }),
        })
        resultado.resueltas++
      } catch (err) {
        resultado.errores.push(item.clave + ': ' + err.message)
      }
    }

    res.status(200).json(resultado)
  } catch (err) {
    console.error('Error en revisar-pendientes:', err)
    res.status(500).json({ error: 'No se pudo completar la revisión: ' + (err && err.message ? err.message : String(err)) })
  }
}
