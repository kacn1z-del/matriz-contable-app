/**
 * Matriz Contable CR - Funciones Helper
 * Versión: v39.5
 *
 * Funciones utilitarias para la aplicación
 */

/**
 * Formatos de moneda
 */
export const formatearMoneda = (valor, moneda = 'CRC') => {
  const formatadores = {
    'CRC': { simbolo: '₡', decimales: 2, posicion: 'izquierda' },
    'USD': { simbolo: '$', decimales: 2, posicion: 'izquierda' },
    'EUR': { simbolo: '€', decimales: 2, posicion: 'derecha' }
  };

  const config = formatadores[moneda] || formatadores['USD'];
  const numero = parseFloat(valor).toFixed(config.decimales);

  return config.posicion === 'izquierda'
    ? `${config.simbolo}${numero}`
    : `${numero} ${config.simbolo}`;
};

/**
 * Formatos de porcentaje
 */
export const formatearPorcentaje = (valor, decimales = 2) => {
  return `${(valor * 100).toFixed(decimales)}%`;
};

/**
 * Formatos de fecha
 */
export const formatearFecha = (fecha, formato = 'dd/MM/yyyy') => {
  const date = new Date(fecha);

  const opciones = {
    'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
    'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
    'DD MMMM YYYY': { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    'corto': { day: 'numeric', month: 'short', year: 'numeric' }
  };

  return date.toLocaleDateString('es-CR', opciones[formato] || opciones['dd/MM/yyyy']);
};

/**
 * Formatos de hora
 */
export const formatearHora = (fecha, formato = 'HH:mm:ss') => {
  const date = new Date(fecha);
  return date.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * Validar email
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar número
 */
export const validarNumero = (valor, min = null, max = null) => {
  const num = parseFloat(valor);

  if (isNaN(num)) return false;
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;

  return true;
};

/**
 * Validar cédula de Costa Rica
 */
export const validarCedulaCR = (cedula) => {
  // Formato: 12-3456-7890
  const regex = /^[0-9]{2}-[0-9]{4}-[0-9]{4}$/;

  if (!regex.test(cedula)) return false;

  const digitos = cedula.replace(/-/g, '');
  const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 8; i++) {
    suma += parseInt(digitos[i]) * coeficientes[i];
  }

  const digito_verificador = (10 - (suma % 10)) % 10;
  return digito_verificador === parseInt(digitos[8]);
};

/**
 * Calcular edad
 */
export const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const fecha = new Date(fechaNacimiento);

  let edad = hoy.getFullYear() - fecha.getFullYear();
  const diferenciaMes = hoy.getMonth() - fecha.getMonth();

  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  return edad;
};

/**
 * Generar UUID
 */
export const generarUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Truncar texto
 */
export const truncarTexto = (texto, longitud = 50) => {
  if (texto.length <= longitud) return texto;
  return texto.substring(0, longitud) + '...';
};

/**
 * Capitalizar primera letra
 */
export const capitalizarPrimeraLetra = (texto) => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Convertir a mayúsculas permanentes
 */
export const aMAYUSCULAS = (texto) => {
  return texto.toUpperCase();
};

/**
 * Convertir a minúsculas permanentes
 */
export const aMinusculas = (texto) => {
  return texto.toLowerCase();
};

/**
 * Remover espacios en blanco
 */
export const removerEspacios = (texto) => {
  return texto.replace(/\s/g, '');
};

/**
 * Calcular checksum (simple)
 */
export const calcularChecksum = (datos) => {
  let checksum = 0;

  for (let i = 0; i < datos.length; i++) {
    checksum += datos.charCodeAt(i);
  }

  return checksum.toString(16);
};

/**
 * Ordenar array de objetos
 */
export const ordenar = (array, campo, direccion = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[campo] < b[campo]) return direccion === 'asc' ? -1 : 1;
    if (a[campo] > b[campo]) return direccion === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filtrar array
 */
export const filtrar = (array, campo, valor) => {
  return array.filter(item =>
    item[campo].toString().toLowerCase().includes(valor.toLowerCase())
  );
};

/**
 * Agrupar array por campo
 */
export const agruparPor = (array, campo) => {
  return array.reduce((grupos, item) => {
    const clave = item[campo];
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(item);
    return grupos;
  }, {});
};

/**
 * Calcular suma de array
 */
export const calcularSuma = (array, campo) => {
  return array.reduce((suma, item) => suma + (parseFloat(item[campo]) || 0), 0);
};

/**
 * Calcular promedio
 */
export const calcularPromedio = (array, campo) => {
  const suma = calcularSuma(array, campo);
  return suma / array.length;
};

/**
 * Encontrar máximo
 */
export const encontrarMaximo = (array, campo) => {
  return Math.max(...array.map(item => parseFloat(item[campo]) || 0));
};

/**
 * Encontrar mínimo
 */
export const encontrarMinimo = (array, campo) => {
  return Math.min(...array.map(item => parseFloat(item[campo]) || 0));
};

/**
 * Descargar JSON como archivo
 */
export const descargarJSON = (datos, nombreArchivo = 'export.json') => {
  const contenido = JSON.stringify(datos, null, 2);
  const blob = new Blob([contenido], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copiar al portapapeles
 */
export const copiarAlPortapapeles = (texto) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(texto);
  } else {
    // Fallback para navegadores antiguos
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

/**
 * Debounce - evitar múltiples llamadas
 */
export const debounce = (funcion, espera) => {
  let timeout;

  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => funcion(...args), espera);
  };
};

/**
 * Throttle - limitar llamadas
 */
export const throttle = (funcion, limite) => {
  let ultimaLlamada = 0;

  return function(...args) {
    const ahora = Date.now();
    if (ahora - ultimaLlamada >= limite) {
      funcion(...args);
      ultimaLlamada = ahora;
    }
  };
};

/**
 * Retry con backoff exponencial
 */
export const reintentar = async (funcion, maxIntentos = 3, espera = 1000) => {
  for (let intento = 0; intento < maxIntentos; intento++) {
    try {
      return await funcion();
    } catch (error) {
      if (intento === maxIntentos - 1) throw error;

      const tiempoEspera = espera * Math.pow(2, intento);
      await new Promise(resolve => setTimeout(resolve, tiempoEspera));
    }
  }
};

/**
 * Esperar (sleep)
 */
export const esperar = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default {
  formatearMoneda,
  formatearPorcentaje,
  formatearFecha,
  formatearHora,
  validarEmail,
  validarNumero,
  validarCedulaCR,
  calcularEdad,
  generarUUID,
  truncarTexto,
  capitalizarPrimeraLetra,
  aMAYUSCULAS,
  aMinusculas,
  removerEspacios,
  calcularChecksum,
  ordenar,
  filtrar,
  agruparPor,
  calcularSuma,
  calcularPromedio,
  encontrarMaximo,
  encontrarMinimo,
  descargarJSON,
  copiarAlPortapapeles,
  debounce,
  throttle,
  reintentar,
  esperar
};
