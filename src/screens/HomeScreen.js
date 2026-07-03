import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useLang } from '../context/LangContext'

const MENU_ITEMS = [
  {
    key: 'nueva',
    icon: '📊',
    titleKey: 'menu.nuevaHoja',
    fallback: 'Nueva Hoja',
    subtitleKey: 'menu.nuevaHojaDesc',
    subtitleFallback: 'Crear una matriz contable en blanco',
    route: 'Sheet',
    params: { template: 'default' },
  },
  {
    key: 'factura',
    icon: '🧾',
    titleKey: 'menu.factura',
    fallback: 'Factura Electrónica 4.3',
    subtitleKey: 'menu.facturaDesc',
    subtitleFallback: 'Generar comprobantes electrónicos CR',
    route: 'Factura',
  },
  {
    key: 'funciones',
    icon: 'fx',
    titleKey: 'menu.funciones',
    fallback: 'Biblioteca de Funciones',
    subtitleKey: 'menu.funcionesDesc',
    subtitleFallback: '452 funciones contables y fiscales CR',
    route: 'Funciones',
  },
  {
    key: 'sibo',
    icon: '✦',
    titleKey: 'menu.sibo',
    fallback: 'Sibö Asistente IA',
    subtitleKey: 'menu.siboDesc',
    subtitleFallback: 'Consultas contables con inteligencia artificial',
    route: 'Sibo',
  },
]

export default function HomeScreen({ navigation }) {
  const { t } = useLang()

  const translate = (key, fallback) => {
    const value = t ? t(key) : null
    return value && value !== key ? value : fallback
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Matriz Contable CR</Text>
        <Text style={styles.tagline}>
          {translate('menu.inicio', 'Inicio')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.route, item.params)}
          >
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <Text style={styles.cardTitle}>
              {translate(item.titleKey, item.fallback)}
            </Text>
            <Text style={styles.cardSubtitle}>
              {translate(item.subtitleKey, item.subtitleFallback)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#2d7a0c',
    borderBottomWidth: 1.5,
    borderBottomColor: '#245f09',
  },
  logo: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  tagline: {
    fontSize: 13,
    color: '#d8f5b0',
    marginTop: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#cce9ae',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3d6020',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#6b8f48',
    lineHeight: 15,
  },
})
