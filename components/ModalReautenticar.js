import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalBase, { estilosModal as s } from './ModalBase';

/**
 * Modal para reautenticar al usuario pidiendo su contraseña actual.
 * Maneja internamente la contraseña y llama a onConfirmar(clave).
 * Props: visible, cargando, onConfirmar(clave), onCancelar.
 */
export default function ModalReautenticar({ visible, cargando, onConfirmar, onCancelar }) {
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);

  useEffect(() => {
    if (visible) {
      setClave('');
      setVerClave(false);
    }
  }, [visible]);

  return (
    <ModalBase visible={visible} titulo="Confirmá tu contraseña" mensaje="Para cambiar tu correo necesitamos que ingreses tu contraseña actual." onClose={onCancelar} teclado>
      <View style={s.claveInput}>
        <Ionicons name="lock-closed-outline" size={18} color="#cfcfcf" />
        <TextInput
          style={s.claveTexto}
          value={clave}
          onChangeText={setClave}
          secureTextEntry={!verClave}
          placeholder="Contraseña actual"
          placeholderTextColor="rgba(255,255,255,0.5)"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setVerClave(!verClave)}>
          <Ionicons name={verClave ? 'eye-outline' : 'eye-off-outline'} size={20} color="#cfcfcf" />
        </TouchableOpacity>
      </View>

      <View style={s.botones}>
        <TouchableOpacity style={[s.boton, s.cancelar]} onPress={onCancelar} disabled={cargando}>
          <Text style={s.botonTexto}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.boton, s.confirmar]} onPress={() => onConfirmar(clave)} disabled={cargando}>
          {cargando ? <ActivityIndicator color="#fff" /> : <Text style={s.botonTexto}>Confirmar</Text>}
        </TouchableOpacity>
      </View>
    </ModalBase>
  );
}
