import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '../src/theme';
import ModalBase, { estilosModal as s } from './ModalBase';

/**
 * Modal para elegir de dónde sacar la foto de perfil.
 * Props: visible, tieneFoto, onElegir(origen: 'galeria'|'camara'|'quitar'), onCerrar.
 */
export default function ModalElegirFoto({ visible, tieneFoto, onElegir, onCerrar }) {
  return (
    <ModalBase visible={visible} titulo="Foto de perfil" mensaje="Elegí de dónde querés sacar tu foto" onClose={onCerrar}>
      <TouchableOpacity style={s.opcion} onPress={() => onElegir('galeria')}>
        <Ionicons name="images-outline" size={20} color="#fff" />
        <Text style={s.opcionTexto}>Galería</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.opcion} onPress={() => onElegir('camara')}>
        <Ionicons name="camera-outline" size={20} color="#fff" />
        <Text style={s.opcionTexto}>Cámara</Text>
      </TouchableOpacity>

      {tieneFoto && (
        <TouchableOpacity style={s.opcion} onPress={() => onElegir('quitar')}>
          <Ionicons name="trash-outline" size={20} color={COLORES.rojo} />
          <Text style={[s.opcionTexto, { color: COLORES.rojo }]}>Quitar foto</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[s.opcion, s.opcionCancelar]} onPress={onCerrar}>
        <Text style={s.opcionCancelarTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ModalBase>
  );
}
