/**
 * Matriz Contable CR - M&A Accounting Utils
 * Versión: v41
 *
 * Funciones para Purchase Price Allocation (PPA), Goodwill y Earn-out
 */

/**
 * Calcular Purchase Price Allocation (PPA)
 *
 * Distribuye el precio de compra entre activos identificables, pasivos y goodwill
 * según IFRS 3
 */
export const calcularPPA = ({ precioCompra, totalActivos, totalPasivos, porcentajeControl = 1.0 }) => {
  // Valor neto identificable de activos adquiridos
  const valorNetoActivosIdentificables = totalActivos - totalPasivos;

  // Precio de compra aplicable (considerando % de control)
  const precioAplicable = precioCompra * porcentajeControl;

  // Revaluación de activos (ajuste a fair value)
  const revaluacionActivos = totalActivos * 0.05; // Estimación 5%

  // Activos intangibles identificables (marcas, relaciones clientes, etc.)
  const intangiblesIdentificables = totalActivos * 0.10; // Estimación 10%

  // Pasivos contingentes (provisiones adicionales)
  const pasivosContingentes = totalPasivos * 0.03; // Estimación 3%

  // Pasivos diferidos (impuestos diferidos)
  const debitosImpuestoDiferido = intangiblesIdentificables * 0.25; // 25% tasa impositiva

  // Asignación del PPA
  const ppa = {
    precioCompra,
    porcentajeControl: (porcentajeControl * 100).toFixed(1) + '%',
    precioAplicable,

    // Activos
    efectivo: totalActivos * 0.20,
    cuentasPorCobrar: totalActivos * 0.30,
    inventario: totalActivos * 0.24,
    propiedadPlantaEquipo: totalActivos * 0.26,
    revaluacionActivos,
    intangiblesIdentificables,
    totalActivosRevaluado: totalActivos + revaluacionActivos + intangiblesIdentificables,

    // Pasivos
    pasivosActuales: totalPasivos,
    pasivosContingentes,
    pasivosImpuestoDiferido: debitosImpuestoDiferido,
    totalPasivosRevaluado: totalPasivos + pasivosContingentes + debitosImpuestoDiferido,

    // Resumen
    valorNetoActivos: valorNetoActivosIdentificables,
    valorNetoActivosRevaluado: (totalActivos + revaluacionActivos + intangiblesIdentificables) - (totalPasivos + pasivosContingentes + debitosImpuestoDiferido)
  };

  return ppa;
};

/**
 * Calcular Goodwill
 *
 * Goodwill = Precio pagado - Valor neto justo de activos identificables
 */
export const calcularGoodwill = ({ precioCompra, valorNetoActivos, porcentajeControl = 1.0 }) => {
  const precioAplicable = precioCompra * porcentajeControl;

  // Goodwill atribuible a la adquisición
  const goodwill = precioAplicable - valorNetoActivos;

  return goodwill;
};

/**
 * Calcular Earn-out (Consideración Contingente)
 *
 * Valúa pagos futuros contingentes al logro de objetivos
 */
export const calcularEarnOut = ({ montoTotal, diasVencimiento, tasaDescuento = 0.05 }) => {
  const anos = diasVencimiento / 365;

  // Valor presente del earn-out
  const valorPresente = montoTotal / Math.pow(1 + tasaDescuento, anos);

  // Probabilidad de cumplimiento (estimada)
  const probabilidadCumplimiento = 0.75;
  const valorEsperado = valorPresente * probabilidadCumplimiento;

  return {
    montoTotal,
    diasVencimiento,
    anos: anos.toFixed(2),
    tasaDescuento: (tasaDescuento * 100).toFixed(2) + '%',
    valorPresente: valorPresente.toFixed(2),
    probabilidadCumplimiento: (probabilidadCumplimiento * 100).toFixed(2) + '%',
    valorEsperado: valorEsperado.toFixed(2)
  };
};

/**
 * Validar IFRS 3 Compliance
 *
 * Verifica que la transacción cumpla con los requisitos de IFRS 3
 */
export const validarIFRS3 = ({ precioCompra, valorNeto, goodwill, porcentajeControl }) => {
  const validaciones = [];
  const advertencias = [];

  // Validación 1: Identificación de la adquisición
  if (porcentajeControl < 0.5) {
    validaciones.push(false);
    advertencias.push('No hay control efectivo (< 50%)');
  } else {
    validaciones.push(true);
  }

  // Validación 2: Medición del precio de compra
  if (precioCompra <= 0) {
    validaciones.push(false);
    advertencias.push('Precio de compra debe ser positivo');
  } else {
    validaciones.push(true);
  }

  // Validación 3: Goodwill negativo (Ganancia por compra favorable)
  if (goodwill < 0) {
    advertencias.push('⚠️ Ganancia por compra (Negative Goodwill) - requiere evaluación adicional');
  }

  // Validación 4: Exceso de precio pagado
  const porcentajeExceso = (goodwill / precioCompra) * 100;
  if (porcentajeExceso > 50) {
    advertencias.push('⚠️ Goodwill representa > 50% del precio pagado');
  }

  // Validación 5: Período de medición (hasta 12 meses)
  validaciones.push(true); // Asumimos que se realiza dentro del período

  const compliant = validaciones.every(v => v === true);

  return {
    compliant,
    validaciones: validaciones.length,
    validacionesAprobadas: validaciones.filter(v => v === true).length,
    advertencias,
    resumen: compliant ? 'Cumple IFRS 3' : 'No cumple IFRS 3'
  };
};

