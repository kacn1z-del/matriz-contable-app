import React, { useState, useEffect } from 'react';
import '../styles/FacturaElectronica.css';

const FacturaElectronica = ({ i18n = {} }) => {
  const t = i18n.t || ((key) => key);

  const [activeTab, setActiveTab] = useState('factura');
  const [facturas, setFacturas] = useState([]);
  const [notasCredito, setNotasCredito] = useState([]);
  const [notasDebito, setNotasDebito] = useState([]);
  const [recibos, setRecibos] = useState([]);

  const [formData, setFormData] = useState({
    tipo: 'factura',
    numeroFactura: '',
    fecha: new Date().toISOString().split('T')[0],
    cliente: {
      nombre: '',
      cedula: '',
      email: '',
      telefono: '',
    },
    detalles: [
      { descripcion: '', cantidad: 1, precioUnitario: 0, impuesto: 0 }
    ],
    condicionVenta: '01', // Contado
    plazoCredito: 0,
    observaciones: '',
    usarTimbrado: true,
  });

  const [estados, setEstados] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mensajeError, setMensajeError] = useState('');

  // Secuencia de timbrado - En producción usar Cloudflare Worker
  const generarNumeroSecuencial = () => {
    const hoy = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${hoy}${random}`;
  };

  // Generar clave de factura (formato Costa Rica)
  const generarClaveFE = (tipoDocumento) => {
    const fecha = new Date();
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear().toString().slice(-2);

    // Formato: DDMMYYTipoDocumento00{Empresa}000{Secuencial}
    const numeroSecuencial = generarNumeroSecuencial();
    return `${dia}${mes}${anio}${tipoDocumento}00000000000${numeroSecuencial}`;
  };

  // Firmar factura digitalmente (XAdES-EPES)
  const firmarFactura = async (claveFE, datosFactura) => {
    try {
      setCargando(true);

      // En producción, esto iría a un endpoint Cloudflare Worker
      // que maneja la firma con el certificado digital
      const xmlFactura = generarXMLFactura(claveFE, datosFactura);

      // Simulación - En producción usar @dojocoding/hacienda-sdk
      const firmaDigital = btoa(xmlFactura); // Base64 encode como simulación

      return {
        claveFE,
        xmlFactura,
        firmaDigital,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Error al firmar factura: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Generar XML de factura
  const generarXMLFactura = (claveFE, datosFactura) => {
    const {
      numeroFactura,
      fecha,
      cliente,
      detalles,
      condicionVenta,
      plazoCredito,
      observaciones,
    } = datosFactura;

    const subtotal = detalles.reduce((acc, det) => acc + (det.cantidad * det.precioUnitario), 0);
    const impuesto = detalles.reduce((acc, det) => acc + det.impuesto, 0);
    const total = subtotal + impuesto;

    return `<?xml version="1.0" encoding="UTF-8"?>
<FacturaElectronica xmlns="https://www.hacienda.go.cr/fe/Comprobante">
  <Encabezado>
    <Clave>${claveFE}</Clave>
    <FechaEmision>${fecha}T00:00:00</FechaEmision>
    <Emisor>
      <Nombre>Mi Empresa</Nombre>
      <Identificacion>
        <Tipo>01</Tipo>
        <Numero>1234567890</Numero>
      </Identificacion>
    </Emisor>
    <Receptor>
      <Nombre>${cliente.nombre}</Nombre>
      <Identificacion>
        <Tipo>01</Tipo>
        <Numero>${cliente.cedula}</Numero>
      </Identificacion>
      <Correo>${cliente.email}</Correo>
    </Receptor>
    <CondicionVenta>${condicionVenta}</CondicionVenta>
    <PlazoCredito>${plazoCredito}</PlazoCredito>
  </Encabezado>
  <DetalleServicio>
    ${detalles.map((det, idx) => `
    <LineaDetalle>
      <NumeroLinea>${idx + 1}</NumeroLinea>
      <Descripcion>${det.descripcion}</Descripcion>
      <Cantidad>${det.cantidad}</Cantidad>
      <PrecioUnitario>${det.precioUnitario}</PrecioUnitario>
      <MontoLinea>${det.cantidad * det.precioUnitario}</MontoLinea>
      <Impuesto>
        <Codigo>01</Codigo>
        <Tarifa>${(det.impuesto / (det.cantidad * det.precioUnitario) * 100).toFixed(2)}</Tarifa>
        <Monto>${det.impuesto}</Monto>
      </Impuesto>
    </LineaDetalle>
    `).join('')}
  </DetalleServicio>
  <Resumen>
    <TotalServGravados>${subtotal}</TotalServGravados>
    <TotalImpuesto>${impuesto}</TotalImpuesto>
    <TotalComprobante>${total}</TotalComprobante>
  </Resumen>
  <Observaciones>${observaciones}</Observaciones>
</FacturaElectronica>`;
  };

  // Enviar factura a Hacienda
  const enviarAHacienda = async (facturaFirmada) => {
    try {
      setCargando(true);

      // En producción: usar endpoint real de Hacienda
      // https://www.hacienda.go.cr/api/v1/enviar-comprobante

      const respuesta = {
        idEnvio: Math.random().toString(36).substring(7),
        estado: 'aceptado',
        mensajeHacienda: 'Factura electrónica recibida correctamente',
        timestamp: new Date().toISOString(),
      };

      return respuesta;
    } catch (error) {
      throw new Error(`Error al enviar a Hacienda: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // Emitir factura
  const emitirFactura = async () => {
    if (!formData.cliente.nombre || !formData.cliente.cedula) {
      setMensajeError(t('fillAllFields'));
      return;
    }

    try {
      setCargando(true);
      setMensajeError('');

      // Generar clave de factura
      const claveFE = generarClaveFE('01'); // 01 = Factura

      // Firmar factura
      const facturaFirmada = await firmarFactura(claveFE, formData);

      // Enviar a Hacienda
      const respuestaHacienda = await enviarAHacienda(facturaFirmada);

      // Guardar factura
      const nuevaFactura = {
        id: claveFE,
        ...formData,
        claveFE,
        estado: respuestaHacienda.estado,
        idEnvio: respuestaHacienda.idEnvio,
        fechaEmision: new Date().toISOString(),
      };

      setFacturas([...facturas, nuevaFactura]);
      setEstados({ ...estados, [claveFE]: respuestaHacienda.estado });
      setMensajeExito(`${t('success')}: ${claveFE}`);

      // Reset form
      setTimeout(() => {
        setFormData({
          ...formData,
          numeroFactura: '',
          cliente: { nombre: '', cedula: '', email: '', telefono: '' },
          detalles: [{ descripcion: '', cantidad: 1, precioUnitario: 0, impuesto: 0 }],
          observaciones: '',
        });
        setMensajeExito('');
      }, 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Emitir nota de crédito
  const emitirNotaCredito = async () => {
    if (!facturas.length) {
      setMensajeError(t('selectFactura'));
      return;
    }

    try {
      setCargando(true);
      const claveFE = generarClaveFE('03'); // 03 = Nota Crédito

      const notaNueva = {
        id: claveFE,
        ...formData,
        claveFE,
        tipoDocumento: 'notaCredito',
        estado: 'aceptado',
        fechaEmision: new Date().toISOString(),
      };

      setNotasCredito([...notasCredito, notaNueva]);
      setMensajeExito(`${t('success')}: Nota de Crédito ${claveFE}`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Emitir nota de débito
  const emitirNotaDebito = async () => {
    if (!facturas.length) {
      setMensajeError(t('selectFactura'));
      return;
    }

    try {
      setCargando(true);
      const claveFE = generarClaveFE('05'); // 05 = Nota Débito

      const notaNueva = {
        id: claveFE,
        ...formData,
        claveFE,
        tipoDocumento: 'notaDebito',
        estado: 'aceptado',
        fechaEmision: new Date().toISOString(),
      };

      setNotasDebito([...notasDebito, notaNueva]);
      setMensajeExito(`${t('success')}: Nota de Débito ${claveFE}`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Emitir recibo de pago
  const emitirRecibo = async () => {
    if (!formData.cliente.nombre) {
      setMensajeError(t('fillAllFields'));
      return;
    }

    try {
      setCargando(true);
      const claveFE = generarClaveFE('04'); // 04 = Recibo de Pago

      const reciboNuevo = {
        id: claveFE,
        ...formData,
        claveFE,
        tipoDocumento: 'reciboPago',
        estado: 'aceptado',
        fechaEmision: new Date().toISOString(),
      };

      setRecibos([...recibos, reciboNuevo]);
      setMensajeExito(`${t('success')}: Recibo ${claveFE}`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Consultar estado con Hacienda
  const consultarEstado = async (claveFE) => {
    try {
      setCargando(true);

      // Simulación - En producción usar API real de Hacienda
      const respuesta = {
        claveFE,
        estado: 'aceptado',
        mensaje: 'Comprobante aceptado por Hacienda',
        timestamp: new Date().toISOString(),
      };

      setEstados({ ...estados, [claveFE]: respuesta.estado });
      setMensajeExito(`${t('estado')}: ${respuesta.estado.toUpperCase()}`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Exportar factura a PDF
  const exportarPDF = (factura) => {
    const contenido = `
FACTURA ELECTRÓNICA
Clave: ${factura.claveFE}
Fecha: ${factura.fechaEmision}

CLIENTE
Nombre: ${factura.cliente.nombre}
Cédula: ${factura.cliente.cedula}
Email: ${factura.cliente.email}

DETALLES
${factura.detalles.map((det, idx) =>
  `${idx + 1}. ${det.descripcion} - ${det.cantidad} x ${det.precioUnitario} = ${det.cantidad * det.precioUnitario}`
).join('\n')}

ESTADO: ${factura.estado.toUpperCase()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(contenido));
    element.setAttribute('download', `factura_${factura.claveFE}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Enviar por email
  const enviarPorEmail = async (factura) => {
    try {
      setCargando(true);
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMensajeExito(`${t('enviado')}: ${factura.cliente.email}`);
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (error) {
      setMensajeError(error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleDetalleChange = (index, field, value) => {
    const nuevosDetalles = [...formData.detalles];
    nuevosDetalles[index][field] = field === 'cantidad' || field === 'precioUnitario' ? parseFloat(value) : value;
    setFormData({ ...formData, detalles: nuevosDetalles });
  };

  const agregarDetalle = () => {
    setFormData({
      ...formData,
      detalles: [...formData.detalles, { descripcion: '', cantidad: 1, precioUnitario: 0, impuesto: 0 }]
    });
  };

  const eliminarDetalle = (index) => {
    setFormData({
      ...formData,
      detalles: formData.detalles.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="factura-electronica">
      <div className="header-factura">
        <h1>📄 {t('facturaElectronica')}</h1>
        <p>{t('haciendaCR')}</p>
      </div>

      {mensajeExito && <div className="alerta alerta-exito">{mensajeExito}</div>}
      {mensajeError && <div className="alerta alerta-error">{mensajeError}</div>}

      <div className="tabs-factura">
        <button className={`tab ${activeTab === 'factura' ? 'activo' : ''}`} onClick={() => setActiveTab('factura')}>
          📋 {t('facturas')}
        </button>
        <button className={`tab ${activeTab === 'notaCredito' ? 'activo' : ''}`} onClick={() => setActiveTab('notaCredito')}>
          ✅ {t('notasCredito')}
        </button>
        <button className={`tab ${activeTab === 'notaDebito' ? 'activo' : ''}`} onClick={() => setActiveTab('notaDebito')}>
          ❌ {t('notasDebito')}
        </button>
        <button className={`tab ${activeTab === 'recibos' ? 'activo' : ''}`} onClick={() => setActiveTab('recibos')}>
          💰 {t('recibos')}
        </button>
      </div>

      {/* FORMULARIO DE FACTURA */}
      {activeTab === 'factura' && (
        <div className="seccion-formulario">
          <h2>{t('emitirFactura')}</h2>

          <div className="form-section">
            <h3>{t('datosCliente')}</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t('nombre')}</label>
                <input
                  type="text"
                  value={formData.cliente.nombre}
                  onChange={(e) => setFormData({
                    ...formData,
                    cliente: { ...formData.cliente, nombre: e.target.value }
                  })}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div className="form-group">
                <label>{t('cedula')}</label>
                <input
                  type="text"
                  value={formData.cliente.cedula}
                  onChange={(e) => setFormData({
                    ...formData,
                    cliente: { ...formData.cliente, cedula: e.target.value }
                  })}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={formData.cliente.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    cliente: { ...formData.cliente, email: e.target.value }
                  })}
                  placeholder="cliente@ejemplo.com"
                />
              </div>
              <div className="form-group">
                <label>{t('telefono')}</label>
                <input
                  type="tel"
                  value={formData.cliente.telefono}
                  onChange={(e) => setFormData({
                    ...formData,
                    cliente: { ...formData.cliente, telefono: e.target.value }
                  })}
                  placeholder="+506 2000 0000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>{t('detalles')}</h3>
            <table className="tabla-detalles">
              <thead>
                <tr>
                  <th>{t('descripcion')}</th>
                  <th>{t('cantidad')}</th>
                  <th>{t('precioUnitario')}</th>
                  <th>{t('impuesto')}</th>
                  <th>{t('subtotal')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.detalles.map((det, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={det.descripcion}
                        onChange={(e) => handleDetalleChange(idx, 'descripcion', e.target.value)}
                        placeholder="Descripción del servicio"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={det.cantidad}
                        onChange={(e) => handleDetalleChange(idx, 'cantidad', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={det.precioUnitario}
                        onChange={(e) => handleDetalleChange(idx, 'precioUnitario', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={det.impuesto}
                        onChange={(e) => handleDetalleChange(idx, 'impuesto', e.target.value)}
                      />
                    </td>
                    <td className="subtotal">₡ {(det.cantidad * det.precioUnitario + det.impuesto).toFixed(2)}</td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarDetalle(idx)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-agregar" onClick={agregarDetalle}>+ {t('agregarDetalle')}</button>
          </div>

          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>{t('condicionVenta')}</label>
                <select
                  value={formData.condicionVenta}
                  onChange={(e) => setFormData({ ...formData, condicionVenta: e.target.value })}
                >
                  <option value="01">Contado</option>
                  <option value="02">Crédito</option>
                  <option value="03">Consignación</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('plazoCredito')}</label>
                <input
                  type="number"
                  value={formData.plazoCredito}
                  onChange={(e) => setFormData({ ...formData, plazoCredito: parseInt(e.target.value) })}
                  placeholder="Días"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label>{t('observaciones')}</label>
              <textarea
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales"
                rows="3"
              />
            </div>
          </div>

          <button
            className="btn-emitir"
            onClick={emitirFactura}
            disabled={cargando}
          >
            {cargando ? '⏳ Procesando...' : '✅ Emitir Factura'}
          </button>
        </div>
      )}

      {/* LISTADO DE FACTURAS */}
      <div className="seccion-listado">
        <h2>{t('facturas')} Emitidas</h2>
        {facturas.length === 0 ? (
          <p className="sin-datos">{t('noData')}</p>
        ) : (
          <table className="tabla-comprobantes">
            <thead>
              <tr>
                <th>Clave</th>
                <th>{t('cliente')}</th>
                <th>Total</th>
                <th>{t('estado')}</th>
                <th>{t('acciones')}</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => {
                const total = factura.detalles.reduce((acc, det) => acc + (det.cantidad * det.precioUnitario + det.impuesto), 0);
                return (
                  <tr key={factura.id}>
                    <td className="clave">{factura.claveFE}</td>
                    <td>{factura.cliente.nombre}</td>
                    <td className="total">₡ {total.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${factura.estado}`}>
                        {factura.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="acciones">
                      <button onClick={() => consultarEstado(factura.claveFE)} title="Consultar estado">🔍</button>
                      <button onClick={() => exportarPDF(factura)} title="Descargar PDF">📥</button>
                      <button onClick={() => enviarPorEmail(factura)} title="Enviar por email">✉️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* NOTAS DE CRÉDITO */}
      {activeTab === 'notaCredito' && (
        <div className="seccion-notas">
          <button
            className="btn-emitir"
            onClick={emitirNotaCredito}
            disabled={cargando || facturas.length === 0}
          >
            {cargando ? '⏳ Procesando...' : '✅ Emitir Nota de Crédito'}
          </button>

          {notasCredito.length === 0 ? (
            <p className="sin-datos">{t('noData')}</p>
          ) : (
            <table className="tabla-comprobantes">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>{t('cliente')}</th>
                  <th>Monto</th>
                  <th>{t('estado')}</th>
                </tr>
              </thead>
              <tbody>
                {notasCredito.map((nota) => (
                  <tr key={nota.id}>
                    <td>{nota.claveFE}</td>
                    <td>{nota.cliente.nombre}</td>
                    <td>₡ 0.00</td>
                    <td><span className="badge badge-aceptado">ACEPTADO</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* NOTAS DE DÉBITO */}
      {activeTab === 'notaDebito' && (
        <div className="seccion-notas">
          <button
            className="btn-emitir"
            onClick={emitirNotaDebito}
            disabled={cargando || facturas.length === 0}
          >
            {cargando ? '⏳ Procesando...' : '✅ Emitir Nota de Débito'}
          </button>

          {notasDebito.length === 0 ? (
            <p className="sin-datos">{t('noData')}</p>
          ) : (
            <table className="tabla-comprobantes">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>{t('cliente')}</th>
                  <th>Monto</th>
                  <th>{t('estado')}</th>
                </tr>
              </thead>
              <tbody>
                {notasDebito.map((nota) => (
                  <tr key={nota.id}>
                    <td>{nota.claveFE}</td>
                    <td>{nota.cliente.nombre}</td>
                    <td>₡ 0.00</td>
                    <td><span className="badge badge-aceptado">ACEPTADO</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* RECIBOS DE PAGO */}
      {activeTab === 'recibos' && (
        <div className="seccion-recibos">
          <button
            className="btn-emitir"
            onClick={emitirRecibo}
            disabled={cargando}
          >
            {cargando ? '⏳ Procesando...' : '✅ Emitir Recibo'}
          </button>

          {recibos.length === 0 ? (
            <p className="sin-datos">{t('noData')}</p>
          ) : (
            <table className="tabla-comprobantes">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>{t('cliente')}</th>
                  <th>Monto</th>
                  <th>{t('estado')}</th>
                </tr>
              </thead>
              <tbody>
                {recibos.map((recibo) => (
                  <tr key={recibo.id}>
                    <td>{recibo.claveFE}</td>
                    <td>{recibo.cliente.nombre}</td>
                    <td>₡ 0.00</td>
                    <td><span className="badge badge-aceptado">ACEPTADO</span></td>
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

export default FacturaElectronica;
