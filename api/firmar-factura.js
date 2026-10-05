/**
 * api/firmar-factura.js
 *
 * Recibe los datos de una factura desde la app, busca el certificado
 * y las credenciales de Hacienda de ese usuario (guardados cifrados
 * en el Worker de Cloudflare "matriz-certificados"), arma el XML,
 * lo firma de verdad (XAdES-EPES) y lo envía a Hacienda.
 *
 * Variables de entorno que hay que configurar en Vercel:
 * - CERTIFICADOS_WORKER_URL: https://matriz-certificados.kacn1z.workers.dev
 * - FIRMA_SERVICE_SECRET: el MISMO secreto que configuraste en el Worker
 *   de Cloudflare (Settings → Variables → FIRMA_SERVICE_SECRET)
 *
 * IMPORTANTE: del SDK solo se importan las funciones que arman y firman
 * el XML. La autenticación contra Hacienda y el envío/sondeo se hacen
 * "a mano" con fetch(), igual que en api/facturar.js de Los Pirchas,
 * porque HaciendaClient / HttpClient / submitAndWait del SDK fallan con
 * ERR_PACKAGE_PATH_NOT_EXPORTED por un desajuste interno de versiones.
 *
 * NUMERACIÓN: la secuencia de cada factura/tiquete YA NO la calcula el
 * celular (antes vivía en localStorage del WebView, lo cual mezclaba la
 * numeración entre clientes que usaran el mismo dispositivo). Ahora se
 * le pide al Worker (/siguiente-secuencia), que la guarda en KV por
 * uid + tipo de documento — cada cliente tiene su propio contador.
 */

import {
  DocumentType,
  Situation,
  buildClave,
  buildFacturaXml,
  buildTiqueteXml,
  calculateLineItemTotals,
  calculateInvoiceSummary,
  signAndEncode,
} from '@dojocoding/hacienda-sdk'

// Se le quitan espacios y barras finales a la URL: con una barra al final
// la ruta quedaría "//obtener-certificado-firma" y el Worker respondería
// "Ruta no encontrada".
const CERTIFICADOS_WORKER_URL = (
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'
)
  .trim()
  .replace(/\/+$/, '')

// Sucursal y terminal fijas (001 / 00001), igual que en Los Pirchas.
const SUCURSAL = '001'
const TERMINAL = '00001'

// ─── Utilidades ─────────────────────────────────────────────────

// Solo dígitos (las cédulas pueden venir con guiones o espacios).
function soloDigitos(valor) {
  return String(valor || '').replace(/[^0-9]/g, '')
}

// Quita espacios al inicio/final; un espacio de más en un campo como
// actividadEconomica hace que Hacienda rechace el comprobante por
// exceder el largo máximo permitido (ya pasó una vez con "5610.0 ").
function limpio(valor) {
  return String(valor || '').trim()
}

// Tipo de identificación del emisor según el largo de la cédula:
// 9 dígitos = física (01), 10 = jurídica (02), 11-12 = DIMEX (03), otro = NITE (04).
function tipoIdentificacionEmisor(cedulaLimpia) {
  if (cedulaLimpia.length === 9) return '01'
  if (cedulaLimpia.length === 10) return '02'
  if (cedulaLimpia.length === 11 || cedulaLimpia.length === 12) return '03'
  return '04'
}

// Código de tarifa de IVA de Hacienda según el porcentaje.
function codigoTarifaPorPorcentaje(tarifa) {
  if (tarifa === 13) return '08'
  if (tarifa === 4) return '04'
  if (tarifa === 2) return '03'
  if (tarifa === 1) return '02'
  if (tarifa === 0.5) return '09'
  return '08'
}

