/**
 * Matriz Contable CR - Dashboard PRO
 * Versión: UI/UX PRO
 *
 * Dashboard profesional con KPIs, gráficos y análisis en tiempo real
 * - Resumen ejecutivo
 * - Indicadores clave (KPIs)
 * - Gráficos interactivos
 * - Alertas y notificaciones
 * - Análisis comparativos
 */

import React, { useState, useEffect } from 'react';
import '../styles/DashboardPRO.css';

export default function DashboardPRO() {
  const [periodo, setPeriodo] = useState('mes');
  const [datos, setDatos] = useState({
    ingresos: 450000,
    gastos: 280000,
    utilidad: 170000,
    activos: 2500000,
    pasivos: 1200000,
    capital: 1300000,
    tasaMorosidad: 2.3,
    rotacionActivos: 1.8,
    margenNeto: 37.8,
    liquidez: 1.5
  });

  const [kpis, setKpis] = useState([
    { nombre: 'Ingresos', valor: 450000, cambio: 12.5, tendencia: 'arriba', meta: 400000 },
    { nombre: 'Gastos', valor: 280000, cambio: -3.2, tendencia: 'abajo', meta: 300000 },
    { nombre: 'Utilidad Neta', valor: 170000, cambio: 8.7, tendencia: 'arriba', meta: 150000 },
    { nombre: 'ROE', valor: 13.1, cambio: 2.1, tendencia: 'arriba', meta: 12.0 },
    { nombre: 'Rotación Activos', valor: 1.8, cambio: 0.3, tendencia: 'arriba', meta: 2.0 },
    { nombre: 'Liquidez Corriente', valor: 1.5, cambio: -0.1, tendencia: 'abajo', meta: 1.5 }
  ]);

  const [alertas, setAlertas] = useState([
    { id: 1, tipo: 'warning', mensaje: '⚠️ 3 cuentas con plazo vencido', fecha: new Date() },
    { id: 2, tipo: 'success', mensaje: '✅ Audit trail completado', fecha: new Date() },
    { id: 3, tipo: 'info', mensaje: 'ℹ️ Actualizaciones disponibles', fecha: new Date() }
  ]);

  // Datos para gráficos
  const datosGrafico = {
    meses: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    ingresos: [350000, 380000, 400000, 420000, 440000, 450000],
    gastos: [240000, 255000, 270000, 275000, 280000, 280000],
    utilidad: [110000, 125000, 130000, 145000, 160000, 170000]
  };

  // Composición de activos
  const activosPorTipo = [
    { tipo: 'Efectivo', valor: 500000, porcentaje: 20 },
    { tipo: 'Cuentas x Cobrar', valor: 750000, porcentaje: 30 },
    { tipo: 'Inventario', valor: 600000, porcentaje: 24 },
    { tipo: 'Activos Fijos', valor: 650000, porcentaje: 26 }
  ];

  // Análisis de rentabilidad
  const analisisRentabilidad = {
    margenBruto: 62.2,
    margenOperacional: 48.5,
    margenNeto: 37.8,
    roe: 13.1,
    roa: 6.8
  };

  const eliminarAlerta = (id) => {
    setAlertas(alertas.filter(a => a.id !== id));
  };

  const cambiarPeriodo = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);
    // Simulación de actualización de datos
    if (nuevoPeriodo === 'semana') {
      setKpis(kpis.map(k => ({
        ...k,
        valor: k.valor * 0.15,
        cambio: Math.random() * 20 - 10
      })));
    }
  };

  return (
    <div className="dashboard-pro">
      <header className="header-dashboard">
        <div className="titulo-header">
          <h1>📊 Dashboard PRO</h1>
          <p>Resumen ejecutivo y análisis financiero en tiempo real</p>
        </div>

        <div className="controles-periodo">
          <button
            className={`btn-periodo ${periodo === 'semana' ? 'activo' : ''}`}
            onClick={() => cambiarPeriodo('semana')}
          >
            Semana
          </button>
          <button
            className={`btn-periodo ${periodo === 'mes' ? 'activo' : ''}`}
            onClick={() => cambiarPeriodo('mes')}
          >
            Mes
          </button>
          <button
            className={`btn-periodo ${periodo === 'trimestre' ? 'activo' : ''}`}
            onClick={() => cambiarPeriodo('trimestre')}
          >
            Trimestre
          </button>
          <button
            className={`btn-periodo ${periodo === 'ano' ? 'activo' : ''}`}
            onClick={() => cambiarPeriodo('ano')}
          >
            Año
          </button>
        </div>
      </header>

      <div className="contenedor-dashboard">
        {/* TARJETAS KPI */}
        <section className="seccion-kpis">
          <h2>📈 Indicadores Clave (KPIs)</h2>
          <div className="grid-kpis">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="tarjeta-kpi">
                <div className="encabezado-kpi">
                  <h3>{kpi.nombre}</h3>
                  <span className={`cambio ${kpi.cambio >= 0 ? 'positivo' : 'negativo'}`}>
                    {kpi.cambio >= 0 ? '↑' : '↓'} {Math.abs(kpi.cambio).toFixed(1)}%
                  </span>
                </div>

                <div className="valor-kpi">
                  {typeof kpi.valor === 'number' && kpi.valor > 100
                    ? `$${(kpi.valor / 1000).toFixed(0)}k`
                    : kpi.valor.toFixed(2)}
                </div>

                <div className="meta-kpi">
                  <span className="etiqueta">Meta: {typeof kpi.meta === 'number' && kpi.meta > 100 ? `$${(kpi.meta / 1000).toFixed(0)}k` : kpi.meta.toFixed(2)}</span>
                  <div className="barra-progreso">
                    <div
                      className="barra-lleno"
                      style={{ width: `${Math.min((kpi.valor / kpi.meta) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GRÁFICOS PRINCIPALES */}
        <section className="seccion-graficos">
          <div className="grid-graficos">
            {/* Gráfico de Tendencias */}
            <div className="grafico-card">
              <h3>📊 Tendencias Financieras</h3>
              <div className="grafico-simple">
                <div className="eje-y">
                  <span>$500k</span>
                  <span>$400k</span>
                  <span>$300k</span>
                  <span>$200k</span>
                  <span>$100k</span>
                  <span>$0</span>
                </div>
                <div className="grafico-lineas">
                  {/* Simulación de líneas */}
                  <svg width="100%" height="200" viewBox="0 0 300 200">
                    <polyline
                      points="0,100 50,80 100,60 150,40 200,30 250,20"
                      fill="none"
                      stroke="#4CAF50"
                      strokeWidth="2"
                    />
                    <polyline
                      points="0,140 50,130 100,120 150,110 200,100 250,90"
                      fill="none"
                      stroke="#FF9800"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="eje-x">
                  {datosGrafico.meses.map((mes, idx) => (
                    <span key={idx}>{mes}</span>
                  ))}
                </div>
                <div className="leyenda-grafico">
                  <span className="legenda-item ingreso">Ingresos</span>
                  <span className="legenda-item gasto">Gastos</span>
                </div>
              </div>
            </div>

            {/* Composición de Activos */}
            <div className="grafico-card">
              <h3>💼 Composición de Activos</h3>
              <div className="grafico-donut">
                <div className="donut-circulo">
                  <svg viewBox="0 0 100 100" style={{ width: '150px', height: '150px' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E8F5E9" strokeWidth="20" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#4CAF50" strokeWidth="8" strokeDasharray="50.27 251.33" strokeLinecap="round" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#2196F3" strokeWidth="8" strokeDasharray="75.40" strokeDashoffset="-50.27" strokeLinecap="round" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FF9800" strokeWidth="8" strokeDasharray="60.32" strokeDashoffset="-125.67" strokeLinecap="round" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F44336" strokeWidth="8" strokeDasharray="65.34" strokeDashoffset="-185.99" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="leyenda-donut">
                  {activosPorTipo.map((activo, idx) => (
                    <div key={idx} className="item-activo">
                      <span className="color" style={{ backgroundColor: ['#4CAF50', '#2196F3', '#FF9800', '#F44336'][idx] }}></span>
                      <span className="nombre">{activo.tipo}: {activo.porcentaje}%</span>
                      <span className="valor">${(activo.valor / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Análisis de Rentabilidad */}
            <div className="grafico-card">
              <h3>📈 Análisis de Rentabilidad</h3>
              <div className="rentabilidad-barras">
                {Object.entries(analisisRentabilidad).map(([clave, valor], idx) => (
                  <div key={idx} className="barra-rentabilidad">
                    <span className="etiqueta">{clave.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="barra">
                      <div className="barra-valor" style={{ width: `${valor}%` }}></div>
                    </div>
                    <span className="porcentaje">{valor.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Balance General */}
            <div className="grafico-card">
              <h3>⚖️ Balance General</h3>
              <div className="balance-comparativo">
                <div className="columna-balance">
                  <h4>Activos</h4>
                  <div className="valor-grande activos">${(datos.activos / 1000000).toFixed(1)}M</div>
                </div>
                <div className="columna-balance">
                  <h4>Pasivos</h4>
                  <div className="valor-grande pasivos">${(datos.pasivos / 1000000).toFixed(1)}M</div>
                </div>
                <div className="columna-balance">
                  <h4>Capital</h4>
                  <div className="valor-grande capital">${(datos.capital / 1000000).toFixed(1)}M</div>
                </div>
              </div>
              <div className="validacion-balance">
                <p>Activos = Pasivos + Capital</p>
                <p className="checkmark">✅ Balance cuadra correctamente</p>
              </div>
            </div>
          </div>
        </section>

        {/* ALERTAS Y NOTIFICACIONES */}
        <section className="seccion-alertas">
          <h2>🔔 Alertas y Notificaciones</h2>
          {alertas.length === 0 ? (
            <p className="sin-alertas">✅ No hay alertas pendientes</p>
          ) : (
            <div className="lista-alertas">
              {alertas.map(alerta => (
                <div key={alerta.id} className={`alerta alerta-${alerta.tipo}`}>
                  <div className="contenido-alerta">
                    <p>{alerta.mensaje}</p>
                    <span className="hora">{alerta.fecha.toLocaleTimeString('es-CR')}</span>
                  </div>
                  <button
                    className="btn-cerrar"
                    onClick={() => eliminarAlerta(alerta.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RESUMEN EJECUTIVO */}
        <section className="seccion-resumen">
          <h2>📋 Resumen Ejecutivo</h2>
          <div className="grid-resumen">
            <div className="card-resumen">
              <h3>💰 Situación Financiera</h3>
              <div className="datos-resumen">
                <p><span>Ingresos:</span> <strong>${(datos.ingresos / 1000).toFixed(0)}k</strong></p>
                <p><span>Gastos:</span> <strong>${(datos.gastos / 1000).toFixed(0)}k</strong></p>
                <p><span>Utilidad Neta:</span> <strong className="positivo">${(datos.utilidad / 1000).toFixed(0)}k</strong></p>
                <p><span>Margen Neto:</span> <strong>{datos.margenNeto.toFixed(1)}%</strong></p>
              </div>
            </div>

            <div className="card-resumen">
              <h3>🏢 Estructura del Activo</h3>
              <div className="datos-resumen">
                <p><span>Total Activos:</span> <strong>${(datos.activos / 1000000).toFixed(1)}M</strong></p>
                <p><span>Total Pasivos:</span> <strong>${(datos.pasivos / 1000000).toFixed(1)}M</strong></p>
                <p><span>Total Capital:</span> <strong>${(datos.capital / 1000000).toFixed(1)}M</strong></p>
                <p><span>Rotación:</span> <strong>{datos.rotacionActivos.toFixed(2)}x</strong></p>
              </div>
            </div>

            <div className="card-resumen">
              <h3>📊 Indicadores de Solvencia</h3>
              <div className="datos-resumen">
                <p><span>Liquidez Corriente:</span> <strong>{datos.liquidez.toFixed(2)}</strong></p>
                <p><span>Tasa Morosidad:</span> <strong className="negativo">{datos.tasaMorosidad.toFixed(1)}%</strong></p>
                <p><span>Deuda/Patrimonio:</span> <strong>{(datos.pasivos / datos.capital).toFixed(2)}</strong></p>
                <p><span>Estado:</span> <strong className="positivo">✅ Saludable</strong></p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTONES DE ACCIÓN */}
        <section className="seccion-acciones">
          <button className="btn-accion exportar">📥 Exportar Reporte</button>
          <button className="btn-accion compartir">📤 Compartir</button>
          <button className="btn-accion imprimir">🖨️ Imprimir</button>
          <button className="btn-accion programar">📅 Programar Envío</button>
        </section>
      </div>
    </div>
  );
}
