import { initializeApp, getApps, getApp } from 'firebase/app'
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// ─── Configuración del proyecto Firebase ────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBxyfSmdUMUY5d-QHzh2l1qus6GNsr28EI",
  authDomain: "matriz-contable-cr-app.firebaseapp.com",
  databaseURL: "https://matriz-contable-cr-app-default-rtdb.firebaseio.com",
  projectId: "matriz-contable-cr-app",
  storageBucket: "matriz-contable-cr-app.firebasestorage.app",
  messagingSenderId: "687675833771",
  appId: "1:687675833771:web:6420c87bf65dff6bc326ee",
  measurementId: "G-3X5M65QZ53",
}

// ─── Evita re-inicializar la app si el módulo se recarga (Fast Refresh) ─
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// ─── Auth: en nativo (Android/iOS) usamos persistencia con AsyncStorage
//     así el usuario no tiene que loguearse cada vez que abre la app.
//     En web, usamos getAuth normal (usa su propia persistencia de browser). ─
let auth
if (Platform.OS === 'web') {
  auth = getAuth(app)
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
}

// ─── Firestore: base de datos donde vamos a guardar clientes,
//     certificados (encriptados) y facturas. ─
const db = getFirestore(app)

export { app, auth, db }

