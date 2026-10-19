import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import BarberHeader from '../components/BarberHeader';
import BarberTabBar from '../components/BarberTabBar';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
const FONDO = '#0f0f0f';
const TARJETA = '#161616';
const BORDE = 'rgba(255,255,255,0.12)';
const GRIS = '#9b9b9b';
const VERDE = '#43c463';

// ---------------------------------------------------------------------------
// Datos de ejemplo. Acá es donde vas a poner TUS imágenes.
// 1) Copiá el PNG a la carpeta assets/.
// 2) Descomentá la línea `imagen` y cambiá el nombre del archivo.
// OJO: tiene que ser un require() "estático" (con la ruta escrita a mano);
// Metro (el empaquetador) no acepta rutas armadas con variables.
// Si dejás `imagen: null`, la tarjeta muestra un recuadro gris de "Espacio
// para imagen" con el tamaño ya listo (igual que en Home).
// ---------------------------------------------------------------------------
const PRODUCTOS_INICIALES = [
  {
    id: '1',
    nombre: 'CERA MATE',
    categoria: 'Pomada',
    precio: 13000,
    stock: 48,
    activo: true,
    imagen: null, // require('../assets/producto_cera_mate.png'),
  },
  {
    id: '2',
    nombre: 'ACEITE BARBA-BICOTE',
    categoria: 'Aceite',
    precio: 17500,
    stock: 12,
    activo: true,
    imagen: null,
  },
  {
    id: '3',
    nombre: 'SHAMPOO NEUTRO',
    categoria: 'Shampoo',
    precio: 18000,
    stock: 5,
    activo: false,
    imagen: null,
  },
];

// Formatea 13000 -> "$13.000" (sin depender de Intl).
const formatearPrecio = (valor) =>
  '$' +
  String(Math.round(Number(valor) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// ---------------------- Tarjeta de un producto ------------------------------
function ProductoCard({ producto, onEditarPrecio, onAnadirStock, onAlternarActivo }) {
  const { activo } = producto;

  return (
    // Si el producto está inactivo, atenuamos toda la tarjeta (opacity).
    <View style={[styles.tarjeta, !activo && styles.tarjetaInactiva]}>
      {/* Imagen o espacio reservado */}
      {producto.imagen ? (
        <Image
          source={producto.imagen}
          style={styles.tarjetaImagen}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.tarjetaImagen, styles.imagenVacia]}>
          <Ionicons name="image-outline" size={26} color="#555" />
          <Text style={styles.imagenVaciaTexto}>Espacio para imagen</Text>
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
          {producto.categoria} / Stock: {producto.stock}
        </Text>

        {/* Precio */}
        <View style={styles.chipPrecio}>
          <Text style={styles.chipPrecioTexto}>
            {formatearPrecio(producto.precio)}
          </Text>
        </View>

        {/* Acciones */}
        <View style={styles.filaBotones}>
          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => onEditarPrecio(producto)}
          >
            <Ionicons name="create-outline" size={14} color="#fff" />
            <Text style={styles.botonAccionTexto}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonAccion}
            onPress={() => onAnadirStock(producto)}
          >
            <Ionicons name="add-circle-outline" size={14} color="#fff" />
            <Text style={styles.botonAccionTexto}>Añadir Stock</Text>
          </TouchableOpacity>
        </View>

        {/* Interruptor activo / inactivo */}
        <TouchableOpacity
          style={[
            styles.pillEstado,
            activo ? styles.pillActivo : styles.pillInactivo,
          ]}
          onPress={() => onAlternarActivo(producto.id)}
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
  const [productos, setProductos] = useState(PRODUCTOS_INICIALES);

  // Estado del modal (sirve para "precio" y para "stock")
  const [modalVisible, setModalVisible] = useState(false);
  const [modo, setModo] = useState('precio'); // 'precio' | 'stock'
  const [productoSel, setProductoSel] = useState(null);
  const [valorInput, setValorInput] = useState('');

  const abrirEditarPrecio = (producto) => {
    setModo('precio');
    setProductoSel(producto);
    setValorInput(String(producto.precio));
    setModalVisible(true);
  };

  const abrirAnadirStock = (producto) => {
    setModo('stock');
    setProductoSel(producto);
    setValorInput('');
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setProductoSel(null);
    setValorInput('');
  };

  // Aplica el cambio al producto correspondiente sin mutar el array original.
  const confirmar = () => {
    const numero = Number(valorInput);
    if (!valorInput.trim() || Number.isNaN(numero) || numero < 0) {
      Alert.alert('Dato inválido', 'Ingresá un número válido.');
      return;
    }

    setProductos((prev) =>
      prev.map((p) => {
        if (p.id !== productoSel.id) return p;
        return modo === 'precio'
          ? { ...p, precio: Math.round(numero) }
          : { ...p, stock: p.stock + Math.round(numero) };
      })
    );

    cerrarModal();
  };

  const alternarActivo = (id) =>
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: !p.activo } : p))
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

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      <BarberHeader
        titulo="Productos"
        onMenu={abrirMenu}
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

        <TouchableOpacity
          style={styles.botonRegistrar}
          onPress={() => Alert.alert('Registrar producto', 'Próximamente.')}
        >
          <Text style={styles.botonRegistrarTexto}>Registrar producto</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </TouchableOpacity>

        {productos.map((producto) => (
          <ProductoCard
            key={producto.id}
            producto={producto}
            onEditarPrecio={abrirEditarPrecio}
            onAnadirStock={abrirAnadirStock}
            onAlternarActivo={alternarActivo}
          />
        ))}
      </ScrollView>

      <BarberTabBar
        activo="inicio"
        onPressTab={(tab) => {
          if (tab.key === 'inicio') navigation.navigate('Home');
        }}
      />

      {/* Modal para cambiar precio o añadir stock */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <KeyboardAvoidingView style={styles.modalFondo} behavior="padding">
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>
              {modo === 'precio' ? 'Cambiar precio' : 'Añadir stock'}
            </Text>
            <Text style={styles.modalProducto}>{productoSel?.nombre}</Text>

            <TextInput
              style={styles.modalInput}
              value={valorInput}
              onChangeText={setValorInput}
              keyboardType="number-pad"
              placeholder={modo === 'precio' ? '13000' : '0'}
              placeholderTextColor="#666"
              autoFocus
            />

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalCancelar]}
                onPress={cerrarModal}
              >
                <Text style={styles.modalBotonTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBoton, styles.modalConfirmar]}
                onPress={confirmar}
              >
                <Text style={styles.modalBotonTexto}>Guardar</Text>
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

  // Modal
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
