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
 */

import {
  HaciendaClient,
  HttpClient,
  DocumentType,
  Situation,
  buildClave,
  buildFacturaXml,
  buildTiqueteXml,
  calculateLineItemTotals,
  calculateInvoiceSummary,
  signAndEncode,
  submitAndWait,
  validateFacturaInput,
} from '@dojocoding/hacienda-sdk'

const CERTIFICADOS_WORKER_URL =
  process.env.CERTIFICADOS_WORKER_URL || 'https://matriz-certificados.kacn1z.workers.dev'

// ─── Arma el "numeroConsecutivo" de 20 dígitos que exige Hacienda ─
// sucursal(3) + terminal(5) + tipoDocumento(2) + secuencia(10)
function armarNumeroConsecutivo(tipoDocumento, secuencia, sucursal, terminal) {
  const suc = String(sucursal || '001').padStart(3, '0')
  const term = String(terminal || '00001').padStart(5, '0')
  const tipo = String(tipoDocumento).padStart(2, '0')
  const sec = String(secuencia).padStart(10, '0')
  return suc + term + tipo + sec
}

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
      uid,           // uid de Firebase del usuario que factura
      receptor,      // { nombre, identificacion: { tipo, numero }, correoElectronico }
      lineas,        // array de LineItemInput (ver README del SDK)
      condicionVenta, // '01' contado, '02' crédito, etc. (default '01')
      medioPago,      // array, ej: ['01'] (default ['01'] efectivo)
      esTiquete,      // true => Tiquete Electrónico (04) en vez de Factura (01)
      secuencia,      // número entero, el consecutivo de ESTA factura para este emisor
      sucursal,       // opcional, default '001'
      terminal,       // opcional, default '00001'
    } = req.body || {}

    if (!uid || !receptor || !Array.isArray(lineas) || !lineas.length || !secuencia) {
      res.status(400).json({
        error: 'Faltan datos: uid, receptor, lineas (array) y secuencia son obligatorios.',
      })
      return
    }

    // ── 1. Pedirle al Worker de Cloudflare el certificado + credenciales ──
    const respCert = await fetch(`${CERTIFICADOS_WORKER_URL}/obtener-certificado-firma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, secreto: process.env.FIRMA_SERVICE_SECRET }),
    })
    const datosCert = await respCert.json()
    if (!respCert.ok) {
      res.status(502).json({ error: 'No se pudo obtener el certificado: ' + (datosCert.error || 'error desconocido') })
      return
    }

    const {
      certificadoBase64, contrasena: p12Pin,
      cedulaEmisor, usuarioHacienda, passwordHacienda,
      actividadEconomica, ambiente,
    } = datosCert

    if (!certificadoBase64 || !cedulaEmisor || !usuarioHacienda || !passwordHacienda || !actividadEconomica) {
      res.status(400).json({
        error: 'Este usuario todavía no completó su configuración de Hacienda (certificado, usuario/contraseña de API, actividad económica). Andá a "Factura Electrónica" en la app y completá esos datos primero.',
      })
      return
    }

    const p12Buffer = Buffer.from(certificadoBase64, 'base64')
    const entorno = ambiente === 'production' ? 'production' : 'sandbox'

    // ── 2. Autenticarse contra Hacienda con las credenciales del cliente ──
    const client = new HaciendaClient({
      environment: entorno,
      credentials: {
        idType: '02', // TODO: si algún cliente factura como persona física, mandar '01' desde el front
        idNumber: cedulaEmisor.replace(/[^0-9]/g, ''),
        password: passwordHacienda,
      },
    })
    await client.authenticate()

    // ── 3. Calcular totales de cada línea y el resumen de la factura ──
    const lineasCalculadas = lineas.map(calculateLineItemTotals)
    const resumen = calculateInvoiceSummary(lineasCalculadas)

    // ── 4. Clave numérica + consecutivo ──
    const tipoDocumento = esTiquete ? DocumentType.TIQUETE_ELECTRONICO : DocumentType.FACTURA_ELECTRONICA
    const codigoTipo = esTiquete ? '04' : '01'

    const clave = buildClave({
      date: new Date(),
      taxpayerId: cedulaEmisor.replace(/[^0-9]/g, ''),
      documentType: tipoDocumento,
      sequence: secuencia,
      situation: Situation.NORMAL,
      branch: sucursal || '001',
      pos: terminal || '00001',
    })
    const numeroConsecutivo = armarNumeroConsecutivo(codigoTipo, secuencia, sucursal, terminal)

    // ── 5. Armar el documento y generar el XML ──
    const documento = {
      clave,
      codigoActividad: actividadEconomica,
      numeroConsecutivo,
      fechaEmision: new Date().toISOString(),
      emisor: {
        nombre: usuarioHacienda.split('@')[0], // razón social; idealmente vendría guardada aparte
        identificacion: { tipo: '02', numero: cedulaEmisor.replace(/[^0-9]/g, '') },
        correoElectronico: usuarioHacienda.includes('@') ? usuarioHacienda : undefined,
      },
      receptor,
      condicionVenta: condicionVenta || '01',
      detalleServicio: lineasCalculadas,
      resumenFactura: {
        ...resumen,
        medioPago: [{ tipoMedioPago: (medioPago && medioPago[0]) || '01', totalMedioPago: resumen.totalComprobante }],
      },
    }

    const validacion = validateFacturaInput(documento)
    if (!validacion.valid) {
      res.status(400).json({
        error: 'La factura no pasó las validaciones de Hacienda.',
        detalles: validacion.errors,
      })
      return
    }

    const xml = esTiquete ? buildTiqueteXml(documento) : buildFacturaXml(documento)

    // ── 6. Firmar de verdad con el certificado del cliente ──
    const xmlFirmadoBase64 = await signAndEncode(xml, p12Buffer, p12Pin)

    // ── 7. Enviar a Hacienda y esperar la respuesta ──
    const baseUrl = entorno === 'production'
      ? 'https://api.comprobanteselectronicos.go.cr/recepcion/v1'
      : 'https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1'

    const httpClient = new HttpClient({
      baseUrl,
      getToken: () => client.getAccessToken(),
    })

    const resultado = await submitAndWait(
      httpClient,
      {
        clave,
        fecha: documento.fechaEmision,
        emisor: {
          tipoIdentificacion: '02',
          numeroIdentificacion: cedulaEmisor.replace(/[^0-9]/g, ''),
        },
        receptor: receptor?.identificacion
          ? {
              tipoIdentificacion: receptor.identificacion.tipo,
              numeroIdentificacion: receptor.identificacion.numero,
            }
          : undefined,
        comprobanteXml: xmlFirmadoBase64,
      },
      { pollIntervalMs: 3000, timeoutMs: 60000 }
    )

    res.status(200).json({
      ok: true,
      aceptado: resultado.accepted,
      motivoRechazo: resultado.accepted ? null : resultado.rejectionReason,
      clave,
      numeroConsecutivo,
      ambiente: entorno,
      xmlFirmadoBase64,
    })
  } catch (err) {
    console.error('Error al firmar/enviar factura:', err)
    res.status(500).json({
      error: 'No se pudo completar la facturación: ' + (err && err.message ? err.message : String(err)),
      codigo: err && err.code ? err.code : undefined,
    })
  }
}
