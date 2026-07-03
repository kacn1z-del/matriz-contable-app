import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import fnData from '../i18n/fndata.json'

const ALL_CATEGORIES = 'Todas'

export default function FunctionsScreen({ navigation }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORIES)

  const categories = useMemo(() => {
    const set = new Set(fnData.map((f) => f.categoria))
    return [ALL_CATEGORIES, ...Array.from(set).sort()]
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return fnData.filter((f) => {
      const matchesCategory = category === ALL_CATEGORIES || f.categoria === category
      if (!matchesCategory) return false
      if (!q) return true
      return (
        f.nombre.toLowerCase().includes(q) ||
        (f.alias && f.alias.toLowerCase().includes(q)) ||
        f.descripcion.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Inicio</Text>
        </TouchableOpacity>
        <Text style={styles.title}>fx Biblioteca de Funciones</Text>
        <Text style={styles.subtitle}>{fnData.length} funciones disponibles</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar función, alias o descripción..."
          placeholderTextColor="#8fae6f"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.chipText, category === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.fnName}>{item.nombre}</Text>
              {item.alias ? <Text style={styles.fnAlias}>{item.alias}</Text> : null}
            </View>
            <Text style={styles.fnCategory}>{item.categoria}</Text>
            <Text style={styles.fnDesc}>{item.descripcion}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron funciones para "{query}".</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0e6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#2d7a0c',
  },
  backBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d8f5b0',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#d8f5b0',
    marginTop: 2,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#cce9ae',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#3d6020',
  },
  chipsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cce9ae',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2d7a0c',
    borderColor: '#2d7a0c',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d6020',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#cce9ae',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  fnName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#245f09',
    marginRight: 8,
  },
  fnAlias: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b8f48',
  },
  fnCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5abf2a',
    marginTop: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  fnDesc: {
    fontSize: 13,
    color: '#3d6020',
    lineHeight: 18,
  },
  empty: {
    textAlign: 'center',
    color: '#6b8f48',
    marginTop: 40,
    fontSize: 13,
  },
})
