import React from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

/**
 * Fondo compartido por las pantallas de autenticación (Login y Recuperar
 * contraseña): imagen de fondo + overlay + logo + nombre + footer.
 * El formulario se pasa como children.
 *
 * Incluye el KeyboardAvoidingView con behavior="padding" (necesario con
 * edge-to-edge) y el footer FUERA del KAV para que no suba con el teclado.
 */
export default function AuthLayout({ children, contentContainerStyle }) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require('../assets/fondo_barberia.png')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.contenido, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../assets/logo_barber.png')}
            style={styles.logo}
          />
          <Text style={styles.titulo}>BARBERIA CLASE A</Text>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <Ionicons name="location-outline" size={18} color="#fff" />
        <Text style={styles.footerTexto}>SALTA, ARGENTINA</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logo: { width: 150, height: 150, alignSelf: 'center', resizeMode: 'contain' },
  titulo: {
    fontFamily: SERIF,
    fontSize: 26,
    color: DORADO,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 40,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  footerTexto: { color: '#fff', fontSize: 12, letterSpacing: 1 },
});
