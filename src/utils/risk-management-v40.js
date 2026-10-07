/**
 * Matriz Contable CR - Risk Management Utils
 * Versión: v40
 *
 * Funciones para cálculo de VaR, Backtesting, Stress Testing y Scenario Analysis
 */

/**
 * Calcular Value at Risk (VaR) - Método Paramétrico
 *
 * Asume distribución normal de retornos
 * VaR = Valor * Z-score * Volatilidad * sqrt(t)
 */
export const calcularVaRParametrico = (valor, volatilidad, nivelConfianza = 0.95, diasHorizonte = 1) => {
  const zScore = obtenerZScore(nivelConfianza);
  const t = diasHorizonte / 365;

  const var_diario = valor * zScore * volatilidad * Math.sqrt(t);

  return {
    metodo: 'Paramétrico',
    var: var_diario,
    valor,
    volatilidad: volatilidad * 100 + '%',
    nivelConfianza: nivelConfianza * 100 + '%',
    diasHorizonte
  };
};

/**
 * Calcular VaR - Método Histórico
 *
 * Usa distribución empírica de retornos históricos
 */
export const calcularVaRHistorico = (retornos, nivelConfianza = 0.95, valor = 1000000) => {
  // Ordenar retornos de menor a mayor
  const retornosOrdenados = [...retornos].sort((a, b) => a - b);

  // Percentil correspondiente al nivel de confianza
  const indice = Math.ceil(retornosOrdenados.length * (1 - nivelConfianza));
  const peorRetorno = retornosOrdenados[indice];

  const var_historico = valor * Math.abs(peorRetorno);

  return {
    metodo: 'Histórico',
    var: var_historico,
    peorRetorno: (peorRetorno * 100).toFixed(2) + '%',
    nivelConfianza: nivelConfianza * 100 + '%',
    observaciones: retornos.length
  };
};

/**
 * Calcular VaR - Método Monte Carlo
 *
 * Simula miles de escenarios de mercado
 */
export const calcularVaRMonteCarlo = (valor, volatilidad, tasaRendimiento = 0.05, nivelConfianza = 0.95, simulaciones = 10000) => {
  const resultados = [];

  for (let i = 0; i < simulaciones; i++) {
    // Generar número aleatorio con distribución normal
    const z = generarNormalAleatorio();
    const retorno = tasaRendimiento + volatilidad * z;
    const valorFinal = valor * Math.exp(retorno);
    resultados.push(valorFinal);
  }

  // Ordenar y encontrar percentil
  resultados.sort((a, b) => a - b);
  const indice = Math.floor(simulaciones * (1 - nivelConfianza));
  const valorVaR = valor - resultados[indice];

  return {
    metodo: 'Monte Carlo',
    var: valorVaR,
    valor,
    volatilidad: volatilidad * 100 + '%',
    nivelConfianza: nivelConfianza * 100 + '%',
    simulaciones,
    promedio: (resultados.reduce((a, b) => a + b, 0) / simulaciones).toFixed(2),
    minimo: resultados[0].toFixed(2),
    maximo: resultados[simulaciones - 1].toFixed(2)
  };
};

/**
 * Backtesting - Kupiec Proportion of Failures (POF)
 *
 * Verifica si el número de excepciones es consistente con el VaR
 */
export const backtestingKupiecPOF = (excepciones, observaciones, nivelConfianza = 0.95) => {
  const tasaExcepcionEsperada = 1 - nivelConfianza;
  const tasaExcepcionObservada = excepciones / observaciones;

  // Estadístico de prueba LR (Likelihood Ratio)
  const lr = 2 * (
    excepciones * Math.log(tasaExcepcionObservada / tasaExcepcionEsperada) +
    (observaciones - excepciones) * Math.log((1 - tasaExcepcionObservada) / (1 - tasaExcepcionEsperada))
  );

  // Valor crítico chi-cuadrado con 1 grado de libertad
  const valorCritico = 3.841; // 95% confianza
  const aprobado = lr < valorCritico;

  return {
    prueba: 'Kupiec POF',
    excepciones,
    observaciones,
    tasaEsperada: (tasaExcepcionEsperada * 100).toFixed(2) + '%',
    tasaObservada: (tasaExcepcionObservada * 100).toFixed(2) + '%',
    estadisticoLR: lr.toFixed(4),
    valorCritico,
    aprobado,
    resultado: aprobado ? 'Modelo válido' : 'Modelo rechazado'
  };
};

/**
 * Backtesting - Christoffersen Independencia
 *
 * Verifica si las excepciones son independientes en el tiempo
 */
