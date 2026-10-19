// Bandera para evitar que el registro redirija a Home antes de cerrar sesión.
// Cuando el usuario se registra, Firebase inicia sesión automáticamente.
// Para mandarlo al Login (y no a Home), "suprimimos" ese primer evento de
// login en el observador de Navigation, y después cerramos la sesión.

let suprimir = false;

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
