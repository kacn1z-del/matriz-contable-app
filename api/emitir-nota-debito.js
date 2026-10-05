/**
 * api/emitir-nota-debito.js
 *
 * Emite una Nota de Débito Electrónica REAL (tipo de documento 02) que
 * carga un monto ADICIONAL sobre una factura o tiquete ya aceptado por
 * Hacienda (por ejemplo: un cobro que se olvidó incluir, un reajuste de
 * precio, intereses por mora, etc.). Es casi gemela de
 * emitir-nota-credito.js — mismo flujo de certificado, secuencia, firma
 * y envío — pero con dos diferencias importantes:
 *
 *   1. Arma el documento con buildNotaDebitoXml() del SDK en vez de
 *      buildNotaCreditoXml(), con tipoDocumento "02".
 *   2. A diferencia de la nota de crédito (que SIEMPRE repite las mismas
 *      líneas del documento original para anularlo al 100%), la nota de
 *      débito recibe líneas NUEVAS — las del cargo adicional que se está
 *      agregando — porque no está anulando nada, está sumando.
 *   3. El código de "InformacionReferencia" es "04" (Referencia a otro
 *      documento) en vez de "01" (Anula documento de referencia): la
 *      nota de débito no anula la factura original, solo se relaciona
 *      con ella para que Hacienda sepa qué comprobante está ajustando.
 *
 * El cliente (la app) manda la clave/fecha del documento original (para
 * la referencia) más el receptor (el mismo del documento original) y
 * las líneas NUEVAS del cargo adicional — esas sí las tipea el usuario
 * en el momento, no se copian del historial.
 *
 * Variables de entorno: las mismas que firmar-factura.js
 * (CERTIFICADOS_WORKER_URL, FIRMA_SERVICE_SECRET, FIREBASE_API_KEY).
 */

import {
  DocumentType,
  Situation,
  buildClave,
  buildNotaDebitoXml,
  calculateLineItemTotals,
  calculateInvoiceSummary,
  signAndEncode,
} from '@dojocoding/hacienda-sdk'

const CERTIFICADOS_WORKER_URL = (
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'
)
  .trim()
  .replace(/\/+$/, '')

const SUCURSAL = '001'
const TERMINAL = '00001'
const CODIGO_TIPO_NOTA_DEBITO = '02'

