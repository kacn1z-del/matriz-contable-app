/**
 * Matriz Contable CR - App Principal
 * Versión: v39.5 COMPLETA
 *
 * Aplicación React integrada con todos los módulos:
 * - Contabilidad Básica v39
 * - Derivados Avanzados v39.2
 * - Gestión de Riesgos v40
 * - M&A Accounting v41
 * - Integraciones v42
 * - Google Sheets v43
 * - Dashboard PRO
 */

import React, { useState, useEffect } from 'react';
import ContabilidadBasica from './components/ContabilidadBasica';
import DerivadosAvanzados from './components/DerivadosAvanzados';
import GestionRiesgos from './components/GestionRiesgos';
import MAAccounting from './components/MAAccounting';
import Integraciones from './components/Integraciones';
import GoogleSheetsImporter from './components/GoogleSheetsImporter';
import DashboardPRO from './components/DashboardPRO';
import './App.css';

export default function App() {
  const [moduloActivo, setModuloActivo] = useState('dashboard');
  const [temaOscuro, setTemaOscuro] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [usuario, setUsuario] = useState(null);

  // Inicializar usuario
  useEffect(() => {
    // Simular carga de usuario
    setUsuario({
      nombre: 'Usuario Matriz Contable',
      email: 'usuario@matrizcontable.cr',
      rol: 'Administrador'
    });
  }, []);

  // Agregar notificación
  const agregarNotificacion = (mensaje, tipo = 'info') => {
    const id = Date.now();
    const notif = { id, mensaje, tipo };
    setNotificaciones([...notificaciones, notif]);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Remover notificación
  const removerNotificacion = (id) => {
    setNotificaciones(notificaciones.filter(n => n.id !== id));
  };

  // Módulos disponibles
  const modulos = [
    { id: 'dashboard', nombre: '📊 Dashboard', icono: '📊' },
    { id: 'contabilidad', nombre: '💼 Contabilidad Básica', icono: '💼' },
    { id: 'derivados', nombre: '📈 Derivados v39.2', icono: '📈' },
    { id: 'riesgos', nombre: '⚠️ Gestión Riesgos v40', icono: '⚠️' },
    { id: 'ma', nombre: '🤝 M&A Accounting v41', icono: '🤝' },
    { id: 'integraciones', nombre: '🔌 Integraciones v42', icono: '🔌' },
    { id: 'sheets', nombre: '🔗 Google Sheets v43', icono: '🔗' }
  ];

  // Renderizar módulo activo
  const renderModulo = () => {
    switch (moduloActivo) {
      case 'dashboard':
        return <DashboardPRO />;
      case 'contabilidad':
        return <ContabilidadBasica />;
      case 'derivados':
        return <DerivadosAvanzados />;
      case 'riesgos':
        return <GestionRiesgos />;
      case 'ma':
        return <MAAccounting />;
      case 'integraciones':
        return <Integraciones />;
      case 'sheets':
        return <GoogleSheetsImporter />;
      default:
        return <DashboardPRO />;
    }
  };

  return (
    <div className={`app-contenedor ${temaOscuro ? 'tema-oscuro' : 'tema-claro'}`}>
      {/* HEADER */}
      <header className="header-app">
        <div className="header-izquierda">
          <h1 className="logo">🧮 Matriz Contable CR v39.5</h1>
          <p className="subtitulo">Plataforma integral de contabilidad y gestión financiera</p>
        </div>

        <div className="header-derecha">
          {usuario && (
            <div className="info-usuario">
              <span className="usuario-nombre">{usuario.nombre}</span>
              <span className="usuario-rol">{usuario.rol}</span>
            </div>
          )}

          <button
            className="btn-tema"
            onClick={() => setTemaOscuro(!temaOscuro)}
            title={temaOscuro ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {temaOscuro ? '☀️' : '🌙'}
          </button>

          <button className="btn-notificaciones" title="Notificaciones">
            🔔
            {notificaciones.length > 0 && <span className="badge">{notificaciones.length}</span>}
          </button>

          <button className="btn-configuracion" title="Configuración">
            ⚙️
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVEGACIÓN */}
      <aside className="sidebar">
        <nav className="nav-modulos">
          <h2 className="nav-titulo">Módulos</h2>
          <ul className="lista-modulos">
            {modulos.map(modulo => (
              <li key={modulo.id}>
                <button
                  className={`btn-modulo ${moduloActivo === modulo.id ? 'activo' : ''}`}
                  onClick={() => setModuloActivo(modulo.id)}
                  title={modulo.nombre}
                >
                  <span className="icono-modulo">{modulo.icono}</span>
                  <span className="nombre-modulo">{modulo.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="seccion-ayuda">
          <h3>📚 Recursos</h3>
          <ul>
            <li><a href="#" className="link-ayuda">📖 Documentación</a></li>
            <li><a href="#" className="link-ayuda">🎓 Tutoriales</a></li>
            <li><a href="#" className="link-ayuda">❓ FAQ</a></li>
            <li><a href="#" className="link-ayuda">💬 Soporte</a></li>
          </ul>
        </div>

        <div className="version-info">
          <p className="version">v39.5 COMPLETA</p>
          <p className="fecha">Octubre 2026</p>
          <button className="btn-check-updates">🔄 Verificar actualizaciones</button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="contenido-principal">
        {/* NOTIFICACIONES */}
        {notificaciones.length > 0 && (
          <div className="contenedor-notificaciones">
            {notificaciones.map(notif => (
              <div key={notif.id} className={`notificacion notificacion-${notif.tipo}`}>
                <span>{notif.mensaje}</span>
                <button
                  className="btn-cerrar"
                  onClick={() => removerNotificacion(notif.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* MÓDULO ACTIVO */}
        <div className="modulo-contenedor">
          {renderModulo()}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer-app">
        <div className="footer-contenido">
          <div className="footer-seccion">
            <h4>Matriz Contable CR</h4>
            <p>Solución integral para contabilidad y gestión financiera empresarial</p>
          </div>

          <div className="footer-seccion">
            <h4>Características</h4>
            <ul>
              <li>✅ Contabilidad completa IFRS</li>
              <li>✅ Gestión de derivados financieros</li>
              <li>✅ Análisis de riesgos avanzado</li>
              <li>✅ M&A accounting automatizado</li>
              <li>✅ Integraciones con 100+ sistemas</li>
              <li>✅ Google Sheets integration OAuth2</li>
            </ul>
          </div>

          <div className="footer-seccion">
            <h4>Seguridad & Compliance</h4>
            <ul>
              <li>🔒 Encriptación AES-256</li>
              <li>🛡️ GDPR & CCPA Compliant</li>
              <li>✅ IFRS 3 Certified</li>
              <li>📋 Audit Trail completo</li>
              <li>🔐 OAuth 2.0 Authentication</li>
            </ul>
          </div>

          <div className="footer-seccion">
            <h4>Contacto</h4>
            <ul>
              <li>📧 Email: soporte@matrizcontable.cr</li>
              <li>📱 WhatsApp: +506 8735-9034</li>
              <li>🌐 Web: matrizcontable.cr</li>
              <li>📍 San José, Costa Rica</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2026 Matriz Contable CR. Todos los derechos reservados.</p>
          <div className="footer-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos de Servicio</a>
            <a href="#">Compliance</a>
            <a href="#">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
