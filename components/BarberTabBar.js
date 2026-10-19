import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DORADO = '#b08d57';

const TABS = [
  { key: 'inicio', label: 'Inicio', icono: 'home' },
  { key: 'turnos', label: 'Turnos', icono: 'cut-outline' },
  { key: 'perfil', label: 'Perfil', icono: 'person-outline' },
];

/**
 * Tab bar inferior reutilizable.
 * Props:
 *   - activo    : key del tab seleccionado ('inicio' | 'turnos' | 'perfil').
 *   - onPressTab: se llama con el tab tocado.
 */
export default function BarberTabBar({ activo = 'inicio', onPressTab }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.barra,
        { height: 56 + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {TABS.map((tab) => {
        const seleccionado = tab.key === activo;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onPressTab && onPressTab(tab)}
          >
            <Ionicons
              name={tab.icono}
              size={20}
              color={seleccionado ? DORADO : '#8a8a8a'}
            />
            <Text style={[styles.texto, seleccionado && styles.textoActivo]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  texto: { fontSize: 10.5, color: '#8a8a8a', letterSpacing: 0.3 },
  textoActivo: { color: DORADO },
});
