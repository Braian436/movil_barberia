import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { notificar } from '../src/notify';
import {
  actualizarProducto,
  ajustarStock,
  crearProducto,
  eliminarProducto,
  mensajeErrorFirestore,
  suscribirProductos,
} from '../src/services/productos';
import BarberHeader from '../components/BarberHeader';
import BarberTabBar from '../components/BarberTabBar';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
const FONDO = '#0f0f0f';
const TARJETA = '#161616';
const BORDE = 'rgba(255,255,255,0.12)';
const GRIS = '#9b9b9b';
const VERDE = '#43c463';
const ROJO = '#e05a5a';

// Categorías precargadas para el menú desplegable.
const CATEGORIAS = ['Pomada', 'Shampoo', 'Aceite', 'Cera', 'Tinte'];

const PRODUCTO_VACIO = {
  nombre: '',
  categoria: '',
  marca: '',
  descripcion: '',
  precio: '',
  stock: '',
  activo: true,
};

// Formatea 13000 -> "$13.000" (sin depender de Intl).
const formatearPrecio = (valor) =>
  '$' +
  String(Math.round(Number(valor) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const aNumero = (valor) => Number(String(valor).replace(',', '.'));

// Convierte un producto de Firestore al formulario (todo texto).
function productoAFormulario(producto) {
  return {
    nombre: producto.nombre,
    categoria: producto.categoria,
    marca: producto.marca,
    descripcion: producto.descripcion,
    precio: String(producto.precio),
    stock: String(producto.stock),
    activo: producto.activo,
  };
}

function validarFormulario(form) {
  const nombre = form.nombre.trim();
  if (!nombre) return 'Ingresá el nombre del producto.';
  if (nombre.length > 80) return 'El nombre no puede superar los 80 caracteres.';

  if (!form.categoria.trim()) return 'Seleccioná una categoría.';

  const precio = aNumero(form.precio);
  if (!String(form.precio).trim() || Number.isNaN(precio) || precio < 0) {
    return 'Ingresá un precio válido.';
  }

  const stock = aNumero(form.stock);
  if (
    !String(form.stock).trim() ||
    Number.isNaN(stock) ||
    stock < 0 ||
    !Number.isInteger(stock)
  ) {
    return 'Ingresá un stock válido (número entero).';
  }

  return null;
}

function datosDesdeFormulario(form) {
  return {
    nombre: form.nombre.trim(),
    categoria: form.categoria.trim(),
    marca: form.marca.trim(),
    descripcion: form.descripcion.trim(),
    precio: Math.round(aNumero(form.precio)),
    stock: Math.round(aNumero(form.stock)),
    activo: form.activo,
  };
}

// Campo reutilizable para el formulario.
function Campo({ label, icono, estilo, estiloInput, ...props }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <View style={[styles.campoContenedor, estilo]}>
        <Ionicons name={icono} size={16} color={GRIS} style={styles.campoIcono} />
        <TextInput
          style={[styles.campoInput, estiloInput]}
          placeholderTextColor="#666"
          {...props}
        />
      </View>
    </View>
  );
}

// ---------------------- Tarjeta de un producto ------------------------------
function ProductoCard({
  producto,
  onEditar,
  onAnadirStock,
  onAlternarActivo,
  onEliminar,
}) {
  const { activo } = producto;
  const [imagenConError, setImagenConError] = useState(false);

  // Si se edita el producto con otra URL, volvemos a intentar mostrarla.
  useEffect(() => setImagenConError(false), [producto.imagenUrl]);

  const mostrarImagen = !!producto.imagenUrl && !imagenConError;

  return (
    // Si el producto está inactivo, atenuamos toda la tarjeta (opacity).
    <View style={[styles.tarjeta, !activo && styles.tarjetaInactiva]}>
      {mostrarImagen ? (
        <Image
          source={{ uri: producto.imagenUrl }}
          style={styles.tarjetaImagen}
          resizeMode="cover"
          onError={() => setImagenConError(true)}
        />
      ) : (
        <View style={[styles.tarjetaImagen, styles.imagenVacia]}>
          <Ionicons name="image-outline" size={26} color="#555" />
          <Text style={styles.imagenVaciaTexto}>
            {producto.imagenUrl ? 'No se pudo cargar la imagen' : 'Espacio para imagen'}
          </Text>
        </View>
      )}

      <View style={styles.tarjetaCuerpo}>
        {/* Nombre + punto de estado */}
        <View style={styles.filaTitulo}>
          <Text style={styles.tarjetaTitulo}>{producto.nombre}</Text>
          <View
            style={[styles.punto, { backgroundColor: activo ? VERDE : '#6b6b6b' }]}
          />
        </View>

        <Text style={styles.tarjetaSub}>
          {producto.categoria}
          {producto.marca ? ` · ${producto.marca}` : ''} / Stock: {producto.stock}
        </Text>

        {!!producto.descripcion && (
          <Text style={styles.tarjetaDescripcion} numberOfLines={2}>
            {producto.descripcion}
          </Text>
        )}

        <View style={styles.chipPrecio}>
          <Text style={styles.chipPrecioTexto}>
            {formatearPrecio(producto.precio)}
          </Text>
        </View>

        {/* Acciones */}
        <View style={styles.filaBotones}>
          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => onEditar(producto)}
          >
            <Ionicons name="create-outline" size={14} color="#fff" />
            <Text style={styles.botonAccionTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => onAnadirStock(producto)}
          >
            <Ionicons name="add-circle-outline" size={14} color="#fff" />
            <Text style={styles.botonAccionTexto}>Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => onEliminar(producto)}
          >
            <Ionicons name="trash-outline" size={16} color={ROJO} />
          </TouchableOpacity>
        </View>

        {/* Interruptor activo / inactivo */}
        <TouchableOpacity
          style={[
            styles.pillEstado,
            activo ? styles.pillActivo : styles.pillInactivo,
          ]}
          onPress={() => onAlternarActivo(producto)}
        >
          <View
            style={[
              styles.pillKnob,
              { backgroundColor: activo ? VERDE : '#6b6b6b' },
            ]}
          />
          <Text
            style={[styles.pillTexto, { color: activo ? VERDE : GRIS }]}
          >
            {activo ? 'ACTIVO' : 'INACTIVO'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------------------ Pantalla ------------------------------------
export default function Productos({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState('');
  const [intento, setIntento] = useState(0);

  // Formulario de registrar / editar.
  const [formVisible, setFormVisible] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(PRODUCTO_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [categoriaVisible, setCategoriaVisible] = useState(false);

  // Modal rápido para añadir stock.
  const [stockVisible, setStockVisible] = useState(false);
  const [productoStock, setProductoStock] = useState(null);
  const [stockInput, setStockInput] = useState('');
  const [guardandoStock, setGuardandoStock] = useState(false);

  // Escucha Firestore en tiempo real: cualquier alta, edición o borrado se
  // refleja sin recargar la pantalla.
  useEffect(() => {
    let activo = true;
    setCargando(true);

    const cancelar = suscribirProductos({
      onCambios: (lista) => {
        if (!activo) return;
        setProductos(lista);
        setErrorCarga('');
        setCargando(false);
      },
      onError: (error) => {
        if (!activo) return;
        console.error('Error de Firestore:', error.code, error.message);
        setErrorCarga(mensajeErrorFirestore(error));
        setCargando(false);
      },
    });

    return () => {
      activo = false;
      cancelar();
    };
  }, [intento]);

  const cambiarCampo = (campo) => (valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const abrirRegistrar = () => {
    setEditandoId(null);
    setForm({ ...PRODUCTO_VACIO });
    setCategoriaVisible(false);
    setFormVisible(true);
  };

  const abrirEditar = (producto) => {
    setEditandoId(producto.id);
    setForm(productoAFormulario(producto));
    setCategoriaVisible(false);
    setFormVisible(true);
  };

  const cerrarFormulario = () => {
    setFormVisible(false);
    setEditandoId(null);
    setForm({ ...PRODUCTO_VACIO });
    setCategoriaVisible(false);
  };

  const guardarProducto = async () => {
    const error = validarFormulario(form);
    if (error) {
      notificar('error', 'Revisá los datos', error);
      return;
    }

    const datos = datosDesdeFormulario(form);
    setGuardando(true);

    try {
      if (editandoId) {
        await actualizarProducto(editandoId, datos);
        notificar('success', 'Producto actualizado', 'Los cambios se guardaron en Firebase.');
      } else {
        await crearProducto(datos);
        notificar(
          'success',
          'Producto registrado',
          'Se guardó en la colección "productos" de Firebase.'
        );
      }
      cerrarFormulario();
    } catch (errorGuardado) {
      console.error('Error al guardar producto:', errorGuardado.code, errorGuardado.message);
      notificar('error', 'No se pudo guardar', mensajeErrorFirestore(errorGuardado));
    } finally {
      setGuardando(false);
    }
  };

  const abrirAnadirStock = (producto) => {
    setProductoStock(producto);
    setStockInput('');
    setStockVisible(true);
  };

  const cerrarStock = () => {
    setStockVisible(false);
    setProductoStock(null);
    setStockInput('');
  };

  const confirmarStock = async () => {
    const cantidad = aNumero(stockInput);
    if (
      !stockInput.trim() ||
      Number.isNaN(cantidad) ||
      cantidad <= 0 ||
      !Number.isInteger(cantidad)
    ) {
      notificar('error', 'Dato inválido', 'Ingresá una cantidad entera mayor a cero.');
      return;
    }

    setGuardandoStock(true);
    try {
      await ajustarStock(productoStock.id, cantidad);
      notificar(
        'success',
        'Stock actualizado',
        `Se sumaron ${cantidad} unidades a "${productoStock.nombre}".`
      );
      cerrarStock();
    } catch (error) {
      console.error('Error al añadir stock:', error.code, error.message);
      notificar('error', 'No se pudo actualizar', mensajeErrorFirestore(error));
    } finally {
      setGuardandoStock(false);
    }
  };

  const alternarActivo = async (producto) => {
    try {
      await actualizarProducto(producto.id, { activo: !producto.activo });
      notificar(
        'success',
        producto.activo ? 'Producto desactivado' : 'Producto activado',
        producto.activo
          ? 'Ya no aparecerá como disponible.'
          : 'Ya aparece como disponible.'
      );
    } catch (error) {
      console.error('Error al cambiar estado:', error.code, error.message);
      notificar('error', 'No se pudo cambiar el estado', mensajeErrorFirestore(error));
    }
  };

  const eliminar = async (producto) => {
    try {
      await eliminarProducto(producto.id);
      notificar('success', 'Producto eliminado', `"${producto.nombre}" se borró de Firebase.`);
    } catch (error) {
      console.error('Error al eliminar producto:', error.code, error.message);
      notificar('error', 'No se pudo eliminar', mensajeErrorFirestore(error));
    }
  };

  const confirmarEliminar = (producto) =>
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminar(producto),
        },
      ]
    );

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
    }
  };

  const abrirMenu = () =>
    Alert.alert('Menú', '¿Qué querés hacer?', [
      { text: 'Volver al inicio', onPress: () => navigation.navigate('Home') },
      { text: 'Cerrar sesión', style: 'destructive', onPress: handleLogOut },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  // Si el producto tiene una categoría que no está en la lista, la incluimos.
  const opcionesCategoria =
    form.categoria && !CATEGORIAS.includes(form.categoria)
      ? [form.categoria, ...CATEGORIAS]
      : CATEGORIAS;

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      <BarberHeader
        titulo="Productos"
        onCampana={() => Alert.alert('Notificaciones', 'Próximamente.')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContenido}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heroTitulo}>BARBERIA CLASE A</Text>

        <Image
          source={require('../assets/imagen_home_barberia.png')}
          style={styles.heroImagen}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.botonRegistrar} onPress={abrirRegistrar}>
          <Text style={styles.botonRegistrarTexto}>Registrar producto</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </TouchableOpacity>

        {!!errorCarga && (
          <View style={styles.errorCaja}>
            <Ionicons name="cloud-offline-outline" size={22} color={ROJO} />
            <View style={styles.errorTextos}>
              <Text style={styles.errorTitulo}>No se pudo conectar con Firestore</Text>
              <Text style={styles.errorTexto}>{errorCarga}</Text>
            </View>
            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={() => setIntento((n) => n + 1)}
            >
              <Text style={styles.botonReintentarTexto}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {cargando && productos.length === 0 ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator size="large" color={DORADO} />
            <Text style={styles.estadoTexto}>Cargando productos...</Text>
          </View>
        ) : productos.length === 0 && !errorCarga ? (
          <View style={styles.estadoCentro}>
            <Ionicons name="cube-outline" size={44} color="#555" />
            <Text style={styles.vacioTitulo}>Todavía no hay productos</Text>
            <Text style={styles.estadoTexto}>
              Tocá "Registrar producto" para crear el primero en Firebase.
            </Text>
          </View>
        ) : (
          productos.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEditar={abrirEditar}
              onAnadirStock={abrirAnadirStock}
              onAlternarActivo={alternarActivo}
              onEliminar={confirmarEliminar}
            />
          ))
        )}
      </ScrollView>

      <BarberTabBar
        activo="inicio"
        onPressTab={(tab) => {
          if (tab.key === 'inicio') navigation.navigate('Home');
          else if (tab.key === 'perfil') abrirMenu();
        }}
      />

      {/* ---------- Formulario: registrar / editar ---------- */}
      <Modal
        visible={formVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarFormulario}
      >
        <KeyboardAvoidingView
          style={styles.formFondo}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.formCaja}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderTextos}>
                <Text style={styles.formTitulo}>
                  {editandoId ? 'Editar producto' : 'Registrar producto'}
                </Text>
                <Text style={styles.formSubtitulo}>
                  Se guarda en Firebase · colección "productos"
                </Text>
              </View>
              <TouchableOpacity
                onPress={cerrarFormulario}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContenido}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Campo
                label="NOMBRE *"
                icono="pricetag-outline"
                placeholder="Ej: Cera mate"
                value={form.nombre}
                onChangeText={cambiarCampo('nombre')}
                autoCapitalize="sentences"
                maxLength={80}
              />

              <View style={styles.campo}>
                <Text style={styles.campoLabel}>CATEGORÍA *</Text>
                <TouchableOpacity
                  style={styles.campoContenedor}
                  activeOpacity={0.8}
                  onPress={() => setCategoriaVisible((v) => !v)}
                >
                  <Ionicons
                    name="albums-outline"
                    size={16}
                    color={GRIS}
                    style={styles.campoIcono}
                  />
                  <Text
                    style={[
                      styles.campoInput,
                      !form.categoria && styles.campoPlaceholder,
                    ]}
                  >
                    {form.categoria || 'Seleccioná una categoría'}
                  </Text>
                  <Ionicons
                    name={categoriaVisible ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={GRIS}
                  />
                </TouchableOpacity>

                {categoriaVisible && (
                  <View style={styles.opcionesCategoria}>
                    {opcionesCategoria.map((cat) => {
                      const seleccionada = form.categoria === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.opcionCategoria,
                            seleccionada && styles.opcionCategoriaActiva,
                          ]}
                          onPress={() => {
                            setForm((prev) => ({ ...prev, categoria: cat }));
                            setCategoriaVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.opcionCategoriaTexto,
                              seleccionada && styles.opcionCategoriaTextoActiva,
                            ]}
                          >
                            {cat}
                          </Text>
                          {seleccionada && (
                            <Ionicons name="checkmark" size={16} color={DORADO} />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <Campo
                label="MARCA"
                icono="business-outline"
                placeholder="Ej: Barber Clase A"
                value={form.marca}
                onChangeText={cambiarCampo('marca')}
                autoCapitalize="words"
              />

              <View style={styles.filaCampos}>
                <View style={styles.mitad}>
                  <Campo
                    label="PRECIO *"
                    icono="cash-outline"
                    placeholder="13000"
                    value={form.precio}
                    onChangeText={cambiarCampo('precio')}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.mitad}>
                  <Campo
                    label="STOCK *"
                    icono="layers-outline"
                    placeholder="0"
                    value={form.stock}
                    onChangeText={cambiarCampo('stock')}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <Campo
                label="DESCRIPCIÓN"
                icono="document-text-outline"
                placeholder="Detalle opcional del producto"
                value={form.descripcion}
                onChangeText={cambiarCampo('descripcion')}
                multiline
                estiloInput={styles.campoMultilinea}
              />

              <TouchableOpacity
                style={styles.activoFila}
                activeOpacity={0.8}
                onPress={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}
              >
                <View
                  style={[
                    styles.switch,
                    form.activo ? styles.switchOn : styles.switchOff,
                  ]}
                >
                  <View
                    style={[
                      styles.switchKnob,
                      { backgroundColor: form.activo ? VERDE : '#6b6b6b' },
                    ]}
                  />
                </View>
                <View style={styles.activoTextos}>
                  <Text style={styles.activoTitulo}>
                    {form.activo ? 'Producto activo' : 'Producto inactivo'}
                  </Text>
                  <Text style={styles.activoAyuda}>
                    Los productos inactivos se muestran atenuados.
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.formBotones}>
              <TouchableOpacity
                style={[styles.formBoton, styles.formCancelar]}
                onPress={cerrarFormulario}
                disabled={guardando}
              >
                <Text style={styles.formBotonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formBoton, styles.formGuardar, guardando && { opacity: 0.6 }]}
                onPress={guardarProducto}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.formBotonTexto}>
                    {editandoId ? 'Guardar cambios' : 'Registrar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ---------- Modal rápido: añadir stock ---------- */}
      <Modal
        visible={stockVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarStock}
      >
        <KeyboardAvoidingView style={styles.modalFondo} behavior="padding">
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Añadir stock</Text>
            <Text style={styles.modalProducto}>{productoStock?.nombre}</Text>

            <TextInput
              style={styles.modalInput}
              value={stockInput}
              onChangeText={setStockInput}
              keyboardType="number-pad"
              placeholder="Cantidad a sumar"
              placeholderTextColor="#666"
              autoFocus
            />

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalCancelar]}
                onPress={cerrarStock}
                disabled={guardandoStock}
              >
                <Text style={styles.modalBotonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBoton,
                  styles.modalConfirmar,
                  guardandoStock && { opacity: 0.6 },
                ]}
                onPress={confirmarStock}
                disabled={guardandoStock}
              >
                {guardandoStock ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalBotonTexto}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: FONDO },

  scroll: { flex: 1 },
  scrollContenido: { paddingBottom: 24 },
  heroTitulo: {
    fontFamily: SERIF,
    fontSize: 20,
    color: DORADO,
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  heroImagen: {
    width: '100%',
    height: 160,
    backgroundColor: '#000',
  },
  botonRegistrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 4,
    backgroundColor: DORADO,
  },
  botonRegistrarTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Estados de carga / vacío / error
  estadoCentro: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 36,
    gap: 10,
  },
  estadoTexto: { color: GRIS, fontSize: 12.5, textAlign: 'center', lineHeight: 18 },
  vacioTitulo: { color: '#fff', fontSize: 15, fontWeight: '700' },

  errorCaja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(224,90,90,0.5)',
    borderRadius: 6,
    backgroundColor: 'rgba(224,90,90,0.08)',
  },
  errorTextos: { flex: 1 },
  errorTitulo: { color: '#fff', fontSize: 12.5, fontWeight: '700' },
  errorTexto: { color: GRIS, fontSize: 11.5, marginTop: 3, lineHeight: 16 },
  botonReintentar: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: ROJO,
  },
  botonReintentarTexto: { color: ROJO, fontSize: 11, fontWeight: '700' },

  // Tarjeta de producto
  tarjeta: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 6,
    backgroundColor: TARJETA,
    overflow: 'hidden',
  },
  tarjetaInactiva: { opacity: 0.45 },
  tarjetaImagen: { width: '100%', height: 150, backgroundColor: '#000' },
  imagenVacia: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  imagenVaciaTexto: { color: '#666', fontSize: 12 },
  tarjetaCuerpo: { padding: 14 },
  filaTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tarjetaTitulo: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    flexShrink: 1,
    marginRight: 10,
  },
  punto: { width: 10, height: 10, borderRadius: 5 },
  tarjetaSub: { color: GRIS, fontSize: 12, marginTop: 6 },
  tarjetaDescripcion: { color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 17, marginTop: 6 },

  chipPrecio: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#1e1e1e',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
  },
  chipPrecioTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },

  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#1e1e1e',
  },
  botonAccionTexto: { color: '#fff', fontSize: 12, fontWeight: '600' },
  botonEliminar: {
    width: 40,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(224,90,90,0.5)',
    backgroundColor: 'rgba(224,90,90,0.08)',
  },

  pillEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingLeft: 6,
    paddingRight: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillActivo: {
    backgroundColor: 'rgba(67,196,99,0.14)',
    borderColor: VERDE,
  },
  pillInactivo: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pillKnob: { width: 16, height: 16, borderRadius: 8 },
  pillTexto: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Formulario de producto
  formFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  formCaja: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    alignSelf: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  formHeaderTextos: { flex: 1 },
  formTitulo: { color: '#fff', fontSize: 18, fontWeight: '700' },
  formSubtitulo: { color: DORADO, fontSize: 11.5, marginTop: 3 },

  formScroll: { flexGrow: 0, flexShrink: 1 },
  formContenido: { paddingHorizontal: 18, paddingBottom: 8 },
  campo: { marginTop: 14 },
  campoLabel: {
    color: '#fff',
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  campoContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  campoIcono: { marginRight: 8 },
  campoInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 10,
  },
  campoMultilinea: {
    minHeight: 74,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  campoPlaceholder: { color: '#666' },
  opcionesCategoria: {
    marginTop: 6,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  opcionCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  opcionCategoriaActiva: { backgroundColor: 'rgba(176,141,87,0.15)' },
  opcionCategoriaTexto: { color: '#ddd', fontSize: 14 },
  opcionCategoriaTextoActiva: { color: DORADO, fontWeight: '700' },
  filaCampos: { flexDirection: 'row', gap: 12 },
  mitad: { flex: 1 },

  activoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: {
    backgroundColor: 'rgba(67,196,99,0.2)',
    borderColor: VERDE,
    alignItems: 'flex-end',
  },
  switchOff: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'flex-start',
  },
  switchKnob: { width: 18, height: 18, borderRadius: 9 },
  activoTextos: { flex: 1 },
  activoTitulo: { color: '#fff', fontSize: 13, fontWeight: '600' },
  activoAyuda: { color: GRIS, fontSize: 11, marginTop: 2 },

  formBotones: {
    flexDirection: 'row',
    gap: 10,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  formBoton: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  formCancelar: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formGuardar: { backgroundColor: DORADO },
  formBotonTexto: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Modal rápido de stock
  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCaja: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 10,
    padding: 20,
  },
  modalTitulo: { color: '#fff', fontSize: 17, fontWeight: '700' },
  modalProducto: { color: DORADO, fontSize: 13, marginTop: 4, marginBottom: 16 },
  modalInput: {
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#111',
  },
  modalBotones: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalBoton: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  modalCancelar: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalConfirmar: { backgroundColor: DORADO },
  modalBotonTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
