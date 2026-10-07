import React, { useState, useEffect } from 'react';
import '../styles/SiboModule.css';

const SiboModule = ({ i18n = {} }) => {
  const t = i18n.t || ((key) => key);

  const [bienes, setBienes] = useState([]);
  const [omisiones, setOmisiones] = useState([]);
  const [formData, setFormData] = useState({
    descripcion: '',
    valorCatalogado: 0,
    valorOmitido: 0,
    fechaOmision: new Date().toISOString().split('T')[0],
    periodo: 'anual',
    resolucion: '',
    observaciones: '',
  });

  const [reportData, setReportData] = useState({
    periodo: 'anual',
    fechaInicio: '',
    fechaFin: '',
  });

  const [filtros, setFiltros] = useState({
    estado: 'todos',
    periodo: 'todos',
    buscar: '',
  });

  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [activeTab, setActiveTab] = useState('bienes');

  // Agregar bien omitido
  const agregarBien = () => {
    if (!formData.descripcion || !formData.valorCatalogado) {
      setMensajeError(t('fillAllFields'));
      return;
    }

    try {
      const bien = {
        id: `SIBO-${Date.now()}`,
        ...formData,
        fechaRegistro: new Date().toISOString(),
        estado: 'reportado',
        penalizacion: calcularPenalizacion(formData.valorOmitido),
      };

      setBienes([...bienes, bien]);
      setOmisiones([...omisiones, {
        ...bien,
        tipo: 'omision',
        montoOmitido: formData.valorOmitido,
      }]);

      setMensajeExito(`${t('success')}: ${bien.id}`);

      // Reset form
      setFormData({
        descripcion: '',
        valorCatalogado: 0,
        valorOmitido: 0,
        fechaOmision: new Date().toISOString().split('T')[0],
        periodo: 'anual',
        resolucion: '',
        observaciones: '',
      });

      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    }
  };

  // Calcular penalización (Costa Rica: 30-100% del monto omitido)
  const calcularPenalizacion = (monto) => {
    return monto * 0.30; // 30% base
  };

  // Generar reporte para Hacienda
  const generarReporteSibo = async () => {
    if (omisiones.length === 0) {
      setMensajeError(t('noData'));
      return;
    }

    try {
      setCargando(true);

      const montoOmitidoTotal = omisiones.reduce((acc, omision) => acc + omision.valorOmitido, 0);
      const penalizacionTotal = omisiones.reduce((acc, omision) => acc + omision.penalizacion, 0);

      const reporte = {
        id: `REPORTE-SIBO-${Date.now()}`,
        periodo: reportData.periodo,
        fechaGeneracion: new Date().toISOString(),
        cantidadOmisiones: omisiones.length,
        montoOmitidoTotal,
        penalizacionTotal,
        impuestoAdeudo: montoOmitidoTotal * 0.13, // 13% IVA CR
        interesMora: montoOmitidoTotal * 0.02, // 2% interés
        totalAdeudo: montoOmitidoTotal + (montoOmitidoTotal * 0.13) + (montoOmitidoTotal * 0.02),
        detalles: omisiones,
      };

      // Simular envío a Hacienda
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMensajeExito(`${t('reportGenerated')}: ${reporte.id}`);
      setTimeout(() => setMensajeExito(''), 3000);

      return reporte;
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Exportar reporte a XML para Hacienda
  const exportarXML = () => {
    const xml = generarXMLReporte();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/xml;charset=utf-8,' + encodeURIComponent(xml));
    element.setAttribute('download', `reporte-sibo-${Date.now()}.xml`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Generar XML para Hacienda
  const generarXMLReporte = () => {
    const montoOmitidoTotal = omisiones.reduce((acc, o) => acc + o.valorOmitido, 0);

    return `<?xml version="1.0" encoding="UTF-8"?>
<ReporteSibo xmlns="https://www.hacienda.go.cr/sibo">
  <Encabezado>
    <Id>REPORTE-SIBO-${Date.now()}</Id>
    <FechaGeneracion>${new Date().toISOString()}</FechaGeneracion>
    <Periodo>${reportData.periodo}</Periodo>
  </Encabezado>
  <Resumen>
    <CantidadBienes>${omisiones.length}</CantidadBienes>
    <MontoOmitidoTotal>${montoOmitidoTotal}</MontoOmitidoTotal>
    <Penalizacion>${calcularPenalizacion(montoOmitidoTotal)}</Penalizacion>
  </Resumen>
  <Bienes>
    ${omisiones.map((bien, idx) => `
    <Bien>
      <Numero>${idx + 1}</Numero>
      <Descripcion>${bien.descripcion}</Descripcion>
      <ValorCatalogado>${bien.valorCatalogado}</ValorCatalogado>
      <ValorOmitido>${bien.valorOmitido}</ValorOmitido>
      <Diferencia>${bien.valorCatalogado - bien.valorOmitido}</Diferencia>
      <FechaOmision>${bien.fechaOmision}</FechaOmision>
    </Bien>
    `).join('')}
  </Bienes>
</ReporteSibo>`;
  };

  // Filtrar bienes
  const bienesFiltrados = bienes.filter(bien => {
    if (filtros.estado !== 'todos' && bien.estado !== filtros.estado) return false;
    if (filtros.periodo !== 'todos' && bien.periodo !== filtros.periodo) return false;
    if (filtros.buscar && !bien.descripcion.toLowerCase().includes(filtros.buscar.toLowerCase())) return false;
    return true;
  });

  // Calcular estadísticas
  const stats = {
    totalBienes: bienes.length,
    montoOmitidoTotal: omisiones.reduce((acc, o) => acc + o.valorOmitido, 0),
    penalizacionTotal: omisiones.reduce((acc, o) => acc + o.penalizacion, 0),
    impuestoAdeudo: omisiones.reduce((acc, o) => acc + (o.valorOmitido * 0.13), 0),
    totalAdeudo: 0,
  };
  stats.totalAdeudo = stats.montoOmitidoTotal + stats.impuestoAdeudo + stats.penalizacionTotal;

  const estado = {
    reportado: 'Reportado ✅',
    enRevision: 'En Revisión 🔍',
    resuelta: 'Resuelta ✓',
  };

  return (
    <div className="sibo-module">
      <div className="header-sibo">
        <h1>📊 {t('siboSystem')}</h1>
        <p>{t('sistemaInformacionBienes')}</p>
      </div>

      {mensajeExito && <div className="alerta alerta-exito">{mensajeExito}</div>}
      {mensajeError && <div className="alerta alerta-error">{mensajeError}</div>}

      {/* ESTADÍSTICAS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <div className="stat-label">{t('totalBienes')}</div>
            <div className="stat-valor">{stats.totalBienes}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <div className="stat-label">{t('montoOmitido')}</div>
            <div className="stat-valor">₡ {stats.montoOmitidoTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <div className="stat-label">{t('penalizacion')}</div>
            <div className="stat-valor">₡ {stats.penalizacionTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <div className="stat-label">{t('totalAdeudo')}</div>
            <div className="stat-valor">₡ {stats.totalAdeudo.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-sibo">
        <button
          className={`tab ${activeTab === 'bienes' ? 'activo' : ''}`}
          onClick={() => setActiveTab('bienes')}
        >
          📦 Bienes Omitidos
        </button>
        <button
          className={`tab ${activeTab === 'reportes' ? 'activo' : ''}`}
          onClick={() => setActiveTab('reportes')}
        >
          📊 Generar Reporte
        </button>
        <button
          className={`tab ${activeTab === 'historial' ? 'activo' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          📜 Historial
        </button>
      </div>

      {/* FORMULARIO AGREGAR BIEN */}
      {activeTab === 'bienes' && (
        <>
          <div className="seccion-formulario-sibo">
            <h2>Registrar Bien Omitido</h2>

            <div className="form-section">
              <div className="form-group">
                <label>{t('descripcion')}</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada del bien omitido"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('valorCatalogado')}</label>
                  <input
                    type="number"
                    value={formData.valorCatalogado}
                    onChange={(e) => setFormData({ ...formData, valorCatalogado: parseFloat(e.target.value) })}
                    placeholder="Valor según catastro"
                  />
                </div>
                <div className="form-group">
                  <label>{t('valorOmitido')}</label>
                  <input
                    type="number"
                    value={formData.valorOmitido}
                    onChange={(e) => setFormData({ ...formData, valorOmitido: parseFloat(e.target.value) })}
                    placeholder="Valor omitido en declaración"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('fechaOmision')}</label>
                  <input
                    type="date"
                    value={formData.fechaOmision}
                    onChange={(e) => setFormData({ ...formData, fechaOmision: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('periodo')}</label>
                  <select
                    value={formData.periodo}
                    onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  >
                    <option value="anual">Anual</option>
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('resolucion')}</label>
                <input
                  type="text"
                  value={formData.resolucion}
                  onChange={(e) => setFormData({ ...formData, resolucion: e.target.value })}
                  placeholder="Resolución de Hacienda asociada"
                />
              </div>

              <div className="form-group">
                <label>{t('observaciones')}</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  placeholder="Observaciones adicionales"
                  rows="3"
                />
              </div>

              <button className="btn-agregar-bien" onClick={agregarBien} disabled={cargando}>
                {cargando ? '⏳ Guardando...' : '✅ Registrar Bien'}
              </button>
            </div>
          </div>

          {/* LISTADO DE BIENES */}
          <div className="seccion-listado-sibo">
            <h2>Bienes Registrados</h2>

            <div className="filtros-sibo">
              <div className="filtro">
                <label>{t('estado')}</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                >
                  <option value="todos">Todos</option>
                  <option value="reportado">Reportado</option>
                  <option value="enRevision">En Revisión</option>
                  <option value="resuelta">Resuelta</option>
                </select>
              </div>

              <div className="filtro">
                <label>{t('buscar')}</label>
                <input
                  type="text"
                  value={filtros.buscar}
                  onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
                  placeholder="Buscar bien..."
                />
              </div>
            </div>

            {bienesFiltrados.length === 0 ? (
              <p className="sin-datos">{t('noData')}</p>
            ) : (
              <table className="tabla-bienes">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('descripcion')}</th>
                    <th>{t('valorCatalogado')}</th>
                    <th>{t('valorOmitido')}</th>
                    <th>{t('penalizacion')}</th>
                    <th>{t('estado')}</th>
                    <th>{t('periodo')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bienesFiltrados.map((bien) => (
                    <tr key={bien.id}>
                      <td className="id">{bien.id}</td>
                      <td>{bien.descripcion}</td>
                      <td className="valor">₡ {bien.valorCatalogado.toFixed(2)}</td>
                      <td className="valor">₡ {bien.valorOmitido.toFixed(2)}</td>
                      <td className="penalizacion">₡ {bien.penalizacion.toFixed(2)}</td>
                      <td>
                        <span className="badge">{estado[bien.estado]}</span>
                      </td>
                      <td>{bien.periodo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* GENERAR REPORTE */}
      {activeTab === 'reportes' && (
        <div className="seccion-reporte-sibo">
          <h2>Generar Reporte para Hacienda</h2>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>{t('periodo')}</label>
                <select
                  value={reportData.periodo}
                  onChange={(e) => setReportData({ ...reportData, periodo: e.target.value })}
                >
                  <option value="anual">Anual</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('fechaInicio')}</label>
                <input
                  type="date"
                  value={reportData.fechaInicio}
                  onChange={(e) => setReportData({ ...reportData, fechaInicio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t('fechaFin')}</label>
                <input
                  type="date"
                  value={reportData.fechaFin}
                  onChange={(e) => setReportData({ ...reportData, fechaFin: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="resumen-reporte">
            <h3>Resumen del Reporte</h3>
            <div className="resumen-grid">
              <div className="resumen-item">
                <span className="resumen-label">Bienes a Reportar</span>
                <span className="resumen-valor">{omisiones.length}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Monto Omitido Total</span>
                <span className="resumen-valor">₡ {stats.montoOmitidoTotal.toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">Penalización (30%)</span>
                <span className="resumen-valor">₡ {stats.penalizacionTotal.toFixed(2)}</span>
              </div>
              <div className="resumen-item">
                <span className="resumen-label">IVA Adeudado (13%)</span>
                <span className="resumen-valor">₡ {stats.impuestoAdeudo.toFixed(2)}</span>
              </div>
              <div className="resumen-item total">
                <span className="resumen-label">Total Adeudo</span>
                <span className="resumen-valor">₡ {stats.totalAdeudo.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="acciones-reporte">
            <button
              className="btn-generar-reporte"
              onClick={generarReporteSibo}
              disabled={cargando || omisiones.length === 0}
            >
              {cargando ? '⏳ Generando...' : '📊 Generar Reporte'}
            </button>
            <button
              className="btn-exportar-xml"
              onClick={exportarXML}
              disabled={omisiones.length === 0}
            >
              📁 Exportar XML
            </button>
          </div>
        </div>
      )}

      {/* HISTORIAL */}
      {activeTab === 'historial' && (
        <div className="seccion-historial-sibo">
          <h2>Historial de Reportes</h2>

          {omisiones.length === 0 ? (
            <p className="sin-datos">{t('noData')}</p>
          ) : (
            <table className="tabla-historial">
              <thead>
                <tr>
                  <th>ID Bien</th>
                  <th>{t('descripcion')}</th>
                  <th>{t('valorOmitido')}</th>
                  <th>{t('penalizacion')}</th>
                  <th>{t('fechaRegistro')}</th>
                </tr>
              </thead>
              <tbody>
                {omisiones.map((omision) => (
                  <tr key={omision.id}>
                    <td>{omision.id}</td>
                    <td>{omision.descripcion}</td>
                    <td className="valor">₡ {omision.valorOmitido.toFixed(2)}</td>
                    <td className="valor">₡ {omision.penalizacion.toFixed(2)}</td>
                    <td>{new Date(omision.fechaRegistro).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default SiboModule;
