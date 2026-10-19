import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import {
  activarSupresionLogin,
  desactivarSupresionLogin,
} from '../src/authFlow';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
const VERDE = '#3d8b55';
const VERDE_CLARO = '#3d7a4a';

const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
const telefonoValido = (valor) => {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 8 && /^[+\d\s()-]+$/.test(valor.trim());
};

// Requisitos de la contraseña (según la referencia).
const REQUISITOS = [
  { texto: '8 caracteres', test: (p) => p.length >= 8 },
  { texto: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { texto: 'Un número', test: (p) => /\d/.test(p) },
  { texto: 'Un carácter especial (#@?%&)', test: (p) => /[#@?%&]/.test(p) },
];

// Campo reutilizable: etiqueta + input con ícono + accesorio opcional (ojo/check).
function Campo({ label, icono, right, ...props }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Ionicons name={icono} size={18} color="#8a8a8a" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholderTextColor="#9a9a9a"
          {...props}
        />
        {right}
      </View>
    </View>
  );
}

export default function SignUp({ navigation }) {
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);
  const [cargando, setCargando] = useState(false);

  const correoOk = emailValido(email);

  const handleSignUp = async () => {
    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const emailLimpio = email.trim();

    if (
      !nombreLimpio ||
      !apellidoLimpio ||
      !emailLimpio ||
      !telefono.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Faltan datos', 'Todos los campos son obligatorios.');
      return;
    }

    if (!emailValido(emailLimpio)) {
      Alert.alert('Correo inválido', 'Ingresá un correo electrónico válido.');
      return;
    }

    if (!telefonoValido(telefono)) {
      Alert.alert('Teléfono inválido', 'Ingresá un número de teléfono válido.');
      return;
    }

    if (!REQUISITOS.every((r) => r.test(password))) {
      Alert.alert(
        'Contraseña débil',
        'La contraseña no cumple con todos los requisitos.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    activarSupresionLogin();
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        emailLimpio,
        password
      );

      try {
        await updateProfile(credential.user, {
          displayName: `${nombreLimpio} ${apellidoLimpio}`,
        });
      } catch (error) {
        // La cuenta ya se creó; si falla el nombre no bloqueamos el registro.
      }

      // Firebase inicia sesión automáticamente al registrar. La cerramos para
      // que el usuario NO entre a Home: lo mandamos al Login a iniciar sesión.
      await signOut(auth);

      Alert.alert(
        'Registro exitoso',
        'Tu cuenta fue creada correctamente. Ahora podés iniciar sesión con tu correo y contraseña.',
        [
          {
            text: 'Ir a iniciar sesión',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { email: emailLimpio } }],
              }),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Error de registro:', error.code, error.message);
      let msg = 'Hubo un problema al registrar el usuario.';
      switch (error.code) {
        case 'auth/email-already-in-use':
          msg = 'El correo electrónico ya está en uso.';
          break;
        case 'auth/invalid-email':
          msg = 'El formato del correo electrónico no es válido.';
          break;
        case 'auth/weak-password':
          msg = 'La contraseña es demasiado débil.';
          break;
        case 'auth/network-request-failed':
          msg = 'Error de conexión, intentá más tarde.';
          break;
        case 'auth/invalid-api-key':
          msg = 'La clave API de Firebase no es válida. Revisá el archivo .env.';
          break;
      }
      Alert.alert('Error', msg);
    } finally {
      desactivarSupresionLogin();
      setCargando(false);
    }
  };

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ---------- Header con imagen ---------- */}
          <ImageBackground
            source={require('../assets/imagen_registro_2.png')}
            style={styles.header}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay} />
            <View style={[styles.headerContenido, { paddingTop: insets.top }]}>
              <Text style={styles.headerTitulo}>Registro</Text>
              <Text style={styles.headerSub}>
                Ingrese sus datos correctamente.
              </Text>
            </View>
          </ImageBackground>

          {/* ---------- Panel del formulario ---------- */}
          <View style={styles.panel}>
            <Text style={styles.obligatorios}>
              Todos los campos son obligatorios{' '}
              <Text style={styles.asterisco}>*</Text>
            </Text>

            <Campo
              label="NOMBRE"
              icono="person-outline"
              placeholder="Ej: José Roberto"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />

            <Campo
              label="APELLIDO"
              icono="person-outline"
              placeholder="Ej: Montero"
              value={apellido}
              onChangeText={setApellido}
              autoCapitalize="words"
            />

            <Campo
              label="CORREO ELECTRÓNICO"
              icono="mail-outline"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              right={
                correoOk ? (
                  <Ionicons name="checkmark-circle" size={20} color={VERDE} />
                ) : null
              }
            />

            <Campo
              label="TELÉFONO DE CONTACTO"
              icono="call-outline"
              placeholder="+54 387598987"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <Campo
              label="CONTRASEÑA"
              icono="lock-closed-outline"
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              right={
                <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                  <Ionicons
                    name={verPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8a8a8a"
                  />
                </TouchableOpacity>
              }
            />

            {/* Requisitos que se van poniendo verdes */}
            <View style={styles.requisitos}>
              <Text style={styles.requisitosTitulo}>
                La contraseña debe tener al menos:
              </Text>
              {REQUISITOS.map((r) => {
                const ok = r.test(password);
                return (
                  <View key={r.texto} style={styles.requisitoRow}>
                    <View
                      style={[
                        styles.requisitoPunto,
                        ok && styles.requisitoPuntoOk,
                      ]}
                    />
                    <Text
                      style={[
                        styles.requisitoTexto,
                        ok && styles.requisitoTextoOk,
                      ]}
                    >
                      {r.texto}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Campo
              label="CONFIRMAR CONTRASEÑA"
              icono="lock-closed-outline"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!verConfirm}
              autoCapitalize="none"
              right={
                <TouchableOpacity onPress={() => setVerConfirm(!verConfirm)}>
                  <Ionicons
                    name={verConfirm ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#8a8a8a"
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={[styles.boton, cargando && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.botonTexto}>Registrarse</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.link}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.linkTexto}>
                ¿Ya tenés cuenta? Iniciá sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#0f0f0f' },
  flex: { flex: 1 },
  scrollContenido: { flexGrow: 1 },

  // Header
  header: { height: 210, backgroundColor: '#000' },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  headerContenido: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerTitulo: {
    fontFamily: SERIF,
    fontSize: 30,
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
  },

  // Panel claro
  panel: {
    flexGrow: 1,
    backgroundColor: '#f2f0ec',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  obligatorios: {
    color: '#8a8178',
    fontSize: 11,
    marginBottom: 4,
  },
  asterisco: { color: '#c0392b', fontWeight: '700' },

  label: {
    color: '#6f6a63',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9e6e0',
    borderWidth: 1,
    borderColor: '#dcd8d1',
    borderRadius: 6,
    height: 46,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: '#2b2b2b', fontSize: 14 },

  // Requisitos
  requisitos: {
    marginTop: 12,
    backgroundColor: '#eaf3ec',
    borderWidth: 1,
    borderColor: '#cfe3d3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  requisitosTitulo: {
    color: VERDE_CLARO,
    fontSize: 11.5,
    marginBottom: 6,
  },
  requisitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  requisitoPunto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b9b9b9',
  },
  requisitoPuntoOk: { backgroundColor: VERDE_CLARO },
  requisitoTexto: { color: '#9a9a9a', fontSize: 11.5 },
  requisitoTextoOk: { color: VERDE_CLARO },

  // Botón y link
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 46,
    borderRadius: 6,
    backgroundColor: DORADO,
    marginTop: 24,
  },
  botonTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  link: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
  linkTexto: { color: DORADO, fontSize: 13 },
});
