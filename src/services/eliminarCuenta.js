// ─── Eliminar la cuenta y todos sus datos ──────────────────────
// Lo exigen Apple (guía 5.1.1 v) y Google Play: si la app deja crear una
// cuenta, también tiene que dejar borrarla desde la misma app.
//
// Orden:
//   1. Volver a verificar la contraseña (Firebase lo pide para borrar).
//   2. Borrar los datos en Firestore que son de la persona.
//   3. Salirse de las matrices que otros le compartieron.
//   4. Borrar el certificado de Hacienda y salir del negocio (Worker).
//   5. Borrar el usuario de Firebase Auth.
import {
  EmailAuthProvider, reauthenticateWithCredential, deleteUser,
} from 'firebase/auth'
import {
  collection, query, where, getDocs, doc, deleteDoc, updateDoc,
  writeBatch, arrayRemove,
} from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { auth, db } from './firebase'

const WORKER_CERTIFICADOS = 'https://matriz-certificados.kacn1z.workers.dev'

// Subcolecciones que cuelgan de cada matriz
const SUBCOLECCIONES_MATRIZ = ['backups', 'historial', 'actividad', 'cursores', 'adjuntos']

// Borra una lista de referencias en tandas (Firestore permite 500 por lote)
async function borrarEnTandas(refs) {
  for (let i = 0; i < refs.length; i += 400) {
    const lote = writeBatch(db)
    refs.slice(i, i + 400).forEach((r) => lote.delete(r))
    await lote.commit()
  }
}

async function borrarColeccionCompleta(ruta) {
  const snap = await getDocs(collection(db, ...ruta))
  await borrarEnTandas(snap.docs.map((d) => d.ref))
}

async function borrarDocsDelDueno(nombreColeccion, uid, subcolecciones = []) {
  const snap = await getDocs(query(collection(db, nombreColeccion), where('ownerId', '==', uid)))
  for (const d of snap.docs) {
    for (const sub of subcolecciones) {
      await borrarColeccionCompleta([nombreColeccion, d.id, sub])
    }
  }
  await borrarEnTandas(snap.docs.map((d) => d.ref))
  return snap.size
}

// avisar(texto) sirve para mostrar en pantalla en qué paso va
export async function eliminarMiCuenta(contrasena, avisar = () => {}) {
  const usuario = auth.currentUser
  if (!usuario) throw new Error('No hay una sesión abierta.')
  const uid = usuario.uid
  const correo = String(usuario.email || '').toLowerCase()

  // 1. Verificar la contraseña
  avisar('Verificando tu contraseña…')
  try {
    const credencial = EmailAuthProvider.credential(usuario.email, contrasena)
    await reauthenticateWithCredential(usuario, credencial)
  } catch (error) {
    const codigo = error && error.code
    if (codigo === 'auth/wrong-password' || codigo === 'auth/invalid-credential' || codigo === 'auth/invalid-login-credentials') {
      throw new Error('La contraseña no es correcta.')
    }
    if (codigo === 'auth/too-many-requests') {
      throw new Error('Demasiados intentos. Esperá unos minutos y probá de nuevo.')
    }
    throw new Error('No se pudo verificar la contraseña: ' + ((error && error.message) || error))
  }

  // 2. Datos propios en Firestore
  avisar('Borrando tus matrices…')
  await borrarDocsDelDueno('matrices', uid, SUBCOLECCIONES_MATRIZ)

  avisar('Borrando formularios, publicaciones y plantillas…')
  await borrarDocsDelDueno('formularios', uid, ['respuestas'])
  await borrarDocsDelDueno('publicaciones', uid)
  await borrarDocsDelDueno('plantillasUsuario', uid)
  await borrarDocsDelDueno('contactos', uid)

  // 3. Salirse de las matrices compartidas por otras personas
  avisar('Saliendo de las matrices compartidas…')
  if (correo) {
    const compartidas = await getDocs(query(collection(db, 'matrices'), where('sharedWith', 'array-contains', correo)))
    for (const d of compartidas.docs) {
      try {
        await updateDoc(d.ref, { sharedWith: arrayRemove(correo) })
      } catch (e) {
        // Si una falla, seguimos con las demás: la cuenta igual se borra
      }
    }
    try {
      await deleteDoc(doc(db, 'userDirectory', correo))
    } catch (e) {}
  }

  // 4. Certificado de Hacienda y negocio (están en el Worker)
  avisar('Borrando el certificado de Hacienda…')
  try {
    const idToken = await usuario.getIdToken()
    await fetch(`${WORKER_CERTIFICADOS}/salir-de-negocio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).catch(() => {})
    await fetch(`${WORKER_CERTIFICADOS}/eliminar-certificado`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).catch(() => {})
  } catch (e) {}

  // 5. Datos guardados en este teléfono
  try {
    await AsyncStorage.clear()
  } catch (e) {}

  // 6. El usuario
  avisar('Eliminando la cuenta…')
  await deleteUser(usuario)
}
