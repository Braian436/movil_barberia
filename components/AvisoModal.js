import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DORADO = '#b08d57';
const VERDE = '#43c463';

/**
 * Modal con el estilo de la app (fondo oscuro + dorado), para reemplazar
 * los Alert blancos del sistema cuando se necesita un botón de acción.
 */
export default function AvisoModal({
  visible,
  titulo,
  mensaje,
  boton = 'Aceptar',
  onPress,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onPress}
    >
      <View style={styles.fondo}>
        <View style={styles.caja}>
          <View style={styles.icono}>
            <Ionicons name="checkmark" size={30} color="#fff" />
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          <TouchableOpacity style={styles.boton} onPress={onPress}>
            <Text style={styles.botonTexto}>{boton}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  caja: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  icono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  mensaje: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  boton: {
    marginTop: 20,
    alignSelf: 'stretch',
    height: 44,
    borderRadius: 8,
    backgroundColor: DORADO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
