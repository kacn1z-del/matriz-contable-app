import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import { auth } from '../services/firebase'
import { useLang } from '../context/LangContext'

// ─── URL del Worker de Cloudflare que guarda el certificado cifrado ─
const WORKER_URL = 'https://matriz-certificados.kacn1z.workers.dev'

export default function CertificadoScreen({ navigation }) {
  const { t } = useLang()
  const insets = useSafeAreaInsets()

  const [archivo, setArchivo] = useState(null) // { nombre, base64 }
  const [contrasena, setContrasena] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [revisando, setRevisando] = useState(true)
  const [tieneCertificado, setTieneCertificado] = useState(false)

  const uid = auth.currentUser?.uid

  // ─── Al entrar, revisa si el cliente ya tiene un certificado guardado ─
  const revisarEstado = useCallback(async () => {
    if (!uid) return
    setRevisando(true)
    try {
      const respuesta = await fetch(`${WORKER_URL}/tiene-certificado?uid=${uid}`)
      const datos = await respuesta.json()
      setTieneCertificado(!!datos.tieneCertificado)
    } catch (error) {
      // Si falla la consulta, no bloqueamos al usuario — solo no sabemos el estado.
      console.log('Error revisando certificado:', error.message)
    } finally {
      setRevisando(false)
    }
  }, [uid])

  useEffect(() => {
    revisarEstado()
  }, [revisarEstado])

  // ─── Elegir el archivo .p12 desde el celular ────────────
  async function elegirArchivo() {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['application/x-pkcs12', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      })

      if (resultado.canceled) return

      const archivoElegido = resultado.assets[0]

      // Validación simple por extensión, ya que el "type" MIME de .p12
      // no siempre viene bien informado por el sistema.
      const nombreMinuscula = archivoElegido.name.toLowerCase()
      if (!nombreMinuscula.endsWith('.p12') && !nombreMinuscula.endsWith('.pfx')) {
        Alert.alert(
          'Archivo no válido',
          'Seleccioná un archivo con extensión .p12 o .pfx (tu llave criptográfica de Hacienda).'
        )
        return
      }

      const base64 = await FileSystem.readAsStringAsync(archivoElegido.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      setArchivo({ nombre: archivoElegido.name, base64 })
    } catch (error) {
      Alert.alert('Error', 'No se pudo leer el archivo: ' + error.message)
    }
  }

  // ─── Enviar certificado + contraseña al Worker ──────────
  async function guardarCertificado() {
    if (!archivo) {
      Alert.alert('Falta el archivo', 'Elegí tu llave criptográfica (.p12) primero.')
      return
    }
    if (!contrasena) {
      Alert.alert('Falta la contraseña', 'Ingresá la contraseña de tu llave criptográfica.')
      return
    }
    if (!uid) {
      Alert.alert('Sesión inválida', 'Volvé a iniciar sesión e intentá de nuevo.')
      return
    }

    setSubiendo(true)
    try {
      const respuesta = await fetch(`${WORKER_URL}/guardar-certificado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          certificadoBase64: archivo.base64,
          contrasena,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error desconocido')
      }

      Alert.alert('Listo', 'Tu llave criptográfica quedó guardada de forma segura.')
      setArchivo(null)
      setContrasena('')
      setTieneCertificado(true)
    } catch (error) {
      Alert.alert('No se pudo guardar', error.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function eliminarCertificado() {
    Alert.alert(
      '¿Eliminar llave criptográfica?',
      'Vas a tener que subirla de nuevo para facturar electrónicamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${WORKER_URL}/eliminar-certificado`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid }),
              })
              setTieneCertificado(false)
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar: ' + error.message)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0e6' }} edges={['left', 'right', 'bottom']}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← {t('menu.inicio')}</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>🧾 Factura Electrónica 4.3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        {revisando ? (
          <View style={styles.cargando}>
            <ActivityIndicator color="#2d7a0c" />
          </View>
        ) : tieneCertificado ? (
          // ─── Estado: ya tiene certificado guardado ─────────
          <View style={styles.card}>
            <Text style={styles.emoji}>✅</Text>
            <Text style={styles.tituloCard}>Llave criptográfica guardada</Text>
            <Text style={styles.textoSecundario}>
              Ya tenés tu certificado configurado para emitir facturas electrónicas.
            </Text>

            <TouchableOpacity style={styles.botonSecundario} onPress={eliminarCertificado}>
              <Text style={styles.botonSecundarioTexto}>Eliminar y reemplazar</Text>
            </TouchableOpacity>

            <View style={styles.avisoProximaFase}>
              <Text style={styles.avisoTexto}>
                🚧 La generación y envío de facturas está en desarrollo. Por ahora podés dejar tu llave lista.
              </Text>
            </View>
          </View>
        ) : (
          // ─── Estado: falta subir el certificado ────────────
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Subí tu llave criptográfica</Text>
            <Text style={styles.textoSecundario}>
              Necesitás el archivo .p12 o .pfx que te entregó el Ministerio de Hacienda (ATV), junto con su contraseña.
            </Text>

            <TouchableOpacity style={styles.botonArchivo} onPress={elegirArchivo}>
              <Text style={styles.botonArchivoTexto}>
                {archivo ? `📄 ${archivo.nombre}` : '📎 Elegir archivo .p12'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Contraseña de la llave</Text>
            <View style={styles.inputContainer}>
              <ContrasenaInput value={contrasena} onChangeText={setContrasena} />
            </View>

            <TouchableOpacity
              style={[styles.botonPrincipal, subiendo && styles.botonDisabled]}
              onPress={guardarCertificado}
              disabled={subiendo}
            >
              {subiendo ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonPrincipalTexto}>Guardar de forma segura</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.notaSeguridad}>
              🔒 Tu llave se guarda cifrada. Nunca se comparte ni se muestra en la app.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Componente separado solo para mantener el TextInput con estilo consistente
import { TextInput } from 'react-native'
function ContrasenaInput({ value, onChangeText }) {
  return (
    <TextInput
      style={styles.input}
      placeholder="••••••••"
      placeholderTextColor="#9db98a"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry
    />
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: '#fff', borderBottomWidth: 1.5, borderBottomColor: '#cce9ae',
  },
  backBtn: { fontSize: 13, fontWeight: '700', color: '#2d7a0c' },
  toolbarTitle: { fontSize: 13, fontWeight: '700', color: '#3d6020' },
  contenido: { padding: 20, flexGrow: 1 },
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
  },
  emoji: { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  tituloCard: { fontSize: 17, fontWeight: '800', color: '#2d3b1f', marginBottom: 6, textAlign: 'center' },
  textoSecundario: { fontSize: 13, color: '#6b8f48', textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  botonArchivo: {
    borderWidth: 1.5, borderColor: '#2d7a0c', borderStyle: 'dashed',
    borderRadius: 10, paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  botonArchivoTexto: { color: '#2d7a0c', fontWeight: '600', fontSize: 14 },
  label: { fontSize: 12, fontWeight: '700', color: '#3d6020', marginBottom: 6 },
  inputContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#2d3b1f', backgroundColor: '#f7fbf0',
  },
  botonPrincipal: {
    backgroundColor: '#2d7a0c', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  botonDisabled: { opacity: 0.6 },
  botonPrincipalTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  notaSeguridad: { fontSize: 11, color: '#8fa87a', textAlign: 'center', marginTop: 14 },
  botonSecundario: {
    borderWidth: 1.5, borderColor: '#c0392b', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 4,
  },
  botonSecundarioTexto: { color: '#c0392b', fontWeight: '600', fontSize: 13 },
  avisoProximaFase: {
    backgroundColor: '#fff8e1', borderRadius: 10, padding: 12, marginTop: 18,
  },
  avisoTexto: { fontSize: 12, color: '#8a6d00', textAlign: 'center', lineHeight: 17 },
})
