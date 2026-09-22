/**
 * api/enviar-correo-factura.js
 *
 * Le manda al cliente (receptor) el PDF y el XML firmado de una factura ya
 * ACEPTADA por Hacienda, usando Resend (resend.com). Lo llama la app
 * automáticamente justo después de que "Firmar y Enviar (real)" confirma
 * la aceptación — el usuario ya no tiene que reenviarlo a mano.
 *
 * Variables de entorno que hay que configurar en Vercel:
 * - RESEND_API_KEY: la API key de tu cuenta de Resend.
 * - RESEND_FROM: la dirección remitente, ej.
 *   "Matriz Contable CR <facturas@tudominio.com>"
 *
 * IMPORTANTE sobre RESEND_FROM: el dominio de esa dirección tiene que estar
 * VERIFICADO en Resend (Resend → Domains → Add Domain, agregando los
 * registros DNS que te den en el proveedor donde compraste el dominio).
 * Sin un dominio verificado, Resend solo deja enviar correos a la cuenta
 * con la que te registraste en Resend — no le va a llegar nada a los
 * clientes reales. Un subdominio tuyo alcanza, ej. facturas@kenychinchilla.com
 * o notificaciones@matrizcontablecr.com si ya tenés ese dominio.
 *
 * Nota: como es un solo remitente para TODOS los clientes de Matriz
 * Contable (multi-cliente), el correo se manda "de parte de" cada emisor
 * pero con reply-to puesto al correo real del emisor, para que si el
 * receptor responde, le llegue al negocio y no a KCN.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

function escaparHtml(texto) {
  return String(texto || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
  if (!process.env.RESEND_API_KEY) {
    res.status(500).json({ error: 'Falta configurar RESEND_API_KEY en Vercel.' })
    return
  }
  if (!process.env.RESEND_FROM) {
    res.status(500).json({ error: 'Falta configurar RESEND_FROM en Vercel (remitente con dominio verificado en Resend).' })
    return
  }

  try {
    const {
      receptorEmail,
      receptorNombre,
      emisorNombre,
      emisorEmail,
      clave,
      numeroConsecutivo,
      pdfBase64,
      xmlBase64,
      nombreArchivo,
    } = req.body || {}

    if (!receptorEmail) {
      res.status(400).json({ error: 'Falta el correo del receptor.' })
      return
    }
    if (!pdfBase64) {
      res.status(400).json({ error: 'Falta el PDF de la factura.' })
      return
    }

    const nombreBase = nombreArchivo || ('factura-' + (numeroConsecutivo || clave || Date.now()))

    const attachments = [{ filename: nombreBase + '.pdf', content: pdfBase64 }]
    if (xmlBase64) {
      attachments.push({ filename: nombreBase + '.xml', content: xmlBase64 })
    }

    const asunto =
      'Factura electrónica de ' + (emisorNombre || 'tu proveedor') +
      (numeroConsecutivo ? ' — N° ' + numeroConsecutivo : '')

    const html =
      '<p>Hola' + (receptorNombre ? ' ' + escaparHtml(receptorNombre) : '') + ',</p>' +
      '<p>Adjunto encontrás tu factura electrónica' +
      (emisorNombre ? ' de <b>' + escaparHtml(emisorNombre) + '</b>' : '') +
      ', ya aceptada por el Ministerio de Hacienda.</p>' +
      (clave ? '<p><b>Clave:</b> ' + escaparHtml(clave) + '</p>' : '') +
      (numeroConsecutivo ? '<p><b>Consecutivo:</b> ' + escaparHtml(numeroConsecutivo) + '</p>' : '') +
      '<p>Se adjunta el comprobante en PDF' +
      (xmlBase64 ? ' y el XML firmado (requerido para fines tributarios)' : '') +
      '.</p>' +
      '<p style="color:#888;font-size:12px;">Este correo fue generado automáticamente por Matriz Contable CR.</p>'

    const cuerpo = {
      from: process.env.RESEND_FROM,
      to: [receptorEmail],
      subject: asunto,
      html: html,
      attachments: attachments,
    }
    if (emisorEmail) {
      cuerpo.reply_to = emisorEmail
    }

    const respuesta = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cuerpo),
    })

    const texto = await respuesta.text()
    let datos
    try {
      datos = JSON.parse(texto)
    } catch {
      datos = { raw: texto }
    }

    if (!respuesta.ok) {
      res.status(502).json({
        error: 'Resend rechazó el envío (status ' + respuesta.status + '): ' + (datos.message || texto),
      })
      return
    }

    res.status(200).json({ ok: true, id: datos.id })
  } catch (err) {
    console.error('Error al enviar correo de factura:', err)
    res.status(500).json({
      error: 'No se pudo enviar el correo: ' + (err && err.message ? err.message : String(err)),
    })
  }
}
