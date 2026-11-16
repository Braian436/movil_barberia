import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const COL = 'productos';
const texto = (v) => String(v ?? '').trim();
const numero = (v) => Math.max(0, Number(v) || 0);

const mapear = (s) => {
  const d = s.data() || {};
  return {
    id: s.id,
    nombre: texto(d.nombre),
    categoria: texto(d.categoria),
    precio: numero(d.precio),
    stock: Math.round(numero(d.stock)),
    activo: d.activo !== false,
  };
};

const campos = (d) => {
  const o = {};
  if ('nombre' in d) o.nombre = texto(d.nombre);
  if ('categoria' in d) o.categoria = texto(d.categoria);
  if ('precio' in d) o.precio = numero(d.precio);
  if ('stock' in d) o.stock = Math.round(numero(d.stock));
  if ('activo' in d) o.activo = d.activo !== false;
  return o;
};

export const suscribirProductos = ({ onCambios, onError }) =>
  onSnapshot(
    collection(db, COL),
    (snap) => onCambios(snap.docs.map(mapear).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))),
    onError
  );

export const crearProducto = (datos) =>
  addDoc(collection(db, COL), { ...campos(datos), creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });

export const actualizarProducto = (id, cambios) =>
  updateDoc(doc(db, COL, id), { ...campos(cambios), actualizadoEn: serverTimestamp() });

export const eliminarProducto = (id) => deleteDoc(doc(db, COL, id));

export const mensajeErrorFirestore = (e) => {
  const c = e?.code || '';
  if (c.includes('permission-denied')) return 'Firestore rechazó la operación. Revisá las reglas.';
  if (c.includes('unavailable')) return 'Sin conexión con Firestore.';
  if (c.includes('failed-precondition')) return 'Firestore no está habilitado.';
  return e?.message || 'Error con Firebase.';
};