// Arma la línea con el bloque de impuesto que Hacienda espera.
// Con tarifa 0 igual se manda el bloque (código de tarifa "01"),
// así lo hace un comprobante real ya aceptado por Hacienda.
function normalizarLinea(linea, indice) {
  const impuestos = Array.isArray(linea.impuesto) ? linea.impuesto : []
  const tarifa = impuestos.length ? Number(impuestos[0].tarifa) || 0 : 0

  return {
    ...linea,
    numeroLinea: indice + 1,
    impuesto: [
      {
        codigo: '01',
        codigoTarifaIVA: tarifa > 0 ? codigoTarifaPorPorcentaje(tarifa) : '01',
        tarifa: tarifa,
      },
    ],
  }
}

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

// ─── Autenticación directa contra el IDP de Hacienda ─────────────
// "usuario" es el usuario COMPLETO que genera Hacienda, con el formato
// cpf-01-XXXX-XXXX@prod.comprobanteselectronicos.go.cr
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
      'No se pudo autenticar con Hacienda (status ' + respuesta.status + '): ' +
        (texto || respuesta.statusText) +
        ' — usuario usado: ' + usuario
    )
  }

  const datos = await respuesta.json()
  return datos.access_token
}

// ─── Le pide al Worker el próximo número de secuencia del cliente ─
async function obtenerSiguienteSecuencia(uid, tipoDocumento) {
  const respuesta = await fetch(CERTIFICADOS_WORKER_URL + '/siguiente-secuencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid: uid,
      secreto: process.env.FIRMA_SERVICE_SECRET,
      tipoDocumento: tipoDocumento,
    }),
  })
  const datos = await leerJsonSeguro(respuesta)
  if (!respuesta.ok || !datos.secuencia) {
    throw new Error(
      'No se pudo generar el número de secuencia: ' + (datos.error || 'error desconocido')
    )
  }
  return datos.secuencia
}

// Los mensajes de error de Hacienda vienen con entidades HTML/XML sin
// decodificar (ej. "&#13;" en vez de un salto de línea real), lo que se ve
// feo en una alerta. Esto las decodifica y colapsa los saltos de línea
// repetidos, para que el mensaje quede legible.
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

// ─── Envío y sondeo directo a la API de recepción de Hacienda ────
async function enviarYEsperarDirecto(opciones) {
  const { baseUrl, entorno, usuario, password, clave, tipoIdEmisor, cedulaEmisor, comprobanteXml } = opciones

  const token = await obtenerAccessToken(entorno, usuario, password)

  const envioRes = await fetch(baseUrl + '/recepcion', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clave: clave,
      fecha: new Date().toISOString(),
      emisor: { tipoIdentificacion: tipoIdEmisor, numeroIdentificacion: cedulaEmisor },
      comprobanteXml: comprobanteXml,
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
    const consultaRes = await fetch(baseUrl + '/recepcion/' + clave, {
      headers: { Authorization: 'Bearer ' + tokenVigente },
    })
    if (!consultaRes.ok) continue

    const estado = await consultaRes.json()
    const indEstado = estado['ind-estado']

    if (indEstado === 'aceptado') {
      return { accepted: true }
    }

    if (indEstado === 'rechazado') {
      let motivo = 'Rechazado por Hacienda'
      try {
        const xmlRespuesta = Buffer.from(estado['respuesta-xml'], 'base64').toString('utf-8')
        const coincidencia = xmlRespuesta.match(/<DetalleMensaje>([^<]*)<\/DetalleMensaje>/i)
        if (coincidencia) motivo = limpiarMensajeHacienda(coincidencia[1])
      } catch {
        // Si no se puede leer el detalle, se deja el motivo genérico.
      }
      return { accepted: false, rejectionReason: motivo }
    }
    // Si sigue "recibido" o "procesando", seguimos esperando.
  }

  // Hacienda YA recibió el comprobante (pasó la validación del status 201/202
  // de arriba) pero no confirmó "aceptado" ni "rechazado" dentro de los 55s
  // que dura esta función serverless. No es un error: la factura pudo haber
  // quedado enviada igual y solo falta consultar su estado más tarde con la
  // clave. Se devuelve como "pendiente" en vez de lanzar una excepción, para
  // que la app pueda avisarle al usuario en vez de mostrar un error genérico.
  return { accepted: null, pending: true }
}

