/**
 * src/services/bloqueoBiometrico.js
 *
 * Bloqueo de la app con Face ID / Touch ID / huella / PIN del teléfono,
 * usando expo-local-authentication. El bloqueo es una preferencia LOCAL
 * de este celular (se guarda en AsyncStorage, no en Firestore) — tiene
 * sentido: es "pedí Face ID en ESTE teléfono", no algo que deba viajar
 * a la nube ni sincronizarse entre dispositivos.
 *
 * Qué SÍ hace: pide autenticación (1) la primera vez que se abre la app
 * con una sesión ya iniciada, y (2) cada vez que la app vuelve de
 * segundo plano (el usuario minimizó la app y volvió) — que es el caso
 * real de "alguien tomó el teléfono desbloqueado y abrió la app".
 *
 * Qué NO hace: no reemplaza el login de Firebase (eso sigue pidiendo
 * correo/contraseña como siempre) — esto es una capa EXTRA para que,
 * aunque el teléfono ya esté desbloqueado y la sesión siga activa,
 * alguien no pueda simplemente abrir la app y ver los datos contables
 * sin Face ID/Touch ID/PIN.
 */

import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CLAVE_PREFERENCIA = 'kcn_bloqueo_biometrico_activo'

// ── Preferencia guardada en este dispositivo ──
export async function obtenerPreferenciaBloqueo() {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_PREFERENCIA)
    return valor === 'si'
  } catch (e) {
    return false
  }
}

export async function guardarPreferenciaBloqueo(activo) {
  try {
    await AsyncStorage.setItem(CLAVE_PREFERENCIA, activo ? 'si' : 'no')
  } catch (e) {
    // Si falla el guardado, la app sigue funcionando — solo no recuerda
    // la preferencia para la próxima vez.
  }
}

// ── ¿Este teléfono puede usar Face ID/Touch ID/huella/PIN? ──
// hasHardwareAsync: el teléfono tiene sensor biométrico.
// isEnrolledAsync: el usuario YA configuró una huella/cara en el
// teléfono (si no, pedir autenticación fallaría siempre).
export async function dispositivoSoportaBloqueo() {
  try {
    const tieneHardware = await LocalAuthentication.hasHardwareAsync()
    if (!tieneHardware) return false
    const tieneEnrolado = await LocalAuthentication.isEnrolledAsync()
    return tieneEnrolado
  } catch (e) {
    return false
  }
}

// ── Pide la autenticación propiamente dicha ──
// Devuelve true si el usuario se autenticó correctamente, false si
// canceló o falló. "disableDeviceFallback: false" permite que, si Face
// ID/huella falla varias veces, el teléfono ofrezca el PIN/patrón como
// respaldo — igual que hacen la mayoría de apps bancarias.
export async function pedirAutenticacion() {
  try {
    const soportado = await dispositivoSoportaBloqueo()
    if (!soportado) return true; // Sin sensor configurado: no se puede bloquear, se deja pasar.

    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verificá tu identidad para abrir Matriz Contable CR',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
      fallbackLabel: 'Usar PIN del teléfono',
    })
    return !!resultado.success
  } catch (e) {
    // Si el módulo nativo falla por cualquier razón (emulador sin
    // sensor, permiso denegado, etc.), no dejamos a alguien trabado
    // fuera de su propia app — se deja pasar.
    return true
  }
}
