import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COL = 'usuarios';

const texto = (v) => String(v ?? '').trim();

// La foto se guarda como base64 (sin el prefijo "data:image/...").
// IMPORTANTE: Firestore tiene un límite de 1 MB por documento. Por eso la
// imagen se recorta a 1:1 y se comprime antes de convertirla a base64.
const mapear = (d) => ({
  nombre: texto(d.nombre),
  apellido: texto(d.apellido),
  email: texto(d.email).toLowerCase(),
  telefono: texto(d.telefono),
  fotoBase64: texto(d.fotoBase64),
});

// Crea el documento si no existe (para usuarios registrados antes de tener
// sección de perfil). Devuelve los datos mapeados del documento.
export const obtenerPerfil = async (uid) => {
  const refDoc = doc(db, COL, uid);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) {
    await setDoc(
      refDoc,
      {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fotoBase64: '',
        creadoEn: serverTimestamp(),
      },
      { merge: true }
    );
    return { nombre: '', apellido: '', email: '', telefono: '', fotoBase64: '' };
  }

  return mapear(snap.data());
};

export const guardarPerfil = (uid, datos) => {
  const campos = {};
  if ('nombre' in datos) campos.nombre = texto(datos.nombre);
  if ('apellido' in datos) campos.apellido = texto(datos.apellido);
  if ('email' in datos) campos.email = texto(datos.email).toLowerCase();
  if ('telefono' in datos) campos.telefono = texto(datos.telefono);
  if ('fotoBase64' in datos) campos.fotoBase64 = texto(datos.fotoBase64);

  return setDoc(
    doc(db, COL, uid),
    { ...campos, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
};
