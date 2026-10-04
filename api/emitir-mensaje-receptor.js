/**
 * api/emitir-mensaje-receptor.js
 *
 * Envía un "Mensaje Receptor" REAL a Hacienda: la confirmación que el
 * RECEPTOR de una factura (o tiquete) le manda a Hacienda para decir si
 * la acepta, la acepta parcialmente, o la rechaza. Es el mensaje que le
 * toca a quien RECIBE un comprobante — no al que lo emitió — así que es
 * casi gemelo de emitir-nota-credito.js / emitir-nota-debito.js en todo
 * lo de certificado, firma y envío, pero con varias diferencias clave:
 *
 *   1. No usa buildClave() para generar una clave nueva de 50 dígitos:
 *      el "clave" del Mensaje Receptor ES la clave del documento
 *      original que se está confirmando (lo manda quien recibió esa
 *      factura, a mano, porque esta app no tiene un buzón de "facturas
 *      recibidas" — ver limitación más abajo).
 *   2. Usa buildMensajeReceptorXml() en vez de los builders de
 *      documentos normales — su estructura de XML es distinta (no
 *      tiene líneas de detalle ni resumen de factura).
 *   3. El código "mensaje" es "1" (acepta todo), "2" (acepta parcial)
 *      o "3" (rechaza) — y el consecutivo propio del mensaje usa el
 *      código de tipo de documento correspondiente: "05"/"06"/"07".
 *
 * LIMITACIÓN HONESTA: esta app no consulta ni guarda un listado de
 * "comprobantes recibidos" (eso requeriría una integración aparte con
 * el padrón de comprobantes de Hacienda). Por eso el usuario tiene que
 * tipear a mano los datos del comprobante que recibió (clave, cédula
 * de quien le facturó, fecha, monto) — los mismos datos que ya trae
 * cualquier factura que le llega por correo o Hacienda le muestra en
 * su propio portal (ATV).
 *
 * Variables de entorno: las mismas que firmar-factura.js
 * (CERTIFICADOS_WORKER_URL, FIRMA_SERVICE_SECRET, FIREBASE_API_KEY).
 */

import {
  buildMensajeReceptorXml,
  signAndEncode,
} from '@dojocoding/hacienda-sdk'

const CERTIFICADOS_WORKER_URL = (
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'
)
  .trim()
  .replace(/\/+$/, '')

const SUCURSAL = '001'
const TERMINAL = '00001'
// Código de "tipo de documento" que lleva el consecutivo propio del
// mensaje receptor — distinto del código "mensaje" que va dentro del
// XML (que es "1"/"2"/"3").
const CODIGO_CONSECUTIVO_POR_MENSAJE = { '1': '05', '2': '06', '3': '07' }

// ─── Utilidades (idénticas a emitir-nota-credito.js / emitir-nota-debito.js) ──
function soloDigitos(valor) {
  return String(valor || '').replace(/[^0-9]/g, '')
}
function limpio(valor) {
  return String(valor || '').trim()
}
function tipoIdentificacionEmisor(cedulaLimpia) {
  if (cedulaLimpia.length === 9) return '01'
  if (cedulaLimpia.length === 10) return '02'
  if (cedulaLimpia.length === 11 || cedulaLimpia.length === 12) return '03'
  return '04'
}
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
  if (!respuesta.ok) {
    const texto = await respuesta.text().catch(() => '')
    throw new Error('No se pudo autenticar con Hacienda (status ' + respuesta.status + '): ' + (texto || respuesta.statusText))
  }
  const datos = await respuesta.json()
  return datos.access_token
}

async function obtenerSiguienteSecuencia(uid, tipoDocumento) {
  const respuesta = await fetch(CERTIFICADOS_WORKER_URL + '/siguiente-secuencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET, tipoDocumento }),
  })
  const datos = await leerJsonSeguro(respuesta)
  if (!respuesta.ok || !datos.secuencia) {
    throw new Error('No se pudo generar el número de secuencia: ' + (datos.error || 'error desconocido'))
  }
  return datos.secuencia
}