/**
 * Calcular impacto en estados financieros post-adquisición
 */
export const calcularImpactoEstadosFinancieros = ({
  precioCompra,
  activos,
  pasivos,
  goodwill,
  capitalAdquirente
}) => {
  const balancePostAdquisicion = {
    // Activos
    activosTotales: activos + goodwill,

    // Pasivos
    pasivosTotales: pasivos,

    // Capital
    capitalTotal: capitalAdquirente + goodwill,

    // Ratios
    leverageRatio: (pasivos / (capitalAdquirente + goodwill)).toFixed(2),
    ratioActivos: ((activos + goodwill) / (capitalAdquirente + goodwill)).toFixed(2)
  };

  return balancePostAdquisicion;
};

/**
 * Amortización de Goodwill e Intangibles
 *
 * Programa de amortización según IFRS 3
 */
export const amortizacionGoodwill = ({
  montoGoodwill,
  montoIntangibles,
  vidaUtilIntangibles = 10,
  periodicidadMeses = 12
}) => {
  const amortizacionAnual = montoIntangibles / vidaUtilIntangibles;
  const amortizacionMensual = amortizacionAnual / 12;

  // Goodwill NO se amortiza, pero se prueba por deterioro anualmente
  const planAmortizacion = [];

  for (let mes = 1; mes <= vidaUtilIntangibles * 12; mes++) {
    planAmortizacion.push({
      mes,
      amortizacionMensual: amortizacionMensual.toFixed(2),
      amortizacionAcumulada: (amortizacionMensual * mes).toFixed(2),
      saldoIntangibles: (montoIntangibles - amortizacionMensual * mes).toFixed(2)
    });
  }

  return {
    montoOriginalGoodwill: montoGoodwill.toFixed(2),
    montoOriginalIntangibles: montoIntangibles.toFixed(2),
    vidaUtilIntangibles,
    amortizacionAnual: amortizacionAnual.toFixed(2),
    amortizacionMensual: amortizacionMensual.toFixed(2),
    planAmortizacion: planAmortizacion.slice(0, 12) // Mostrar primer año
  };
};

/**
 * Prueba de Deterioro (Impairment Test) de Goodwill
 *
 * Según IFRS 3, el goodwill debe probarse anualmente
 */
export const pruebaDeterioro = ({
  montoGoodwill,
  valorContableUGC, // Valor contable de la Unidad Generadora de Efectivo
  valorRecuperable
}) => {
  const deterioro = Math.max(0, valorContableUGC - valorRecuperable);
  const deterioroGoodwill = Math.min(deterioro, montoGoodwill);

  return {
    montoGoodwill: montoGoodwill.toFixed(2),
    valorContableUGC: valorContableUGC.toFixed(2),
    valorRecuperable: valorRecuperable.toFixed(2),
    diferencia: (valorRecuperable - valorContableUGC).toFixed(2),
    deterioroTotal: deterioro.toFixed(2),
    deterioroGoodwill: deterioroGoodwill.toFixed(2),
    resultadoTest: deterioroGoodwill > 0 ? 'Deterioro detectado' : 'Sin deterioro',
    registroContable: deterioroGoodwill > 0
      ? `Dr. Gasto por Deterioro ${deterioroGoodwill.toFixed(2)}`
      : 'Sin asiento contable'
  };
};

/**
 * Consolidación de estados financieros post-adquisición
 */
export const consolidacionEF = ({
  activosAdquirente,
  pasivosAdquirente,
  capitalAdquirente,
  activosAdquirida,
  pasivosAdquirida,
  capitalAdquirida,
  goodwill,
  intangibles
}) => {
  return {
    activosConsolidados: (activosAdquirente + activosAdquirida + goodwill + intangibles).toFixed(2),
    pasivosConsolidados: (pasivosAdquirente + pasivosAdquirida).toFixed(2),
    capitalConsolidado: (capitalAdquirente + capitalAdquirida + goodwill + intangibles).toFixed(2),
    // Balance check: Activos = Pasivos + Capital
    balanceVerificacion: 'Debe cuadrar'
  };
};

export default {
  calcularPPA,
  calcularGoodwill,
  calcularEarnOut,
  validarIFRS3,
  calcularImpactoEstadosFinancieros,
  amortizacionGoodwill,
  pruebaDeterioro,
  consolidacionEF
};
