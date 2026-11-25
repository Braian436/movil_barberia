import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

/**
- Header reutilizable para las pantallas de la app.
- Props:
-   - titulo: texto que va centrado (por defecto "Inicio").
-   - onBack: función opcional; si se pasa, reemplaza el logo por una flecha para volver.
 */
export default function BarberHeader({ titulo = 'Inicio', onBack }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.lado}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.botonAtras}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../assets/logo_barber.png')}
            style={styles.logo}
          />
        )}
      </View>

      <Text style={styles.titulo}>{titulo}</Text>

      {/* Espaciador vacío para mantener el título centrado. */}
      <View style={[styles.lado, styles.derecha]} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  lado: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  derecha: { justifyContent: 'flex-end' },
  botonAtras: {
    paddingVertical: 4,
    paddingRight: 8,
    justifyContent: 'center',
  },
  logo: { width: 26, height: 26, resizeMode: 'contain' },
  titulo: {
    fontFamily: SERIF,
    fontSize: 18,
    color: DORADO,
    letterSpacing: 0.5,
  },
});