import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
const FONDO = '#0f0f0f';
const TARJETA = '#161616';
const BORDE = 'rgba(255,255,255,0.12)';
const GRIS = '#9b9b9b';

// Alturas fijas pensadas para celular (las imágenes originales son muy
// "altas" si se las muestra con su relación de aspecto real).
// `alto` en píxeles y `ajuste`:
//   - 'cover'   -> llena el ancho recortando un poco arriba/abajo (fotos).
//   - 'contain' -> muestra la imagen completa con fondo negro (el gráfico).
const SECCIONES = [
  {
    key: 'empleados',
    titulo: 'EMPLEADOS',
    descripcion: 'Administrar empleados.',
    enlace: 'VER EMPLEADOS',
    imagen: require('../assets/card_empleado.png'),
    alto: 150,
    ajuste: 'cover',
  },
  {
    key: 'estadisticas',
    titulo: 'ESTADISTICAS',
    descripcion: 'Estadísticas de empleados, ganancias y asistencias.',
    enlace: 'VER ESTADISTICAS',
    imagen: require('../assets/card_estadistica.png'),
    alto: 150,
    ajuste: 'contain',
  },
  {
    key: 'servicios',
    titulo: 'SERVICIOS',
    descripcion: 'Administrar servicios.',
    enlace: 'VER SERVICIOS',
    imagen: require('../assets/card_servicios.png'),
    alto: 150,
    ajuste: 'cover',
  },
  {
    key: 'productos',
    titulo: 'PRODUCTOS',
    descripcion: 'Agregar o administrar productos, marcas, categorías y descuentos.',
    enlace: 'VER PRODUCTOS',
    imagen: require('../assets/card_productos.png'),
    alto: 150,
    ajuste: 'cover',
  },
];

const TABS = [
  { key: 'inicio', label: 'Inicio', icono: 'home', activo: true },
  { key: 'turnos', label: 'Turnos', icono: 'cut-outline' },
  { key: 'perfil', label: 'Perfil', icono: 'person-outline' },
];

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente.');
      // El observador de Firebase muestra Login al cerrar la sesión.
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión.');
    }
  };

  // El ícono de menú abre las opciones (por ahora, cerrar sesión).
  const abrirMenu = () => {
    Alert.alert('Menú', '¿Qué querés hacer?', [
      { text: 'Cerrar sesión', style: 'destructive', onPress: handleLogOut },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // Placeholder: cuando existan las pantallas, acá se navega.
  const seccionProximamente = (titulo) => {
    Alert.alert(titulo, 'Esta sección estará disponible próximamente.');
  };

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      {/* ---------- Header ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerLado}>
          <TouchableOpacity onPress={abrirMenu} hitSlop={8}>
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('../assets/logo_barber.png')}
            style={styles.headerLogo}
          />
        </View>

        <Text style={styles.headerTitulo}>Inicio</Text>

        <View style={[styles.headerLado, styles.headerDerecha]}>
          <TouchableOpacity onPress={() => seccionProximamente('Notificaciones')} hitSlop={8}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- Contenido ---------- */}
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
          style={styles.botonEmpleados}
          onPress={() => seccionProximamente('Registrar empleados')}
        >
          <Text style={styles.botonEmpleadosTexto}>Registrar empleados</Text>
          <Ionicons name="chevron-forward" size={14} color="#fff" />
        </TouchableOpacity>

        {SECCIONES.map((item) => (
          <View key={item.key} style={styles.tarjeta}>
            <Image
              source={item.imagen}
              style={[styles.tarjetaImagen, { height: item.alto }]}
              resizeMode={item.ajuste}
            />
            <View style={styles.tarjetaCuerpo}>
              <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
              <Text style={styles.tarjetaDescripcion}>{item.descripcion}</Text>
              <TouchableOpacity
                style={styles.tarjetaEnlace}
                onPress={() => seccionProximamente(item.titulo)}
              >
                <Text style={styles.tarjetaEnlaceTexto}>{item.enlace}</Text>
                <Ionicons name="chevron-forward" size={12} color={DORADO} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ---------- Botón flotante ---------- */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 56 + insets.bottom + 16 }]}
        onPress={() => seccionProximamente('Acción rápida')}
      >
        <Ionicons name="add" size={26} color={DORADO} />
      </TouchableOpacity>

      {/* ---------- Tab bar ---------- */}
      <View
        style={[
          styles.tabBar,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => seccionProximamente(tab.label)}
          >
            <Ionicons
              name={tab.icono}
              size={20}
              color={tab.activo ? DORADO : '#8a8a8a'}
            />
            <Text style={[styles.tabTexto, tab.activo && styles.tabTextoActivo]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: FONDO },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLado: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerDerecha: { justifyContent: 'flex-end' },
  headerLogo: { width: 26, height: 26, resizeMode: 'contain' },
  headerTitulo: {
    fontFamily: SERIF,
    fontSize: 18,
    color: DORADO,
    letterSpacing: 0.5,
  },

  // Contenido
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
  // La imagen original es casi cuadrada (804x808), pero en el diseño se
  // muestra como banner apaisado. Por eso fijamos la altura y usamos "cover".
  heroImagen: {
    width: '100%',
    height: 160,
    backgroundColor: '#000',
  },
  botonEmpleados: {
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
  botonEmpleadosTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Tarjetas
  tarjeta: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDE,
    borderRadius: 6,
    backgroundColor: TARJETA,
    overflow: 'hidden',
  },
  tarjetaImagen: { width: '100%', backgroundColor: '#000' },
  tarjetaCuerpo: { padding: 14 },
  tarjetaTitulo: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tarjetaDescripcion: { color: GRIS, fontSize: 12.5, lineHeight: 17 },
  tarjetaEnlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  tarjetaEnlaceTexto: {
    color: DORADO,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Botón flotante
  fab: {
    position: 'absolute',
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#191919',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  tabTexto: { fontSize: 10.5, color: '#8a8a8a', letterSpacing: 0.3 },
  tabTextoActivo: { color: DORADO },
});
