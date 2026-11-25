import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '../src/theme';

/**
 * Campo de formulario reutilizable: etiqueta + input con ícono + accesorio.
 * Usa el estilo oscuro del registro/perfil.
 * Props:
 *   - label  : texto de la etiqueta.
 *   - icono  : nombre del ícono Ionicons.
 *   - right  : nodo opcional a la derecha del input (ojo, check, etc.).
 *   - containerStyle / inputStyle : estilos extra.
 *   - ...rest se pasa al TextInput.
 */
export default function FormInput({
  label,
  icono,
  right,
  containerStyle,
  inputStyle,
  ...props
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, containerStyle]}>
        <Ionicons name={icono} size={18} color="#cfcfcf" style={styles.icon} />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor="rgba(255,255,255,0.55)"
          {...props}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  bordeOk: { borderColor: COLORES.verde },
  bordeError: { borderColor: COLORES.rojo },
});

// Helpers de borde reutilizables (verde / rojo según el estado del campo).
export const bordeCampo = (estado) =>
  estado === 'ok'
    ? styles.bordeOk
    : estado === 'error'
      ? styles.bordeError
      : null;
