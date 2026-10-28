# Productos en Firebase (Firestore)

La colección **`productos`** es independiente: no tiene claves foráneas ni
depende de otras colecciones. `categoria` y `marca` se guardan como texto
dentro de cada producto.

Firestore crea la colección automáticamente cuando se registra el primer
producto desde la app. No hace falta crearla a mano en la consola.

## Estructura de cada documento

Ruta: `productos/{idGeneradoPorFirestore}`

| Campo           | Tipo      | Obligatorio | Descripción                                  |
| --------------- | --------- | ----------- | -------------------------------------------- |
| `nombre`        | string    | Sí          | Nombre del producto (máx. 80 caracteres).    |
| `categoria`     | string    | Sí          | Categoría como texto (Pomada, Shampoo, etc.).|
| `marca`         | string    | No          | Marca como texto.                            |
| `descripcion`   | string    | No          | Detalle libre.                               |
| `precio`        | number    | Sí          | Precio entero, mayor o igual a 0.            |
| `stock`         | number    | Sí          | Unidades disponibles, entero mayor o igual a 0. |
| `activo`        | boolean   | Sí          | Si se muestra como disponible.               |
| `imagenUrl`     | string / null | No      | URL pública de la imagen (`https://...`).    |
| `creadoEn`      | timestamp | Automático  | Fecha de alta (`serverTimestamp`).           |
| `actualizadoEn` | timestamp | Automático  | Última modificación.                         |

## 1. Habilitar Firestore

1. Entrar a <https://console.firebase.google.com/> y elegir el proyecto.
2. Ir a **Firestore Database** y pulsar **Crear base de datos**.
3. Elegir la ubicación y crear en **modo producción**.

## 2. Cargar las reglas de seguridad

1. En Firestore, abrir la pestaña **Reglas**.
2. Reemplazar el contenido por el archivo [`firestore.rules`](./firestore.rules).
3. Pulsar **Publicar**.

Las reglas permiten leer y escribir solo a usuarios con sesión iniciada
(la app ya exige login para entrar a Productos).

## 3. Probar el CRUD

1. Iniciar sesión en la app.
2. Ir a **Inicio > Productos**.
3. Pulsar **Registrar producto**, completar los campos y guardar.
4. Verificar el documento en **Firestore Database > productos**.
5. Probar **Editar**, **Stock**, el interruptor **Activo/Inactivo** y el tacho
   de basura (**Eliminar**).

La pantalla escucha Firestore en tiempo real: cualquier cambio se refleja sin
recargar.

## Imágenes

El campo **Imagen (URL)** acepta un enlace público (`https://...`). Si no se
completa, la tarjeta muestra el recuadro de "Espacio para imagen".

Para subir archivos desde el teléfono habría que integrar **Firebase Storage**
y guardar en `imagenUrl` la URL de descarga. El CRUD actual ya está preparado
para mostrar esa URL.
