import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Colección "productos". No tiene claves foráneas: categoría y marca se
// guardan como texto dentro de cada documento.
export const COLECCION_PRODUCTOS = 'productos';

const texto = (valor) => String(valor ?? '').trim();

// Convierte cualquier documento de Firestore al formato que usa la pantalla.
function mapearProducto(snap) {
  const datos = snap.data() || {};

  return {
    id: snap.id,
    nombre: texto(datos.nombre),
    categoria: texto(datos.categoria),
    marca: texto(datos.marca),
    descripcion: texto(datos.descripcion),
    precio: Number(datos.precio) || 0,
    stock: Number(datos.stock) || 0,
    activo: datos.activo !== false,
    imagenUrl: texto(datos.imagenUrl),
  };
}

// Solo normaliza los campos que vienen en `datos`. Así `actualizarProducto`
// puede recibir cambios parciales (por ejemplo, únicamente { activo: false }).
function normalizarCampos(datos) {
  const salida = {};

  if ('nombre' in datos) salida.nombre = texto(datos.nombre);
  if ('categoria' in datos) salida.categoria = texto(datos.categoria);
  if ('marca' in datos) salida.marca = texto(datos.marca);
  if ('descripcion' in datos) salida.descripcion = texto(datos.descripcion);
  if ('precio' in datos) salida.precio = Math.max(0, Math.round(Number(datos.precio) || 0));
  if ('stock' in datos) salida.stock = Math.max(0, Math.round(Number(datos.stock) || 0));
  if ('activo' in datos) salida.activo = datos.activo !== false;
  if ('imagenUrl' in datos) salida.imagenUrl = texto(datos.imagenUrl) || null;

  return salida;
}

function asegurarDb() {
  if (!db) {
    throw new Error('Firebase no está configurado. Revisá el archivo .env.');
  }
}

/**
 * Escucha la colección en tiempo real. Devuelve la función para cancelar.
 * Los productos se ordenan alfabéticamente en el cliente para no necesitar
 * índices ni campos obligatorios en Firestore.
 */
export function suscribirProductos({ onCambios, onError }) {
  if (!db) {
    onError?.(new Error('Firebase no está configurado. Revisá el archivo .env.'));
    return () => {};
  }

  return onSnapshot(
    collection(db, COLECCION_PRODUCTOS),
    (snapshot) => {
      const productos = snapshot.docs
        .map(mapearProducto)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

      onCambios(productos);
    },
    (error) => onError?.(error)
  );
}

export async function crearProducto(datos) {
  asegurarDb();

  const campos = normalizarCampos({
    nombre: datos.nombre,
    categoria: datos.categoria,
    marca: datos.marca,
    descripcion: datos.descripcion,
    precio: datos.precio,
    stock: datos.stock,
    activo: datos.activo,
    imagenUrl: datos.imagenUrl,
  });

  const referencia = await addDoc(collection(db, COLECCION_PRODUCTOS), {
    ...campos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return referencia.id;
}

export async function actualizarProducto(id, cambios) {
  asegurarDb();

  const campos = normalizarCampos(cambios);
  if (!Object.keys(campos).length) return;

  await updateDoc(doc(db, COLECCION_PRODUCTOS, id), {
    ...campos,
    actualizadoEn: serverTimestamp(),
  });
}

// Suma (o resta, si es negativo) stock de forma atómica en el servidor.
export async function ajustarStock(id, cantidad) {
  asegurarDb();

  await updateDoc(doc(db, COLECCION_PRODUCTOS, id), {
    stock: increment(Math.round(Number(cantidad) || 0)),
    actualizadoEn: serverTimestamp(),
  });
}

export async function eliminarProducto(id) {
  asegurarDb();
  await deleteDoc(doc(db, COLECCION_PRODUCTOS, id));
}

// Mensajes claros para los errores más comunes de Firestore.
export function mensajeErrorFirestore(error) {
  const codigo = error?.code || '';

  if (codigo.includes('permission-denied')) {
    return 'Firestore rechazó la operación. Revisá que la base esté creada y que las reglas permitan a usuarios autenticados.';
  }
  if (codigo.includes('unavailable')) {
    return 'No hay conexión con Firestore. Revisá tu internet e intentá de nuevo.';
  }
  if (codigo.includes('failed-precondition')) {
    return 'Firestore no está habilitado en el proyecto. Creá la base de datos en la consola de Firebase.';
  }
  if (codigo.includes('not-found')) {
    return 'El producto ya no existe en la base de datos.';
  }

  return error?.message || 'Ocurrió un error al hablar con Firebase.';
}
