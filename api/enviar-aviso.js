/**
 * Avisos con condición por correo (como las "notificaciones condicionales"
 * de Google Sheets).
 *
 * POST /api/enviar-aviso
 *   { "idToken": "<token de Firebase de quien hizo el cambio>", "para": "correo@…",
 *     "matrizId": "…" (opcional), "asunto": "…", "texto": "…" }
 *
 * Seguridad:
 *  - El token de Firebase se verifica con las llaves públicas de Google.
 *  - Sin matrizId, solo se puede mandar al propio correo de quien llama.
 *  - Con matrizId, se lee la matriz en Firestore CON EL TOKEN de quien llama
 *    (o sea, aplicando las reglas): si no tiene acceso, no se manda; y el
 *    destinatario tiene que ser el dueño o alguien con quien está compartida.
 *
 * Usa las variables de Vercel que ya existen para las facturas:
 *   RESEND_API_KEY y RESEND_FROM
 */
import crypto from 'crypto'

const PROYECTO = 'matriz-contable-cr-app'
const URL_LLAVES = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
let llavesCache = { llaves: null, vence: 0 }

function base64urlADatos(s) {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

async function llavesGoogle() {
  if (llavesCache.llaves && Date.now() < llavesCache.vence) return llavesCache.llaves
  const r = await fetch(URL_LLAVES)
  const llaves = await r.json()
  const cc = r.headers.get('cache-control') || ''
  const m = /max-age=(\d+)/.exec(cc)
  llavesCache = { llaves, vence: Date.now() + (m ? Number(m[1]) * 1000 : 3600000) }
  return llaves
}

// Verifica un ID token de Firebase y devuelve sus datos (o lanza un error)
async function verificarToken(token) {
  const partes = String(token || '').split('.')
  if (partes.length !== 3) throw new Error('token inválido')
  const cabecera = JSON.parse(base64urlADatos(partes[0]).toString('utf8'))
  const datos = JSON.parse(base64urlADatos(partes[1]).toString('utf8'))
  if (cabecera.alg !== 'RS256') throw new Error('token inválido')
  const llaves = await llavesGoogle()
  const cert = llaves[cabecera.kid]
  if (!cert) throw new Error('token vencido o inválido')
  const ok = crypto.createVerify('RSA-SHA256').update(partes[0] + '.' + partes[1]).verify(cert, base64urlADatos(partes[2]))
  if (!ok) throw new Error('firma inválida')
  const ahora = Math.floor(Date.now() / 1000)
  if (datos.aud !== PROYECTO || datos.iss !== 'https://securetoken.google.com/' + PROYECTO) throw new Error('token de otro proyecto')
  if (!datos.exp || datos.exp < ahora - 60) throw new Error('token vencido')
  if (!datos.email) throw new Error('la cuenta no tiene correo')
  return datos
}

// Lee la matriz con el token de quien llama (aplican las reglas de Firestore)
async function personasDeMatriz(matrizId, token) {
  const url = 'https://firestore.googleapis.com/v1/projects/' + PROYECTO + '/databases/(default)/documents/matrices/' +
    encodeURIComponent(matrizId) + '?mask.fieldPaths=ownerEmail&mask.fieldPaths=sharedWith'
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } })
  if (!r.ok) throw new Error('sin acceso a la matriz')
  const doc = await r.json()
  const campos = doc.fields || {}
  const lista = []
  if (campos.ownerEmail && campos.ownerEmail.stringValue) lista.push(campos.ownerEmail.stringValue.toLowerCase())
  const sw = campos.sharedWith && campos.sharedWith.arrayValue && campos.sharedWith.arrayValue.values
  ;(sw || []).forEach((v) => { if (v.stringValue) lista.push(v.stringValue.toLowerCase()) })
  return lista
}

function escapar(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
    res.status(405).json({ error: 'Usá POST' })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch (e) {
      body = {}
    }
  }
  body = body || {}

  try {
    const quien = await verificarToken(body.idToken)
    const para = String(body.para || '').trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(para)) throw new Error('correo de destino inválido')

    if (body.matrizId) {
      const gente = await personasDeMatriz(String(body.matrizId), body.idToken)
      if (gente.indexOf(para) === -1) throw new Error('ese correo no tiene acceso a la matriz')
    } else if (para !== String(quien.email).toLowerCase()) {
      throw new Error('sin matriz de la nube solo se puede avisar a tu propio correo')
    }

    const asunto = String(body.asunto || '🔔 Aviso de Matriz Contable CR').slice(0, 150)
    const texto = String(body.texto || '').slice(0, 3000)
    const html =
      '<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #e5e7eb;border-radius:14px">' +
      '<h2 style="margin:0 0 10px;color:#217346">' + escapar(asunto) + '</h2>' +
      '<pre style="white-space:pre-wrap;font-family:inherit;font-size:15px;color:#1f2937;margin:0">' + escapar(texto) + '</pre>' +
      '<p style="color:#9ca3af;font-size:12px;margin-top:18px">Este aviso lo configuró una regla en Matriz Contable CR. El cambio lo hizo ' + escapar(quien.email) + '.</p></div>'

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: [para], subject: asunto, html, text: texto }),
    })
    const respuesta = await r.json().catch(() => ({}))
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, resend: respuesta })
  } catch (err) {
    res.status(400).json({ error: String((err && err.message) || err) })
  }
}
