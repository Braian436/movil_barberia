import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ModalBase, { estilosModal as s } from './ModalBase';

/**
 * Modal genérico de confirmación con dos botones (Cancelar / Confirmar).
 * Props: visible, titulo, mensaje, textoConfirmar, peligro (rojo), onConfirmar, onCancelar.
 */
export default function ModalConfirmar({ visible, titulo, mensaje, textoConfirmar = 'Confirmar', peligro = false, onConfirmar, onCancelar }) {
  return (
    <ModalBase visible={visible} titulo={titulo} mensaje={mensaje} onClose={onCancelar}>
      <View style={s.botones}>
        <TouchableOpacity style={[s.boton, s.cancelar]} onPress={onCancelar}>
          <Text style={s.botonTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.boton, peligro ? s.peligro : s.confirmar]} onPress={onConfirmar}>
          <Text style={s.botonTexto}>{textoConfirmar}</Text>
        </TouchableOpacity>
      </View>
    </ModalBase>
  );
}
