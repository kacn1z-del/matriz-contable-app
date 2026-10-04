import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native'
import { WebView } from 'react-native-webview'
import * as Notifications from 'expo-notifications'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import * as Print from 'expo-print'
import Constants from 'expo-constants'
import { Asset } from 'expo-asset'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})


// ─── La hoja de cálculo ya NO va pegada aquí como texto ──────────────
// Antes, todo el HTML/CSS/JS de la hoja (más de 800,000 caracteres)
// estaba escrito directo en este archivo, dentro de un solo literal de
// JavaScript ("const SHEET_HTML = `...`"). Se comprobó con un
// diagnóstico dentro de la app ("Diagnóstico de integridad") que ese
// texto se CORROMPÍA silenciosamente al compilar la app — perdía
// caracteres sin ningún aviso de error — y esa corrupción era la causa
// real del "Invalid or unexpected token" al abrir la hoja.
//
// La solución: la hoja ahora vive en su propio archivo,
// "assets/hoja-matriz-contable.html", empaquetado con la app igual que
// el ícono o la pantalla de carga (ver metro.config.js, que le dice a
// Metro que trate los ".html" como archivo y no como código). Así
// nunca pasa por el compilador de JavaScript, y no hay forma de que se
// corrompa de esa manera.
const hojaAsset = Asset.fromModule(require('../../assets/hoja-matriz-contable.html'))

function proximaFechaNativa(dia, mesesLista) {
  var hoy = new Date()
  var y = hoy.getFullYear()
  var candidatos = []
  mesesLista.forEach(function (mes) {
    var d = new Date(y, mes, dia, 9, 0, 0)
    if (d < hoy) d = new Date(y + 1, mes, dia, 9, 0, 0)
    candidatos.push(d)
  })
  candidatos.sort(function (a, b) { return a - b })
  return candidatos[0]
}

async function programarNotificacionesVencimientos() {
  const { status } = await Notifications.getPermissionsAsync()
  let finalStatus = status
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync()
    finalStatus = req.status
  }
  if (finalStatus !== 'granted') return

  await Notifications.cancelAllScheduledNotificationsAsync()
  const todosMeses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  const items = [
    { nombre: 'IVA (D-104) mensual', fecha: proximaFechaNativa(15, todosMeses) },
    { nombre: 'Planilla CCSS mensual', fecha: proximaFechaNativa(5, todosMeses) },
    { nombre: 'D-151 (Declaración informativa) anual', fecha: proximaFechaNativa(28, [1]) },
    { nombre: 'Renta / D-101 anual', fecha: proximaFechaNativa(15, [2]) },
  ]
  for (const it of items) {
    const avisoTemprano = new Date(it.fecha.getTime() - 3 * 24 * 60 * 60 * 1000)
    if (avisoTemprano > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🗓 Vencimiento fiscal próximo',
          body: it.nombre + ' vence el ' + it.fecha.toLocaleDateString('es-CR') + ' (en 3 días)',
        },
        trigger: avisoTemprano,
      })
    }
    if (it.fecha > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Vencimiento fiscal HOY',
          body: it.nombre + ' vence hoy, ' + it.fecha.toLocaleDateString('es-CR'),
        },
        trigger: it.fecha,
      })
    }
  }
}

// Programa un recordatorio local para revisar el estado de una factura
// que quedó "pendiente" (Hacienda no confirmó dentro de los 55s). Sin
// esto, el usuario tendría que acordarse solo de volver a consultarla.
async function manejarRecordatorioPendiente(clave, numeroConsecutivo) {
  try {
    var disparo = new Date(Date.now() + 20 * 60 * 1000) // 20 minutos después
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏳ Revisá esa factura pendiente',
        body: 'La factura ' + (numeroConsecutivo || '') + ' quedó pendiente de confirmar con Hacienda. Tocá para consultar su estado.',
        data: { clave: clave },
      },
      trigger: disparo,
    })
  } catch (err) {
    // No es crítico — si falla (sin permiso de notificaciones, etc.) la
    // factura ya quedó enviada igual, solo no habrá recordatorio.
    console.log('No se pudo programar el recordatorio:', err.message)
  }
}

async function manejarImpresionDesdeWebView(base64, filename) {
  try {
    const path = FileSystem.cacheDirectory + filename
    await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 })
    // Print.printAsync abre el diálogo nativo de impresión (AirPrint en
    // iOS, el gestor de impresión de Android) directo con este archivo,
    // sin pasar por el share sheet.
    await Print.printAsync({ uri: path })
  } catch (err) {
    // El usuario cancelando la impresión también cae acá (jsPDF/expo-print
    // no distingue "cancelado" de otros errores), así que no mostramos
    // alerta salvo que parezca un error real.
    const mensaje = String(err && err.message ? err.message : err)
    if (!/cancel/i.test(mensaje)) {
      Alert.alert('No se pudo imprimir', mensaje)
    }
  }
}

async function manejarArchivoDesdeWebView(base64, filename, mime) {
  try {
    const path = FileSystem.cacheDirectory + filename
    await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 })
    const disponible = await Sharing.isAvailableAsync()
    if (disponible) {
      await Sharing.shareAsync(path, { mimeType: mime, dialogTitle: filename })
    } else {
      Alert.alert('Archivo listo', 'El archivo se generó pero no se pudo abrir el diálogo para compartir/guardar en este dispositivo.')
    }
  } catch (err) {
    Alert.alert('Error al guardar archivo', String(err && err.message ? err.message : err))
  }
}

