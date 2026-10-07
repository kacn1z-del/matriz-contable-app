/**
 * Matriz Contable CR - M&A Accounting
 * Versión: v41
 *
 * Componente para contabilidad de fusiones y adquisiciones
 * - IFRS 3 compliance
 * - Purchase Price Allocation (PPA)
 * - Goodwill calculation
 * - Earn-out valuation
 */

import React, { useState } from 'react';
import {
  calcularPPA,
  calcularGoodwill,
  calcularEarnOut,
  validarIFRS3
} from '../utils/ma-accounting-v41';
import '../styles/MAAccounting.css';

export default function MAAccounting() {
  const [transacciones, setTransacciones] = useState([]);
  const [formulario, setFormulario] = useState({
    nombreTransaccion: '',
    empresaAdquirida: '',
    precioCompra: 0,
    fechaCierre: new Date().toISOString().split('T')[0],
    tipoComprador: 'empresa',
    porcentajeControl: 100,
    moneda: 'USD'
  });

  const [detallesActivos, setDetallesActivos] = useState({
    efectivo: 0,
    cuentasxCobrar: 0,
    inventario: 0,
    propiedadPlanta: 0,
    intangibles: 0,
    otrosActivos: 0
  });

  const [detallesPasivos, setDetallesPasivos] = useState({
    cuentasxPagar: 0,
    deudaCortoplazo: 0,
    deudaLargoplazo: 0,
    obligacionesLaborales: 0,
    otrosPasivos: 0
  });

  const [earnOut, setEarnOut] = useState({
    montoTotal: 0,
    condiciones: '',
    periodoDias: 365,
    tasaDescuento: 0.05
  });

  const [ppaCalculado, setPPACalculado] = useState(null);
  const [goodwillCalculado, setGoodwillCalculado] = useState(null);
  const [ifrs3Check, setIFRS3Check] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Agregar transacción M&A
  const agregarTransaccion = (e) => {
    e.preventDefault();

    if (!formulario.nombreTransaccion || formulario.precioCompra <= 0) {
      setMensaje('❌ Completa todos los campos requeridos');
      return;
    }

    // Calcular totales de activos y pasivos
    const totalActivos = Object.values(detallesActivos).reduce((a, b) => a + b, 0);
    const totalPasivos = Object.values(detallesPasivos).reduce((a, b) => a + b, 0);
    const valorNeto = totalActivos - totalPasivos;

    // Calcular PPA
    const ppa = calcularPPA({
      precioCompra: formulario.precioCompra,
      totalActivos,
      totalPasivos,
      porcentajeControl: formulario.porcentajeControl / 100
    });

    // Calcular Goodwill
    const goodwill = calcularGoodwill({
      precioCompra: formulario.precioCompra,
      valorNetoActivos: valorNeto,
      porcentajeControl: formulario.porcentajeControl / 100
    });

    // Calcular Earn-out si aplica
    let earnOutCalculado = null;
    if (earnOut.montoTotal > 0) {
      earnOutCalculado = calcularEarnOut({
        montoTotal: earnOut.montoTotal,
        diasVencimiento: earnOut.periodoDias,
        tasaDescuento: earnOut.tasaDescuento
      });
    }

    // Validar IFRS 3
    const validacionIFRS3 = validarIFRS3({
      precioCompra: formulario.precioCompra,
      valorNeto,
      goodwill,
      porcentajeControl: formulario.porcentajeControl
    });

    const nuevaTransaccion = {
      id: Date.now(),
      ...formulario,
      precioCompra: parseFloat(formulario.precioCompra),
      activos: { ...detallesActivos, total: totalActivos },
      pasivos: { ...detallesPasivos, total: totalPasivos },
      ppa,
      goodwill,
      earnOut: earnOutCalculado,
      ifrs3Validation: validacionIFRS3,
      timestamp: new Date().toISOString()
    };

    setTransacciones([...transacciones, nuevaTransaccion]);

    // Mostrar resultados
    setPPACalculado(ppa);
    setGoodwillCalculado(goodwill);
    setIFRS3Check(validacionIFRS3);

    setMensaje('✅ Transacción M&A registrada');

    // Limpiar formularios
    setFormulario({
      nombreTransaccion: '',
      empresaAdquirida: '',
      precioCompra: 0,
      fechaCierre: new Date().toISOString().split('T')[0],
      tipoComprador: 'empresa',
      porcentajeControl: 100,
      moneda: 'USD'
    });

    setTimeout(() => setMensaje(''), 3000);
  };

  // Eliminar transacción
  const eliminarTransaccion = (id) => {
    setTransacciones(transacciones.filter(t => t.id !== id));
    setPPACalculado(null);
    setGoodwillCalculado(null);
    setIFRS3Check(null);
    setMensaje('✅ Transacción eliminada');
  };

  // Calcular valor neto de activos
  const totalActivos = Object.values(detallesActivos).reduce((a, b) => a + b, 0);
  const totalPasivos = Object.values(detallesPasivos).reduce((a, b) => a + b, 0);
  const valorNeto = totalActivos - totalPasivos;

  return (
    <div className="ma-accounting">
      <header className="header">
        <h1>🤝 M&A Accounting v41</h1>
        <p>Contabilidad de fusiones y adquisiciones - IFRS 3 compliant</p>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>{mensaje}</div>}

      <div className="contenedor-ma">
        {/* FORMULARIO PRINCIPAL */}
        <section className="seccion-principal">
          <h2>📋 Nueva Transacción M&A</h2>
          <form onSubmit={agregarTransaccion} className="formulario-ma">
            <div className="panel-informacion">
              <h3>Información General</h3>
              <div className="fila-formulario">
                <div className="grupo-input">
                  <label>Nombre de la Transacción</label>
                  <input
                    type="text"
                    placeholder="Ej: Adquisición TecnoMundo"
                    value={formulario.nombreTransaccion}
                    onChange={(e) => setFormulario({ ...formulario, nombreTransaccion: e.target.value })}
                    required
                  />
                </div>

                <div className="grupo-input">
                  <label>Empresa Adquirida</label>
                  <input
                    type="text"
                    placeholder="Ej: TecnoMundo S.A."
                    value={formulario.empresaAdquirida}
                    onChange={(e) => setFormulario({ ...formulario, empresaAdquirida: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="fila-formulario">
                <div className="grupo-input">
                  <label>Precio de Compra ({formulario.moneda})</label>
                  <input
                    type="number"
                    step="10000"
                    value={formulario.precioCompra || ''}
                    onChange={(e) => setFormulario({ ...formulario, precioCompra: e.target.value })}
                    required
                  />
                </div>

                <div className="grupo-input">
                  <label>Fecha de Cierre</label>
                  <input
                    type="date"
                    value={formulario.fechaCierre}
                    onChange={(e) => setFormulario({ ...formulario, fechaCierre: e.target.value })}
                  />
                </div>

                <div className="grupo-input">
                  <label>Control (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formulario.porcentajeControl || ''}
                    onChange={(e) => setFormulario({ ...formulario, porcentajeControl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* ACTIVOS */}
            <div className="panel-activos">
              <h3>📊 Activos Identificables</h3>
              <div className="grid-activos">
                <div className="grupo-input">
                  <label>Efectivo ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.efectivo || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, efectivo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Cuentas x Cobrar ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.cuentasxCobrar || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, cuentasxCobrar: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Inventario ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.inventario || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, inventario: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Propiedad, Planta y Equipo ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.propiedadPlanta || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, propiedadPlanta: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Intangibles (Marcas, Patentes) ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.intangibles || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, intangibles: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Otros Activos ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesActivos.otrosActivos || ''}
                    onChange={(e) => setDetallesActivos({ ...detallesActivos, otrosActivos: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="total-activos">
                <strong>Total Activos: ${totalActivos.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* PASIVOS */}
            <div className="panel-pasivos">
              <h3>💳 Pasivos Asumidos</h3>
              <div className="grid-pasivos">
                <div className="grupo-input">
                  <label>Cuentas x Pagar ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesPasivos.cuentasxPagar || ''}
                    onChange={(e) => setDetallesPasivos({ ...detallesPasivos, cuentasxPagar: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Deuda Corto Plazo ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesPasivos.deudaCortoplazo || ''}
                    onChange={(e) => setDetallesPasivos({ ...detallesPasivos, deudaCortoplazo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Deuda Largo Plazo ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesPasivos.deudaLargoplazo || ''}
                    onChange={(e) => setDetallesPasivos({ ...detallesPasivos, deudaLargoplazo: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Obligaciones Laborales ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesPasivos.obligacionesLaborales || ''}
                    onChange={(e) => setDetallesPasivos({ ...detallesPasivos, obligacionesLaborales: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grupo-input">
                  <label>Otros Pasivos ($)</label>
                  <input
                    type="number"
                    step="1000"
                    value={detallesPasivos.otrosPasivos || ''}
                    onChange={(e) => setDetallesPasivos({ ...detallesPasivos, otrosPasivos: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="total-pasivos">
                <strong>Total Pasivos: ${totalPasivos.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* EARN-OUT (opcional) */}
            <div className="panel-earnout">
              <h3>🎯 Consideración Contingente (Earn-Out)</h3>
              <div className="fila-formulario">
                <div className="grupo-input">
                  <label>Monto Total Earn-Out ($)</label>
                  <input
                    type="number"
                    step="10000"
                    value={earnOut.montoTotal || ''}
                    onChange={(e) => setEarnOut({ ...earnOut, montoTotal: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="grupo-input">
                  <label>Período (días)</label>
                  <input
                    type="number"
                    step="30"
                    value={earnOut.periodoDias}
                    onChange={(e) => setEarnOut({ ...earnOut, periodoDias: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grupo-input">
                  <label>Tasa de Descuento (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={(earnOut.tasaDescuento * 100) || ''}
                    onChange={(e) => setEarnOut({ ...earnOut, tasaDescuento: parseFloat(e.target.value) / 100 || 0 })}
                  />
                </div>
              </div>

              <div className="grupo-input">
                <label>Condiciones</label>
                <textarea
                  rows="2"
                  placeholder="Ej: Si EBITDA > 20M en próximos 2 años"
                  value={earnOut.condiciones}
                  onChange={(e) => setEarnOut({ ...earnOut, condiciones: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Registrar Transacción M&A</button>
          </form>
        </section>

        {/* RESUMEN DE CÁLCULOS */}
        {ppaCalculado && (
          <section className="seccion-resultados">
            <h2>📈 Resultados del Análisis</h2>

            <div className="grid-resultados">
              <div className="resultado-card ppa">
                <h3>💰 Asignación de Precio de Compra (PPA)</h3>
                <div className="detalle-ppa">
                  <p><span>Valor Neto de Activos:</span> <strong>${valorNeto.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</strong></p>
                  <p><span>Revaluación de Activos:</span> <strong>${ppaCalculado.revaluacionActivos?.toLocaleString('es-CR', { maximumFractionDigits: 2 }) || 0}</strong></p>
                  <p><span>Reconocimiento de Intangibles:</span> <strong>${ppaCalculado.intangiblesReconocidos?.toLocaleString('es-CR', { maximumFractionDigits: 2 }) || 0}</strong></p>
                </div>
              </div>

              <div className="resultado-card goodwill">
                <h3>✨ Goodwill Calculado</h3>
                <div className="detalle-goodwill">
                  <p className={`valor ${goodwillCalculado >= 0 ? 'positivo' : 'negativo'}`}>
                    <strong>${goodwillCalculado?.toLocaleString('es-CR', { maximumFractionDigits: 2 }) || 0}</strong>
                  </p>
                  <p className="explicacion">
                    {goodwillCalculado > 0
                      ? '✅ Adquisición a precio premium'
                      : '⚠️ Adquisición a descuento (Ganancia por compra)'}
                  </p>
                </div>
              </div>

              {earnOut.montoTotal > 0 && (
                <div className="resultado-card earnout">
                  <h3>🎯 Earn-Out Valor Presente</h3>
                  <p><strong>${earnOut.montoTotal?.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</strong></p>
                </div>
              )}
            </div>

            {ifrs3Check && (
              <div className="ifrs3-validation">
                <h3>✅ Validación IFRS 3</h3>
                <div className={`validacion ${ifrs3Check.compliant ? 'aprobada' : 'advertencia'}`}>
                  <p><strong>Cumple IFRS 3:</strong> {ifrs3Check.compliant ? '✅ Sí' : '⚠️ Revisión requerida'}</p>
                  {ifrs3Check.advertencias?.map((adv, idx) => (
                    <p key={idx} className="advertencia">⚠️ {adv}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* TRANSACCIONES REGISTRADAS */}
        <section className="seccion-transacciones">
          <h2>📋 Transacciones M&A Registradas ({transacciones.length})</h2>

          {transacciones.length === 0 ? (
            <p className="sin-datos">No hay transacciones registradas</p>
          ) : (
            <div className="lista-transacciones">
              {transacciones.map(trans => (
                <div key={trans.id} className="tarjeta-transaccion">
                  <div className="encabezado">
                    <h4>{trans.nombreTransaccion}</h4>
                    <span className="empresa">{trans.empresaAdquirida}</span>
                  </div>
                  <div className="datos">
                    <p><span>Precio:</span> ${trans.precioCompra.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</p>
                    <p><span>Goodwill:</span> ${trans.goodwill.toLocaleString('es-CR', { maximumFractionDigits: 2 })}</p>
                    <p><span>Fecha:</span> {new Date(trans.timestamp).toLocaleDateString('es-CR')}</p>
                  </div>
                  <button
                    className="btn-eliminar"
                    onClick={() => eliminarTransaccion(trans.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
