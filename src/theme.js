import { Platform } from 'react-native';

// Paleta y tipografía compartida por toda la app.
// Centralizada acá para no repetir los mismos valores en cada pantalla.

export const COLORES = {
  dorado: '#b08d57',
  oroClaro: '#e3c98f',
  crema: '#f5efe3',
  fondo: '#0f0f0f',
  tarjeta: '#161616',
  gris: '#9b9b9b',
  verde: '#43c463',
  rojo: '#e05a5a',
  borde: 'rgba(255,255,255,0.12)',
  textoClaro: 'rgba(255,255,255,0.8)',
  textoAtenuado: 'rgba(255,255,255,0.55)',
};

export const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
