/**
 * Matriz Contable CR - Derivados Avanzados Utils
 * Versión: v39.2
 *
 * Funciones para cálculo de Greeks, XVA y valuación de derivados
 */

/**
 * Calcular Greeks (sensibilidades del precio)
 *
 * Greeks son medidas que indican cómo cambia el precio de una opción
 * ante cambios en variables de mercado
 */
export const calcularGreeks = ({ tipoDerivado, notional, strike, tasaFija, volatilidad, vencimiento }) => {
  const t = vencimiento / 365; // Convertir a años
  const sigma = volatilidad;

  // Black-Scholes parameters
  const r = tasaFija / 100;
  const S = notional;
  const K = strike || notional;

  const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * t) / (sigma * Math.sqrt(t));
  const d2 = d1 - sigma * Math.sqrt(t);

  const N_d1 = normalizacion(d1);
  const N_minus_d1 = normalizacion(-d1);
  const n_d1 = 1 / Math.sqrt(2 * Math.PI) * Math.exp(-d1 * d1 / 2);

  return {
    delta: N_d1, // Cambio en precio vs cambio en subyacente
    gamma: n_d1 / (S * sigma * Math.sqrt(t)), // Cambio en delta
    theta: -(S * n_d1 * sigma) / (2 * Math.sqrt(t)) - r * K * Math.exp(-r * t) * normalizacion(d2), // Decaimiento de tiempo
    vega: S * n_d1 * Math.sqrt(t) / 100, // Cambio vs cambio en volatilidad
    rho: K * t * Math.exp(-r * t) * normalizacion(d2) / 100, // Cambio vs cambio en tasas
    lambda: (N_d1 * S) / (K * Math.exp(-r * t)) // Elasticidad
  };
};

/**
 * Calcular XVA (Xva Valuation Adjustment)
 *
 * Ajustes de valuación que refleja el costo real de una posición derivada:
 * - CVA: Credit Valuation Adjustment (riesgo de contraparte)
 * - DVA: Debit Valuation Adjustment (riesgo propio)
 * - FVA: Funding Valuation Adjustment (costo de funding)
 * - KVA: Capital Valuation Adjustment (requisitos de capital)
 * - MVA: Margin Valuation Adjustment (costo de margen)
 * - CollVA: Collateral Valuation Adjustment (costo de colateral)
 */
export const calcularXVA = ({ notional, volatilidad, colateral, diasAlVencimiento, tipoDerivado }) => {
  const t = diasAlVencimiento / 365;

  // Tasas de mercado (simuladas)
  const tasaLibre = 0.02; // SOFR
  const tasaFunding = 0.035; // Con spread
  const tasaCapital = 0.12; // Cost of capital
  const tasaMargen = 0.04; // Costo de margen

  // CVA: Riesgo de crédito de contraparte
  const pd = 0.01; // Probabilidad de default
  const lGD = 0.6; // Loss Given Default
  const ead = notional * Math.max(0, volatilidad * Math.sqrt(t)); // Exposure at Default
  const cva = pd * lGD * ead * t;

  // DVA: Riesgo de crédito propio (típicamente 60% de CVA)
  const dva = cva * 0.6;

  // FVA: Costo de financing
  const fva = notional * (tasaFunding - tasaLibre) * t;

  // KVA: Capital requerido (8% de RWA)
  const capitalRequerido = notional * 0.08;
  const kva = capitalRequerido * tasaCapital * t;

  // MVA: Costo de Initial Margin
  const margen = notional * 0.15; // 15% de notional
  const mva = margen * tasaMargen * t;

  // CollVA: Costo de mantener colateral
  const collva = Math.max(0, (margen - colateral) * tasaFunding * t);

  return {
    cva: cva,
    dva: dva,
    fva: fva,
    kva: kva,
    mva: mva,
    collva: collva,
    totalXVA: cva + dva + fva + kva + mva + collva
  };
};

/**
 * Calcular tasa de descuento (Yield curve)
 */
export const tasaDescuento = (dias = 30) => {
  // Yield curve simplificada (en producción sería más compleja)
  const curva = {
    30: 0.0245,
    90: 0.0250,
    180: 0.0260,
    365: 0.0275
  };

  return curva[dias] || 0.0250;
};

/**
 * Calcular volatilidad implícita
 */
export const volatilidadImplicita = (precioOpcion, S, K, r, t) => {
  // Usar método de Newton-Raphson para encontrar sigma
  let sigma = 0.2; // Estimación inicial

  for (let i = 0; i < 100; i++) {
    const precio = precioOpcionBS(S, K, r, t, sigma);
    const vega = S * normalizacion(d1_simple(S, K, r, t, sigma)) * Math.sqrt(t);

    sigma = sigma - (precio - precioOpcion) / vega;

    if (Math.abs(precio - precioOpcion) < 0.001) break;
  }

  return sigma;
};

/**
 * Función auxiliar: Distribución normal acumulada
 */
export const normalizacion = (x) => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

/**
 * Error function approximation
 */
const erf = (x) => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

/**
 * Precio de Black-Scholes
 */
const precioOpcionBS = (S, K, r, t, sigma) => {
  const d1 = d1_simple(S, K, r, t, sigma);
  const d2 = d1 - sigma * Math.sqrt(t);

  return S * normalizacion(d1) - K * Math.exp(-r * t) * normalizacion(d2);
};

/**
 * Calcular d1 para Black-Scholes
 */
const d1_simple = (S, K, r, t, sigma) => {
  return (Math.log(S / K) + (r + sigma * sigma / 2) * t) / (sigma * Math.sqrt(t));
};

/**
 * Calcular Mark-to-Market de un swap
 */
export const calcularMTMSwap = (notional, tasaFija, tasaFlotante, diasVencimiento) => {
  const t = diasVencimiento / 365;
  const r = tasaDescuento(diasVencimiento);

  // PV Leg fijo - PV Leg flotante
  const pvFijo = notional * tasaFija * t * Math.exp(-r * t);
  const pvFlotante = notional * tasaFlotante * t * Math.exp(-r * t);

  return pvFijo - pvFlotante;
};

/**
 * Validar inputs de derivado
 */
export const validarDerivado = ({ notional, strike, volatilidad, tasaFija, tasaFlotante }) => {
  const errores = [];

  if (notional <= 0) errores.push('Notional debe ser positivo');
  if (volatilidad < 0 || volatilidad > 2) errores.push('Volatilidad debe estar entre 0 y 200%');
  if (tasaFija < -0.1 || tasaFija > 0.5) errores.push('Tasa fija fuera de rango');
  if (tasaFlotante < -0.1 || tasaFlotante > 0.5) errores.push('Tasa flotante fuera de rango');

  return {
    valido: errores.length === 0,
    errores
  };
};

export default {
  calcularGreeks,
  calcularXVA,
  tasaDescuento,
  volatilidadImplicita,
  normalizacion,
  calcularMTMSwap,
  validarDerivado
};
