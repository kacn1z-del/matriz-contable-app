import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { updateProfile, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import { useLang } from '../context/LangContext'

// Mismo Cloudinary que ya usa Los Pirchas para fotos, con un preset
// nuevo dedicado solo a avatares de Matriz Contable (creado como
// "Unsigned" en Cloudinary → Settings → Upload → Upload presets).
const CLOUDINARY_CLOUD_NAME = 'kyhdlu4q'
const CLOUDINARY_UPLOAD_PRESET = 'matriz_avatares'

export default function ProfileScreen({ navigation }) {
  const { t } = useLang()
  const insets = useSafeAreaInsets()
  const usuario = auth.currentUser

  const [nombre, setNombre] = useState(usuario?.displayName || '')
  const [fotoLocal, setFotoLocal] = useState(usuario?.photoURL || null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const inicial = (nombre || usuario?.email || '?').trim().charAt(0).toUpperCase()

  // ─── Elegir y subir una foto de perfil nueva (vía Cloudinary) ───
  async function elegirFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permiso.granted) {
      Alert.alert('Falta permiso', 'Necesitamos acceso a tus fotos para poder cambiar tu foto de perfil.')
      return
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    })

    if (resultado.canceled) return

    const uri = resultado.assets[0].uri
    setFotoLocal(uri) // vista previa inmediata

    if (!usuario) return
    setSubiendoFoto(true)
    try {
      const formData = new FormData()
      formData.append('file', { uri, type: 'image/jpeg', name: 'avatar.jpg' })
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', 'matriz-avatares')

      const respuesta = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const datos = await respuesta.json()
      if (!datos.secure_url) {
        throw new Error(datos.error?.message || 'Cloudinary no devolvió la imagen.')
      }
      await updateProfile(usuario, { photoURL: datos.secure_url })
      setFotoLocal(datos.secure_url)
    } catch (error) {
      Alert.alert('No se pudo subir la foto', error.message)
    } finally {
      setSubiendoFoto(false)
    }
  }

  // ─── Guardar el nombre editado ───────────────────────────
  async function guardarNombre() {
    if (!nombre.trim()) {
      Alert.alert('Falta el nombre', 'Ingresá tu nombre.')
      return
    }
    if (!usuario) return
    setGuardando(true)
    try {
      await updateProfile(usuario, { displayName: nombre.trim() })
      Alert.alert('Listo', 'Tu nombre quedó actualizado.')
    } catch (error) {
      Alert.alert('No se pudo guardar', error.message)
    } finally {
      setGuardando(false)
    }
  }

  function cerrarSesion() {
    Alert.alert('¿Cerrar sesión?', '', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut(auth) },
    ])
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0e6' }} edges={['left', 'right', 'bottom']}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← {t ? t('menu.inicio') : 'Inicio'}</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>👤 Mi perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.avatarWrap} onPress={elegirFoto} disabled={subiendoFoto}>
            {fotoLocal ? (
              <Image source={{ uri: fotoLocal }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInicial}>{inicial}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              {subiendoFoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.avatarEditBadgeText}>📷</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.tocaFoto}>Tocá la foto para cambiarla</Text>

          <Text style={styles.label}>Tu nombre</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre completo"
            placeholderTextColor="#9db98a"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>Correo</Text>
          <Text style={styles.correoTexto}>{usuario?.email}</Text>

          <TouchableOpacity
            style={[styles.botonPrincipal, guardando && styles.botonDisabled]}
            onPress={guardarNombre}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonPrincipalTexto}>Guardar cambios</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.botonSecundario} onPress={cerrarSesion}>
            <Text style={styles.botonSecundarioTexto}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center',
  },
  avatarWrap: { width: 96, height: 96, marginBottom: 8 },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#2d7a0c', alignItems: 'center', justifyContent: 'center',
  },
  avatarInicial: { color: '#fff', fontSize: 34, fontWeight: '800' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#245f09', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  avatarEditBadgeText: { fontSize: 13 },
  tocaFoto: { fontSize: 11.5, color: '#8fa87a', marginBottom: 18 },
  label: {
    fontSize: 12, fontWeight: '700', color: '#3d6020',
    alignSelf: 'flex-start', marginTop: 10, marginBottom: 4,
  },
  input: {
    width: '100%', borderWidth: 1.5, borderColor: '#cce9ae', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#2d3b1f', backgroundColor: '#f7fbf0',
  },
  correoTexto: { alignSelf: 'flex-start', fontSize: 14, color: '#6b8f48' },
  botonPrincipal: {
    width: '100%', backgroundColor: '#2d7a0c', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 22,
  },
  botonDisabled: { opacity: 0.6 },
  botonPrincipalTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  botonSecundario: {
    width: '100%', borderWidth: 1.5, borderColor: '#c0392b', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  botonSecundarioTexto: { color: '#c0392b', fontWeight: '600', fontSize: 13 },
})
