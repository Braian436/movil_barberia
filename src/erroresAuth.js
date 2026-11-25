// Traducción de los códigos de error de Firebase Auth a mensajes claros.
// Cada pantalla pasa su contexto ('login' | 'registro' | 'recuperar' | 'perfil')
// porque el mismo código puede significar cosas distintas según dónde ocurra.

const POR_CONTEXTO = {
  login: {
    'auth/invalid-credential': 'Correo o contraseña incorrectos.',
    'auth/wrong-password': 'Correo o contraseña incorrectos.',
    'auth/user-not-found': 'Correo o contraseña incorrectos.',
  },
  recuperar: {
    'auth/user-not-found': 'No encontramos una cuenta con ese correo.',
  },
  perfil: {
    'auth/email-already-in-use': 'Ese correo ya está en uso por otra cuenta.',
    'auth/wrong-password': 'La contraseña actual no es correcta.',
    'auth/invalid-credential': 'La contraseña actual no es correcta.',
    'auth/requires-recent-login':
      'Por seguridad, volvé a iniciar sesión e intentá de nuevo.',
  },
};

const GENERICOS = {
  'auth/invalid-email': 'El formato del correo no es válido.',
  'auth/email-already-in-use': 'El correo electrónico ya está en uso.',
  'auth/weak-password': 'La contraseña es demasiado débil.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo más tarde.',
  'auth/network-request-failed': 'Error de conexión, intentá más tarde.',
  'auth/invalid-api-key':
    'La clave API de Firebase no es válida. Revisá el archivo .env.',
  'auth/operation-not-allowed':
    'Esta acción no está habilitada en el proyecto de Firebase.',
  'auth/missing-continue-uri':
    'Falta configurar la URL de verificación en el proyecto.',
};

// Devuelve el mensaje para el código, o null si no hay uno conocido
// (así la pantalla puede usar su mensaje por defecto).
export function mensajeErrorAuth(codigo, contexto = 'generico') {
  return POR_CONTEXTO[contexto]?.[codigo] || GENERICOS[codigo] || null;
}
