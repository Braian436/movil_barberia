import Toast from 'react-native-toast-message';

/**
 * Muestra un aviso con el estilo de la app (no el cartel blanco del sistema).
 * tipo: 'success' | 'error' | 'info'
 */
export function notificar(tipo, titulo, mensaje, duracion = 3500) {
  Toast.show({
    type: tipo,
    text1: titulo,
    text2: mensaje,
    visibilityTime: duracion,
    position: 'top',
  });
}
