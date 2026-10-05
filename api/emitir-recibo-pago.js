/**
 * api/emitir-recibo-pago.js
 *
 * Emite un Recibo Electrónico de Pago (REP) REAL — el comprobante que
 * Hacienda exige cuando se cobra efectivamente una factura que se había
 * emitido "a crédito" (condicionVenta "02" o "10"; el esquema oficial v4.4 define 10 como «Venta a crédito en IVA hasta 90 días, Art. 27 LIVA»). Es casi gemelo de
 * emitir-nota-credito.js / emitir-nota-debito.js en todo lo de
 * certificado, firma y envío, pero:
 *
 *   1. Usa buildReciboPagoXml() del SDK, tipo de documento "07".
 *   2. Repite las líneas y el receptor del documento original (igual
 *      que la nota de crédito) porque el REP documenta el pago del
 *      100% de esa factura — esta primera versión no soporta pagos
 *      parciales en varias cuotas.
 *   3. El código de "InformacionReferencia" es "04" (Referencia a otro
 *      documento), igual que la nota de débito: el REP no anula la
 *      factura original, solo confirma que ya se cobró.
 *
 * ── OJO, LIMITACIÓN TÉCNICA IMPORTANTE QUE HAY QUE PROBAR EN SANDBOX ──
 * La documentación del SDK (@dojocoding/hacienda-sdk) anota en el
 * builder del REP: "Document type code: 07 (clave code: 10)" — es
 * decir, según esa nota, dentro de los 50 dígitos de la "clave" el
 * código de tipo de documento del REP debería ser "10", no "07". Pero
 * la función pública buildClave() del mismo SDK SOLO acepta códigos
 * "01" a "09" (los valida contra una lista fija) — no hay forma de
 * pedirle "10" sin saltarse esa validación a mano. Por ahora esta
 * función arma la clave con "07" (el único código que el SDK realmente
 * deja usar, y el mismo que usa el resto del documento), que es
 * consistente puertas adentro pero puede no ser exactamente lo que
 * Hacienda espera en ese dígito. ANTES de usar esto con el ambiente de
 * PRODUCCIÓN real, probalo primero en modo sandbox (la cuenta de
 * Hacienda tiene que estar configurada en modo pruebas) y fijate que
 * el comprobante quede "aceptado" — si Hacienda lo rechaza por el tipo
 * de documento, hay que ajustar el código "07"→"10" acá a mano.
 *
 * Variables de entorno: las mismas que firmar-factura.js
 * (CERTIFICADOS_WORKER_URL, FIRMA_SERVICE_SECRET, FIREBASE_API_KEY).
 */

