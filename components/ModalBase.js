import React from 'react';
import { Modal, View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORES } from '../src/theme';

// Estilos compartidos por todos los modales de la app.
export const estilosModal = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caja: { width: '100%', maxWidth: 380, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 24 },
  titulo: { color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  mensaje: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 16 },

  // Fila de botones (Cancelar / Confirmar)
  botones: { flexDirection: 'row', gap: 10, marginTop: 6 },
  boton: { flex: 1, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelar: { backgroundColor: '#2a2a2a' },
  peligro: { backgroundColor: COLORES.rojo },
  confirmar: { backgroundColor: COLORES.dorado },
  botonTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Opciones en lista (modal de foto)
  opcion: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, marginTop: 10 },
  opcionTexto: { color: '#fff', fontSize: 15 },
  opcionCancelar: { backgroundColor: 'transparent', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  opcionCancelarTexto: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },

  // Input de contraseña (modal de reautenticación)
  claveInput: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, marginBottom: 6 },
  claveTexto: { flex: 1, color: '#fff', fontSize: 14, height: '100%' },
});

/**
 * Shell reutilizable para modales: fondo oscuro + caja + título + mensaje.
 * Props: visible, titulo, mensaje, icono (opcional, arriba del título),
 * onClose, teclado (envuelve en KeyboardAvoidingView) y children.
 */
export default function ModalBase({ visible, titulo, mensaje, icono, onClose, teclado = false, children }) {
  const contenido = (
    <View style={estilosModal.caja}>
      {icono}
      {!!titulo && <Text style={estilosModal.titulo}>{titulo}</Text>}
      {!!mensaje && <Text style={estilosModal.mensaje}>{mensaje}</Text>}
      {children}
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {teclado ? (
        <KeyboardAvoidingView style={estilosModal.fondo} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {contenido}
        </KeyboardAvoidingView>
      ) : (
        <View style={estilosModal.fondo}>{contenido}</View>
      )}
    </Modal>
  );
}
