import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { notificar } from '../src/notify';
import { actualizarProducto, crearProducto, eliminarProducto, mensajeErrorFirestore, suscribirProductos } from '../src/services/productos';
import BarberHeader from '../components/BarberHeader';
import BarberTabBar from '../components/BarberTabBar';

const GOLD = '#b08d57', BG = '#0f0f0f', RED = '#e05a5a', GREEN = '#43c463';
const CATS = ['Pomada', 'Shampoo', 'Aceite', 'Cera', 'Tinte'];
const VACIO = { nombre: '', categoria: '', precio: '', stock: '', activo: true };
const money = (v) => '$' + String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const Card = ({ p, onEdit, onToggle, onDelete }) => (
  <View style={[s.card, !p.activo && { opacity: 0.5 }]}>
    <View style={s.row}>
      <Text style={s.title}>{p.nombre}</Text>
      <View style={[s.dot, { backgroundColor: p.activo ? GREEN : '#666' }]} />
    </View>
    <Text style={s.sub}>{p.categoria} · Stock: {p.stock}</Text>
    <Text style={s.price}>{money(p.precio)}</Text>
    <View style={s.row}>
      <TouchableOpacity style={s.btn} onPress={() => onEdit(p)}><Text style={s.btnTxt}>Editar</Text></TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={() => onToggle(p)}><Text style={s.btnTxt}>{p.activo ? 'Desactivar' : 'Activar'}</Text></TouchableOpacity>
      <TouchableOpacity style={[s.btn, s.danger]} onPress={() => onDelete(p)}><Text style={[s.btnTxt, { color: RED }]}>Borrar</Text></TouchableOpacity>
    </View>
  </View>
);

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
      onCambios: (l) => { setItems(l); setError(''); setLoading(false); },
      onError: (e) => { setError(mensajeErrorFirestore(e)); setLoading(false); },
    });
  }, []);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const abrir = (p) => {
    setId(p ? p.id : null);
    setForm(p ? { nombre: p.nombre, categoria: p.categoria, precio: `${p.precio}`, stock: `${p.stock}`, activo: p.activo } : VACIO);
    setOpen(false);
    setVisible(true);
  };

  const cerrar = () => { setVisible(false); setId(null); setForm(VACIO); setOpen(false); };

  const guardar = async () => {
    const precio = Number(form.precio), stock = Number(form.stock);
    if (!form.nombre.trim() || !form.categoria || !String(form.precio).trim() || !String(form.stock).trim() || !Number.isFinite(precio) || !Number.isFinite(stock) || precio < 0 || stock < 0 || !Number.isInteger(stock)) {
      return notificar('error', 'Datos inválidos', 'Completá nombre, categoría, precio y stock entero.');
    }
    setSaving(true);
    try {
      const datos = { nombre: form.nombre.trim(), categoria: form.categoria, precio: Math.round(precio), stock, activo: form.activo };
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
    try { await actualizarProducto(p.id, { activo: !p.activo }); }
    catch (e) { notificar('error', 'No se pudo cambiar', mensajeErrorFirestore(e)); }
  };

  const borrar = (p) => Alert.alert('Eliminar', `¿Borrar "${p.nombre}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: () => eliminarProducto(p.id).catch((e) => notificar('error', 'No se pudo eliminar', mensajeErrorFirestore(e))) },
  ]);

  const menu = () => Alert.alert('Menú', '¿Qué querés hacer?', [
    { text: 'Ir al inicio', onPress: () => navigation.navigate('Home') },
    { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut(auth).catch(() => {}) },
    { text: 'Cancelar', style: 'cancel' },
  ]);

  const opciones = form.categoria && !CATS.includes(form.categoria) ? [form.categoria, ...CATS] : CATS;

  return (
    <View style={s.pantalla}>
      <StatusBar style="light" />
      <BarberHeader titulo="Productos" />
      <ScrollView contentContainerStyle={s.content}>
        <TouchableOpacity style={s.add} onPress={() => abrir(null)}>
          <Text style={s.addTxt}>+ Registrar producto</Text>
        </TouchableOpacity>
        {!!error && <Text style={s.error}>{error}</Text>}
        {loading && <ActivityIndicator color={GOLD} style={{ marginTop: 20 }} />}
        {!loading && !items.length && !error && <Text style={s.empty}>Sin productos.</Text>}
        {items.map((p) => <Card key={p.id} p={p} onEdit={abrir} onToggle={toggle} onDelete={borrar} />)}
      </ScrollView>
      <BarberTabBar activo="inicio" onPressTab={(t) => (t.key === 'inicio' ? navigation.navigate('Home') : t.key === 'perfil' ? menu() : null)} />

      <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar}>
        <KeyboardAvoidingView style={s.bg} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.modal}>
            <View style={s.head}>
              <Text style={s.headTxt}>{id ? 'Editar' : 'Nuevo'} producto</Text>
              <TouchableOpacity onPress={cerrar}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
              <Text style={s.label}>NOMBRE *</Text>
              <TextInput style={s.input} value={form.nombre} onChangeText={set('nombre')} placeholder="Ej: Cera mate" placeholderTextColor="#666" />
              <Text style={s.label}>CATEGORÍA *</Text>
              <TouchableOpacity style={s.select} onPress={() => setOpen((v) => !v)}>
                <Text style={{ color: form.categoria ? '#fff' : '#666' }}>{form.categoria || 'Elegir categoría'}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#888" />
              </TouchableOpacity>
              {open && <View style={s.options}>{opciones.map((c) => (
                <TouchableOpacity key={c} style={s.option} onPress={() => { set('categoria')(c); setOpen(false); }}>
                  <Text style={{ color: form.categoria === c ? GOLD : '#ddd' }}>{c}</Text>
                  {form.categoria === c && <Ionicons name="checkmark" size={16} color={GOLD} />}
                </TouchableOpacity>
              ))}</View>}
              <View style={s.row}>
                <View style={{ flex: 1 }}><Text style={s.label}>PRECIO *</Text><TextInput style={s.input} value={form.precio} onChangeText={set('precio')} keyboardType="number-pad" placeholder="0" placeholderTextColor="#666" /></View>
                <View style={{ flex: 1 }}><Text style={s.label}>STOCK *</Text><TextInput style={s.input} value={form.stock} onChangeText={set('stock')} keyboardType="number-pad" placeholder="0" placeholderTextColor="#666" /></View>
              </View>
            </ScrollView>
            <View style={s.footer}>
              <TouchableOpacity style={[s.btn, s.cancel]} onPress={cerrar}><Text style={s.btnTxt}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.save]} onPress={guardar} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>{id ? 'Guardar' : 'Registrar'}</Text>}</TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 10,
  },
  add: {
    height: 42,
    borderRadius: 6,
    backgroundColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: RED,
    fontSize: 12,
    textAlign: 'center',
  },
  empty: {
    color: '#9b9b9b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#161616',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sub: {
    color: '#9b9b9b',
    fontSize: 12,
    marginTop: 6,
  },
  price: {
    color: GOLD,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    color: '#fff',
    fontSize: 12,
  },
  danger: {
    borderColor: 'rgba(224,90,90,0.4)',
    backgroundColor: 'rgba(224,90,90,0.08)',
  },
  bg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modal: {
    maxHeight: '90%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headTxt: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  form: {
    padding: 16,
  },
  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#fff',
    backgroundColor: '#111',
  },
  select: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#111',
  },
  options: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    backgroundColor: '#111',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  cancel: {
    borderColor: '#444',
  },
  save: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
});
