// Bandera para evitar que el registro redirija a Home antes de cerrar sesión.
// Cuando el usuario se registra, Firebase inicia sesión automáticamente.
// Para mandarlo al Login (y no a Home), "suprimimos" ese primer evento de
// login en el observador de Navigation, y después cerramos la sesión.

import { signOut } from 'firebase/auth';
import { auth } from './config/firebaseConfig';

let suprimir = false;

/**
 * Cierra la sesión del usuario actual. El observador de Firebase en
 * Navigation muestra el Login automáticamente al detectar el cierre.
 * Devuelve true si se cerró bien, false si hubo un error.
 */
export async function cerrarSesion() {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    return false;
  }
}

export function activarSupresionLogin() {
  suprimir = true;
}

export function desactivarSupresionLogin() {
  suprimir = false;
}

/** Devuelve true (y limpia la bandera) si hay que ignorar este login. */
export function consumirSupresionLogin() {
  if (!suprimir) return false;
  suprimir = false;
  return true;
}
