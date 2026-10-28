import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import { notificar } from '../src/notify';
import AvisoModal from '../components/AvisoModal';
import {
  activarSupresionLogin,
  desactivarSupresionLogin,
} from '../src/authFlow';

const DORADO = '#b08d57';
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif' });
const VERDE = '#43c463';
const ROJO = '#e05a5a';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Dominios desechables / de prueba (para no llenar la base de correos basura).
const DOMINIOS_BASURA = [
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'yopmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakeinbox.com',
  'maildrop.cc',
  'mintemail.com',
  'spam4.me',
  'example.com',
  'example.org',
  'test.com',
];

// Solo letras (con acentos) y espacios.
const NOMBRE_RE =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

// Limpia lo que el usuario escribe: deja únicamente letras y espacios.
const soloLetras = (valor) =>
  valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, '');

const REQUISITOS = [
  { texto: '8 caracteres', test: (p) => p.length >= 8 },
  { texto: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { texto: 'Un número', test: (p) => /\d/.test(p) },
  { texto: 'Un carácter especial (#@?%&)', test: (p) => /[#@?%&]/.test(p) },
];

function validarCorreo(valor) {
  const correo = valor.trim().toLowerCase();
  if (!EMAIL_RE.test(correo)) {
    return 'Ingresá un correo válido, por ejemplo Usuario@email.com.';
  }
  const dominio = correo.split('@')[1];
  if (DOMINIOS_BASURA.includes(dominio)) {
    return 'Ese dominio no está permitido. Usá un correo real.';
  }
  return null;
}

function validarNombre(valor, campo) {
  const v = valor.trim().replace(/\s+/g, ' ');
  if (v.length < 2) return `Ingresá al menos 2 letras en ${campo}.`;
  if (!NOMBRE_RE.test(v)) return `En ${campo} solo se permiten letras y espacios.`;
  return null;
}

const telefonoValido = (valor) => {
  const digitos = valor.replace(/\D/g, '');
  return digitos.length >= 8 && /^[+\d\s()-]+$/.test(valor.trim());
};

// Campo reutilizable: etiqueta + input con ícono + accesorio opcional.
function Campo({
  label,
  icono,
  right,
  containerStyle,
  inputStyle,
  ...props
}) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, containerStyle]}>
        <Ionicons name={icono} size={18} color="#cfcfcf" style={styles.icon} />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor="rgba(255,255,255,0.55)"
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

  // Modal de éxito (en vez del Alert blanco del sistema).
  const [exitoVisible, setExitoVisible] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');

  const correoError = validarCorreo(email);
  const correoOk = email.trim().length > 0 && !correoError;

  const cumpleRequisitos = REQUISITOS.every((r) => r.test(password));
  const coincide = confirmPassword.length > 0 && confirmPassword === password;

  const passEstado =
    password.length === 0 ? null : cumpleRequisitos ? 'ok' : 'error';
  const confirmEstado =
    confirmPassword.length === 0 ? null : coincide ? 'ok' : 'error';

  const borde = (estado) =>
    estado === 'ok'
      ? styles.bordeOk
      : estado === 'error'
        ? styles.bordeError
        : null;

  const handleSignUp = async () => {
    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const apellidoLimpio = apellido.trim().replace(/\s+/g, ' ');
    const emailLimpio = email.trim().toLowerCase();

    if (
      !nombreLimpio ||
      !apellidoLimpio ||
      !emailLimpio ||
      !telefono.trim() ||
      !password ||
      !confirmPassword
    ) {
      notificar('error', 'Faltan datos', 'Todos los campos son obligatorios.');
      return;
    }

    const errorNombre = validarNombre(nombreLimpio, 'el nombre');
    if (errorNombre) {
      notificar('error', 'Nombre inválido', errorNombre);
      return;
    }

    const errorApellido = validarNombre(apellidoLimpio, 'el apellido');
    if (errorApellido) {
      notificar('error', 'Apellido inválido', errorApellido);
      return;
    }

    const errorCorreo = validarCorreo(emailLimpio);
    if (errorCorreo) {
      notificar('error', 'Correo inválido', errorCorreo);
      return;
    }

    if (!telefonoValido(telefono)) {
      notificar(
        'error',
        'Teléfono inválido',
        'Ingresá un número de teléfono válido (mínimo 8 dígitos).'
      );
      return;
    }

    if (!cumpleRequisitos) {
      notificar(
        'error',
        'Contraseña débil',
        'La contraseña no cumple con todos los requisitos.'
      );
      return;
    }

    if (password !== confirmPassword) {
      notificar('error', 'Contraseñas distintas', 'Las contraseñas no coinciden.');
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

      setEmailRegistrado(emailLimpio);
      setExitoVisible(true);
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
      notificar('error', 'No se pudo registrar', msg);
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

          {/* ---------- Formulario ---------- */}
          <View style={styles.panel}>
            <Text style={styles.incentivo}>
              Completá tus datos para crear tu cuenta y formar parte de este gran equipo!.
            </Text>
            <Text style={styles.obligatorios}>
              Todos los campos son obligatorios{' '}
              <Text style={styles.asterisco}>*</Text>
            </Text>

            <Campo
              label="NOMBRE"
              icono="person-outline"
              placeholder="Ej: José Roberto"
              value={nombre}
              onChangeText={(valor) => setNombre(soloLetras(valor))}
              autoCapitalize="words"
            />

            <Campo
              label="APELLIDO"
              icono="person-outline"
              placeholder="Ej: Montero"
              value={apellido}
              onChangeText={(valor) => setApellido(soloLetras(valor))}
              autoCapitalize="words"
            />

            <Campo
              label="CORREO ELECTRÓNICO"
              icono="mail-outline"
              placeholder="Usuario@email.com"
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
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!verPassword}
              autoCapitalize="none"
              inputStyle={styles.inputPassword}
              containerStyle={borde(passEstado)}
              right={
                <TouchableOpacity onPress={() => setVerPassword(!verPassword)}>
                  <Ionicons
                    name={verPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#cfcfcf"
                  />
                </TouchableOpacity>
              }
            />

            {/* Requisitos: rojo mientras no se cumplen, verde cuando sí. */}
            <View
              style={[
                styles.requisitos,
                cumpleRequisitos
                  ? styles.bordeOk
                  : password.length > 0
                    ? styles.bordeError
                    : null,
              ]}
            >
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
                        { backgroundColor: ok ? VERDE : ROJO },
                      ]}
                    />
                    <Text
                      style={[
                        styles.requisitoTexto,
                        { color: ok ? VERDE : ROJO },
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
              placeholder="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!verConfirm}
              autoCapitalize="none"
              inputStyle={styles.inputPassword}
              containerStyle={borde(confirmEstado)}
              right={
                <TouchableOpacity onPress={() => setVerConfirm(!verConfirm)}>
                  <Ionicons
                    name={verConfirm ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#cfcfcf"
                  />
                </TouchableOpacity>
              }
            />

            {confirmPassword.length > 0 && (
              <Text
                style={[
                  styles.ayuda,
                  { color: coincide ? VERDE : ROJO },
                ]}
              >
                {coincide
                  ? 'Las contraseñas coinciden.'
                  : 'Las contraseñas no coinciden.'}
              </Text>
            )}

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

      <AvisoModal
        visible={exitoVisible}
        titulo="Registro exitoso"
        mensaje="Tu cuenta fue creada correctamente. Ahora iniciá sesión con tu correo y contraseña."
        boton="Ir a iniciar sesión"
        onPress={() => {
          setExitoVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login', params: { email: emailRegistrado } }],
          });
        }}
      />
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

  // Formulario (mismos colores que el Login)
  panel: {
    flexGrow: 1,
    backgroundColor: '#0f0f0f',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 30,
  },
  incentivo: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  obligatorios: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    marginBottom: 2,
  },
  asterisco: { color: '#c0392b', fontWeight: '700' },

  label: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  inputPassword: {
    fontSize: 14,
    letterSpacing: 3,
    lineHeight: 26,
    includeFontPadding: false,
  },

  bordeOk: { borderColor: VERDE },
  bordeError: { borderColor: ROJO },

  // Requisitos
  requisitos: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  requisitosTitulo: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    marginBottom: 6,
  },
  requisitoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  requisitoPunto: { width: 6, height: 6, borderRadius: 3 },
  requisitoTexto: { fontSize: 11.5 },

  ayuda: { fontSize: 11.5, marginTop: 6 },

  // Botón y link
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 8,
    backgroundColor: DORADO,
    marginTop: 22,
  },
  botonTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },
  link: { alignSelf: 'center', marginTop: 18, paddingVertical: 6 },
  linkTexto: { color: DORADO, fontSize: 13 },
});
