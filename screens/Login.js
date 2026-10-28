import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { notificar } from '../src/notify';

const DORADO = '#b08d57';
const ORO_CLARO = '#e3c98f';
// Panel semitransparente: deja ver la foto de fondo.
const PANEL = 'rgba(11,13,18,0.78)';
const CREMA = '#f5efe3';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const KEY_RECORDAR = 'barberia:correoRecordado';

// Curvas doradas que separan la foto del panel oscuro.
const WAVE_H = 60;
const TOP_FILL = 'M0,30 C 26,58 60,2 100,22 L100,60 L0,60 Z';
const TOP_LINE = 'M0,30 C 26,58 60,2 100,22';
const BOTTOM_FILL = 'M0,0 L100,0 L100,26 C 62,4 28,58 0,30 Z';
const BOTTOM_LINE = 'M100,26 C 62,4 28,58 0,30';

export default function Login({ navigation, route }) {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState(route?.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [cargando, setCargando] = useState(false);

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
    } catch (error) {}
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

  const irARecuperar = () =>
    navigation.navigate('RecuperarPassword', { email: email.trim() });

  return (
    <ImageBackground
      source={require('../assets/fondo_barberia.png')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.contenido,
            { paddingBottom: insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- Logo sobre la foto ---------- */}
          <View style={[styles.topArea, { paddingTop: insets.top + 14 }]}>
            <Image
              source={require('../assets/logo_barber.png')}
              style={styles.logo}
            />
          </View>

          {/* ---------- Curva superior ---------- */}
          <View style={styles.wave}>
            <Svg
              width="100%"
              height={WAVE_H}
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
            >
              <Path d={TOP_FILL} fill={PANEL} />
              <Path d={TOP_LINE} stroke={DORADO} strokeWidth={1.6} fill="none" />
            </Svg>
          </View>

          {/* ---------- Panel del formulario ---------- */}
          <View style={styles.panel}>
            <Text style={styles.bienvenido}>BIENVENIDO</Text>
            <Text style={styles.titulo}>
              Iniciar <Text style={styles.tituloGold}>sesión</Text>
            </Text>
            <Text style={styles.subtitulo}>
              Accedé a tu cuenta para continuar
            </Text>
            <View style={styles.linea} />

            <Text style={styles.label}>Correo electrónico</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#bdbdbd" />
              <TextInput
                style={styles.input}
                placeholder="Usuario@email.com"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#bdbdbd" />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="********"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#bdbdbd"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.filaOpciones}>
              <TouchableOpacity style={styles.recordarRow} onPress={toggleRecordar}>
                <Ionicons
                  name={recordar ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={DORADO}
                />
                <Text style={styles.recordarTexto}>Recordarme</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={irARecuperar}>
                <Text style={styles.olvidoTexto}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.boton, cargando && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#171512" />
              ) : (
                <>
                  <Text style={styles.botonTexto}>Iniciar sesión</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#171512"
                    style={styles.botonFlecha}
                  />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registro}
              onPress={() => navigation.navigate('Registro')}
            >
              <Text style={styles.registroTexto}>
                ¿No tenes cuenta?{' '}
                <Text style={styles.registroLink}>Registrate.</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* ---------- Curva inferior ---------- */}
          <View style={styles.wave}>
            <Svg
              width="100%"
              height={WAVE_H}
              viewBox="0 0 100 60"
              preserveAspectRatio="none"
            >
              <Path d={BOTTOM_FILL} fill={PANEL} />
              <Path
                d={BOTTOM_LINE}
                stroke={DORADO}
                strokeWidth={1.6}
                fill="none"
              />
            </Svg>
          </View>

          {/* ---------- Foto al pie ---------- */}
          <View style={styles.bottomArea} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  contenido: { flexGrow: 1 },

  // Logo
  topArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 260,
    paddingBottom: 4,
  },
  logo: { width: 150, height: 150, resizeMode: 'contain' },

  // Curvas
  wave: { width: '100%', height: WAVE_H },

  // Panel
  panel: {
    backgroundColor: PANEL,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 26,
  },
  bienvenido: {
    color: '#c9b48a',
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '600',
    marginBottom: 10,
  },
  titulo: {
    fontFamily: SERIF,
    fontSize: 38,
    color: CREMA,
    letterSpacing: 0.3,
    lineHeight: 44,
  },
  tituloGold: { color: '#c9a86a' },
  subtitulo: {
    color: '#9a9a9a',
    fontSize: 15,
    marginTop: 8,
  },
  linea: {
    width: 54,
    height: 3,
    borderRadius: 2,
    backgroundColor: DORADO,
    marginTop: 14,
    marginBottom: 14,
  },

  label: {
    color: '#e9e4da',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DORADO,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  inputPassword: {
    fontSize: 20,
    letterSpacing: 3,
    lineHeight: 24,
    includeFontPadding: false,
  },

  filaOpciones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  recordarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordarTexto: { color: '#d6d1c8', fontSize: 13 },
  olvidoTexto: {
    color: '#bdbdbd',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'right',
  },

  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 12,
    backgroundColor: ORO_CLARO,
    marginTop: 24,
  },
  botonTexto: { color: '#171512', fontSize: 17, fontWeight: '700' },
  botonFlecha: { position: 'absolute', right: 18 },

  registro: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
  registroTexto: { color: '#9a9a9a', fontSize: 14 },
  registroLink: { color: ORO_CLARO, fontWeight: '700' },

  bottomArea: { flexGrow: 1, minHeight: 110 },
});
