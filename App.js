import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { LangProvider, useLang } from './src/context/LangContext'
import HomeScreen from './src/screens/HomeScreen'
import FunctionsScreen from './src/screens/FunctionsScreen'
import LoginScreen from './src/screens/LoginScreen'
import CertificadoScreen from './src/screens/CertificadoScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import SiboScreen from './src/screens/SiboScreen'
import SheetEditor from './src/components/SheetEditor'
import PantallaBloqueo from './src/components/PantallaBloqueo'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, AppState, useWindowDimensions } from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './src/services/firebase'
import { obtenerPreferenciaBloqueo, pedirAutenticacion } from './src/services/bloqueoBiometrico'

const Stack = createNativeStackNavigator()

// ─── Pantalla envoltorio para el editor de hojas ────────
function SheetScreen({ navigation, route }) {
  const { t } = useLang()
  const template = route.params?.template ?? 'default'
  const insets = useSafeAreaInsets()
  // En horizontal la pantalla es muy baja: se compacta la barra superior para dejarle más lugar a la hoja.
  const { width, height } = useWindowDimensions()
  const horizontal = width > height

  return (
    <View style={{ flex: 1, backgroundColor: '#e6f0e6' }}>
      <View style={[styles.toolbar, horizontal ? { paddingTop: Math.min(insets.top, 8) + 2, paddingBottom: 4 } : { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← {t('menu.inicio')}</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>{t('canvas.toolbar')}</Text>
      </View>
      <SheetEditor userId={null} sheetId={template} />
    </View>
  )
}

// ─── Placeholder temporales (próximas fases) ────────────
function PlaceholderScreen({ navigation, route, title }) {
  const { t } = useLang()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0e6', padding: 20 }} edges={['top', 'left', 'right']}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.backBtn}>← {t('menu.inicio')}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🚧</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#3d6020' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#6b8f48', marginTop: 6 }}>Próxima fase de desarrollo</Text>
      </View>
    </SafeAreaView>
  )
}

// ─── Pantalla de carga mientras Firebase revisa si hay sesión activa ─
function CargandoScreen() {
  return (
    <View style={styles.loadingScreen}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  )
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Sheet" component={SheetScreen} />
        <Stack.Screen name="Funciones" component={FunctionsScreen} />
        <Stack.Screen name="Factura" component={CertificadoScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Sibo" component={SiboScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  // ─── Estado de sesión: null = cargando, false = sin sesión, objeto = con sesión ─
  const [usuario, setUsuario] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  // ─── Bloqueo biométrico (Face ID/Touch ID/huella/PIN) ───────────
  // bloqueada: si la app está TAPADA en este momento esperando verificación.
  // La preferencia en sí (si el bloqueo está activado) se guarda en
  // AsyncStorage (ProfileScreen la cambia) y siempre se relee "fresca"
  // en el momento — así, si el usuario la activa o desactiva durante la
  // misma sesión, el cambio aplica de inmediato sin tener que cerrar y
  // volver a abrir la app.
  const [bloqueada, setBloqueada] = useState(false)
  const estadoAppAnterior = useRef(AppState.currentState)
  const verificandoAlVolver = useRef(false)

  useEffect(() => {
    const dejarDeEscuchar = onAuthStateChanged(auth, (user) => {
      setUsuario(user)
      setCargandoSesion(false)
    })
    return dejarDeEscuchar
  }, [])

  // Si hay sesión y la preferencia está activa, bloquea la app de
  // entrada (recién abierta = se trata igual que "volver de segundo plano").
  useEffect(() => {
    if (cargandoSesion || !usuario) return
    let vigente = true
    obtenerPreferenciaBloqueo().then((activo) => {
      if (vigente && activo) setBloqueada(true)
    })
    return () => { vigente = false }
  }, [cargandoSesion, usuario])

  // Vuelve a bloquear cada vez que la app pasa de segundo plano
  // ("background"/"inactive") a primer plano ("active") — el caso real
  // de alguien tomando el teléfono ya desbloqueado y reabriendo la app.
  useEffect(() => {
    const escuchador = AppState.addEventListener('change', async (siguienteEstado) => {
      var estadoAnterior = estadoAppAnterior.current
      estadoAppAnterior.current = siguienteEstado
      var volvioAlFrente = /inactive|background/.test(estadoAnterior) && siguienteEstado === 'active'
      if (!volvioAlFrente || !usuario || verificandoAlVolver.current) return
      var activo = await obtenerPreferenciaBloqueo()
      if (activo) setBloqueada(true)
    })
    return () => escuchador.remove()
  }, [usuario])

  async function intentarDesbloquear() {
    verificandoAlVolver.current = true
    const exito = await pedirAutenticacion()
    verificandoAlVolver.current = false
    if (exito) setBloqueada(false)
    return exito
  }

  return (
    <SafeAreaProvider>
      <LangProvider>
        <StatusBar style="light" />
        {cargandoSesion ? (
          <CargandoScreen />
        ) : usuario ? (
          bloqueada ? (
            <PantallaBloqueo onIntentar={intentarDesbloquear} />
          ) : (
            <AppNavigator />
          )
        ) : (
          <LoginScreen />
        )}
      </LangProvider>
    </SafeAreaProvider>
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
  loadingScreen: {
    flex: 1, backgroundColor: '#2d7a0c',
    justifyContent: 'center', alignItems: 'center',
  },
})
