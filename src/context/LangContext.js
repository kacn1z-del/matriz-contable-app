import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import TRANSLATIONS from '../i18n/translations.json'

// Idiomas disponibles: español, inglés y 6 lenguas indígenas de Costa Rica
// (Bribri, Cabécar, Ngäbere, Boruca/Brunca, Térraba, Maléku). El contenido
// de las lenguas indígenas viene tal cual de la versión web de Matriz
// Contable CR (src/i18n/translations.json) — nunca se inventa ni se
// completa a mano, así que algunas claves de pantallas propias de la app
// (que no existen en la web) solo tienen español e inglés; en esos casos
// t() cae a español en vez de mostrar una traducción inventada.
export const IDIOMAS_DISPONIBLES = Object.keys(TRANSLATIONS).filter((k) => k !== '_languageNames')
export const NOMBRES_IDIOMAS = TRANSLATIONS._languageNames || {}

const LANG_STORAGE_KEY = 'mcr_idioma_v1'

function getNestedValue(obj, path) {
  return path
    .split('.')
    .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('es')

  useEffect(() => {
    let activo = true
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((guardado) => {
      if (activo && guardado && TRANSLATIONS[guardado]) setLangState(guardado)
    })
    return () => { activo = false }
  }, [])

  const setLang = (nuevo) => {
    if (!TRANSLATIONS[nuevo]) return
    setLangState(nuevo)
    AsyncStorage.setItem(LANG_STORAGE_KEY, nuevo).catch(() => {})
  }

  const value = useMemo(() => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.es
    const dictEs = TRANSLATIONS.es

    const t = (key) => {
      const found = getNestedValue(dict, key)
      if (found !== undefined) return found
      // Si la lengua actual todavía no tiene esta clave puntual, cae a
      // español (no se inventa contenido en la lengua indígena).
      const fallback = getNestedValue(dictEs, key)
      return fallback !== undefined ? fallback : key
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
