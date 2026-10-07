/**
 * Matriz Contable CR - Derivados Avanzados
 * Versión: v39.2
 *
 * Componente para gestión de instrumentos derivados
 * - Interest Rate Swaps (IRS)
 * - Currency Swaps (CCS)
 * - Equity Swaps
 * - Cálculo de Greeks
 * - Valuación XVA (CVA, DVA, FVA, KVA, MVA, CollVA)
 */

import React, { useState } from 'react';
import {
  calcularGreeks,
  calcularXVA,
  tasaDescuento,
  volatilidadImplicita
} from '../utils/derivados-avanzados';
import '../styles/DerivadosAvanzados.css';

export default function DerivadosAvanzados() {
  const [derivados, setDerivados] = useState([]);
  const [tipoDerivado, setTipoDerivado] = useState('IRS');
  const [formulario, setFormulario] = useState({
    nombre: '',
    notional: 0,
    strike: 0,
    tasaFija: 0,
    tasaFlotante: 0,
    vencimiento: 30,
    volatilidad: 0.2,
    contraparte: '',
    colateral: 0
  });

  const [greeksCalculados, setGreeksCalculados] = useState(null);
  const [xvaCalculado, setXvaCalculado] = useState(null);
  const [mensaje, setMensaje] = useState('');

  // Tipos de derivados disponibles
  const tipos = {
    'IRS': 'Interest Rate Swap',
    'CCS': 'Currency Swap',
    'EQUITY': 'Equity Swap',
    'OPCION': 'Opción (Call/Put)'
  };

  // Agregar derivado
  const agregarDerivado = (e) => {
    e.preventDefault();

    if (!formulario.nombre || formulario.notional <= 0) {
      setMensaje('❌ Completa todos los campos correctamente');
      return;
    }

    // Calcular Greeks y XVA
    const greeks = calcularGreeks({
      tipoDerivado,
      ...formulario
    });

    const xva = calcularXVA({
      notional: formulario.notional,
      volatilidad: formulario.volatilidad,
      colateral: formulario.colateral,
      diasAlVencimiento: formulario.vencimiento,
      tipoDerivado
    });

    const nuevoDerivado = {
      id: Date.now(),
      tipo: tipoDerivado,
      nombre: formulario.nombre,
      notional: parseFloat(formulario.notional),
      strike: parseFloat(formulario.strike),
      tasaFija: parseFloat(formulario.tasaFija),
      tasaFlotante: parseFloat(formulario.tasaFlotante),
      vencimiento: parseInt(formulario.vencimiento),
      contraparte: formulario.contraparte,
      mtm: calcularMTM(formulario, tipoDerivado),
      greeks,
      xva,
      fechaCreacion: new Date().toISOString()
    };

    setDerivados([...derivados, nuevoDerivado]);
    setMensaje('✅ Derivado registrado correctamente');

    // Limpiar formulario
    setFormulario({
      nombre: '',
      notional: 0,
      strike: 0,
      tasaFija: 0,
      tasaFlotante: 0,
      vencimiento: 30,
      volatilidad: 0.2,
      contraparte: '',
      colateral: 0
    });

    setTimeout(() => setMensaje(''), 3000);
  };

  // Calcular Mark-to-Market (MTM)
  const calcularMTM = (form, tipo) => {
    let mtm = 0;
    const r = tasaDescuento();
    const dias = form.vencimiento;
    const t = dias / 365;

    if (tipo === 'IRS') {
      mtm = form.notional * (form.tasaFija - form.tasaFlotante) * t;
    } else if (tipo === 'CCS') {
      mtm = form.notional * (form.tasaFija - form.tasaFlotante) * t * 0.95; // Factor de correlación
    } else if (tipo === 'EQUITY') {
      mtm = form.notional * form.volatilidad * Math.sqrt(t);
    }

    return parseFloat(mtm.toFixed(2));
  };

  // Ver detalles de derivado
  const verDetalles = (derivado) => {
    setGreeksCalculados(derivado.greeks);
    setXvaCalculado(derivado.xva);
  };

  // Eliminar derivado
  const eliminarDerivado = (id) => {
    setDerivados(derivados.filter(d => d.id !== id));
    setMensaje('✅ Derivado eliminado');
    setGreeksCalculados(null);
    setXvaCalculado(null);
  };

  return (
    <div className="derivados-avanzados">
      <header className="header">
        <h1>📈 Derivados Avanzados v39.2</h1>
        <p>Gestión y valuación de instrumentos financieros derivados</p>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>{mensaje}</div>}

      <div className="contenedor-derivados">
        {/* REGISTRO DE DERIVADO */}
        <section className="seccion-registro">
          <h2>➕ Registrar Nuevo Derivado</h2>
          <form onSubmit={agregarDerivado} className="formulario-derivado">
            <div className="grupo-tipo">
              <label>Tipo de Derivado</label>
              <select
                value={tipoDerivado}
                onChange={(e) => setTipoDerivado(e.target.value)}
              >
                {Object.entries(tipos).map(([clave, nombre]) => (
                  <option key={clave} value={clave}>{nombre}</option>
                ))}
              </select>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Nombre/ID del Derivado</label>
                <input
                  type="text"
                  placeholder="Ej: IRS-USD-2026"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Notional ($)</label>
                <input
                  type="number"
                  step="1000"
                  value={formulario.notional || ''}
                  onChange={(e) => setFormulario({ ...formulario, notional: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Strike (si aplica)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.strike || ''}
                  onChange={(e) => setFormulario({ ...formulario, strike: e.target.value })}
                />
              </div>

              <div className="grupo-input">
                <label>Tasa Fija (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.tasaFija || ''}
                  onChange={(e) => setFormulario({ ...formulario, tasaFija: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Tasa Flotante (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.tasaFlotante || ''}
                  onChange={(e) => setFormulario({ ...formulario, tasaFlotante: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Días al Vencimiento</label>
                <input
                  type="number"
                  step="1"
                  value={formulario.vencimiento}
                  onChange={(e) => setFormulario({ ...formulario, vencimiento: e.target.value })}
                />
              </div>

              <div className="grupo-input">
                <label>Volatilidad Implícita (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formulario.volatilidad || ''}
                  onChange={(e) => setFormulario({ ...formulario, volatilidad: e.target.value })}
                />
              </div>

              <div className="grupo-input">
                <label>Colateral ($)</label>
                <input
                  type="number"
                  step="100"
                  value={formulario.colateral || ''}
                  onChange={(e) => setFormulario({ ...formulario, colateral: e.target.value })}
                />
              </div>
            </div>

            <div className="grupo-input">
              <label>Contraparte</label>
              <input
                type="text"
                placeholder="Ej: JP Morgan, Deutsche Bank"
                value={formulario.contraparte}
                onChange={(e) => setFormulario({ ...formulario, contraparte: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary">Registrar Derivado</button>
          </form>
        </section>

        {/* LISTA DE DERIVADOS */}
        <section className="seccion-derivados">
          <h2>📊 Derivados Registrados ({derivados.length})</h2>

          {derivados.length === 0 ? (
            <p className="sin-datos">No hay derivados registrados</p>
          ) : (
            <div className="grid-derivados">
              {derivados.map(der => (
                <div key={der.id} className="tarjeta-derivado">
                  <div className="encabezado-tarjeta">
                    <h3>{der.nombre}</h3>
                    <span className={`badge-tipo ${der.tipo.toLowerCase()}`}>{der.tipo}</span>
                  </div>

                  <div className="datos-derivado">
                    <div className="fila-dato">
                      <span className="etiqueta">Notional:</span>
                      <span className="valor">${der.notional.toLocaleString()}</span>
                    </div>
                    <div className="fila-dato">
                      <span className="etiqueta">MTM:</span>
                      <span className={`valor ${der.mtm >= 0 ? 'positivo' : 'negativo'}`}>
                        ${der.mtm.toFixed(2)}
                      </span>
                    </div>
                    <div className="fila-dato">
                      <span className="etiqueta">Vencimiento:</span>
                      <span className="valor">{der.vencimiento} días</span>
                    </div>
                    <div className="fila-dato">
                      <span className="etiqueta">Contraparte:</span>
                      <span className="valor">{der.contraparte || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="acciones-tarjeta">
                    <button
                      className="btn-ver"
                      onClick={() => verDetalles(der)}
                    >
                      📊 Ver Detalles
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarDerivado(der.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* DETALLES DE GREEKS Y XVA */}
        {greeksCalculados && (
          <section className="seccion-detalles">
            <h2>🔬 Greeks (Sensibilidades)</h2>
            <div className="grid-greeks">
              <div className="grec delta"><span className="nombre">Delta</span><span className="valor">{greeksCalculados.delta?.toFixed(4) || 'N/A'}</span></div>
              <div className="grec gamma"><span className="nombre">Gamma</span><span className="valor">{greeksCalculados.gamma?.toFixed(4) || 'N/A'}</span></div>
              <div className="grec theta"><span className="nombre">Theta</span><span className="valor">{greeksCalculados.theta?.toFixed(4) || 'N/A'}</span></div>
              <div className="grec vega"><span className="nombre">Vega</span><span className="valor">{greeksCalculados.vega?.toFixed(4) || 'N/A'}</span></div>
              <div className="grec rho"><span className="nombre">Rho</span><span className="valor">{greeksCalculados.rho?.toFixed(4) || 'N/A'}</span></div>
              <div className="grec lambda"><span className="nombre">Lambda</span><span className="valor">{greeksCalculados.lambda?.toFixed(4) || 'N/A'}</span></div>
            </div>
          </section>
        )}

        {xvaCalculado && (
          <section className="seccion-xva">
            <h2>💳 Valuación XVA (Ajustes de Valuación)</h2>
            <div className="grid-xva">
              <div className="xva-item cva"><span>CVA (Credit)</span><span>${xvaCalculado.cva?.toFixed(2) || 0}</span></div>
              <div className="xva-item dva"><span>DVA (Debit)</span><span>${xvaCalculado.dva?.toFixed(2) || 0}</span></div>
              <div className="xva-item fva"><span>FVA (Funding)</span><span>${xvaCalculado.fva?.toFixed(2) || 0}</span></div>
              <div className="xva-item kva"><span>KVA (Capital)</span><span>${xvaCalculado.kva?.toFixed(2) || 0}</span></div>
              <div className="xva-item mva"><span>MVA (Margin)</span><span>${xvaCalculado.mva?.toFixed(2) || 0}</span></div>
              <div className="xva-item colva"><span>CollVA (Collateral)</span><span>${xvaCalculado.collva?.toFixed(2) || 0}</span></div>
            </div>
            <div className="total-xva">
              <strong>Total XVA Ajustado:</strong>
              <span>${(Object.values(xvaCalculado).reduce((a, b) => a + b, 0)).toFixed(2)}</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