// ─── Verifica el idToken de Firebase del cliente y devuelve el uid ──
// REAL de la sesión (o null si es inválido/expiró). Nunca se confía en
// un uid que venga suelto en el body: sin esto, cualquiera podría
// mandar el uid de otro cliente y firmar/consultar con SU certificado.
// ─── Verifica un límite de peticiones contra el Worker (que es quien ──
// realmente lleva la cuenta en KV). Si el Worker no responde por algún
// motivo, se deja pasar la petición — un rate limit caído no debería
// tumbar el servicio entero, solo es una capa extra de protección.
async function verificarLimiteRemoto(clave, limite, ventanaSegundos) {
  try {
    const respuesta = await fetch(CERTIFICADOS_WORKER_URL + '/verificar-limite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secreto: process.env.FIRMA_SERVICE_SECRET,
        clave: clave,
        limite: limite,
        ventanaSegundos: ventanaSegundos,
      }),
    })
    if (!respuesta.ok) return true
    const datos = await respuesta.json()
    return datos.permitido !== false
  } catch {
    return true
  }
}

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

// ─── Guarda el registro de esta factura en el historial del cliente ──
// Se llama SIEMPRE después de intentar el envío (aceptada, rechazada o
// pendiente) — el historial sirve justamente para ver ese resultado
// después, así que no tiene sentido guardarlo solo si salió bien.
// Nunca deja que un fallo acá tumbe la respuesta al usuario: si el
// guardado del historial falla, la factura ya se firmó y envió de
// verdad, eso es lo importante.
async function guardarHistorial(uid, registro) {
  try {
    await fetch(CERTIFICADOS_WORKER_URL + '/guardar-historial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: uid,
        secreto: process.env.FIRMA_SERVICE_SECRET,
        registro: registro,
      }),
    })
  } catch (err) {
    console.error('No se pudo guardar el historial (la factura sí se procesó):', err.message)
  }
}

