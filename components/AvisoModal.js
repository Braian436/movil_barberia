import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '../src/theme';
import ModalBase from './ModalBase';

/**
 * Modal con el estilo de la app (fondo oscuro + dorado), para reemplazar
 * los Alert blancos del sistema cuando se necesita un botón de acción.
 */
export default function AvisoModal({ visible, titulo, mensaje, boton = 'Aceptar', onPress }) {
  return (
    <ModalBase
      visible={visible}
      titulo={titulo}
      mensaje={mensaje}
      icono={
        <View style={styles.icono}>
          <Ionicons name="checkmark" size={30} color="#fff" />
        </View>
      }
      onClose={onPress}
    >
      <TouchableOpacity style={styles.boton} onPress={onPress}>
        <Text style={styles.botonTexto}>{boton}</Text>
      </TouchableOpacity>
    </ModalBase>
  );
}

const styles = StyleSheet.create({
  icono: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORES.verde, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  boton: { marginTop: 20, alignSelf: 'stretch', height: 44, borderRadius: 8, backgroundColor: COLORES.dorado, alignItems: 'center', justifyContent: 'center' },
  botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
