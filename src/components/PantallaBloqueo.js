/**
 * src/components/PantallaBloqueo.js
 *
 * Pantalla que se muestra TAPANDO toda la app mientras está "bloqueada"
 * (recién abierta, o recién vuelta de segundo plano) y todavía no se
 * verificó Face ID/Touch ID/PIN. No tiene forma de saltársela salvo
 * autenticándose o cerrando la app del todo.
 */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

export default function PantallaBloqueo({ onIntentar }) {
  const [verificando, setVerificando] = useState(false)
  const [fallo, setFallo] = useState(false)

  async function intentar() {
    setVerificando(true)
    setFallo(false)
    const exito = await onIntentar()
    setVerificando(false)
    if (!exito) setFallo(true)
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.icono}>🔒</Text>
      <Text style={styles.titulo}>Matriz Contable CR</Text>
      <Text style={styles.subtitulo}>La app está bloqueada por seguridad</Text>

      {fallo && (
        <Text style={styles.errorTexto}>No se pudo verificar tu identidad. Probá de nuevo.</Text>
      )}

      <TouchableOpacity style={styles.boton} onPress={intentar} disabled={verificando}>
        {verificando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>🔓 Desbloquear</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCerrarSesion} onPress={() => signOut(auth)}>
        <Text style={styles.botonCerrarSesionTexto}>Cerrar sesión en vez de desbloquear</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1, backgroundColor: '#2d7a0c',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  icono: { fontSize: 56, marginBottom: 10 },
  titulo: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  subtitulo: { color: '#d7ecc2', fontSize: 13, marginBottom: 28, textAlign: 'center' },
  errorTexto: { color: '#ffe0e0', fontSize: 12.5, marginBottom: 14, textAlign: 'center' },
  boton: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 36,
    alignItems: 'center', minWidth: 220,
  },
  botonTexto: { color: '#2d7a0c', fontWeight: '800', fontSize: 15 },
  botonCerrarSesion: { marginTop: 22, padding: 8 },
  botonCerrarSesionTexto: { color: '#d7ecc2', fontSize: 12, textDecorationLine: 'underline' },
})
