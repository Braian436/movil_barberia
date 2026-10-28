import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

const VERDE = '#43c463';
const ROJO = '#e05a5a';
const DORADO = '#b08d57';

const ESTILOS = {
  success: { color: VERDE, icono: 'checkmark-circle' },
  error: { color: ROJO, icono: 'alert-circle' },
  info: { color: DORADO, icono: 'information-circle' },
};

function ToastBase({ tipo, text1, text2 }) {
  const { color, icono } = ESTILOS[tipo] || ESTILOS.info;

  return (
    <View style={[styles.caja, { borderLeftColor: color }]}>
      <Ionicons name={icono} size={22} color={color} />
      <View style={styles.textos}>
        {!!text1 && (
          <Text style={styles.titulo} numberOfLines={2}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text style={styles.mensaje} numberOfLines={3}>
            {text2}
          </Text>
        )}
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (p) => <ToastBase tipo="success" text1={p.text1} text2={p.text2} />,
  error: (p) => <ToastBase tipo="error" text1={p.text1} text2={p.text2} />,
  info: (p) => <ToastBase tipo="info" text1={p.text1} text2={p.text2} />,
};

/**
 * Se monta una sola vez en App.js. A partir de ahí, cualquier pantalla puede
 * mostrar avisos con `notificar()` (src/notify.js).
 */
export default function AppToast() {
  return <Toast config={toastConfig} />;
}

const styles = StyleSheet.create({
  caja: {
    width: '92%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  textos: { flex: 1 },
  titulo: { color: '#fff', fontSize: 14, fontWeight: '700' },
  mensaje: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
});