export default function SheetEditor({ userId, sheetId }) {
  const webViewRef = useRef(null)
  const [rutaHojaLista, setRutaHojaLista] = useState(null)
  const [errorPreparandoHoja, setErrorPreparandoHoja] = useState(false)

  useEffect(() => {
    let vigente = true
    ;(async () => {
      try {
        await hojaAsset.downloadAsync()
        if (!vigente) return
        const ruta = hojaAsset.localUri
        if (vigente) setRutaHojaLista(ruta)
      } catch (err) {
        console.log('No se pudo preparar el archivo de la hoja:', err && err.message)
        if (vigente) setErrorPreparandoHoja(true)
      }
    })()
    return () => { vigente = false }
  }, [])

  useEffect(() => {
    programarNotificacionesVencimientos()
    registrarNotificacionesPush()
  }, [])

  // Pide permiso de notificaciones, obtiene el "token" de Expo Push de
  // este dispositivo, y se lo pasa a la WebView (que es quien tiene la
  // sesión de Firebase para mandarlo autenticado al Worker). Si algo
  // falla (sin permiso, sin projectId, etc.) simplemente no habrá
  // notificaciones push — no bloquea nada más de la app.
  async function registrarNotificacionesPush() {
    try {
      const permisoActual = await Notifications.getPermissionsAsync()
      let estadoFinal = permisoActual.status
      if (estadoFinal !== 'granted') {
        const pedido = await Notifications.requestPermissionsAsync()
        estadoFinal = pedido.status
      }
      if (estadoFinal !== 'granted') return

      const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId
      if (!projectId) return

      const resultado = await Notifications.getExpoPushTokenAsync({ projectId })
      const token = resultado.data
      if (!token) return

      // Espera un toque a que la WebView termine de cargar su JS antes
      // de inyectar — si se dispara demasiado rápido, la función
      // window.recibirPushTokenNativo todavía no existe.
      setTimeout(() => {
        const script = `
          (function(){
            try { window.recibirPushTokenNativo && window.recibirPushTokenNativo(${JSON.stringify(token)}); } catch (e) {}
          })();
          true;
        `
        webViewRef.current && webViewRef.current.injectJavaScript(script)
      }, 3000)
    } catch (err) {
      console.log('No se pudo registrar para notificaciones push:', err.message)
    }
  }

  // En algunos WebView de Android, las peticiones de red salientes (fetch
  // y XMLHttpRequest por igual) quedan colgadas sin error ni éxito. Para
  // esos casos, el WebView le pide a React Native (que no tiene esa
  // restricción) que haga la petición por él, y React Native le devuelve
  // el resultado inyectando JavaScript de vuelta.
  async function manejarLlamadaNativa(id, url, opciones) {
    try {
      const respuesta = await fetch(url, opciones)
      const texto = await respuesta.text()
      const script = `
        (function(){
          try {
            window.recibirRespuestaNativa && window.recibirRespuestaNativa(
              ${JSON.stringify(id)}, true, ${JSON.stringify(respuesta.ok)}, ${JSON.stringify(texto)}
            );
          } catch (e) {}
        })();
        true;
      `
      webViewRef.current && webViewRef.current.injectJavaScript(script)
    } catch (error) {
      const script = `
        (function(){
          try {
            window.recibirRespuestaNativa && window.recibirRespuestaNativa(
              ${JSON.stringify(id)}, false, false, ${JSON.stringify(String(error && error.message || error))}
            );
          } catch (e) {}
        })();
        true;
      `
      webViewRef.current && webViewRef.current.injectJavaScript(script)
    }
  }

  // Mientras se prepara el archivo de la hoja (una fracción de segundo,
  // normalmente) se muestra un loader en vez de la WebView — así nunca
  // se le pasa una ruta de archivo que todavía no existe.
  if (!rutaHojaLista && !errorPreparandoHoja) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2d7a0c" />
      </View>
    )
  }

  // Si por alguna razón no se pudo preparar el archivo de la hoja (muy
  // poco raro — almacenamiento lleno, etc.), se avisa en vez de dejar
  // la pantalla en blanco o cargando para siempre.
  if (errorPreparandoHoja) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={{ textAlign: 'center', color: '#b00020' }}>
          No se pudo preparar el archivo de la hoja en este dispositivo. Cerrá la app y volvé a intentar.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: rutaHojaLista }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowFileAccess={true}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data)
            if (msg && msg.tipo === 'guardarArchivo') {
              manejarArchivoDesdeWebView(msg.base64, msg.filename, msg.mime)
            }
            if (msg && msg.tipo === 'imprimirArchivo') {
              manejarImpresionDesdeWebView(msg.base64, msg.filename)
            }
            if (msg && msg.tipo === 'programarRecordatorioPendiente') {
              manejarRecordatorioPendiente(msg.clave, msg.numeroConsecutivo)
            }
            if (msg && msg.tipo === 'llamarNativo') {
              manejarLlamadaNativa(msg.id, msg.url, msg.opciones)
            }
            if (msg && msg.tipo === 'diagnosticoErrorHoja') {
              Alert.alert('Diagnóstico del error', msg.detalle || '(sin detalle)')
            }
          } catch (e) {}
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
  webview: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
})
