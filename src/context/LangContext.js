
import React, { createContext, useContext, useState, useMemo } from 'react'

// Traducciones básicas. Si más adelante llenás src/i18n/translations.json
// con más idiomas, podés reemplazar este objeto por esa data.
const TRANSLATIONS = {
  es: {
    menu: {
      inicio: 'Inicio',
      nuevaHoja: 'Nueva Hoja',
      nuevaHojaDesc: 'Crear una matriz contable en blanco',
      factura: 'Factura Electrónica 4.3',
      facturaDesc: 'Generar comprobantes electrónicos CR',
      funciones: 'Biblioteca de Funciones',
      funcionesDesc: '452 funciones contables y fiscales CR',
      sibo: 'Sibö Asistente IA',
      siboDesc: 'Consultas contables con inteligencia artificial',
    },
    canvas: {
      toolbar: 'Editor de Matriz',
    },
  },
}

const LangContext = createContext(null)

function getNestedValue(obj, path) {
  return path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState('es')

  const value = useMemo(() => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.es

    const t = (key) => {
      const found = getNestedValue(dict, key)
      return found !== undefined ? found : key
    }

    return { lang, setLang, t }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) {
    // Fallback seguro por si algún componente se renderiza fuera del Provider
    return { lang: 'es', setLang: () => {}, t: (key) => key }
  }
  return ctx
}
