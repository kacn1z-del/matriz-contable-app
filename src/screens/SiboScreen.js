import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLang } from '../context/LangContext'

// Mismo servidor que usa Sibö dentro de la hoja (Cloudflare Worker con la IA de Anthropic).
// La dirección vieja de Vercel ya no responde: por eso la tarjeta caía siempre en las respuestas locales.
const SIBO_CHAT_URL = 'https://matriz-fe-worker.kacn1z.workers.dev/sibo-chat'
const TIEMPO_MAXIMO_MS = 45000
const HISTORIAL_KEY = 'kcn_sibo_historial_nativo'

// ─── Respuestas locales de respaldo, por si no hay conexión ─────
function respuestaLocal(mensaje) {
  const m = mensaje.toLowerCase()
  if (m.includes('iva')) {
    return 'El IVA en Costa Rica es del 13% de forma general, con tarifas reducidas del 4%, 2% y 1% para ciertos bienes y servicios (canasta básica, medicamentos, educación, salud, entre otros).'
  }
  if (m.includes('ccss')) {
    return 'La CCSS retiene aproximadamente un 10.67% del salario bruto al trabajador, y el patrono aporta cerca de un 26.67% adicional.'
  }
  if (m.includes('aguinaldo')) {
    return 'El aguinaldo se calcula sumando los salarios de diciembre a noviembre y dividiendo entre 12.'
  }
  return 'No tengo conexión con Sibö en este momento, pero podés preguntarme de nuevo cuando tengas internet, o abrir el Editor de Matriz para usar la versión completa de Sibö con contexto de tu hoja.'
}

export default function SiboScreen({ navigation }) {
  const { t } = useLang()
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    AsyncStorage.getItem(HISTORIAL_KEY).then((guardado) => {
      if (guardado) {
        try { setMensajes(JSON.parse(guardado)) } catch (e) {}
      } else {
        setMensajes([{
          id: 'bienvenida',
          usuario: false,
          texto: '¡Hola! Soy Sibö 🌿, tu asistente contable. Preguntame sobre IVA, CCSS, aguinaldo, fórmulas contables o cualquier duda fiscal de Costa Rica.',
        }])
      }
    })
  }, [])

  function guardarHistorial(lista) {
    AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify(lista.slice(-40))).catch(() => {})
  }

  async function enviarMensaje() {
    const contenido = texto.trim()
    if (!contenido || enviando) return

    const nuevoUsuario = { id: 'u' + Date.now(), usuario: true, texto: contenido }
    const listaConUsuario = [...mensajes, nuevoUsuario]
    setMensajes(listaConUsuario)
    guardarHistorial(listaConUsuario)
    setTexto('')
    setEnviando(true)

    const controlador = new AbortController()
    const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS)
    let textoRespuesta = ''
    try {
      // Mismo formato que la hoja: { user, texto }, sin el saludo inicial ni el mensaje actual
      const historialParaApi = listaConUsuario
        .filter((m) => m.id !== 'bienvenida')
        .slice(-11, -1)
        .map((m) => ({ user: m.usuario, texto: m.texto }))
      const respuesta = await fetch(SIBO_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contenido,
          history: historialParaApi,
          sheetContext: 'El usuario escribe desde la pantalla de Sibö de la app (fuera de la hoja), así que no hay hoja activa. Respondé en texto normal, sin bloques de acciones.',
        }),
        signal: controlador.signal,
      })
      let datos = {}
      try { datos = await respuesta.json() } catch (e) {}
      if (respuesta.ok && datos.text) {
        // Por si la IA igual manda un bloque ```acciones```, acá no se puede aplicar: lo quitamos
        textoRespuesta = String(datos.text).replace(/```acciones[\s\S]*?```/g, '').trim() || String(datos.text)
      } else {
        textoRespuesta = respuestaLocal(contenido) + '\n\n(Sibö IA no respondió' + (datos.error ? ': ' + datos.error : ' — código ' + respuesta.status) + ')'
      }
    } catch (error) {
      textoRespuesta = respuestaLocal(contenido) + (error && error.name === 'AbortError' ? '\n\n(Sibö tardó demasiado en responder; probá de nuevo.)' : '')
    } finally {
      clearTimeout(temporizador)
    }
    const nuevoBot = { id: 'b' + Date.now(), usuario: false, texto: textoRespuesta }
    setMensajes((prev) => {
      const actualizada = [...prev, nuevoBot]
      guardarHistorial(actualizada)
      return actualizada
    })
    setEnviando(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← {t ? t('menu.inicio') : 'Inicio'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✦ {t ? t('app.siboTitulo') : 'Sibö · Asistente IA'}</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={mensajes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.burbuja, item.usuario ? styles.burbujaUsuario : styles.burbujaBot]}>
              <Text style={item.usuario ? styles.textoUsuario : styles.textoBot}>{item.texto}</Text>
            </View>
          )}
        />

        {enviando ? (
          <View style={styles.escribiendo}>
            <ActivityIndicator size="small" color="#2d7a0c" />
            <Text style={styles.escribiendoTexto}>Sibö está pensando...</Text>
          </View>
        ) : null}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t ? t('app.siboPlaceholder') : 'Preguntale algo a Sibö...'}
            placeholderTextColor="#9db98a"
            value={texto}
            onChangeText={setTexto}
            multiline
            editable={!enviando}
          />
          <TouchableOpacity
            style={[styles.enviarBtn, (!texto.trim() || enviando) && styles.enviarBtnDisabled]}
            onPress={enviarMensaje}
            disabled={!texto.trim() || enviando}
          >
            <Text style={styles.enviarBtnTexto}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e6f0e6' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1.5, borderBottomColor: '#cce9ae',
  },
  backBtn: { fontSize: 13, fontWeight: '700', color: '#2d7a0c' },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#3d6020' },
  lista: { padding: 14, paddingBottom: 6 },
  burbuja: {
    maxWidth: '82%', borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, marginBottom: 8,
  },
  burbujaUsuario: {
    alignSelf: 'flex-end', backgroundColor: '#2d7a0c', borderBottomRightRadius: 3,
  },
  burbujaBot: {
    alignSelf: 'flex-start', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cce9ae',
    borderBottomLeftRadius: 3,
  },
  textoUsuario: { color: '#fff', fontSize: 14, lineHeight: 19 },
  textoBot: { color: '#2d3b1f', fontSize: 14, lineHeight: 19 },
  escribiendo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 6,
  },
  escribiendoTexto: { fontSize: 12, color: '#6b8f48', fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 10, backgroundColor: '#fff', borderTopWidth: 1.5, borderTopColor: '#cce9ae',
  },
  input: {
    flex: 1, borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: '#2d3b1f',
    backgroundColor: '#f7fbf0', maxHeight: 100,
  },
  enviarBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#2d7a0c',
    alignItems: 'center', justifyContent: 'center',
  },
  enviarBtnDisabled: { backgroundColor: '#a8c99a' },
  enviarBtnTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
