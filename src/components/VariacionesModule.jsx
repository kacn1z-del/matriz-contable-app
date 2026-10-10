<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Módulo de Variaciones - Código Completo</title>
  <style>
    * { box-sizing: border-box; }
    :root {
      --bg: #f9fafb;
      --fg: #111827;
      --accent: #1f7a44;
      --border: #e5e7eb;
      --code-bg: #1f2937;
      --code-fg: #f3f4f6;
      --success: #16a34a;
    }
    @media (prefers-color-scheme: dark) {
      :root:not([data-theme="light"]) {
        --bg: #111827;
        --fg: #f3f4f6;
        --accent: #4ade80;
        --border: #374151;
        --code-bg: #0f172a;
        --code-fg: #e2e8f0;
      }
    }
    :root[data-theme="dark"] {
      --bg: #111827;
      --fg: #f3f4f6;
      --accent: #4ade80;
      --border: #374151;
      --code-bg: #0f172a;
      --code-fg: #e2e8f0;
    }

    html, body { height: 100%; margin: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--fg);
      padding: 20px;
      overflow-y: auto;
    }

    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      font-size: 28px;
      margin: 0 0 10px 0;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 30px;
    }

    .files-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    @media (max-width: 1000px) {
      .files-container { grid-template-columns: 1fr; }
    }

    .file-section {
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      background: var(--bg);
      display: flex;
      flex-direction: column;
    }

    .file-header {
      background: var(--accent);
      color: white;
      padding: 12px 16px;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .copy-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 5px 11px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .copy-btn.copied {
      background: rgba(255, 255, 255, 0.3);
    }

    .file-content {
      overflow: auto;
      background: var(--code-bg);
      color: var(--code-fg);
      padding: 14px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      line-height: 1.5;
      white-space: pre;
      flex: 1;
      max-height: 600px;
    }

    .instructions {
      background: var(--accent);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin-top: 30px;
    }

    .instructions h2 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 18px;
    }

    .instructions ol {
      margin: 0;
      padding-left: 20px;
    }

    .instructions li {
      margin: 10px 0;
      line-height: 1.6;
    }

    .instructions code {
      background: rgba(0, 0, 0, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
    }

    .success-msg {
      display: none;
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      z-index: 1000;
    }

    .success-msg.show {
      display: block;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="success-msg" id="successMsg">✓ Copiado al portapapeles</div>

  <div class="container">
    <h1>📊 Módulo de Variaciones Contables</h1>
    <p class="subtitle">Análisis de nómina y comparativa presupuesto vs real — Código completo</p>

    <div class="files-container">
      <!-- VariacionesModule.jsx -->
      <div class="file-section">
        <div class="file-header">
          <span>VariacionesModule.jsx</span>
          <button class="copy-btn" onclick="copiarAlPortapapeles('jsx-code', this)">Copiar</button>
        </div>
        <div class="file-content" id="jsx-code">import React, { useState } from 'react';
import './VariacionesModule.css';

const VariacionesModule = () => {
  const [datos, setDatos] = useState([
    { id: 1, concepto: 'Salario', esperado: 2500000, real: 2500000 },
    { id: 2, concepto: 'Bono', esperado: 250000, real: 250000 },
  ]);

  const [rangos, setRangos] = useState([
    { id: 1, min: -100, max: -1, criterio: 'No aceptable', color: '#dc2626' },
    { id: 2, min: 0, max: 1, criterio: 'Puede Mejorar', color: '#f59e0b' },
    { id: 3, min: 1, max: 100, criterio: 'Aceptable', color: '#16a34a' },
  ]);

  const [editandoRangos, setEditandoRangos] = useState(false);

  const calcularVariacion = (esperado, real) => {
    if (esperado === 0) return 0;
    return ((real - esperado) / esperado) * 100;
  };

  const obtenerCriterio = (variacion) => {
    const rango = rangos.find(r => variacion >= r.min && variacion <= r.max);
    return rango ? { criterio: rango.criterio, color: rango.color } : { criterio: 'N/A', color: '#9ca3af' };
  };

  const agregarFila = () => {
    setDatos([...datos, {
      id: Math.max(...datos.map(d => d.id), 0) + 1,
      concepto: 'Nuevo',
      esperado: 0,
      real: 0,
    }]);
  };

  const actualizarDato = (id, campo, valor) => {
    setDatos(datos.map(d =>
      d.id === id ? { ...d, [campo]: parseFloat(valor) || 0 } : d
    ));
  };

  const eliminarFila = (id) => {
    setDatos(datos.filter(d => d.id !== id));
  };

  const actualizarRango = (id, campo, valor) => {
    setRangos(rangos.map(r =>
      r.id === id ? { ...r, [campo]: isNaN(valor) ? valor : parseFloat(valor) } : r
    ));
  };

  const generarReporte = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Variaciones', 20, 20);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CR')}`, 20, 35);

    let y = 50;
    doc.setFont(undefined, 'bold');
    doc.text('Concepto', 20, y);
    doc.text('Esperado', 80, y);
    doc.text('Real', 120, y);
    doc.text('Variación %', 150, y);
    doc.text('Criterio', 200, y);

    doc.setFont(undefined, 'normal');
    y += 10;

    datos.forEach(d => {
      const var_pct = calcularVariacion(d.esperado, d.real).toFixed(2);
      const { criterio } = obtenerCriterio(parseFloat(var_pct));

      doc.text(d.concepto, 20, y);
      doc.text(d.esperado.toLocaleString('es-CR'), 80, y);
      doc.text(d.real.toLocaleString('es-CR'), 120, y);
      doc.text(var_pct + '%', 150, y);
      doc.text(criterio, 200, y);
      y += 10;
    });

    doc.save('variaciones-reporte.pdf');
  };

  return (
    <div className="variaciones-container">
      <div className="variaciones-header">
        <h2>Análisis de Variaciones</h2>
        <button className="btn-primary" onClick={generarReporte}>
          📥 Descargar Reporte PDF
        </button>
      </div>

      <div className="variaciones-section">
        <h3>📊 Datos de Variación</h3>
        <div className="tabla-wrapper">
          <table className="tabla-variaciones">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Esperado</th>
                <th>Real</th>
                <th>Variación %</th>
                <th>Criterio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datos.map(d => {
                const var_pct = calcularVariacion(d.esperado, d.real);
                const { criterio, color } = obtenerCriterio(var_pct);

                return (
                  <tr key={d.id}>
                    <td>
                      <input
                        type="text"
                        value={d.concepto}
                        onChange={(e) => actualizarDato(d.id, 'concepto', e.target.value)}
                        className="input-texto"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={d.esperado}
                        onChange={(e) => actualizarDato(d.id, 'esperado', e.target.value)}
                        className="input-numero"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={d.real}
                        onChange={(e) => actualizarDato(d.id, 'real', e.target.value)}
                        className="input-numero"
                      />
                    </td>
                    <td className="celda-variacion">
                      <span className="badge-variacion">{var_pct.toFixed(2)}%</span>
                    </td>
                    <td>
                      <span className="badge-criterio" style={{ backgroundColor: color, color: '#fff' }}>
                        {criterio}
                      </span>
                    </td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarFila(d.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn-agregar" onClick={agregarFila}>+ Agregar Fila</button>
      </div>

      <div className="variaciones-section">
        <div className="rangos-header">
          <h3>📋 Tabla de Referencia / Criterios</h3>
          <button
            className="btn-editar"
            onClick={() => setEditandoRangos(!editandoRangos)}
          >
            {editandoRangos ? '✓ Listo' : '✏️ Editar'}
          </button>
        </div>

        <div className="tabla-wrapper">
          <table className="tabla-referencia">
            <thead>
              <tr>
                <th>Desde %</th>
                <th>Hasta %</th>
                <th>Criterio</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {rangos.map(r => (
                <tr key={r.id}>
                  <td>
                    {editandoRangos ? (
                      <input
                        type="number"
                        value={r.min}
                        onChange={(e) => actualizarRango(r.id, 'min', e.target.value)}
                        className="input-numero"
                      />
                    ) : (
                      r.min
                    )}
                  </td>
                  <td>
                    {editandoRangos ? (
                      <input
                        type="number"
                        value={r.max}
                        onChange={(e) => actualizarRango(r.id, 'max', e.target.value)}
                        className="input-numero"
                      />
                    ) : (
                      r.max
                    )}
                  </td>
                  <td>
                    {editandoRangos ? (
                      <input
                        type="text"
                        value={r.criterio}
                        onChange={(e) => actualizarRango(r.id, 'criterio', e.target.value)}
                        className="input-texto"
                      />
                    ) : (
                      r.criterio
                    )}
                  </td>
                  <td>
                    {editandoRangos ? (
                      <input
                        type="color"
                        value={r.color}
                        onChange={(e) => actualizarRango(r.id, 'color', e.target.value)}
                        className="input-color"
                      />
                    ) : (
                      <span className="color-preview" style={{ backgroundColor: r.color }}></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="variaciones-resumen">
        <h3>📈 Resumen</h3>
        <div className="resumen-grid">
          <div className="resumen-card">
            <div className="resumen-label">Total Esperado</div>
            <div className="resumen-valor">
              ₡{datos.reduce((sum, d) => sum + d.esperado, 0).toLocaleString('es-CR')}
            </div>
          </div>
          <div className="resumen-card">
            <div className="resumen-label">Total Real</div>
            <div className="resumen-valor">
              ₡{datos.reduce((sum, d) => sum + d.real, 0).toLocaleString('es-CR')}
            </div>
          </div>
          <div className="resumen-card">
            <div className="resumen-label">Variación Total</div>
            <div className="resumen-valor">
              {(calcularVariacion(
                datos.reduce((s, d) => s + d.esperado, 0),
                datos.reduce((s, d) => s + d.real, 0)
              )).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariacionesModule;
        </div>
      </div>

      <!-- VariacionesModule.css -->
      <div class="file-section">
        <div class="file-header">
          <span>VariacionesModule.css</span>
          <button class="copy-btn" onclick="copiarAlPortapapeles('css-code', this)">Copiar</button>
        </div>
        <div class="file-content" id="css-code">.variaciones-container {
  padding: 16px;
  background: #f9fafb;
}

.variaciones-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.variaciones-header h2 {
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 700;
}

.variaciones-section {
  margin-bottom: 28px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.variaciones-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 700;
}

.rangos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rangos-header h3 {
  margin: 0;
}

.tabla-wrapper {
  overflow-x: auto;
  margin-bottom: 14px;
}

.tabla-variaciones,
.tabla-referencia {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.tabla-variaciones thead,
.tabla-referencia thead {
  background: #f3f4f6;
  border-bottom: 2px solid #d1d5db;
}

.tabla-variaciones th,
.tabla-referencia th {
  padding: 12px;
  text-align: left;
  font-weight: 700;
  color: #374151;
}

.tabla-variaciones td,
.tabla-referencia td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #1f2937;
}

.tabla-variaciones tbody tr:hover {
  background: #f9fafb;
}

.input-texto,
.input-numero,
.input-color {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.input-color {
  padding: 2px;
  height: 32px;
  cursor: pointer;
}

.celda-variacion {
  text-align: center;
}

.badge-variacion {
  background: #e0f2fe;
  color: #0369a1;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.badge-criterio {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
  color: white !important;
}

.color-preview {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.btn-primary,
.btn-agregar,
.btn-editar,
.btn-eliminar {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary {
  background: #1f7a44;
  color: white;
  padding: 10px 18px;
  font-size: 14px;
}

.btn-primary:hover {
  background: #15803d;
  box-shadow: 0 2px 8px rgba(31, 122, 68, 0.2);
}

.btn-primary:active {
  background: #166534;
}

.btn-agregar {
  background: #dbeafe;
  color: #0369a1;
  margin-top: 12px;
}

.btn-agregar:hover {
  background: #bfdbfe;
}

.btn-editar {
  background: #f5f3ff;
  color: #7c3aed;
  padding: 6px 12px;
  font-size: 12px;
}

.btn-editar:hover {
  background: #ede9fe;
}

.btn-eliminar {
  background: #fee2e2;
  color: #dc2626;
  padding: 4px 10px;
  font-size: 12px;
}

.btn-eliminar:hover {
  background: #fecaca;
}

.variaciones-resumen {
  background: linear-gradient(135deg, #1f7a44 0%, #15803d 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 28px;
}

.variaciones-resumen h3 {
  margin: 0 0 20px 0;
  color: white;
  font-size: 18px;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.resumen-card {
  background: rgba(255, 255, 255, 0.12);
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.resumen-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 8px;
}

.resumen-valor {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Dark mode */
body.dark-mode .variaciones-container {
  background: #1f2937;
}

body.dark-mode .variaciones-section {
  background: #374151;
  border-color: #4b5563;
}

body.dark-mode .variaciones-section h3,
body.dark-mode .variaciones-header h2 {
  color: #f3f4f6;
}

body.dark-mode .tabla-variaciones thead,
body.dark-mode .tabla-referencia thead {
  background: #4b5563;
}

body.dark-mode .tabla-variaciones th,
body.dark-mode .tabla-referencia th {
  color: #f3f4f6;
}

body.dark-mode .tabla-variaciones td,
body.dark-mode .tabla-referencia td {
  color: #e5e7eb;
  border-color: #4b5563;
}
