import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AuthLayout from '../components/AuthLayout';
import { notificar } from '../src/notify';

const DORADO = '#b08d57';
const GRIS_CLARO = 'rgba(255,255,255,0.75)';
const VERDE = '#43c463';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export default function RecuperarPassword({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const correoOk = EMAIL_RE.test(email.trim());

  const handleEnviar = async () => {
    if (!correoOk) {
      notificar(
        'error',
        'Correo inválido',
        'Ingresá un correo válido, por ejemplo Usuario@email.com'
      );
      return;
    }

    setCargando(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      // Firebase manda el correo solo si la cuenta existe.
      setEnviado(true);
    } catch (error) {
      console.error('Error al enviar el correo:', error.code, error.message);
      let titulo = 'No se pudo enviar';
      let msg = 'Intentá de nuevo en unos minutos.';
      switch (error.code) {
        case 'auth/invalid-email':
          titulo = 'Correo inválido';
          msg = 'El correo no tiene un formato válido.';
          break;
        case 'auth/user-not-found':
          titulo = 'Correo no registrado';
          msg = 'No encontramos una cuenta con ese correo.';
          break;
        case 'auth/too-many-requests':
          titulo = 'Demasiados intentos';
          msg = 'Probá de nuevo más tarde.';
          break;
        case 'auth/network-request-failed':
          titulo = 'Sin conexión';
          msg = 'Revisá tu conexión a internet.';
          break;
      }
      notificar('error', titulo, msg);
    } finally {
      setCargando(false);
    }
  };

  // ---------- Paso 2: confirmación ----------
  if (enviado) {
    return (
      <AuthLayout onVolver={() => navigation.goBack()}>
        <StatusBar style="light" />

        <View style={styles.exitoCard}>
          <View style={styles.exitoIcono}>
            <Ionicons name="checkmark" size={30} color="#fff" />
          </View>

          <Text style={styles.exitoTitulo}>Revisá tu correo</Text>
          <Text style={styles.exitoTexto}>
            Si el correo{' '}
            <Text style={styles.exitoEmail}>{email.trim()}</Text> está
            registrado, te enviamos un mensaje para que crees tu nueva
            contraseña. Revisá también la carpeta de spam.
          </Text>

          <TouchableOpacity
            style={styles.exitoBoton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.exitoBotonTexto}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </AuthLayout>
    );
  }

  // ---------- Paso 1: pedir correo ----------
  return (
    <AuthLayout onVolver={() => navigation.goBack()}>
      <StatusBar style="light" />

      <Text style={styles.titulo}>Recuperá tu contraseña</Text>
      <Text style={styles.subtitulo}>
        Ingresá el correo con el que te registraste para restablecer tu
        contraseña.
      </Text>

      <Text style={styles.label}>Validar correo electrónico registrado</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name="mail-outline"
          size={20}
          color="#fff"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Usuario@email.com"
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {correoOk && (
          <Ionicons name="checkmark-circle" size={22} color={VERDE} />
        )}
      </View>

      <TouchableOpacity
        style={[styles.boton, cargando && { opacity: 0.6 }]}
        onPress={handleEnviar}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>Cambiar contraseña</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoRow}>
        <Ionicons name="mail-outline" size={18} color={GRIS_CLARO} />
        <Text style={styles.infoTexto}>
          Si el correo está registrado, vas a recibir un mensaje de
          recuperación. Revisá también la carpeta de spam.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.volver}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.volverTexto}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  titulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitulo: {
    color: GRIS_CLARO,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 22,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },

  boton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DORADO,
    borderRadius: 8,
    height: 48,
    marginTop: 22,
  },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 22,
  },
  infoTexto: {
    flex: 1,
    color: GRIS_CLARO,
    fontSize: 12,
    lineHeight: 18,
  },

  volver: { alignSelf: 'center', marginTop: 24, paddingVertical: 6 },
  volverTexto: { color: '#fff', fontSize: 13, textDecorationLine: 'underline' },

  // Tarjeta de confirmación
  exitoCard: {
    backgroundColor: '#f2f0ec',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  exitoIcono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: VERDE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exitoTitulo: {
    color: '#2b2b2b',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  exitoTexto: {
    color: '#6f6a63',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  exitoEmail: { color: '#2b2b2b', fontWeight: '700' },
  exitoBoton: {
    marginTop: 20,
    backgroundColor: DORADO,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  exitoBotonTexto: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
