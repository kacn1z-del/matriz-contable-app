import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
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
  const [modoCarga, setModoCarga] = useState('archivo') // 'archivo' | 'base64'
  const [base64Pegado, setBase64Pegado] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cedulaEmisor, setCedulaEmisor] = useState('')
  const [usuarioHacienda, setUsuarioHacienda] = useState('')
  const [passwordHacienda, setPasswordHacienda] = useState('')
  const [actividadEconomica, setActividadEconomica] = useState('')
  const [ambiente, setAmbiente] = useState('sandbox') // 'sandbox' | 'production'
  const [provincia, setProvincia] = useState('')
  const [canton, setCanton] = useState('')
  const [distrito, setDistrito] = useState('')
  const [otrasSenas, setOtrasSenas] = useState('')
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

  // ─── Enviar certificado + credenciales de Hacienda al Worker ─
  async function guardarCertificado() {
    var certificadoBase64Final = modoCarga === 'base64' ? base64Pegado.trim() : (archivo ? archivo.base64 : '')

    if (!certificadoBase64Final) {
      Alert.alert(
        'Falta la llave',
        modoCarga === 'base64'
          ? 'Pegá el texto en base64 de tu certificado.'
          : 'Elegí tu llave criptográfica (.p12) primero.'
      )
      return
    }
    if (!contrasena) {
      Alert.alert('Falta la contraseña', 'Ingresá la contraseña de tu llave criptográfica.')
      return
    }
    if (!cedulaEmisor || !usuarioHacienda || !passwordHacienda || !actividadEconomica) {
      Alert.alert(
        'Faltan datos',
        'Completá la cédula, el usuario y contraseña de API de Hacienda, y el código de actividad económica.'
      )
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
          certificadoBase64: certificadoBase64Final,
          contrasena,
          cedulaEmisor,
          usuarioHacienda,
          passwordHacienda,
          actividadEconomica,
          ambiente,
          provincia,
          canton,
          distrito,
          otrasSenas,
        }),
      })

      const datos = await respuesta.json()

      if (!respuesta.ok) {
        throw new Error(datos.error || 'Error desconocido')
      }

      Alert.alert('Listo', 'Tu llave criptográfica y tus datos de Hacienda quedaron guardados de forma segura.')
      setArchivo(null)
      setBase64Pegado('')
      setContrasena('')
      setCedulaEmisor('')
      setUsuarioHacienda('')
      setPasswordHacienda('')
      setActividadEconomica('')
      setTieneCertificado(true)
    } catch (error) {
      Alert.alert('No se pudo guardar', error.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function eliminarCertificado() {
    Alert.alert(
      '¿Eliminar llave criptográfica y datos de Hacienda?',
      'Vas a tener que subirlos de nuevo para facturar electrónicamente.',
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
            <Text style={styles.tituloCard}>Firma electrónica configurada</Text>
            <Text style={styles.textoSecundario}>
              Ya tenés tu certificado y tus datos de Hacienda listos para emitir facturas electrónicas firmadas de verdad.
            </Text>

            <TouchableOpacity style={styles.botonSecundario} onPress={eliminarCertificado}>
              <Text style={styles.botonSecundarioTexto}>Eliminar y reemplazar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // ─── Estado: falta subir el certificado y los datos ────
          <View style={styles.card}>
            <Text style={styles.tituloCard}>Configurá tu firma electrónica</Text>
            <Text style={styles.textoSecundario}>
              Necesitás el archivo .p12 o .pfx que te entregó el Ministerio de Hacienda (ATV), junto con su contraseña,
              y tus credenciales de acceso a la API de Hacienda.
            </Text>

            <View style={styles.modoRow}>
              <TouchableOpacity
                style={[styles.modoBtn, modoCarga === 'archivo' && styles.modoBtnActivo]}
                onPress={() => setModoCarga('archivo')}
              >
                <Text style={[styles.modoBtnTexto, modoCarga === 'archivo' && styles.modoBtnTextoActivo]}>
                  📎 Elegir archivo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modoBtn, modoCarga === 'base64' && styles.modoBtnActivo]}
                onPress={() => setModoCarga('base64')}
              >
                <Text style={[styles.modoBtnTexto, modoCarga === 'base64' && styles.modoBtnTextoActivo]}>
                  📋 Pegar base64
                </Text>
              </TouchableOpacity>
            </View>

            {modoCarga === 'archivo' ? (
              <TouchableOpacity style={styles.botonArchivo} onPress={elegirArchivo}>
                <Text style={styles.botonArchivoTexto}>
                  {archivo ? `📄 ${archivo.nombre}` : '📎 Elegir archivo .p12'}
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.textoSecundario}>
                  Copiá el valor en base64 de tu certificado (por ejemplo, desde una variable de entorno de otro
                  proyecto tuyo, como HACIENDA_P12_BASE64 en Vercel) y pegalo acá.
                </Text>
                <TextInput
                  style={[styles.input, styles.inputMultilinea]}
                  placeholder="Pegá aquí el texto en base64..."
                  placeholderTextColor="#9db98a"
                  value={base64Pegado}
                  onChangeText={setBase64Pegado}
                  multiline
                  numberOfLines={4}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <Text style={styles.label}>Contraseña de la llave (.p12)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9db98a"
              value={contrasena}
              onChangeText={setContrasena}
              secureTextEntry
            />

            <Text style={styles.separador}>Credenciales de API de Hacienda</Text>

            <Text style={styles.label}>Cédula del emisor</Text>
            <TextInput
              style={styles.input}
              placeholder="1-2345-6789"
              placeholderTextColor="#9db98a"
              value={cedulaEmisor}
              onChangeText={setCedulaEmisor}
            />

            <Text style={styles.label}>Usuario de API (ovitribucr.hacienda.go.cr)</Text>
            <TextInput
              style={styles.input}
              placeholder="cpf-01-XXXXXXXXXX@prod.comprobanteselectronicos.go.cr"
              placeholderTextColor="#9db98a"
              value={usuarioHacienda}
              onChangeText={setUsuarioHacienda}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Contraseña de API de Hacienda</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9db98a"
              value={passwordHacienda}
              onChangeText={setPasswordHacienda}
              secureTextEntry
            />

            <Text style={styles.label}>Código de actividad económica</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 6920.0"
              placeholderTextColor="#9db98a"
              value={actividadEconomica}
              onChangeText={setActividadEconomica}
            />

            <Text style={styles.label}>Provincia (número 1-7)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 1 (San José)"
              placeholderTextColor="#9db98a"
              value={provincia}
              onChangeText={setProvincia}
            />

            <Text style={styles.label}>Cantón (2 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 01"
              placeholderTextColor="#9db98a"
              value={canton}
              onChangeText={setCanton}
            />

            <Text style={styles.label}>Distrito (2 dígitos)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 01"
              placeholderTextColor="#9db98a"
              value={distrito}
              onChangeText={setDistrito}
            />

            <Text style={styles.label}>Otras señas</Text>
            <TextInput
              style={styles.input}
              placeholder="Dirección exacta de tu negocio"
              placeholderTextColor="#9db98a"
              value={otrasSenas}
              onChangeText={setOtrasSenas}
            />

            <Text style={styles.label}>Ambiente</Text>
            <View style={styles.ambienteRow}>
              <TouchableOpacity
                style={[styles.ambienteBtn, ambiente === 'sandbox' && styles.ambienteBtnActivo]}
                onPress={() => setAmbiente('sandbox')}
              >
                <Text style={[styles.ambienteBtnTexto, ambiente === 'sandbox' && styles.ambienteBtnTextoActivo]}>
                  Pruebas (sandbox)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ambienteBtn, ambiente === 'production' && styles.ambienteBtnActivo]}
                onPress={() => setAmbiente('production')}
              >
                <Text style={[styles.ambienteBtnTexto, ambiente === 'production' && styles.ambienteBtnTextoActivo]}>
                  Producción real
                </Text>
              </TouchableOpacity>
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
              🔒 Todo se guarda cifrado. Nunca se comparte ni se muestra en la app.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  modoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modoBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingVertical: 9, alignItems: 'center', backgroundColor: '#fff',
  },
  modoBtnActivo: { backgroundColor: '#2d7a0c', borderColor: '#2d7a0c' },
  modoBtnTexto: { fontSize: 12, fontWeight: '600', color: '#2d7a0c' },
  modoBtnTextoActivo: { color: '#fff' },
  inputMultilinea: { minHeight: 90, textAlignVertical: 'top' },
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
  separador: {
    fontSize: 12.5, fontWeight: '800', color: '#2d7a0c',
    marginTop: 18, marginBottom: 10, textTransform: 'uppercase',
  },
  label: { fontSize: 12, fontWeight: '700', color: '#3d6020', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#2d3b1f', backgroundColor: '#f7fbf0', marginBottom: 12,
  },
  ambienteRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  ambienteBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
  },
  ambienteBtnActivo: { backgroundColor: '#2d7a0c', borderColor: '#2d7a0c' },
  ambienteBtnTexto: { fontSize: 12.5, fontWeight: '600', color: '#2d7a0c' },
  ambienteBtnTextoActivo: { color: '#fff' },
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
})
