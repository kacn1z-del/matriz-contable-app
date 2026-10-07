/**
 * Matriz Contable CR - Integraciones Utils
 * Versión: v42
 *
 * Funciones para REST APIs, Webhooks, WebSocket sync y Export/Import
 */

/**
 * Configurar y validar integración API
 */
export const validarIntegracionAPI = ({ url, autenticacion, token }) => {
  const errores = [];

  // Validar URL
  try {
    new URL(url);
  } catch {
    errores.push('URL inválida');
  }

  // Validar autenticación
  if (autenticacion !== 'ninguna' && !token) {
    errores.push('Token requerido para este tipo de autenticación');
  }

  // Validar protocolo
  if (!url.startsWith('https://')) {
    errores.push('Debe usar HTTPS para seguridad');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Preparar headers de autenticación
 */
export const prepararHeadersAuth = ({ autenticacion, token, clientId, clientSecret }) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  switch (autenticacion) {
    case 'bearer':
      headers['Authorization'] = `Bearer ${token}`;
      break;
    case 'api_key':
      headers['X-API-Key'] = token;
      break;
    case 'basic':
      headers['Authorization'] = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
      break;
    case 'oauth':
      headers['Authorization'] = `Bearer ${token}`;
      break;
  }

  return headers;
};

/**
 * Serializar datos para envío a API
 */
export const serializarDatos = (datos, formato = 'json') => {
  switch (formato) {
    case 'json':
      return JSON.stringify(datos);

    case 'csv':
      return convertirACSV(datos);

    case 'xml':
      return convertirAXML(datos);

    case 'form-data':
      return new FormData(datos);

    default:
      return JSON.stringify(datos);
  }
};

/**
 * Convertir datos a CSV
 */
const convertirACSV = (datos) => {
  if (!Array.isArray(datos) || datos.length === 0) return '';

  // Encabezados
  const headers = Object.keys(datos[0]);
  const csv = [headers.join(',')];

  // Filas
  for (const fila of datos) {
    const valores = headers.map(h => {
      const valor = fila[h];
      // Escapar comillas
      return typeof valor === 'string' ? `"${valor.replace(/"/g, '""')}"` : valor;
    });
    csv.push(valores.join(','));
  }

  return csv.join('\n');
};

/**
 * Convertir datos a XML
 */
const convertirAXML = (datos) => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';

  if (Array.isArray(datos)) {
    for (const item of datos) {
      xml += '  <item>\n';
      for (const [key, value] of Object.entries(item)) {
        xml += `    <${key}>${value}</${key}>\n`;
      }
      xml += '  </item>\n';
    }
  } else {
    for (const [key, value] of Object.entries(datos)) {
      xml += `  <${key}>${value}</${key}>\n`;
    }
  }

  xml += '</root>';
  return xml;
};

/**
 * Configurar Webhook
 */
export const configurarWebhook = ({ nombre, evento, urlDestino, encabezados = {} }) => {
  const webhook = {
    id: generarId(),
    nombre,
    evento,
    urlDestino,
    encabezados,
    activo: true,
    intentosFallidos: 0,
    ultimoIntento: null,
    configuradoEn: new Date().toISOString()
  };

  return webhook;
};

/**
 * Enviar evento a Webhook
 */
