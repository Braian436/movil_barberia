import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AuthLayout from '../components/AuthLayout';

const DORADO = '#b08d57';

export default function Login({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Si venimos del registro, precargamos el correo que usó el usuario.
  useEffect(() => {
    if (route?.params?.email) setEmail(route.params.email);
  }, [route?.params?.email]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Por favor ingrese ambos campos.');
      return;
    }
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // El observador de Firebase cambia la pantalla al detectar la sesión.
    } catch (error) {
      console.error('Error de inicio de sesión:', error.code, error.message);
      let msg = 'Hubo un problema al iniciar sesión.';
      switch (error.code) {
        case 'auth/invalid-email':
          msg = 'El formato del correo no es válido.';
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          msg = 'Correo o contraseña incorrectos.';
          break;
        case 'auth/too-many-requests':
          msg = 'Demasiados intentos. Probá de nuevo más tarde.';
          break;
        case 'auth/network-request-failed':
          msg = 'Error de conexión, intentá más tarde.';
          break;
      }
      Alert.alert('Error', msg);
    } finally {
      setCargando(false);
    }
  };

  // Le pasamos el correo ya escrito a la pantalla de recuperación.
  const irARecuperar = () =>
    navigation.navigate('RecuperarPassword', { email: email.trim() });

  return (
    <AuthLayout>
      <StatusBar style="light" />

      <Text style={styles.label}>Ingrese su correo</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#fff" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#fff"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="••••••••••••"
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.boton, cargando && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={cargando}
      >
        {cargando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.botonTexto}>Iniciar sesión</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.olvido} onPress={irARecuperar}>
        <Text style={styles.olvidoTexto}>Olvidé mi contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registro}
        onPress={() => navigation.navigate('Registro')}
      >
        <Text style={styles.registroTexto}>
          ¿No tenés cuenta? <Text style={styles.registroLink}>Registrate</Text>
        </Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: '#fff', fontSize: 16, marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 20,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DORADO,
    borderRadius: 8,
    height: 48,
    marginTop: 30,
    gap: 6,
  },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  olvido: {
    alignSelf: 'center',
    marginTop: 30,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  olvidoTexto: { color: '#fff', fontSize: 12 },
  registro: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
  registroTexto: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  registroLink: { color: DORADO, fontWeight: '700' },
});