async function enviarYEsperarDirecto(opciones) {
  const { baseUrl, entorno, usuario, password, clave, tipoIdEmisor, cedulaEmisor, comprobanteXml } = opciones
  const token = await obtenerAccessToken(entorno, usuario, password)

  const envioRes = await fetch(baseUrl + '/recepcion', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clave,
      fecha: new Date().toISOString(),
      emisor: { tipoIdentificacion: tipoIdEmisor, numeroIdentificacion: cedulaEmisor },
      comprobanteXml,
    }),
  })

  if (envioRes.status !== 201 && envioRes.status !== 202) {
    const texto = await envioRes.text().catch(() => '')
    throw new Error('Hacienda rechazó el envío (status ' + envioRes.status + '): ' + texto)
  }

  const limite = Date.now() + 55000
  while (Date.now() < limite) {
    await new Promise((resolver) => setTimeout(resolver, 3000))
    const tokenVigente = await obtenerAccessToken(entorno, usuario, password)
    const consultaRes = await fetch(baseUrl + '/recepcion/' + clave, { headers: { Authorization: 'Bearer ' + tokenVigente } })
    if (!consultaRes.ok) continue

    const estado = await consultaRes.json()
    const indEstado = estado['ind-estado']

    if (indEstado === 'aceptado') return { accepted: true }

    if (indEstado === 'rechazado') {
      let motivo = 'Rechazado por Hacienda'
      try {
        const xmlRespuesta = Buffer.from(estado['respuesta-xml'], 'base64').toString('utf-8')
        const coincidencia = xmlRespuesta.match(/<DetalleMensaje>([^<]*)<\/DetalleMensaje>/i)
        if (coincidencia) motivo = limpiarMensajeHacienda(coincidencia[1])
      } catch { /* se deja el motivo genérico */ }
      return { accepted: false, rejectionReason: motivo }
    }
  }
  return { accepted: null, pending: true }
}

async function verificarIdToken(idToken) {
  if (!idToken || !process.env.FIREBASE_API_KEY) return null
  try {
    const respuesta = await fetch(
      'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + process.env.FIREBASE_API_KEY,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
    )
    if (!respuesta.ok) return null
    const datos = await respuesta.json()
    const usuario = datos.users && datos.users[0]
    return usuario ? usuario.localId : null
  } catch {
    return null
  }
}

async function verificarLimiteRemoto(clave, limite, ventanaSegundos) {
  try {
    const respuesta = await fetch(CERTIFICADOS_WORKER_URL + '/verificar-limite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secreto: process.env.FIRMA_SERVICE_SECRET, clave, limite, ventanaSegundos }),
    })
    if (!respuesta.ok) return true
    const datos = await respuesta.json()
    return datos.permitido !== false
  } catch {
    return true
  }
}

async function guardarHistorial(uid, registro) {
  try {
    await fetch(CERTIFICADOS_WORKER_URL + '/guardar-historial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET, registro }),
    })
  } catch (err) {
    console.error('No se pudo guardar el historial (el mensaje sí se procesó):', err.message)
  }
}

