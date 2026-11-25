import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '../src/theme';

/**
 * Avatar circular de perfil con botón de cámara.
 * Props:
 *   - fotoUrl : URL o data URI (base64) de la foto de perfil.
 *   - onPress : abre el menú de cámara/galería.
 */
export default function AvatarPerfil({ fotoUrl, onPress }) {
  return (
    <TouchableOpacity
      style={styles.contenedor}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.avatar}>
        {fotoUrl ? (
          <Image source={{ uri: fotoUrl }} style={styles.imagen} />
        ) : (
          <Ionicons name="person" size={52} color="rgba(255,255,255,0.55)" />
        )}
      </View>

      <View style={styles.badge}>
        <Ionicons name="camera" size={15} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  contenedor: { alignSelf: 'center', marginTop: 20 },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: COLORES.dorado,
    backgroundColor: '#1d1d1d',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagen: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORES.dorado,
    borderWidth: 2,
    borderColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
