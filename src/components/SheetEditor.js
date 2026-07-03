import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

// Placeholder temporal del editor de hojas.
// Reemplazar con la integración real (WebView + assets/sheet-engine.html
// o el motor de fórmulas nativo) en la próxima fase de desarrollo.
export default function SheetEditor({ userId, sheetId }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📊</Text>
      <Text style={styles.title}>Editor de Matriz</Text>
      <Text style={styles.subtitle}>
        Plantilla: {sheetId || 'default'}
      </Text>
      <Text style={styles.note}>
        El motor de hojas de cálculo se conectará aquí en la próxima fase.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e6f0e6',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3d6020',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b8f48',
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#8fae6f',
    textAlign: 'center',
  },
})