export const backtestingChristoffersen = (excepciones, observaciones) => {
  let n00 = 0, n01 = 0, n10 = 0, n11 = 0;

  // Contar transiciones
  for (let i = 1; i < excepciones.length; i++) {
    if (excepciones[i - 1] === 0 && excepciones[i] === 0) n00++;
    if (excepciones[i - 1] === 0 && excepciones[i] === 1) n01++;
    if (excepciones[i - 1] === 1 && excepciones[i] === 0) n10++;
    if (excepciones[i - 1] === 1 && excepciones[i] === 1) n11++;
  }

  // Estadístico LR de independencia
  const p01 = n01 / (n00 + n01);
  const p11 = n11 / (n10 + n11);
  const pTotal = (n01 + n11) / (n00 + n01 + n10 + n11);

  const lr = 2 * (
    n00 * Math.log((1 - p01) / (1 - pTotal)) +
    n01 * Math.log(p01 / pTotal) +
    n10 * Math.log((1 - p11) / (1 - pTotal)) +
    n11 * Math.log(p11 / pTotal)
  );

  const aprobado = lr < 3.841; // Chi-cuadrado 95%

  return {
    prueba: 'Christoffersen Independencia',
    estadisticoLR: lr.toFixed(4),
    aprobado,
    resultado: aprobado ? 'Excepciones independientes' : 'Excepciones agrupadas'
  };
};

/**
 * Stress Testing - Evaluar impacto en escenarios extremos
 */
export const stressTesting = (posicion, cambios) => {
  const escenarios = [];

  for (const escenario of cambios) {
    const impacto = posicion * escenario.cambio;
    const valorResultante = posicion + impacto;

    escenarios.push({
      nombre: escenario.nombre,
      cambioMercado: (escenario.cambio * 100).toFixed(2) + '%',
      impactoPosicion: impacto.toFixed(2),
      valorResultante: valorResultante.toFixed(2),
      perdida: Math.min(0, impacto).toFixed(2)
    });
  }

  return escenarios;
};

/**
 * Scenario Analysis - Analizar múltiples escenarios macroeconómicos
 */
export const scenarioAnalysis = (posiciones, escenarios) => {
  const resultados = [];

  for (const escenario of escenarios) {
    let valorTotal = 0;
    let impactoTotal = 0;

    for (const pos of posiciones) {
      const impacto = pos.valor * escenario.ponderaciones[pos.tipo];
      valorTotal += pos.valor + impacto;
      impactoTotal += impacto;
    }

    resultados.push({
      escenario: escenario.nombre,
      probabilidad: (escenario.probabilidad * 100).toFixed(2) + '%',
      valorCartera: valorTotal.toFixed(2),
      impactoTotal: impactoTotal.toFixed(2),
      cambioPorc: ((impactoTotal / Object.values(posiciones).reduce((a, b) => a + b.valor, 0)) * 100).toFixed(2) + '%'
    });
  }

  return resultados;
};

/**
 * Calcular ratio de Sharpe
 */
export const calcularSharpe = (retornoCartera, retornoLibreRiesgo, volatilidad) => {
  return (retornoCartera - retornoLibreRiesgo) / volatilidad;
};

/**
 * Calcular correlación entre dos series
 */
export const calcularCorrelacion = (serie1, serie2) => {
  const n = Math.min(serie1.length, serie2.length);
  const media1 = serie1.slice(0, n).reduce((a, b) => a + b) / n;
  const media2 = serie2.slice(0, n).reduce((a, b) => a + b) / n;

  let numerador = 0;
  let denom1 = 0;
  let denom2 = 0;

  for (let i = 0; i < n; i++) {
    const d1 = serie1[i] - media1;
    const d2 = serie2[i] - media2;
    numerador += d1 * d2;
    denom1 += d1 * d1;
    denom2 += d2 * d2;
  }

  return numerador / Math.sqrt(denom1 * denom2);
};

/**
 * Obtener Z-score para nivel de confianza
 */
const obtenerZScore = (nivelConfianza) => {
  const zScores = {
    0.90: 1.28,
    0.95: 1.645,
    0.99: 2.326
  };
  return zScores[nivelConfianza] || 1.645;
};

/**
 * Generar número aleatorio con distribución normal (Box-Muller)
 */
const generarNormalAleatorio = () => {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
};

/**
 * Matriz de correlación
 */
export const matrizCorrelacion = (retornos) => {
  const activos = Object.keys(retornos[0]);
  const matriz = [];

  for (const activo1 of activos) {
    const fila = [];
    for (const activo2 of activos) {
      const serie1 = retornos.map(r => r[activo1]);
      const serie2 = retornos.map(r => r[activo2]);
      const correlacion = calcularCorrelacion(serie1, serie2);
      fila.push(correlacion);
    }
    matriz.push(fila);
  }

  return matriz;
};

export default {
  calcularVaRParametrico,
  calcularVaRHistorico,
  calcularVaRMonteCarlo,
  backtestingKupiecPOF,
  backtestingChristoffersen,
  stressTesting,
  scenarioAnalysis,
  calcularSharpe,
  calcularCorrelacion,
  matrizCorrelacion
};
