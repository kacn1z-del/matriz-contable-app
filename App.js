import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { LangProvider, useLang } from './src/context/LangContext'
import HomeScreen from './src/screens/HomeScreen'
import FunctionsScreen from './src/screens/FunctionsScreen'
import SheetEditor from './src/components/SheetEditor'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const Stack = createNativeStackNavigator()

// ─── Pantalla envoltorio para el editor de hojas ────────
function SheetScreen({ navigation, route }) {
  const { t } = useLang()
  const template = route.params?.template ?? 'default'
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: '#e6f0e6' }}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.backBtn}>← {t('menu.inicio')}</Text>
        </TouchableOpacity>
        <Text style={styles.toolbarTitle}>{t('canvas.toolbar')}</Text>
      </View>
      <SheetEditor userId={null} sheetId={template} />
    </View>
  )
}

// ─── Placeholder temporales (próximas fases) ────────────
function PlaceholderScreen({ navigation, route, title }) {
  const { t } = useLang()
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e6f0e6', padding: 20 }} edges={['top', 'left', 'right']}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.backBtn}>← {t('menu.inicio')}</Text>
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>🚧</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#3d6020' }}>{title}</Text>
        <Text style={{ fontSize: 13, color: '#6b8f48', marginTop: 6 }}>Próxima fase de desarrollo</Text>
      </View>
    </SafeAreaView>
  )
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Sheet" component={SheetScreen} />
        <Stack.Screen name="Funciones" component={FunctionsScreen} />
        <Stack.Screen
          name="Factura"
          children={(props) => <PlaceholderScreen {...props} title="🧾 Factura Electrónica 4.3" />}
        />
        <Stack.Screen
          name="Sibo"
          children={(props) => <PlaceholderScreen {...props} title="✦ Sibö Asistente IA" />}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LangProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </LangProvider>
    </SafeAreaProvider>
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
})
