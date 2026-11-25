import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORES } from '../src/theme';

const CATS = ['Pomada', 'Shampoo', 'Aceite', 'Cera', 'Tinte'];

/**
 * Modal para crear o editar un producto.
 * Props:
 *   - visible, id, form, open, saving
 *   - onCerrar, onCambiar(k), onToggleOpen, onGuardar
 */
export default function ProductoModal({
  visible,
  id,
  form,
  open,
  saving,
  onCerrar,
  onCambiar,
  onToggleOpen,
  onGuardar,
}) {
  const opciones =
    form.categoria && !CATS.includes(form.categoria)
      ? [form.categoria, ...CATS]
      : CATS;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <KeyboardAvoidingView
        style={styles.bg}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modal}>
          <View style={styles.head}>
            <Text style={styles.headTxt}>{id ? 'Editar' : 'Nuevo'} producto</Text>
            <TouchableOpacity onPress={onCerrar}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>NOMBRE *</Text>
            <TextInput
              style={styles.input}
              value={form.nombre}
              onChangeText={onCambiar('nombre')}
              placeholder="Ej: Cera mate"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>CATEGORÍA *</Text>
            <TouchableOpacity style={styles.select} onPress={onToggleOpen}>
              <Text style={{ color: form.categoria ? '#fff' : '#666' }}>
                {form.categoria || 'Elegir categoría'}
              </Text>
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#888"
              />
            </TouchableOpacity>

            {open && (
              <View style={styles.options}>
                {opciones.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={styles.option}
                    onPress={() => {
                      onCambiar('categoria')(c);
                      onToggleOpen();
                    }}
                  >
                    <Text style={{ color: form.categoria === c ? COLORES.dorado : '#ddd' }}>
                      {c}
                    </Text>
                    {form.categoria === c && (
                      <Ionicons name="checkmark" size={16} color={COLORES.dorado} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.fila}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>PRECIO *</Text>
                <TextInput
                  style={styles.input}
                  value={form.precio}
                  onChangeText={onCambiar('precio')}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>STOCK *</Text>
                <TextInput
                  style={styles.input}
                  value={form.stock}
                  onChangeText={onCambiar('stock')}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="#666"
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCerrar}>
              <Text style={styles.btnTxt}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.save]} onPress={onGuardar} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnTxt}>{id ? 'Guardar' : 'Registrar'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  headTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
  form: { padding: 16 },
  label: { color: '#fff', fontSize: 11, fontWeight: '700', marginTop: 10, marginBottom: 6 },
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
  fila: { flexDirection: 'row', gap: 10 },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
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
  btnTxt: { color: '#fff', fontSize: 12 },
  cancel: { borderColor: '#444' },
  save: { backgroundColor: COLORES.dorado, borderColor: COLORES.dorado },
});
