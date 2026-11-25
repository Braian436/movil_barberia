import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { notificar } from '../src/notify';
import { COLORES } from '../src/theme';
import { actualizarProducto, crearProducto, eliminarProducto, mensajeErrorFirestore, suscribirProductos } from '../src/services/productos';
import BarberHeader from '../components/BarberHeader';
import BarberTabBar from '../components/BarberTabBar';
import ProductoCard from '../components/ProductoCard';
import ProductoModal from '../components/ProductoModal';
import { Ionicons } from '@expo/vector-icons';

const VACIO = { nombre: '', categoria: '', precio: '', stock: '', activo: true };

export default function Productos({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [id, setId] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    return suscribirProductos({
      onCambios: (l) => {
        setItems(l);
        setError('');
        setLoading(false);
      },
      onError: (e) => {
        setError(mensajeErrorFirestore(e));
        setLoading(false);
      },
    });
  }, []);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const abrir = (p) => {
    setId(p ? p.id : null);
    setForm(
      p
        ? { nombre: p.nombre, categoria: p.categoria, precio: `${p.precio}`, stock: `${p.stock}`, activo: p.activo }
        : VACIO
    );
    setOpen(false);
    setVisible(true);
  };

  const cerrar = () => {
    setVisible(false);
    setId(null);
    setForm(VACIO);
    setOpen(false);
  };

  const guardar = async () => {
    const precio = Number(form.precio);
    const stock = Number(form.stock);
    if (
      !form.nombre.trim() ||
      !form.categoria ||
      !String(form.precio).trim() ||
      !String(form.stock).trim() ||
      !Number.isFinite(precio) ||
      !Number.isFinite(stock) ||
      precio < 0 ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      return notificar(
        'error',
        'Datos inválidos',
        'Completá nombre, categoría, precio y stock entero.'
      );
    }
    setSaving(true);
    try {
      const datos = {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        precio: Math.round(precio),
        stock,
        activo: form.activo,
      };
      await (id ? actualizarProducto(id, datos) : crearProducto(datos));
      notificar('success', id ? 'Producto actualizado' : 'Producto registrado');
      cerrar();
    } catch (e) {
      notificar('error', 'No se pudo guardar', mensajeErrorFirestore(e));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p) => {
    try {
      await actualizarProducto(p.id, { activo: !p.activo });
    } catch (e) {
      notificar('error', 'No se pudo cambiar', mensajeErrorFirestore(e));
    }
  };

  const borrar = (p) =>
    Alert.alert('Eliminar', `¿Borrar "${p.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          eliminarProducto(p.id).catch((e) =>
            notificar('error', 'No se pudo eliminar', mensajeErrorFirestore(e))
          ),
      },
    ]);

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <BarberHeader titulo="Productos" />

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.add} onPress={() => abrir(null)}>
          <Text style={styles.addTxt}>+ Registrar producto</Text>
        </TouchableOpacity>

        {!!error && <Text style={styles.error}>{error}</Text>}
        {loading && <ActivityIndicator color={COLORES.dorado} style={{ marginTop: 20 }} />}
        {!loading && !items.length && !error && (
          <Text style={styles.empty}>Sin productos.</Text>
        )}
        {items.map((p) => (
          <ProductoCard
            key={p.id}
            p={p}
            onEdit={abrir}
            onToggle={toggle}
            onDelete={borrar}
          />
        ))}
      </ScrollView>

      <BarberTabBar
        activo="inicio"
        onPressTab={(t) => {
          if (t.key === 'inicio') navigation.navigate('Home');
          else if (t.key === 'perfil') navigation.navigate('MiPerfil');
        }}
      />

      <ProductoModal
        visible={visible}
        id={id}
        form={form}
        open={open}
        saving={saving}
        onCerrar={cerrar}
        onCambiar={set}
        onToggleOpen={() => setOpen((v) => !v)}
        onGuardar={guardar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  content: { padding: 16, paddingBottom: 24, gap: 10 },
  add: {
    height: 42,
    borderRadius: 6,
    backgroundColor: COLORES.dorado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  error: { color: COLORES.rojo, fontSize: 12, textAlign: 'center' },
  empty: { color: COLORES.gris, fontSize: 13, textAlign: 'center', marginTop: 20 },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 15,
  backgroundColor: '#0d0d0d',
},
});
