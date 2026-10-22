import React, { useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import AuthLayout from '../components/AuthLayout';
import { notificar } from '../src/notify';

const DORADO = '#b08d57';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const KEY_RECORDAR = 'barberia:correoRecordado';

export default function Login({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [cargando, setCargando] = useState(false);

  // Precarga: correo que viene del registro o el que se guardó con "Recordar".
  useEffect(() => {
    let activo = true;

    (async () => {
      try {
        const guardado = await AsyncStorage.getItem(KEY_RECORDAR);
        if (!activo) return;

        if (route?.params?.email) {
          setEmail(route.params.email);
          setRecordar(true);
        } else if (guardado) {
          setEmail(guardado);
          setRecordar(true);
        }
      } catch (error) {
        // Si falla AsyncStorage, seguimos con el login normal.
      }
    })();

    return () => {
      activo = false;
    };
  }, [route?.params?.email]);

  const guardarRecordar = async () => {
    try {
      if (recordar) {
        await AsyncStorage.setItem(KEY_RECORDAR, email.trim());
      }
    } catch (error) {
      // No bloqueamos el login por un problema de almacenamiento.
    }
  };

  const toggleRecordar = async () => {
    const nuevo = !recordar;
    setRecordar(nuevo);
    if (!nuevo) {
      try {
        await AsyncStorage.removeItem(KEY_RECORDAR);
      } catch (error) {}
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      notificar('error', 'Faltan datos', 'Completá el correo y la contraseña.');
      return;
    }

    if (!EMAIL_RE.test(email.trim())) {
      notificar(
        'error',
        'Correo inválido',
        'Ingresá un correo válido, por ejemplo Usuario@email.com'
      );
      return;
    }

    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await guardarRecordar();
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
      notificar('error', 'No se pudo iniciar sesión', msg);
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
          placeholder="Usuario@email.com"
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
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
          style={[styles.input, styles.inputPassword]}
          placeholder="********"
          placeholderTextColor="rgba(255,255,255,0.55)"
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

      <TouchableOpacity style={styles.recordarRow} onPress={toggleRecordar}>
        <Ionicons
          name={recordar ? 'checkbox' : 'square-outline'}
          size={20}
          color={recordar ? DORADO : '#fff'}
        />
        <Text style={styles.recordarTexto}>Recordar</Text>
      </TouchableOpacity>

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
    marginBottom: 18,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  // Asteriscos del placeholder (y del texto oculto) más grandes y centrados.
  inputPassword: {
    fontSize: 20,
    letterSpacing: 3,
    lineHeight: 26,
    //includeFontPadding: false,
    paddingTop: 6,
  },

  recordarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: -6,
    marginBottom: 4,
    paddingVertical: 4,
  },
  recordarTexto: { color: '#fff', fontSize: 13 },

  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DORADO,
    borderRadius: 8,
    height: 48,
    marginTop: 20,
    gap: 6,
  },
  botonTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  olvido: {
    alignSelf: 'center',
    marginTop: 26,
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
