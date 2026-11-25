import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { notificar } from '../src/notify';
import { COLORES, SERIF } from '../src/theme';
import { soloLetras, validarCorreo, validarNombre, telefonoValido } from '../src/validaciones';
import { mensajeErrorAuth } from '../src/erroresAuth';
import FormInput from '../components/FormInput';
import AvisoModal from '../components/AvisoModal';
import { activarSupresionLogin, desactivarSupresionLogin } from '../src/authFlow';

const { dorado: DORADO, verde: VERDE, rojo: ROJO } = COLORES;

const REQUISITOS = [
  { texto: '8 caracteres', test: (p) => p.length >= 8 },
  { texto: 'Una letra mayúscula', test: (p) => /[A-Z]/.test(p) },
  { texto: 'Un número', test: (p) => /\d/.test(p) },
  { texto: 'Un carácter especial (#@?%&)', test: (p) => /[#@?%&]/.test(p) },
];

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
      const msg =
        mensajeErrorAuth(error.code, 'registro') ||
        'Hubo un problema al registrar el usuario.';
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

            <FormInput
              label="NOMBRE"
              icono="person-outline"
              placeholder="Ej: José Roberto"
              value={nombre}
              onChangeText={(valor) => setNombre(soloLetras(valor))}
              autoCapitalize="words"
            />

            <FormInput
              label="APELLIDO"
              icono="person-outline"
              placeholder="Ej: Montero"
              value={apellido}
              onChangeText={(valor) => setApellido(soloLetras(valor))}
              autoCapitalize="words"
            />

            <FormInput
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

            <FormInput
              label="TELÉFONO DE CONTACTO"
              icono="call-outline"
              placeholder="+54 387598987"
              value={telefono}
              onChangeText={setTelefono}
              keyboardType="phone-pad"
            />

            <FormInput
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

            <FormInput
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
