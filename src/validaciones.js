// Validaciones compartidas por Login, Registro, Recuperar contraseña y Perfil.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Solo letras (con acentos) y espacios.
export const NOMBRE_RE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

// Dominios desechables / de prueba (para no llenar la base de correos basura).
export const DOMINIOS_BASURA = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'spam4.me',
  'example.com',
  'example.org',
  'test.com',
];

// Limpia lo que el usuario escribe: deja únicamente letras y espacios.
export const soloLetras = (valor) =>
  valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');

// Devuelve un mensaje de error o null si el correo es válido.
export function validarCorreo(valor) {
  const correo = valor.trim().toLowerCase();
  if (!EMAIL_RE.test(correo)) {
    return 'Ingresá un correo válido, por ejemplo Usuario@email.com.';
  }
  const dominio = correo.split('@')[1];
  if (DOMINIOS_BASURA.includes(dominio)) {
    return 'Ese dominio no está permitido. Usá un correo real.';
  }
  return null;
}

// Devuelve un mensaje de error o null si el nombre/apellido es válido.
export function validarNombre(valor, campo) {
  const v = valor.trim().replace(/\s+/g, ' ');
  if (v.length < 2) return `Ingresá al menos 2 letras en ${campo}.`;
  if (!NOMBRE_RE.test(v)) return `En ${campo} solo se permiten letras y espacios.`;
  return null;
}

// true si el teléfono tiene al menos 8 dígitos y solo usa +, dígitos, espacios, () y -.
export const telefonoValido = (valor) => {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 8 && /^[+\d\s()-]+$/.test(valor.trim());
};
