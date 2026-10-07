import React, { useState } from 'react';
import './styles/App.css';

// Componentes Originales
import ContabilidadBasica from './components/ContabilidadBasica';
import DashboardPRO from './components/DashboardPRO';
import DerivadosAvanzados from './components/DerivadosAvanzados';
import GestionRiesgos from './components/GestionRiesgos';
import GoogleSheetsImporter from './components/GoogleSheetsImporter';
import Integraciones from './components/Integraciones';
import MAAccounting from './components/MAAccounting';

// Componentes Nuevos - Factura Electrónica, Sibo y Fórmulas
import FacturaElectronica from './components/FacturaElectronica';
import SiboModule from './components/SiboModule';
import FormulasModule from './components/FormulasModule';

// Sistema de idiomas mock (conecta con tu translations.json)
const i18n = {
  t: (key) => key,
  lang: 'es'
};

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-left">
          <button
            className="btn-toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 className="app-title">📊 Matriz Contable CR v39.5+</h1>
        </div>
        <div className="header-right">
          <span className="user-info">👤 Usuario</span>
        </div>
      </header>

      <div className="app-layout">
        {/* SIDEBAR */}
        <nav className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="nav-section">
            <h3 className="nav-title">📈 Análisis</h3>
            <button
              className={`nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActivePage('dashboard')}
            >
              Dashboard PRO
            </button>
            <button
              className={`nav-btn ${activePage === 'contabilidad' ? 'active' : ''}`}
              onClick={() => setActivePage('contabilidad')}
            >
              Contabilidad Básica
            </button>
            <button
              className={`nav-btn ${activePage === 'derivados' ? 'active' : ''}`}
              onClick={() => setActivePage('derivados')}
            >
              Derivados Avanzados
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">💼 Finanzas</h3>
            <button
              className={`nav-btn ${activePage === 'factura' ? 'active' : ''}`}
              onClick={() => setActivePage('factura')}
            >
              📄 Factura Electrónica
            </button>
            <button
              className={`nav-btn ${activePage === 'ma-accounting' ? 'active' : ''}`}
              onClick={() => setActivePage('ma-accounting')}
            >
              M&A Accounting
            </button>
            <button
              className={`nav-btn ${activePage === 'riesgos' ? 'active' : ''}`}
              onClick={() => setActivePage('riesgos')}
            >
              Gestión de Riesgos
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">🎯 Costa Rica</h3>
            <button
              className={`nav-btn ${activePage === 'sibo' ? 'active' : ''}`}
              onClick={() => setActivePage('sibo')}
            >
              📊 Sibo (Bienes Omitidos)
            </button>
            <button
              className={`nav-btn ${activePage === 'integraciones' ? 'active' : ''}`}
              onClick={() => setActivePage('integraciones')}
            >
              🔗 Integraciones
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-title">🛠️ Herramientas</h3>
            <button
              className={`nav-btn ${activePage === 'formulas' ? 'active' : ''}`}
              onClick={() => setActivePage('formulas')}
            >
              📐 510+ Fórmulas
            </button>
            <button
              className={`nav-btn ${activePage === 'sheets' ? 'active' : ''}`}
              onClick={() => setActivePage('sheets')}
            >
              📑 Google Sheets
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="app-main">
          {/* Dashboard PRO */}
          {activePage === 'dashboard' && (
            <DashboardPRO i18n={i18n} />
          )}

          {/* Contabilidad Básica */}
          {activePage === 'contabilidad' && (
            <ContabilidadBasica i18n={i18n} />
          )}

          {/* Derivados Avanzados */}
          {activePage === 'derivados' && (
            <DerivadosAvanzados i18n={i18n} />
          )}

          {/* Factura Electrónica ✨ NUEVO */}
          {activePage === 'factura' && (
            <FacturaElectronica i18n={i18n} />
          )}

          {/* M&A Accounting */}
          {activePage === 'ma-accounting' && (
            <MAAccounting i18n={i18n} />
          )}

          {/* Gestión de Riesgos */}
          {activePage === 'riesgos' && (
            <GestionRiesgos i18n={i18n} />
          )}

          {/* Sibo ✨ NUEVO */}
          {activePage === 'sibo' && (
            <SiboModule i18n={i18n} />
          )}

          {/* Integraciones */}
          {activePage === 'integraciones' && (
            <Integraciones i18n={i18n} />
          )}

          {/* 510+ Fórmulas ✨ NUEVO */}
          {activePage === 'formulas' && (
            <FormulasModule i18n={i18n} />
          )}

          {/* Google Sheets Importer */}
          {activePage === 'sheets' && (
            <GoogleSheetsImporter i18n={i18n} />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>© 2026 Matriz Contable CR | Desarrollado con React v39.5+</p>
        <p>Última actualización: Octubre 7, 2026</p>
      </footer>
    </div>
  );
}

export default App;