export const enviarWebhook = async (webhook, datos) => {
  try {
    const payload = {
      evento: webhook.evento,
      timestamp: new Date().toISOString(),
      datos
    };

    const response = await fetch(webhook.urlDestino, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...webhook.encabezados
      },
      body: JSON.stringify(payload)
    });

    return {
      exitoso: response.ok,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      exitoso: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Configurar conexión WebSocket
 */
export const configurarWebSocket = (url) => {
  const socket = {
    url,
    conectado: false,
    suscripciones: [],
    ultimoMensaje: null,
    intentosReconexion: 0,
    maxReintentos: 5
  };

  return socket;
};

/**
 * Manejo de reconexión automática
 */
export const reconexionAutomatica = (socket) => {
  if (socket.intentosReconexion >= socket.maxReintentos) {
    return { exitoso: false, mensaje: 'Máximo de intentos de reconexión alcanzado' };
  }

  socket.intentosReconexion++;
  const tiempoEspera = Math.pow(2, socket.intentosReconexion) * 1000; // Exponential backoff

  return {
    exitoso: true,
    proximoIntento: tiempoEspera,
    intentoActual: socket.intentosReconexion
  };
};

/**
 * Procesar mensaje WebSocket
 */
export const procesarMensajeWebSocket = (mensaje) => {
  try {
    const datos = JSON.parse(mensaje);

    return {
      procesado: true,
      tipo: datos.tipo,
      datos: datos.payload,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      procesado: false,
      error: 'Formato de mensaje inválido'
    };
  }
};

/**
 * Exportar datos a formato especificado
 */
export const exportarDatos = (datos, formato = 'json') => {
  let contenido;
  let mimetype;
  let extension;

  switch (formato) {
    case 'csv':
      contenido = convertirACSV(datos);
      mimetype = 'text/csv';
      extension = 'csv';
      break;

    case 'json':
      contenido = JSON.stringify(datos, null, 2);
      mimetype = 'application/json';
      extension = 'json';
      break;

    case 'xml':
      contenido = convertirAXML(datos);
      mimetype = 'application/xml';
      extension = 'xml';
      break;

    case 'pdf':
      // En producción usaría librería como jsPDF
      contenido = generarPDFSimulado(datos);
      mimetype = 'application/pdf';
      extension = 'pdf';
      break;

    case 'xlsx':
      // En producción usaría XLSX library
      contenido = generarExcelSimulado(datos);
      mimetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
      break;

    default:
      contenido = JSON.stringify(datos, null, 2);
      mimetype = 'application/json';
      extension = 'json';
  }

  return {
    contenido,
    mimetype,
    extension,
    nombreArchivo: `export-${Date.now()}.${extension}`,
    tamanio: new Blob([contenido]).size
  };
};

/**
 * Importar datos de archivo
 */
export const importarDatos = async (archivo, formato) => {
  try {
    let datos;

    switch (formato) {
      case 'json':
        datos = JSON.parse(await archivo.text());
        break;

      case 'csv':
        datos = parsearCSV(await archivo.text());
        break;

      case 'xml':
        datos = parsearXML(await archivo.text());
        break;

      default:
        throw new Error('Formato no soportado');
    }

    // Validar datos importados
    const validacion = validarDatosImportados(datos);

    return {
      exitoso: validacion.valido,
      cantidad: Array.isArray(datos) ? datos.length : 1,
      datos,
      advertencias: validacion.advertencias
    };
  } catch (error) {
    return {
      exitoso: false,
      error: error.message
    };
  }
};

/**
 * Parsear CSV
 */
const parsearCSV = (csv) => {
  const lineas = csv.trim().split('\n');
  if (lineas.length < 2) return [];

  const encabezados = lineas[0].split(',');
  const datos = [];

  for (let i = 1; i < lineas.length; i++) {
    const valores = lineas[i].split(',');
    const objeto = {};

    for (let j = 0; j < encabezados.length; j++) {
      objeto[encabezados[j].trim()] = valores[j]?.trim() || '';
    }

    datos.push(objeto);
  }

  return datos;
};

/**
 * Parsear XML
 */
const parsearXML = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  if (doc.getElementsByTagName('parsererror').length > 0) {
    throw new Error('XML inválido');
  }

  const datos = [];
  const items = doc.getElementsByTagName('item');

  for (let i = 0; i < items.length; i++) {
    const objeto = {};
    const children = items[i].children;

    for (let j = 0; j < children.length; j++) {
      objeto[children[j].tagName] = children[j].textContent;
    }

    datos.push(objeto);
  }

  return datos;
};

/**
 * Validar datos importados
 */
const validarDatosImportados = (datos) => {
  const advertencias = [];

  if (!Array.isArray(datos) && typeof datos !== 'object') {
    return { valido: false, advertencias: ['Formato de datos inválido'] };
  }

  if (Array.isArray(datos) && datos.length === 0) {
    advertencias.push('Archivo vacío o sin registros');
  }

  return { valido: true, advertencias };
};

/**
 * Generar PDF simulado
 */
const generarPDFSimulado = (datos) => {
  return 'PDF_SIMULADO_' + JSON.stringify(datos).substring(0, 50);
};

/**
 * Generar Excel simulado
 */
const generarExcelSimulado = (datos) => {
  return 'XLSX_SIMULADO_' + JSON.stringify(datos).substring(0, 50);
};

/**
 * Generar ID único
 */
const generarId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Sincronización bidireccional
 */
export const sincronizacionBidireccional = (datosLocales, datosRemoto) => {
  const resultado = {
    crear: [],
    actualizar: [],
    eliminar: [],
    conflictos: []
  };

  // Registros a crear (en local pero no en remoto)
  for (const local of datosLocales) {
    if (!datosRemoto.find(r => r.id === local.id)) {
      resultado.crear.push(local);
    }
  }

  // Registros a eliminar (en remoto pero no en local)
  for (const remoto of datosRemoto) {
    if (!datosLocales.find(l => l.id === remoto.id)) {
      resultado.eliminar.push(remoto);
    }
  }

  // Conflictos (modificado en ambos)
  for (const local of datosLocales) {
    const remoto = datosRemoto.find(r => r.id === local.id);
    if (remoto && local.modificado !== remoto.modificado) {
      resultado.conflictos.push({ local, remoto });
    }
  }

  return resultado;
};

export default {
  validarIntegracionAPI,
  prepararHeadersAuth,
  serializarDatos,
  configurarWebhook,
  enviarWebhook,
  configurarWebSocket,
  reconexionAutomatica,
  procesarMensajeWebSocket,
  exportarDatos,
  importarDatos,
  sincronizacionBidireccional
};
