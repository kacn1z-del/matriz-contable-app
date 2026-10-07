/**
 * Matriz Contable CR - Contabilidad Básica
 * Versión: v39
 *
 * Componente principal para registro de transacciones contables
 * - Registro de asientos diarios
 * - Balance de cuentas
 * - Reportes básicos
 */

import React, { useState, useEffect } from 'react';
import '../styles/ContabilidadBasica.css';

export default function ContabilidadBasica() {
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState({
    activos: 0,
    pasivos: 0,
    capital: 0,
    ingresos: 0,
    gastos: 0
  });

  const [formulario, setFormulario] = useState({
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    debe: 0,
    haber: 0,
    cuenta: 'activos',
    referencia: ''
  });

  const [filtro, setFiltro] = useState('todas');
  const [mensaje, setMensaje] = useState('');

  // Agregar transacción
  const agregarTransaccion = (e) => {
    e.preventDefault();

    if (!formulario.concepto || (!formulario.debe && !formulario.haber)) {
      setMensaje('❌ Completa todos los campos');
      return;
    }

    if (formulario.debe && formulario.haber) {
      setMensaje('❌ Una transacción solo puede tener Debe O Haber, no ambos');
      return;
    }

    const nuevaTransaccion = {
      id: Date.now(),
      ...formulario,
      debe: parseFloat(formulario.debe) || 0,
      haber: parseFloat(formulario.haber) || 0,
      timestamp: new Date().toISOString()
    };

    setTransacciones([...transacciones, nuevaTransaccion]);

    // Actualizar saldos
    actualizarSaldos([...transacciones, nuevaTransaccion]);

    // Limpiar formulario
    setFormulario({
      fecha: new Date().toISOString().split('T')[0],
      concepto: '',
      debe: 0,
      haber: 0,
      cuenta: 'activos',
      referencia: ''
    });

    setMensaje('✅ Transacción registrada correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  // Actualizar saldos de cuentas
  const actualizarSaldos = (trans) => {
    const nuevosSaldos = { activos: 0, pasivos: 0, capital: 0, ingresos: 0, gastos: 0 };

    trans.forEach(t => {
      const monto = t.debe || t.haber;
      if (t.debe) {
        nuevosSaldos[t.cuenta] += monto;
      } else {
        nuevosSaldos[t.cuenta] -= monto;
      }
    });

    setCuentas(nuevosSaldos);
  };

  // Eliminar transacción
  const eliminarTransaccion = (id) => {
    const nuevas = transacciones.filter(t => t.id !== id);
    setTransacciones(nuevas);
    actualizarSaldos(nuevas);
    setMensaje('✅ Transacción eliminada');
  };

  // Filtrar transacciones
  const transaccionesFiltradas = filtro === 'todas'
    ? transacciones
    : transacciones.filter(t => t.cuenta === filtro);

  // Calcular totales
  const totalDebe = transaccionesFiltradas.reduce((sum, t) => sum + (t.debe || 0), 0);
  const totalHaber = transaccionesFiltradas.reduce((sum, t) => sum + (t.haber || 0), 0);

  return (
    <div className="contabilidad-basica">
      <header className="header">
        <h1>📊 Contabilidad Básica v39</h1>
        <p>Registro y gestión de transacciones contables</p>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>{mensaje}</div>}

      <div className="contenedor-principal">
        {/* FORMULARIO DE ENTRADA */}
        <section className="seccion-formulario">
          <h2>➕ Nueva Transacción</h2>
          <form onSubmit={agregarTransaccion} className="formulario">
            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Fecha</label>
                <input
                  type="date"
                  value={formulario.fecha}
                  onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Concepto</label>
                <input
                  type="text"
                  placeholder="Ej: Venta de mercancía"
                  value={formulario.concepto}
                  onChange={(e) => setFormulario({ ...formulario, concepto: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Debe ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.debe || ''}
                  onChange={(e) => setFormulario({ ...formulario, debe: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="grupo-input">
                <label>Haber ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.haber || ''}
                  onChange={(e) => setFormulario({ ...formulario, haber: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Cuenta</label>
                <select
                  value={formulario.cuenta}
                  onChange={(e) => setFormulario({ ...formulario, cuenta: e.target.value })}
                >
                  <option value="activos">Activos</option>
                  <option value="pasivos">Pasivos</option>
                  <option value="capital">Capital</option>
                  <option value="ingresos">Ingresos</option>
                  <option value="gastos">Gastos</option>
                </select>
              </div>

              <div className="grupo-input">
                <label>Referencia (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Factura 001"
                  value={formulario.referencia}
                  onChange={(e) => setFormulario({ ...formulario, referencia: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Registrar Transacción</button>
          </form>
        </section>

        {/* SALDOS DE CUENTAS */}
        <section className="seccion-saldos">
          <h2>💰 Saldos por Cuenta</h2>
          <div className="grid-saldos">
            <div className="tarjeta-saldo activos">
              <span className="etiqueta">Activos</span>
              <span className="valor">₡{cuentas.activos.toFixed(2)}</span>
            </div>
            <div className="tarjeta-saldo pasivos">
              <span className="etiqueta">Pasivos</span>
              <span className="valor">₡{cuentas.pasivos.toFixed(2)}</span>
            </div>
            <div className="tarjeta-saldo capital">
              <span className="etiqueta">Capital</span>
              <span className="valor">₡{cuentas.capital.toFixed(2)}</span>
            </div>
            <div className="tarjeta-saldo ingresos">
              <span className="etiqueta">Ingresos</span>
              <span className="valor">₡{cuentas.ingresos.toFixed(2)}</span>
            </div>
            <div className="tarjeta-saldo gastos">
              <span className="etiqueta">Gastos</span>
              <span className="valor">₡{cuentas.gastos.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* TABLA DE TRANSACCIONES */}
        <section className="seccion-transacciones">
          <h2>📋 Transacciones Registradas</h2>

          <div className="controles-filtro">
            <label>Filtrar por cuenta:</label>
            <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              <option value="todas">Todas las cuentas</option>
              <option value="activos">Activos</option>
              <option value="pasivos">Pasivos</option>
              <option value="capital">Capital</option>
              <option value="ingresos">Ingresos</option>
              <option value="gastos">Gastos</option>
            </select>
          </div>

          {transaccionesFiltradas.length === 0 ? (
            <p className="sin-datos">No hay transacciones registradas</p>
          ) : (
            <>
              <div className="tabla-scroll">
                <table className="tabla-transacciones">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Cuenta</th>
                      <th className="debe">Debe</th>
                      <th className="haber">Haber</th>
                      <th>Referencia</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaccionesFiltradas.map(trans => (
                      <tr key={trans.id}>
                        <td>{trans.fecha}</td>
                        <td>{trans.concepto}</td>
                        <td className={`tag-${trans.cuenta}`}>{trans.cuenta}</td>
                        <td className="debe">₡{trans.debe.toFixed(2)}</td>
                        <td className="haber">₡{trans.haber.toFixed(2)}</td>
                        <td>{trans.referencia || '-'}</td>
                        <td>
                          <button
                            className="btn-eliminar"
                            onClick={() => eliminarTransaccion(trans.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="totales">
                <span>Total Debe: ₡{totalDebe.toFixed(2)}</span>
                <span>Total Haber: ₡{totalHaber.toFixed(2)}</span>
                <span className={totalDebe === totalHaber ? 'balanceado' : 'desbalanceado'}>
                  {totalDebe === totalHaber ? '✅ Balanceado' : '⚠️ Desbalanceado'}
                </span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
