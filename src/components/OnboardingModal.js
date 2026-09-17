import React, { useState } from 'react'
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native'

const { width } = Dimensions.get('window')

export const ONBOARDING_SLIDES = [
  {
    emoji: '🌿',
    titulo: '¡Bienvenido/a a Matriz Contable CR!',
    texto: 'Tu app contable con fórmulas de Costa Rica, facturación electrónica, reportes automáticos y un asistente de IA. Te mostramos lo esencial en unos segundos.',
  },
  {
    emoji: '📊',
    titulo: 'Nueva Hoja',
    texto: 'Creá una matriz contable en blanco y usá más de 450 fórmulas contables y fiscales de Costa Rica, con reportes automáticos (Balance, Flujo de Efectivo, Dashboard).',
  },
  {
    emoji: '🧾',
    titulo: 'Factura Electrónica 4.3',
    texto: 'Generá comprobantes electrónicos para Hacienda directo desde la app, con exportación en XML y PDF.',
  },
  {
    emoji: '✦',
    titulo: 'Sibö, tu asistente contable',
    texto: 'Preguntale a Sibö sobre IVA, CCSS, fórmulas o tus propios datos — puede leer tu hoja activa y sugerirte fórmulas para insertar directo en la celda.',
  },
  {
    emoji: '🚀',
    titulo: '¡Listo para empezar!',
    texto: 'Tocá "Nueva Hoja" para crear tu primera matriz de movimientos. Podés reabrir este tutorial cuando quieras con el botón ❔ de esta pantalla.',
  },
]

export default function OnboardingModal({ visible, onClose, slides }) {
  const [idx, setIdx] = useState(0)
  const data = slides || ONBOARDING_SLIDES
  const slide = data[idx]
  const esUltimo = idx === data.length - 1

  function cerrar() {
    setIdx(0)
    onClose && onClose()
  }

  function siguiente() {
    if (esUltimo) cerrar()
    else setIdx(idx + 1)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.titulo}>{slide.titulo}</Text>
          <Text style={styles.texto}>{slide.texto}</Text>

          <View style={styles.dots}>
            {data.map((_, i) => (
              <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnSkip} onPress={cerrar}>
              <Text style={styles.btnSkipText}>Saltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnNext} onPress={siguiente}>
              <Text style={styles.btnNextText}>{esUltimo ? '¡Empezar!' : 'Siguiente'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,30,5,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: Math.min(width - 48, 380),
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
  },
  emoji: { fontSize: 44, marginBottom: 10 },
  titulo: {
    fontSize: 17, fontWeight: '700', color: '#2d7a0c',
    marginBottom: 8, textAlign: 'center',
  },
  texto: {
    fontSize: 13.5, color: '#444', lineHeight: 20, textAlign: 'center',
  },
  dots: {
    flexDirection: 'row', gap: 6, marginTop: 18, marginBottom: 4,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: '#dce9d0',
  },
  dotActive: { backgroundColor: '#2d7a0c' },
  btnRow: {
    flexDirection: 'row', gap: 10, width: '100%', marginTop: 16,
  },
  btnSkip: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: '#cce9ae', backgroundColor: '#fff',
    alignItems: 'center',
  },
  btnSkipText: { color: '#2d7a0c', fontWeight: '600', fontSize: 13.5 },
  btnNext: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: '#2d7a0c', alignItems: 'center',
  },
  btnNextText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
})
