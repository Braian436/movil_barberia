import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

/**
 * Header reutilizable para las pantallas de la app.
 * Props:
 *   - titulo   : texto que va centrado (por defecto "Inicio").
 *   - onCampana: se llama al tocar la campana.
 */
export default function BarberHeader({ titulo = 'Inicio', onCampana }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.lado}>
        <Image
          source={require('../assets/logo_barber.png')}
          style={styles.logo}
        />
      </View>

      <Text style={styles.titulo}>{titulo}</Text>

      <View style={[styles.lado, styles.derecha]}>
        <TouchableOpacity onPress={onCampana} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
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
  logo: { width: 26, height: 26, resizeMode: 'contain' },
  titulo: {
    fontFamily: SERIF,
    fontSize: 18,
    color: DORADO,
    letterSpacing: 0.5,
  },
});