// ─── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS básico, igual que en sibo-chat.js
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
      idToken, // token de sesión de Firebase del usuario que factura
      receptor, // { nombre, identificacion: { tipo, numero }, correoElectronico }
      lineas, // array de líneas (codigoCabys, cantidad, detalle, precioUnitario, impuesto)
      condicionVenta, // '01' contado, '02' crédito, etc. (default '01')
      plazoCredito, // días de plazo — obligatorio cuando condicionVenta === '02'
      medioPago, // array, ej: ['01'] (default ['01'] efectivo)
      esTiquete, // true => Tiquete Electrónico (04) en vez de Factura (01)
      emisorNombre, // opcional: nombre / razón social del emisor
    } = req.body || {}

    const uid = await verificarIdToken(idToken)
    if (!uid) {
      res.status(401).json({ error: 'Sesión inválida o expirada. Volvé a iniciar sesión e intentá de nuevo.' })
      return
    }
    // Máximo 20 facturas reales por hora por cliente — frena un
    // disparo accidental en bucle o un abuso deliberado, sin molestar
    // a nadie facturando a un ritmo normal.
    if (!(await verificarLimiteRemoto('firmar:' + uid, 20, 3600))) {
      res.status(429).json({ error: 'Alcanzaste el límite de facturas por hora. Esperá un rato y probá de nuevo.' })
      return
    }
    if (!Array.isArray(lineas) || !lineas.length) {
      res.status(400).json({
        error: 'Faltan datos: lineas (array) es obligatorio.',
      })
      return
    }
    if (!esTiquete && !receptor) {
      res.status(400).json({
        error: 'Para una Factura Electrónica hace falta el receptor (nombre y cédula).',
      })
      return
    }
    // Hacienda exige el plazo en días cuando la condición de venta es
    // "crédito" (02) — sin esto el comprobante se rechaza.
    const plazoCreditoLimpio = String(plazoCredito || '').replace(/[^0-9]/g, '')
    const esCreditoVenta = condicionVenta === '02' || condicionVenta === '10' // 10 = crédito con IVA diferido hasta 90 días (Art. 27 LIVA)
    if (esCreditoVenta && !plazoCreditoLimpio) {
      res.status(400).json({
        error: 'Para facturar a crédito hace falta indicar el plazo de crédito en días.',
      })
      return
    }

    if (condicionVenta === '10' && Number(plazoCreditoLimpio) > 90) {
      res.status(400).json({ error: 'El crédito con IVA diferido (Art. 27) permite un plazo máximo de 90 días.' })
      return
    }

    // ── 1. Pedirle al Worker de Cloudflare el certificado + credenciales ──
    const respCert = await fetch(CERTIFICADOS_WORKER_URL + '/obtener-certificado-firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid, secreto: process.env.FIRMA_SERVICE_SECRET }),
    })
    const datosCert = await leerJsonSeguro(respCert)
    if (!respCert.ok) {
      res.status(502).json({
        error:
          'No se pudo obtener el certificado: ' +
          (datosCert.error || 'error desconocido') +
          ' (Worker consultado: ' + CERTIFICADOS_WORKER_URL + ')',
      })
      return
    }

    const {
      certificadoBase64,
      contrasena: p12Pin,
      cedulaEmisor,
      usuarioHacienda,
      passwordHacienda,
      actividadEconomica,
      ambiente,
      provincia,
      canton,
      distrito,
      otrasSenas,
    } = datosCert

    if (
      !certificadoBase64 ||
      !cedulaEmisor ||
      !usuarioHacienda ||
      !passwordHacienda ||
      !actividadEconomica
    ) {
      res.status(400).json({
        error:
          'Este usuario todavía no completó su configuración de Hacienda (certificado, usuario/contraseña de API, actividad económica). Andá a "Factura Electrónica" en la app y completá esos datos primero.',
      })
      return
    }

    const p12Buffer = Buffer.from(certificadoBase64, 'base64')
    const entorno = ambiente === 'production' ? 'production' : 'sandbox'
    const cedulaLimpia = soloDigitos(cedulaEmisor)
    const tipoIdEmisor = tipoIdentificacionEmisor(cedulaLimpia)

    // ── 2. Pedirle al Worker el próximo número de secuencia de ESTE cliente ──
    const secuencia = await obtenerSiguienteSecuencia(uid, esTiquete ? 'tiquete' : 'factura')

    // ── 3. Calcular totales de cada línea y el resumen de la factura ──
    const lineasNormalizadas = lineas.map(normalizarLinea)
    const lineasCalculadas = lineasNormalizadas.map(calculateLineItemTotals)
    const resumen = calculateInvoiceSummary(lineasCalculadas)

    // Si ninguna línea lleva IVA (tarifa 0), se declara todo como "No Sujeto",
    // igual que en Los Pirchas (Régimen de Tributación Simplificada): sin esto
    // Hacienda rechaza el comprobante diciendo que "carece" de ese total.
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
      resumen.totalDesgloseImpuesto = [
        { codigo: '01', codigoTarifaIVA: '01', totalMontoImpuesto: 0 },
      ]
      resumen.totalImpuesto = 0
      resumen.totalComprobante = totalLineas
    }

    // v4.4: medioPago vive dentro de resumenFactura.
    resumen.medioPago = [
      {
        tipoMedioPago: (Array.isArray(medioPago) && medioPago[0]) || '01',
        totalMedioPago: resumen.totalComprobante,
      },
    ]

    // ── 4. Clave numérica + consecutivo de 20 dígitos ──
    const tipoDocumento = esTiquete
      ? DocumentType.TIQUETE_ELECTRONICO
      : DocumentType.FACTURA_ELECTRONICA
    const codigoTipo = esTiquete ? '04' : '01'

    const clave = buildClave({
      date: new Date(),
      taxpayerId: cedulaLimpia,
      documentType: tipoDocumento,
      sequence: secuencia,
      situation: Situation.NORMAL,
    })

    // sucursal(3) + terminal(5) + tipoDocumento(2) + secuencia(10)
    const numeroConsecutivo = SUCURSAL + TERMINAL + codigoTipo + String(secuencia).padStart(10, '0')

    // ── 5. Armar el documento y generar el XML ──
    // limpio() le quita espacios de más a cada campo de texto: un espacio
    // sobrante (ej. en actividadEconomica) hace que Hacienda rechace el
    // comprobante por exceder el largo máximo permitido.
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
      clave: clave,
      codigoActividadEmisor: limpio(actividadEconomica),
      proveedorSistemas: cedulaLimpia, // v4.4 (TRIBU-CR): identificación del proveedor del software
      numeroConsecutivo: numeroConsecutivo,
      fechaEmision: new Date().toISOString(),
      emisor: emisor,
      condicionVenta: condicionVenta || '01',
      detalleServicio: lineasCalculadas,
      resumenFactura: resumen,
    }
    if (condicionVenta === '02' || condicionVenta === '10') documento.plazoCredito = plazoCreditoLimpio

    let xml
    if (esTiquete) {
      xml = buildTiqueteXml(documento)
    } else {
      documento.receptor = receptor
      xml = buildFacturaXml(documento)
    }

    // ── 6. Firmar de verdad con el certificado del cliente ──
    const xmlFirmadoBase64 = await signAndEncode(xml, p12Buffer, p12Pin)

    // ── 7. Enviar a Hacienda y esperar la respuesta ──
    const baseUrl =
      entorno === 'production'
        ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
        : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    const resultado = await enviarYEsperarDirecto({
      baseUrl: baseUrl,
      entorno: entorno,
      usuario: usuarioHacienda,
      password: passwordHacienda,
      clave: clave,
      tipoIdEmisor: tipoIdEmisor,
      cedulaEmisor: cedulaLimpia,
      comprobanteXml: xmlFirmadoBase64,
    })

    // ── 8. Guardar el registro en el historial de este cliente ──
    const estadoHistorial = resultado.accepted === true ? 'aceptado' : resultado.accepted === false ? 'rechazado' : 'pendiente'
    await guardarHistorial(uid, {
      clave: clave,
      numeroConsecutivo: numeroConsecutivo,
      ambiente: entorno,
      estado: estadoHistorial,
      motivoRechazo: estadoHistorial === 'rechazado' ? resultado.rejectionReason : null,
      fecha: new Date().toISOString(),
      esTiquete: !!esTiquete,
      emisorNombre: emisorNombre || cedulaLimpia,
      receptorNombre: receptor ? receptor.nombre : null,
      receptorCedula: receptor && receptor.identificacion ? receptor.identificacion.numero : null,
      receptorEmail: receptor ? receptor.correoElectronico : null,
      total: resumen.totalComprobante,
      lineas: lineas,
      condicionVenta: condicionVenta || '01',
      plazoCredito: (condicionVenta === '02' || condicionVenta === '10') ? plazoCreditoLimpio : null,
      medioPago: medioPago || ['01'],
      xmlFirmadoBase64: xmlFirmadoBase64,
    })

    res.status(200).json({
      ok: true,
      aceptado: resultado.accepted, // true | false | null (null = pendiente, ver abajo)
      pendiente: resultado.pending === true,
      motivoRechazo: resultado.accepted === false ? resultado.rejectionReason : null,
      mensajePendiente: resultado.pending === true
        ? 'Hacienda no confirmó a tiempo (55s), pero el comprobante SÍ fue recibido. Guardá la clave de abajo — probablemente ya quedó aceptada o rechazada; consultala más tarde en ATV con esa clave.'
        : null,
      clave: clave,
      numeroConsecutivo: numeroConsecutivo,
      ambiente: entorno,
      xmlFirmadoBase64: xmlFirmadoBase64,
    })
  } catch (err) {
    console.error('Error al firmar/enviar factura:', err)
    res.status(500).json({
      error:
        'No se pudo completar la facturación: ' + (err && err.message ? err.message : String(err)),
      codigo: err && err.code ? err.code : undefined,
    })
  }
}