// ─── Utilidades (idénticas a emitir-nota-credito.js) ──────────────────
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
function codigoTarifaPorPorcentaje(tarifa) {
  if (tarifa === 13) return '08'
  if (tarifa === 4) return '04'
  if (tarifa === 2) return '03'
  if (tarifa === 1) return '02'
  if (tarifa === 0.5) return '09'
  return '08'
}
function normalizarLinea(linea, indice) {
  const impuestos = Array.isArray(linea.impuesto) ? linea.impuesto : []
  const tarifa = impuestos.length ? Number(impuestos[0].tarifa) || 0 : 0
  return {
    ...linea,
    numeroLinea: indice + 1,
    impuesto: [{ codigo: '01', codigoTarifaIVA: tarifa > 0 ? codigoTarifaPorPorcentaje(tarifa) : '01', tarifa }],
  }
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

// Multi-emisor: cédula del emisor dentro de una clave de 50 dígitos (posiciones 10–21, con ceros a la izquierda).
// El Worker compara ignorando ceros a la izquierda y verifica que esa cédula pertenezca al negocio del usuario.
function cedulaDeClave(clave) {
  const d = String(clave || '').replace(/[^0-9]/g, '')
  return d.length === 50 ? d.substr(9, 12) : ''
}

async function obtenerSiguienteSecuencia(uid, tipoDocumento, cedulaEmisor) {
  const respuesta = await fetch(CERTIFICADOS_WORKER_URL + '/siguiente-secuencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET, tipoDocumento, cedulaEmisor: cedulaEmisor || undefined }),
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
    console.error('No se pudo guardar el historial (la nota sí se procesó):', err.message)
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
      claveOriginal, // clave de 50 dígitos del documento que se está ajustando
      fechaOriginal, // fecha de emisión del documento original (ISO)
      motivo, // texto libre explicando el cargo adicional (va en "razon")
      receptor, // mismo receptor del documento original
      lineas, // líneas NUEVAS del cargo adicional (NO las del documento original)
      condicionVenta,
      medioPago,
      esTiquete, // si el documento original era un tiquete (sin receptor obligatorio)
      emisorNombre,
      cedulaEmisor: cedulaEmisorBody, // multi-emisor: con qué cédula emitir (si no viene, la que va dentro de la clave original)
    } = req.body || {}

    const uid = await verificarIdToken(idToken)
    if (!uid) {
      res.status(401).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión e intentá de nuevo.' })
      return
    }
    // Igual que las notas de crédito: un límite bajo alcanza de sobra
    // para uso legítimo y frena un error en bucle.
    if (!(await verificarLimiteRemoto('nota-debito:' + uid, 10, 3600))) {
      res.status(429).json({ error: 'Alcanzaste el límite de notas de débito por hora. Esperá un rato y probá de nuevo.' })
      return
    }
    if (!claveOriginal || String(claveOriginal).replace(/[^0-9]/g, '').length !== 50) {
      res.status(400).json({ error: 'Falta o es inválida la clave del documento original (debe tener 50 dígitos).' })
      return
    }
    if (!Array.isArray(lineas) || !lineas.length) {
      res.status(400).json({ error: 'Faltan datos: lineas (array) es obligatorio — son las líneas NUEVAS del cargo adicional.' })
      return
    }
    if (!esTiquete && !receptor) {
      res.status(400).json({ error: 'Para cargar una nota de débito sobre una Factura hace falta el receptor original (nombre y cédula).' })
      return
    }

    // ── 1. Certificado + credenciales del cliente ──
    const respCert = await fetch(CERTIFICADOS_WORKER_URL + '/obtener-certificado-firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET, cedulaEmisor: (String(cedulaEmisorBody || '').replace(/[^0-9]/g, '') || cedulaDeClave(claveOriginal)) || undefined }),
    })
    const datosCert = await leerJsonSeguro(respCert)
    if (!respCert.ok) {
      res.status(502).json({ error: 'No se pudo obtener el certificado: ' + (datosCert.error || 'error desconocido') })
      return
    }

    const {
      certificadoBase64, contrasena: p12Pin, cedulaEmisor, usuarioHacienda, passwordHacienda,
      actividadEconomica, ambiente, provincia, canton, distrito, otrasSenas,
    } = datosCert

    if (!certificadoBase64 || !cedulaEmisor || !usuarioHacienda || !passwordHacienda || !actividadEconomica) {
      res.status(400).json({
        error: 'Este usuario todavía no completó su configuración de Hacienda. Andá a "Factura Electrónica" en la app y completá esos datos primero.',
      })
      return
    }

    const p12Buffer = Buffer.from(certificadoBase64, 'base64')
    const entorno = ambiente === 'production' ? 'production' : 'sandbox'
    const cedulaLimpia = soloDigitos(cedulaEmisor)
    const tipoIdEmisor = tipoIdentificacionEmisor(cedulaLimpia)
    const claveOriginalLimpia = soloDigitos(claveOriginal)

    // ── 2. Secuencia propia para notas de débito (contador separado) ──
    const secuencia = await obtenerSiguienteSecuencia(uid, 'notaDebito', cedulaLimpia)

    // ── 3. Totales — se calculan solo sobre las líneas NUEVAS del cargo
    //       adicional (a diferencia de la nota de crédito, aquí no se
    //       repiten las líneas del documento original) ──
    const lineasNormalizadas = lineas.map(normalizarLinea)
    const lineasCalculadas = lineasNormalizadas.map(calculateLineItemTotals)
    const resumen = calculateInvoiceSummary(lineasCalculadas)

    const sinIva = lineasNormalizadas.every((l) => l.impuesto[0].tarifa === 0)
    if (sinIva) {
      const totalLineas = lineasCalculadas.reduce((suma, l) => suma + l.montoTotalLinea, 0)
      resumen.totalServGravados = 0
      resumen.totalServExentos = 0
      resumen.totalServExonerado = 0
      resumen.totalServNoSujeto = totalLineas
      resumen.totalGravado = 0
      resumen.totalExento = 0
      resumen.totalExonerado = 0
      resumen.totalNoSujeto = totalLineas
      resumen.totalVenta = totalLineas
      resumen.totalVentaNeta = totalLineas
      resumen.totalDesgloseImpuesto = [{ codigo: '01', codigoTarifaIVA: '01', totalMontoImpuesto: 0 }]
      resumen.totalImpuesto = 0
      resumen.totalComprobante = totalLineas
    }
    resumen.medioPago = [{ tipoMedioPago: (Array.isArray(medioPago) && medioPago[0]) || '01', totalMedioPago: resumen.totalComprobante }]

    // ── 4. Clave y consecutivo de LA NOTA DE DÉBITO (documento nuevo) ──
    const clave = buildClave({
      date: new Date(),
      taxpayerId: cedulaLimpia,
      documentType: DocumentType.NOTA_DEBITO_ELECTRONICA,
      sequence: secuencia,
      situation: Situation.NORMAL,
    })
    const numeroConsecutivo = SUCURSAL + TERMINAL + CODIGO_TIPO_NOTA_DEBITO + String(secuencia).padStart(10, '0')

    // ── 5. Armar el documento, con la referencia al original ──
    const emisor = {
      nombre: emisorNombre || cedulaLimpia,
      identificacion: { tipo: tipoIdEmisor, numero: cedulaLimpia },
      ubicacion: {
        provincia: limpio(provincia) || '1',
        canton: limpio(canton) || '01',
        distrito: limpio(distrito) || '01',
        otrasSenas: limpio(otrasSenas) || 'N/A',
      },
    }

    const documento = {
      clave,
      codigoActividadEmisor: limpio(actividadEconomica),
      proveedorSistemas: cedulaLimpia,
      numeroConsecutivo,
      fechaEmision: new Date().toISOString(),
      emisor,
      receptor: receptor || { nombre: 'Consumidor final', identificacion: { tipo: '01', numero: cedulaLimpia } },
      condicionVenta: condicionVenta || '01',
      detalleServicio: lineasCalculadas,
      resumenFactura: resumen,
      // Referencia obligatoria: a qué documento se le está agregando este
      // cargo. codigo "04" = "Referencia a otro documento" — a diferencia
      // de la nota de crédito, la nota de débito NO anula el original
      // (por eso no usa el código "01"), solo se relaciona con él.
      informacionReferencia: [
        {
          tipoDoc: esTiquete ? '04' : '01',
          numero: claveOriginalLimpia,
          fechaEmision: fechaOriginal || new Date().toISOString(),
          codigo: '04',
          razon: limpio(motivo).slice(0, 180) || 'Cargo adicional sobre el comprobante de referencia',
        },
      ],
    }

    const xml = buildNotaDebitoXml(documento)

    // ── 6. Firmar y enviar, igual que una factura normal ──
    const xmlFirmadoBase64 = await signAndEncode(xml, p12Buffer, p12Pin)

    const baseUrl = entorno === 'production'
      ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
      : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    const resultado = await enviarYEsperarDirecto({
      baseUrl, entorno, usuario: usuarioHacienda, password: passwordHacienda,
      clave, tipoIdEmisor, cedulaEmisor: cedulaLimpia, comprobanteXml: xmlFirmadoBase64,
    })

    // ── 7. Guardar en el historial, marcado como nota de débito ──
    const estadoHistorial = resultado.accepted === true ? 'aceptado' : resultado.accepted === false ? 'rechazado' : 'pendiente'
    await guardarHistorial(uid, {
      clave,
      numeroConsecutivo,
      ambiente: entorno,
      estado: estadoHistorial,
      motivoRechazo: estadoHistorial === 'rechazado' ? resultado.rejectionReason : null,
      fecha: new Date().toISOString(),
      tipoDocumento: 'notaDebito',
      claveReferenciada: claveOriginalLimpia,
      emisorNombre: emisorNombre || cedulaLimpia,
      receptorNombre: receptor ? receptor.nombre : null,
      receptorCedula: receptor && receptor.identificacion ? receptor.identificacion.numero : null,
      receptorEmail: receptor ? receptor.correoElectronico : null,
      total: resumen.totalComprobante,
      lineas,
      condicionVenta: condicionVenta || '01',
      medioPago: medioPago || ['01'],
      xmlFirmadoBase64,
    })

    res.status(200).json({
      ok: true,
      aceptado: resultado.accepted,
      pendiente: resultado.pending === true,
      motivoRechazo: resultado.accepted === false ? resultado.rejectionReason : null,
      mensajePendiente: resultado.pending === true
        ? 'Hacienda no confirmó a tiempo (55s), pero la nota de débito SÍ fue recibida. Guardá la clave para consultar el estado más tarde.'
        : null,
      clave,
      numeroConsecutivo,
      claveReferenciada: claveOriginalLimpia,
      ambiente: entorno,
      xmlFirmadoBase64,
    })
  } catch (err) {
    console.error('Error al emitir nota de débito:', err)
    res.status(500).json({
      error: 'No se pudo emitir la nota de débito: ' + (err && err.message ? err.message : String(err)),
    })
  }
}
