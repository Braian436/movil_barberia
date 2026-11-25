import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORES, SERIF } from '../src/theme';
import BarberHeader from '../components/BarberHeader';
import BarberTabBar from '../components/BarberTabBar';

const DORADO = COLORES.dorado;
const FONDO = COLORES.fondo;
const TARJETA = COLORES.tarjeta;
const BORDE = COLORES.borde;
const GRIS = COLORES.gris;

// Alturas fijas pensadas para celular (las imágenes originales son muy
// "altas" si se las muestra con su relación de aspecto real).
// `alto` en píxeles y `ajuste`:
//   - 'cover'   -> llena el ancho recortando un poco arriba/abajo (fotos).
//   - 'contain' -> muestra la imagen completa con fondo negro (el gráfico).
const SECCIONES = [
  {
    key: 'productos',
    titulo: 'PRODUCTOS',
    descripcion: 'Agregar o administrar productos, marcas, categorías y descuentos.',
    enlace: 'VER PRODUCTOS',
    imagen: require('../assets/card_productos.png'),
    alto: 150,
    ajuste: 'cover',
    destino: 'Productos',
  },
];

export default function Home({ navigation }) {
  // Placeholder: cuando existan las pantallas, acá se navega.
  const seccionProximamente = (titulo) => {
    Alert.alert(titulo, 'Este apartado estará disponible próximamente.');
  };

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      {/* ---------- Header ---------- */}
      <BarberHeader titulo="Inicio" />

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
                onPress={() =>
                  item.destino
                    ? navigation.navigate(item.destino)
                    : seccionProximamente(item.titulo)
                }
              >
                <Text style={styles.tarjetaEnlaceTexto}>{item.enlace}</Text>
                <Ionicons name="chevron-forward" size={12} color={DORADO} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ---------- Tab bar ---------- */}
      <BarberTabBar
        activo="inicio"
        onPressTab={(tab) => {
          if (tab.key === 'perfil') {
            navigation.navigate('MiPerfil');
          } else if (tab.key === 'inicio') {
            return;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: FONDO },

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
    marginBottom: 16,
  },

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
});
