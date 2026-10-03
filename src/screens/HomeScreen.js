import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  FlatList,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLang, IDIOMAS_DISPONIBLES, NOMBRES_IDIOMAS } from '../context/LangContext'
import OnboardingModal from '../components/OnboardingModal'
import { auth } from '../services/firebase'
import { useResponsive } from '../hooks/useResponsive'

const ONBOARDING_KEY = 'kcn_onboarding_visto'

const MENU_ITEMS = [
  {
    key: 'nueva',
    icon: '📊',
    titleKey: 'app.nuevaHoja',
    fallback: 'Nueva Hoja',
    subtitleKey: 'app.nuevaHojaDesc',
    subtitleFallback: 'Crear una matriz contable en blanco',
    route: 'Sheet',
    params: { template: 'default' },
  },
  {
    key: 'factura',
    icon: '🧾',
    titleKey: 'app.factura',
    fallback: 'Factura Electrónica 4.3',
    subtitleKey: 'app.facturaDesc',
    subtitleFallback: 'Generar comprobantes electrónicos CR',
    route: 'Factura',
  },
  {
    key: 'funciones',
    icon: 'fx',
    titleKey: 'app.funciones',
    fallback: 'Biblioteca de Funciones',
    subtitleKey: 'app.funcionesDesc',
    subtitleFallback: '452 funciones contables y fiscales CR',
    route: 'Funciones',
  },
  {
    key: 'sibo',
    icon: '✦',
    titleKey: 'app.sibo',
    fallback: 'Sibö Asistente IA',
    subtitleKey: 'app.siboDesc',
    subtitleFallback: 'Consultas contables con inteligencia artificial',
    route: 'Sibo',
  },
]

export default function HomeScreen({ navigation }) {
  const { t, lang, setLang } = useLang()
  const [onboardingVisible, setOnboardingVisible] = useState(false)
  const [idiomaVisible, setIdiomaVisible] = useState(false)
  const { columns, maxContentWidth, isDesktop } = useResponsive()
  // Deja un poco de aire entre tarjetas (gap efectivo ~3.5%) sin importar
  // cuántas columnas haya, para que siempre quede "space-between" parejo.
  const cardWidth = `${100 / columns - 3.5}%`

  const usuario = auth.currentUser
  const nombreMostrado = (usuario?.displayName || (usuario?.email ? usuario.email.split('@')[0] : '') || '').trim()
  const nombreCapitalizado = nombreMostrado
    ? nombreMostrado.charAt(0).toUpperCase() + nombreMostrado.slice(1)
    : ''
  const inicial = nombreMostrado ? nombreMostrado.charAt(0).toUpperCase() : '👤'

  const translate = (key, fallback) => {
    const value = t ? t(key) : null
    return value && value !== key ? value : fallback
  }

  useEffect(() => {
    let activo = true
    AsyncStorage.getItem(ONBOARDING_KEY).then((visto) => {
      if (activo && !visto) setOnboardingVisible(true)
    })
    return () => { activo = false }
  }, [])

  function cerrarOnboarding() {
    setOnboardingVisible(false)
    AsyncStorage.setItem(ONBOARDING_KEY, '1').catch(() => {})
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.logo}>Matriz Contable CR</Text>
            <Text style={styles.tagline}>
              {translate('menu.inicio', 'Inicio')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setIdiomaVisible(true)}
          >
            <Text style={styles.langBtnText}>{(NOMBRES_IDIOMAS[lang] || '🌐').split(' ')[0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => setOnboardingVisible(true)}
          >
            <Text style={styles.helpBtnText}>❔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={isDesktop ? styles.scrollDesktop : styles.scrollPhone}>
        <View style={[styles.grid, { maxWidth: maxContentWidth }]}>
          {nombreCapitalizado ? (
            <View style={styles.welcomeBanner}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                {usuario?.photoURL ? (
                  <Image source={{ uri: usuario.photoURL }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{inicial}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeTitle}>Hola, {nombreCapitalizado}</Text>
                <Text style={styles.welcomeText}>
                  Bienvenido/a a Matriz Contable CR. Accedé rápido a tus herramientas desde aquí abajo.
                </Text>
              </View>
            </View>
          ) : null}

          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.card, { width: cardWidth }]}
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

          <View style={styles.footer}>
            <View style={styles.footerDividerRow}>
              <View style={styles.footerLine} />
              <Text style={styles.footerLabel}>Diseñado por</Text>
              <View style={styles.footerLine} />
            </View>
            <View style={styles.footerBrandRow}>
              <Text style={styles.footerKCN}>KCN</Text>
              <View style={styles.footerDivider} />
              <Text style={styles.footerName}>Keny Chinchilla{'\n'}Navarro</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <OnboardingModal visible={onboardingVisible} onClose={cerrarOnboarding} />

      <Modal visible={idiomaVisible} transparent animationType="fade" onRequestClose={() => setIdiomaVisible(false)}>
        <TouchableOpacity style={styles.idiomaOverlay} activeOpacity={1} onPress={() => setIdiomaVisible(false)}>
          <View style={styles.idiomaBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.idiomaTitulo}>{translate('app.idioma', 'Idioma')}</Text>
            <Text style={styles.idiomaSubtitulo}>{translate('app.elegirIdioma', 'Elegí el idioma de la app')}</Text>
            <FlatList
              data={IDIOMAS_DISPONIBLES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.idiomaItem, item === lang && styles.idiomaItemActivo]}
                  onPress={() => { setLang(item); setIdiomaVisible(false) }}
                >
                  <Text style={[styles.idiomaItemTexto, item === lang && styles.idiomaItemTextoActivo]}>
                    {NOMBRES_IDIOMAS[item] || item}
                  </Text>
                  {item === lang ? <Text style={styles.idiomaCheck}>✓</Text> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  helpBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  helpBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  langBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginRight: 8,
  },
  langBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  idiomaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,30,5,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  idiomaBox: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
  },
  idiomaTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d3b1f',
  },
  idiomaSubtitulo: {
    fontSize: 12,
    color: '#6b8f48',
    marginTop: 2,
    marginBottom: 10,
  },
  idiomaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  idiomaItemActivo: {
    backgroundColor: '#eaf7d8',
  },
  idiomaItemTexto: {
    fontSize: 14,
    color: '#3d6020',
    fontWeight: '600',
  },
  idiomaItemTextoActivo: {
    color: '#2d7a0c',
    fontWeight: '800',
  },
  idiomaCheck: {
    color: '#2d7a0c',
    fontWeight: '800',
    fontSize: 15,
  },
  scrollPhone: {
    flexGrow: 1,
  },
  scrollDesktop: {
    flexGrow: 1,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%',
  },
  welcomeBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#cce9ae',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d7a0c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2d3b1f',
    marginBottom: 3,
  },
  welcomeText: {
    fontSize: 12,
    color: '#6b8f48',
    lineHeight: 16,
  },
  card: {
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
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  footerDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginBottom: 14,
  },
  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#b9d49a',
  },
  footerLabel: {
    fontSize: 11,
    color: '#6b8f48',
    marginHorizontal: 10,
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerKCN: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2d7a0c',
    letterSpacing: 0.5,
  },
  footerDivider: {
    width: 1.5,
    height: 30,
    backgroundColor: '#b9d49a',
    marginHorizontal: 12,
  },
  footerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d3b1f',
    lineHeight: 18,
  },
})
