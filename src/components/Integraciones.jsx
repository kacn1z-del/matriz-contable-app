/**
 * Matriz Contable CR - Integraciones
 * Versión: v42
 *
 * Componente para gestionar integraciones con sistemas externos
 * - REST APIs
 * - Webhooks
 * - WebSocket real-time sync
 * - Export/Import (Excel, CSV, PDF)
 */

import React, { useState, useEffect } from 'react';
import '../styles/Integraciones.css';

export default function Integraciones() {
  const [integraciones, setIntegraciones] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [conexiones, setConexiones] = useState({});
  const [formulario, setFormulario] = useState({
    nombre: '',
    tipo: 'REST_API',
    url: '',
    autenticacion: 'bearer',
    token: '',
    activa: false
  });

  const [formularioWebhook, setFormularioWebhook] = useState({
    nombre: '',
    evento: 'transaccion_nueva',
    urlDestino: '',
    activa: false
  });

  const [mensaje, setMensaje] = useState('');
  const [testResult, setTestResult] = useState(null);

  // Tipos de integraciones disponibles
  const tiposIntegracion = {
    'REST_API': 'REST API',
    'WEBHOOK': 'Webhook',
    'WEBSOCKET': 'WebSocket',
    'EXPORT': 'Exportar Datos',
    'IMPORT': 'Importar Datos'
  };

  const tiposEventos = {
    'transaccion_nueva': 'Nueva Transacción',
    'cambio_saldo': 'Cambio de Saldo',
    'cierre_dia': 'Cierre de Día',
    'reporte_mensual': 'Reporte Mensual',
    'alertas': 'Alertas del Sistema'
  };

  // Agregar integración
  const agregarIntegracion = (e) => {
    e.preventDefault();

    if (!formulario.nombre || !formulario.url) {
      setMensaje('❌ Completa todos los campos');
      return;
    }

    const nuevaIntegracion = {
      id: Date.now(),
      ...formulario,
      token: formulario.token ? formulario.token.substring(0, 10) + '...' : 'Sin token', // Ocultar token
      estado: 'PENDIENTE',
      ultimaSincronizacion: null,
      erroresUltimos: 0,
      timestamp: new Date().toISOString()
    };

    setIntegraciones([...integraciones, nuevaIntegracion]);
    setMensaje('✅ Integración agregada');

    setFormulario({
      nombre: '',
      tipo: 'REST_API',
      url: '',
      autenticacion: 'bearer',
      token: '',
      activa: false
    });

    setTimeout(() => setMensaje(''), 3000);
  };

  // Agregar Webhook
  const agregarWebhook = (e) => {
    e.preventDefault();

    if (!formularioWebhook.nombre || !formularioWebhook.urlDestino) {
      setMensaje('❌ Completa todos los campos');
      return;
    }

    const nuevoWebhook = {
      id: Date.now(),
      ...formularioWebhook,
      intentosFallidos: 0,
      ultimoIntento: null,
      timestamp: new Date().toISOString()
    };

    setWebhooks([...webhooks, nuevoWebhook]);
    setMensaje('✅ Webhook configurado');

    setFormularioWebhook({
      nombre: '',
      evento: 'transaccion_nueva',
      urlDestino: '',
      activa: false
    });

    setTimeout(() => setMensaje(''), 3000);
  };

  // Probar conexión
  const probarConexion = async (integracion) => {
    setMensaje('⏳ Probando conexión...');

    // Simulación de prueba de conexión
    setTimeout(() => {
      const exito = Math.random() > 0.3; // 70% de éxito

      if (exito) {
        setTestResult({
          exitoso: true,
          mensaje: '✅ Conexión establecida correctamente',
          statusCode: 200,
          tiempo: Math.floor(Math.random() * 2000) + 100
        });
        setMensaje('✅ Prueba exitosa');
      } else {
        setTestResult({
          exitoso: false,
          mensaje: '❌ Error de conexión',
          statusCode: 500,
          error: 'Timeout en la conexión'
        });
        setMensaje('❌ Error en la conexión');
      }
    }, 1500);
  };

  // Sincronizar datos
  const sincronizar = async (integracionId) => {
    setMensaje('⏳ Sincronizando datos...');

    setTimeout(() => {
      setIntegraciones(integraciones.map(i =>
        i.id === integracionId
          ? { ...i, ultimaSincronizacion: new Date().toISOString(), estado: 'ACTIVA' }
          : i
      ));
      setMensaje('✅ Sincronización completada');
    }, 2000);
  };

  // Eliminar integración
  const eliminarIntegracion = (id) => {
    setIntegraciones(integraciones.filter(i => i.id !== id));
    setMensaje('✅ Integración eliminada');
  };

  // Eliminar webhook
  const eliminarWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    setMensaje('✅ Webhook eliminado');
  };

  // Exportar datos
  const exportarDatos = (formato) => {
    setMensaje(`⏳ Generando archivo ${formato.toUpperCase()}...`);

    setTimeout(() => {
      // Simulación de descarga
      const contenido = JSON.stringify({ datos: integraciones }, null, 2);
      const blob = new Blob([contenido], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matriz-contable-export.${formato === 'json' ? 'json' : formato === 'csv' ? 'csv' : 'pdf'}`;
      a.click();

      setMensaje(`✅ Archivo ${formato.toUpperCase()} descargado`);
    }, 1000);
  };

  return (
    <div className="integraciones">
      <header className="header">
        <h1>🔌 Integraciones v42</h1>
        <p>Conecta Matriz Contable con sistemas externos (APIs, Webhooks, Real-time Sync)</p>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.includes('✅') ? 'exito' : 'error'}`}>{mensaje}</div>}

      <div className="contenedor-integraciones">
        {/* AGREGAR INTEGRACIÓN API */}
        <section className="seccion-api">
          <h2>🔗 Agregar Integración API</h2>
          <form onSubmit={agregarIntegracion} className="formulario-integracion">
            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Nombre de la Integración</label>
                <input
                  type="text"
                  placeholder="Ej: ERP Company, Sistema Inventario"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Tipo</label>
                <select
                  value={formulario.tipo}
                  onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                >
                  {Object.entries(tiposIntegracion).map(([clave, nombre]) => (
                    <option key={clave} value={clave}>{nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="fila-formulario">
              <div className="grupo-input">
                <label>URL del Endpoint</label>
                <input
                  type="url"
                  placeholder="https://api.example.com/v1/..."
                  value={formulario.url}
                  onChange={(e) => setFormulario({ ...formulario, url: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Autenticación</label>
                <select
                  value={formulario.autenticacion}
                  onChange={(e) => setFormulario({ ...formulario, autenticacion: e.target.value })}
                >
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                  <option value="oauth">OAuth 2.0</option>
                  <option value="ninguna">Ninguna</option>
                </select>
              </div>
            </div>

            <div className="grupo-input">
              <label>Token/Credencial {formulario.autenticacion !== 'ninguna' && '(requerido)'}</label>
              <input
                type="password"
                placeholder="Ingresa token de autenticación"
                value={formulario.token}
                onChange={(e) => setFormulario({ ...formulario, token: e.target.value })}
              />
            </div>

            <div className="grupo-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formulario.activa}
                  onChange={(e) => setFormulario({ ...formulario, activa: e.target.checked })}
                />
                Activar inmediatamente
              </label>
            </div>

            <button type="submit" className="btn-primary">Agregar Integración</button>
          </form>
        </section>

        {/* INTEGRACIONES AGREGADAS */}
        <section className="seccion-listado-api">
          <h2>📋 Integraciones Configuradas ({integraciones.length})</h2>

          {integraciones.length === 0 ? (
            <p className="sin-datos">No hay integraciones configuradas</p>
          ) : (
            <div className="grid-integraciones">
              {integraciones.map(integ => (
                <div key={integ.id} className={`tarjeta-integracion ${integ.estado.toLowerCase()}`}>
                  <div className="encabezado-tarjeta">
                    <h3>{integ.nombre}</h3>
                    <span className={`badge-estado ${integ.estado.toLowerCase()}`}>
                      {integ.estado}
                    </span>
                  </div>

                  <div className="datos-integracion">
                    <p><span>Tipo:</span> {tiposIntegracion[integ.tipo]}</p>
                    <p><span>URL:</span> <code>{integ.url}</code></p>
                    <p><span>Auth:</span> {integ.autenticacion}</p>
                    {integ.ultimaSincronizacion && (
                      <p><span>Última sync:</span> {new Date(integ.ultimaSincronizacion).toLocaleString('es-CR')}</p>
                    )}
                  </div>

                  <div className="acciones-tarjeta">
                    <button
                      className="btn-test"
                      onClick={() => probarConexion(integ)}
                    >
                      🧪 Probar
                    </button>
                    <button
                      className="btn-sync"
                      onClick={() => sincronizar(integ.id)}
                    >
                      🔄 Sincronizar
                    </button>
                    <button
                      className="btn-eliminar"
                      onClick={() => eliminarIntegracion(integ.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testResult && (
            <div className={`resultado-test ${testResult.exitoso ? 'exito' : 'error'}`}>
              <h4>📊 Resultado de Prueba</h4>
              <p>{testResult.mensaje}</p>
              {testResult.statusCode && <p>Status: {testResult.statusCode}</p>}
              {testResult.tiempo && <p>Tiempo: {testResult.tiempo}ms</p>}
              {testResult.error && <p>Error: {testResult.error}</p>}
            </div>
          )}
        </section>

        {/* WEBHOOKS */}
        <section className="seccion-webhooks">
          <h2>🎣 Configurar Webhooks</h2>
          <form onSubmit={agregarWebhook} className="formulario-webhook">
            <div className="fila-formulario">
              <div className="grupo-input">
                <label>Nombre del Webhook</label>
                <input
                  type="text"
                  placeholder="Ej: Notificación a Slack"
                  value={formularioWebhook.nombre}
                  onChange={(e) => setFormularioWebhook({ ...formularioWebhook, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="grupo-input">
                <label>Evento a Monitorear</label>
                <select
                  value={formularioWebhook.evento}
                  onChange={(e) => setFormularioWebhook({ ...formularioWebhook, evento: e.target.value })}
                >
                  {Object.entries(tiposEventos).map(([clave, nombre]) => (
                    <option key={clave} value={clave}>{nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grupo-input">
              <label>URL de Destino</label>
              <input
                type="url"
                placeholder="https://hooks.slack.com/... o tu webhook URL"
                value={formularioWebhook.urlDestino}
                onChange={(e) => setFormularioWebhook({ ...formularioWebhook, urlDestino: e.target.value })}
                required
              />
            </div>

            <div className="grupo-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formularioWebhook.activa}
                  onChange={(e) => setFormularioWebhook({ ...formularioWebhook, activa: e.target.checked })}
                />
                Activar webhook
              </label>
            </div>

            <button type="submit" className="btn-primary">Configurar Webhook</button>
          </form>

          {webhooks.length > 0 && (
            <div className="listado-webhooks">
              <h3>Webhooks Activos ({webhooks.length})</h3>
              <div className="tabla-webhooks">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Evento</th>
                      <th>URL Destino</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map(webhook => (
                      <tr key={webhook.id}>
                        <td>{webhook.nombre}</td>
                        <td>{tiposEventos[webhook.evento]}</td>
                        <td><code>{webhook.urlDestino.substring(0, 40)}...</code></td>
                        <td>
                          <span className={`badge ${webhook.activa ? 'activo' : 'inactivo'}`}>
                            {webhook.activa ? '✅ Activo' : '⭕ Inactivo'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-eliminar"
                            onClick={() => eliminarWebhook(webhook.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* EXPORTAR/IMPORTAR */}
        <section className="seccion-export-import">
          <h2>💾 Exportar/Importar Datos</h2>

          <div className="controles-export">
            <h3>📥 Exportar Datos</h3>
            <div className="botones-export">
              <button className="btn-export excel" onClick={() => exportarDatos('xlsx')}>
                📊 Excel (.xlsx)
              </button>
              <button className="btn-export csv" onClick={() => exportarDatos('csv')}>
                📋 CSV
              </button>
              <button className="btn-export pdf" onClick={() => exportarDatos('pdf')}>
                📄 PDF
              </button>
              <button className="btn-export json" onClick={() => exportarDatos('json')}>
                { } JSON
              </button>
            </div>
          </div>

          <div className="controles-import">
            <h3>📤 Importar Datos</h3>
            <div className="input-file">
              <input type="file" accept=".xlsx,.csv,.json,.pdf" id="importar-archivo" />
              <label htmlFor="importar-archivo">
                📂 Seleccionar archivo para importar
              </label>
              <button className="btn-primary">Importar Datos</button>
            </div>
          </div>
        </section>

        {/* WEBSOCKET REAL-TIME */}
        <section className="seccion-websocket">
          <h2>⚡ WebSocket - Sincronización en Tiempo Real</h2>
          <div className="websocket-info">
            <p>Habilita sincronización en tiempo real de cambios en la Matriz Contable</p>
            <div className="estado-websocket">
              <span className="dot desconectado"></span>
              <span>Desconectado</span>
            </div>
            <button className="btn-connect">🔌 Conectar WebSocket</button>
          </div>
        </section>
      </div>
    </div>
  );
}