// ─── Handler ───────────────────────────────────────────────────
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
    const {
      idToken,
      claveRecibida, // clave de 50 dígitos del comprobante que le llegó al usuario
      cedulaEmisorRecibido, // cédula de quien le facturó (el emisor del comprobante recibido)
      fechaEmisionRecibida, // fecha de emisión de ese comprobante (ISO)
      totalFacturaRecibida, // monto total de ese comprobante
      montoTotalImpuestoRecibido, // monto total de IVA de ese comprobante (opcional, 0 si no aplica)
      mensaje, // "1" acepta todo, "2" acepta parcial, "3" rechaza
      detalleMensaje, // motivo / detalle libre (recomendado si no es aceptación total)
    } = req.body || {}

    const uid = await verificarIdToken(idToken)
    if (!uid) {
      res.status(401).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión e intentá de nuevo.' })
      return
    }
    if (!(await verificarLimiteRemoto('mensaje-receptor:' + uid, 20, 3600))) {
      res.status(429).json({ error: 'Alcanzaste el límite de mensajes de receptor por hora. Esperá un rato y probá de nuevo.' })
      return
    }
    const claveRecibidaLimpia = soloDigitos(claveRecibida)
    if (claveRecibidaLimpia.length !== 50) {
      res.status(400).json({ error: 'Falta o es inválida la clave del comprobante recibido (debe tener 50 dígitos).' })
      return
    }
    const codigoConsecutivo = CODIGO_CONSECUTIVO_POR_MENSAJE[String(mensaje)]
    if (!codigoConsecutivo) {
      res.status(400).json({ error: 'El mensaje debe ser "1" (acepta), "2" (acepta parcial) o "3" (rechaza).' })
      return
    }
    const cedulaEmisorRecibidoLimpia = soloDigitos(cedulaEmisorRecibido)
    if (!cedulaEmisorRecibidoLimpia) {
      res.status(400).json({ error: 'Falta la cédula de quien emitió el comprobante que estás respondiendo.' })
      return
    }

    // ── 1. Certificado + credenciales del cliente (el RECEPTOR, quien firma y envía este mensaje) ──
    const respCert = await fetch(CERTIFICADOS_WORKER_URL + '/obtener-certificado-firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET }),
    })
    const datosCert = await leerJsonSeguro(respCert)
    if (!respCert.ok) {
      res.status(502).json({ error: 'No se pudo obtener el certificado: ' + (datosCert.error || 'error desconocido') })
      return
    }

    const { certificadoBase64, contrasena: p12Pin, cedulaEmisor, usuarioHacienda, passwordHacienda, ambiente } = datosCert

    if (!certificadoBase64 || !cedulaEmisor || !usuarioHacienda || !passwordHacienda) {
      res.status(400).json({
        error: 'Este usuario todavía no completó su configuración de Hacienda. Andá a "Factura Electrónica" en la app y completá esos datos primero.',
      })
      return
    }

    const p12Buffer = Buffer.from(certificadoBase64, 'base64')
    const entorno = ambiente === 'production' ? 'production' : 'sandbox'
    const cedulaLimpia = soloDigitos(cedulaEmisor) // la cédula del propio usuario (el receptor)
    const tipoIdPropio = tipoIdentificacionEmisor(cedulaLimpia)

    // ── 2. Secuencia propia por tipo de mensaje (05/06/07 tienen cada uno su contador) ──
    const secuencia = await obtenerSiguienteSecuencia(uid, 'mensajeReceptor-' + codigoConsecutivo)
    const numeroConsecutivoReceptor = SUCURSAL + TERMINAL + codigoConsecutivo + String(secuencia).padStart(10, '0')

    // ── 3. Armar y firmar el Mensaje Receptor ──
    const documento = {
      clave: claveRecibidaLimpia,
      numeroCedulaEmisor: cedulaEmisorRecibidoLimpia,
      fechaEmisionDoc: fechaEmisionRecibida || new Date().toISOString(),
      mensaje: String(mensaje),
      detalleMensaje: limpio(detalleMensaje).slice(0, 160) || undefined,
      montoTotalImpuesto: Number(montoTotalImpuestoRecibido) || 0,
      totalFactura: Number(totalFacturaRecibida) || 0,
      numeroCedulaReceptor: cedulaLimpia,
      numeroConsecutivoReceptor,
    }

    const xml = buildMensajeReceptorXml(documento)
    const xmlFirmadoBase64 = await signAndEncode(xml, p12Buffer, p12Pin)

    const baseUrl = entorno === 'production'
      ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
      : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    const resultado = await enviarYEsperarDirecto({
      baseUrl, entorno, usuario: usuarioHacienda, password: passwordHacienda,
      clave: claveRecibidaLimpia, tipoIdEmisor: tipoIdPropio, cedulaEmisor: cedulaLimpia, comprobanteXml: xmlFirmadoBase64,
    })

    // ── 4. Guardar en el historial, marcado como mensaje receptor ──
    const estadoHistorial = resultado.accepted === true ? 'aceptado' : resultado.accepted === false ? 'rechazado' : 'pendiente'
    await guardarHistorial(uid, {
      clave: claveRecibidaLimpia,
      numeroConsecutivo: numeroConsecutivoReceptor,
      ambiente: entorno,
      estado: estadoHistorial,
      motivoRechazo: estadoHistorial === 'rechazado' ? resultado.rejectionReason : null,
      fecha: new Date().toISOString(),
      tipoDocumento: 'mensajeReceptor',
      claveReferenciada: claveRecibidaLimpia,
      mensajeReceptorTipo: String(mensaje),
      receptorNombre: null,
      receptorCedula: cedulaEmisorRecibidoLimpia,
      receptorEmail: null,
      total: Number(totalFacturaRecibida) || 0,
      xmlFirmadoBase64,
    })

    res.status(200).json({
      ok: true,
      aceptado: resultado.accepted,
      pendiente: resultado.pending === true,
      motivoRechazo: resultado.accepted === false ? resultado.rejectionReason : null,
      mensajePendiente: resultado.pending === true
        ? 'Hacienda no confirmó a tiempo (55s), pero el mensaje SÍ fue recibido. Guardá la clave para consultar el estado más tarde.'
        : null,
      numeroConsecutivoReceptor,
      claveReferenciada: claveRecibidaLimpia,
      ambiente: entorno,
      xmlFirmadoBase64,
    })
  } catch (err) {
    console.error('Error al emitir mensaje receptor:', err)
    res.status(500).json({
      error: 'No se pudo emitir el mensaje receptor: ' + (err && err.message ? err.message : String(err)),
    })
  }
}
