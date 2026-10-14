import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';

const DORADO = '#a8844f';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });

export default function Login({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cargando, setCargando] = useState(false);

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

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Atención', 'Escribí tu correo arriba y volvé a tocar "Olvidé mi contraseña".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Listo', 'Te enviamos un correo para restablecer tu contraseña.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el correo. Revisá la dirección.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/fondo_barberia.png')}
      style={styles.fondo}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* behavior="padding" en AMBAS plataformas: con edge-to-edge (obligatorio
          en Android 15/16 y en Expo SDK 54+) la ventana ya NO se redimensiona
          sola al abrir el teclado, así que el teclado tapa el contenido.
          "undefined"/"height" dejan de funcionar; "padding" empuja el contenido. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.contenido}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
          showsVerticalScrollIndicator={false}
        >
          <Image source={require('../assets/logo_barber.png')} style={styles.logo} />
          <Text style={styles.titulo}>BARBERIA CLASE A</Text>

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
            <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.icon} />
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

          <TouchableOpacity style={styles.olvido} onPress={handleReset}>
            <Text style={styles.olvidoTexto}>Olvidé mi contraseña</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* El footer queda FUERA del KeyboardAvoidingView: el KAV (flex:1) es el
          que se encoge al abrir el teclado, y el footer, al ser un hermano en
          flujo normal, se mantiene anclado abajo y NO sube. */}
      <View
        style={[
          styles.footer,
          { height: 56 + insets.bottom, paddingBottom: insets.bottom },
        ]}
      >
        <Ionicons name="location-outline" size={18} color="#fff" />
        <Text style={styles.footerTexto}>SALTA, ARGENTINA</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: '#000' },
  flex: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logo: { width: 150, height: 150, alignSelf: 'center', resizeMode: 'contain' },
  titulo: {
    fontFamily: SERIF,
    fontSize: 26,
    color: DORADO,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 40,
  },
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  footerTexto: { color: '#fff', fontSize: 12, letterSpacing: 1 },
});
