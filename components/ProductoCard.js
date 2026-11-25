import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORES } from '../src/theme';

const money = (v) =>
  '$' + String(Math.round(Number(v) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Tarjeta de producto en el listado.
 * Props: p (producto), onEdit, onToggle, onDelete.
 */
export default function ProductoCard({ p, onEdit, onToggle, onDelete }) {
  return (
    <View style={[styles.card, !p.activo && { opacity: 0.5 }]}>
      <View style={styles.row}>
        <Text style={styles.title}>{p.nombre}</Text>
        <View
          style={[styles.dot, { backgroundColor: p.activo ? COLORES.verde : '#666' }]}
        />
      </View>
      <Text style={styles.sub}>
        {p.categoria} · Stock: {p.stock}
      </Text>
      <Text style={styles.price}>{money(p.precio)}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={() => onEdit(p)}>
          <Text style={styles.btnTxt}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => onToggle(p)}>
          <Text style={styles.btnTxt}>{p.activo ? 'Desactivar' : 'Activar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.danger]} onPress={() => onDelete(p)}>
          <Text style={[styles.btnTxt, { color: COLORES.rojo }]}>Borrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: COLORES.tarjeta,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  title: { color: '#fff', fontSize: 15, fontWeight: '700', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  sub: { color: COLORES.gris, fontSize: 12, marginTop: 6 },
  price: { color: COLORES.dorado, fontSize: 16, fontWeight: '700', marginTop: 8 },
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
  btnTxt: { color: '#fff', fontSize: 12 },
  danger: {
    borderColor: 'rgba(224,90,90,0.4)',
    backgroundColor: 'rgba(224,90,90,0.08)',
  },
});