import {
  DocumentType,
  Situation,
  buildClave,
  buildReciboPagoXml,
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
// Código del REP en la estructura v4.4 de Hacienda (10). El SDK solo deja
// armar claves con 01–09, así que la clave se arma con el SDK y luego se
// corrige el código de tipo dentro del consecutivo que lleva incrustado.
const CODIGO_TIPO_REP = '10'

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
    console.error('No se pudo guardar el historial (el REP sí se procesó):', err.message)
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
      claveOriginal, // clave de 50 dígitos de la factura a crédito que se está cobrando
      fechaOriginal, // fecha de emisión de esa factura (ISO)
      receptor, // mismo receptor de la factura original (obligatorio: a crédito siempre tiene receptor)
      lineas, // mismas líneas de la factura original (se documenta el pago del 100%)
      medioPago, // cómo se cobró: ['01'] efectivo, ['02'] tarjeta, ['03'] cheque, ['04'] transferencia, etc.
      emisorNombre,
      montoPago, // opcional: monto cobrado en este pago (pago parcial). Sin esto se documenta el 100%
      totalOriginal, // total de la factura original (para calcular la proporción del pago parcial)
    } = req.body || {}

    const uid = await verificarIdToken(idToken)
    if (!uid) {
      res.status(401).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión e intentá de nuevo.' })
      return
    }
    if (!(await verificarLimiteRemoto('recibo-pago:' + uid, 20, 3600))) {
      res.status(429).json({ error: 'Alcanzaste el límite de recibos de pago por hora. Esperá un rato y probá de nuevo.' })
      return
    }
    if (!claveOriginal || String(claveOriginal).replace(/[^0-9]/g, '').length !== 50) {
      res.status(400).json({ error: 'Falta o es inválida la clave de la factura original (debe tener 50 dígitos).' })
      return
    }
    if (!Array.isArray(lineas) || !lineas.length) {
      res.status(400).json({ error: 'Faltan datos: lineas (array) es obligatorio.' })
      return
    }
    if (!receptor) {
      res.status(400).json({ error: 'Falta el receptor de la factura original — un REP siempre referencia una Factura a crédito, que siempre tiene receptor.' })
      return
    }

    // ── 1. Certificado + credenciales del cliente ──
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

    // ── 2. Secuencia propia para recibos de pago (contador separado) ──
    const secuencia = await obtenerSiguienteSecuencia(uid, 'reciboPago')

    // ── 3. Totales — se documenta el pago del 100% de la factura original ──
    let lineasBase = lineas
    const montoPagoNum = Number(montoPago)
    const totalOrigNum = Number(totalOriginal)
    if (montoPago !== undefined && montoPago !== null && montoPago !== '') {
      if (!(montoPagoNum > 0) || !(totalOrigNum > 0) || montoPagoNum > totalOrigNum + 0.005) {
        res.status(400).json({ error: 'El monto del pago debe ser mayor que 0 y no puede superar el total de la factura.' })
        return
      }
      if (montoPagoNum < totalOrigNum - 0.005) {
        // Pago parcial: se escala el precio de cada línea por la proporción
        // pagada, así el IVA queda proporcional al monto cobrado.
        const proporcion = montoPagoNum / totalOrigNum
        lineasBase = lineas.map((l) => ({ ...l, precioUnitario: Math.round(Number(l.precioUnitario) * proporcion * 100000) / 100000 }))
      }
    }
    const lineasNormalizadas = lineasBase.map(normalizarLinea)
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

    // ── 4. Clave y consecutivo del REP (documento nuevo) ──
    // Ver el comentario largo arriba del archivo: "07" es el único código
    // que buildClave() deja usar — puede no ser el "10" que menciona la
    // documentación del SDK. Probar en sandbox antes de usar en producción.
    const claveSdk = buildClave({
      date: new Date(),
      taxpayerId: cedulaLimpia,
      documentType: DocumentType.RECIBO_ELECTRONICO_PAGO,
      sequence: secuencia,
      situation: Situation.NORMAL,
    })
    const numeroConsecutivo = SUCURSAL + TERMINAL + CODIGO_TIPO_REP + String(secuencia).padStart(10, '0')
    // El consecutivo ocupa las posiciones 21–40 de la clave; se reemplaza
    // por el nuestro (con tipo "10") y se conserva el resto tal cual.
    const clave = claveSdk.slice(0, 21) + numeroConsecutivo + claveSdk.slice(41)
    if (clave.length !== 50) {
      res.status(500).json({ error: 'No se pudo armar la clave del recibo de pago.' })
      return
    }

    // ── 5. Armar el documento, con la referencia a la factura cobrada ──
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
      receptor,
      condicionVenta: '01', // el REP en sí se documenta como "contado" — es la factura original la que era a crédito
      detalleServicio: lineasCalculadas,
      resumenFactura: resumen,
      // Referencia obligatoria: qué factura a crédito se está cobrando.
      // codigo "04" = "Referencia a otro documento" — el REP no anula la
      // factura original (por eso no usa "01"), solo confirma el cobro.
      informacionReferencia: [
        {
          tipoDoc: '01',
          numero: claveOriginalLimpia,
          fechaEmision: fechaOriginal || new Date().toISOString(),
          codigo: '04',
          razon: 'Pago de la factura de referencia',
        },
      ],
    }

    const xml = buildReciboPagoXml(documento)

    // ── 6. Firmar y enviar, igual que una factura normal ──
    const xmlFirmadoBase64 = await signAndEncode(xml, p12Buffer, p12Pin)

    const baseUrl = entorno === 'production'
      ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
      : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    const resultado = await enviarYEsperarDirecto({
      baseUrl, entorno, usuario: usuarioHacienda, password: passwordHacienda,
      clave, tipoIdEmisor, cedulaEmisor: cedulaLimpia, comprobanteXml: xmlFirmadoBase64,
    })

    // ── 7. Guardar en el historial, marcado como recibo de pago ──
    const estadoHistorial = resultado.accepted === true ? 'aceptado' : resultado.accepted === false ? 'rechazado' : 'pendiente'
    await guardarHistorial(uid, {
      clave,
      numeroConsecutivo,
      ambiente: entorno,
      estado: estadoHistorial,
      motivoRechazo: estadoHistorial === 'rechazado' ? resultado.rejectionReason : null,
      fecha: new Date().toISOString(),
      tipoDocumento: 'reciboPago',
      claveReferenciada: claveOriginalLimpia,
      emisorNombre: emisorNombre || cedulaLimpia,
      receptorNombre: receptor ? receptor.nombre : null,
      receptorCedula: receptor && receptor.identificacion ? receptor.identificacion.numero : null,
      receptorEmail: receptor ? receptor.correoElectronico : null,
      total: resumen.totalComprobante,
      lineas,
      medioPago: medioPago || ['01'],
      xmlFirmadoBase64,
    })

    res.status(200).json({
      ok: true,
      aceptado: resultado.accepted,
      pendiente: resultado.pending === true,
      motivoRechazo: resultado.accepted === false ? resultado.rejectionReason : null,
      mensajePendiente: resultado.pending === true
        ? 'Hacienda no confirmó a tiempo (55s), pero el recibo de pago SÍ fue recibido. Guardá la clave para consultar el estado más tarde.'
        : null,
      clave,
      numeroConsecutivo,
      claveReferenciada: claveOriginalLimpia,
      ambiente: entorno,
      xmlFirmadoBase64,
    })
  } catch (err) {
    console.error('Error al emitir recibo de pago:', err)
    res.status(500).json({
      error: 'No se pudo emitir el recibo de pago: ' + (err && err.message ? err.message : String(err)),
    })
  }
}
