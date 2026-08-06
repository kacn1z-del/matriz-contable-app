import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '../services/firebase'

// ─── Traduce los códigos de error de Firebase a mensajes claros ─
function traducirError(codigo) {
  const mensajes = {
    'auth/invalid-email': 'El correo no es válido.',
    'auth/user-not-found': 'No existe una cuenta con ese correo.',
    'auth/wrong-password': 'La contraseña es incorrecta.',
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
    'auth/missing-password': 'Ingresá una contraseña.',
    'auth/network-request-failed': 'Sin conexión a internet.',
  }
  return mensajes[codigo] || 'Ocurrió un error. Intentá de nuevo.'
}

export default function LoginScreen() {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [cargando, setCargando] = useState(false)

  const esRegistro = modo === 'registro'

  async function manejarEnvio() {
    const correo = email.trim().toLowerCase()

    if (!correo || !password) {
      Alert.alert('Faltan datos', 'Completá el correo y la contraseña.')
      return
    }
    if (esRegistro && password !== password2) {
      Alert.alert('Las contraseñas no coinciden', 'Verificá que ambas contraseñas sean iguales.')
      return
    }

    setCargando(true)
    try {
      if (esRegistro) {
        await createUserWithEmailAndPassword(auth, correo, password)
      } else {
        await signInWithEmailAndPassword(auth, correo, password)
      }
      // No hace falta navegar manualmente: App.js escucha onAuthStateChanged
      // y cambia de pantalla automáticamente cuando el login es exitoso.
    } catch (error) {
      Alert.alert('No se pudo continuar', traducirError(error.code))
    } finally {
      setCargando(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>Matriz Contable CR</Text>
          <Text style={styles.subtitle}>
            {esRegistro ? 'Creá tu cuenta para empezar' : 'Iniciá sesión para continuar'}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor="#9db98a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!cargando}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9db98a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!cargando}
            />

            {esRegistro && (
              <>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9db98a"
                  value={password2}
                  onChangeText={setPassword2}
                  secureTextEntry
                  editable={!cargando}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.button, cargando && styles.buttonDisabled]}
              onPress={manejarEnvio}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeBtn}
              onPress={() => setModo(esRegistro ? 'login' : 'registro')}
              disabled={cargando}
            >
              <Text style={styles.switchModeText}>
                {esRegistro
                  ? '¿Ya tenés cuenta? Iniciá sesión'
                  : '¿Sos nuevo? Creá una cuenta'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2d7a0c' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: {
    fontSize: 26, fontWeight: '800', color: '#fff',
    textAlign: 'center', marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, color: '#dff2cc',
    textAlign: 'center', marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, gap: 4,
  },
  label: {
    fontSize: 12, fontWeight: '700', color: '#3d6020',
    marginTop: 12, marginBottom: 4,
  },
  input: {
    borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#2d3b1f', backgroundColor: '#f7fbf0',
  },
  button: {
    backgroundColor: '#2d7a0c', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  switchModeBtn: { marginTop: 14, alignItems: 'center' },
  switchModeText: { color: '#2d7a0c', fontWeight: '600', fontSize: 13 },
})
