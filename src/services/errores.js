// Traducción de errores de Firestore a mensajes claros, compartida por todos
// los servicios (productos, usuarios, etc.).

export const mensajeErrorFirestore = (e) => {
  const c = e?.code || '';
  if (c.includes('permission-denied'))
    return 'Firestore rechazó la operación. Revisá las reglas.';
  if (c.includes('unavailable')) return 'Sin conexión con Firestore.';
  if (c.includes('failed-precondition')) return 'Firestore no está habilitado.';
  return e?.message || 'Error con Firebase.';
};
