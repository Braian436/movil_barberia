import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { notificar } from '../src/notify';
import { COLORES, SERIF } from '../src/theme';
import { soloLetras, validarCorreo, validarNombre, telefonoValido } from '../src/validaciones';
import { mensajeErrorAuth } from '../src/erroresAuth';
import { cerrarSesion } from '../src/authFlow';
import { obtenerPerfil, guardarPerfil } from '../src/services/usuarios';
import { mensajeErrorFirestore } from '../src/services/errores';
import FormInput, { bordeCampo } from '../components/FormInput';
import AvatarPerfil from '../components/AvatarPerfil';
import BarberTabBar from '../components/BarberTabBar';
import ModalElegirFoto from '../components/ModalElegirFoto';
import ModalConfirmar from '../components/ModalConfirmar';
import ModalReautenticar from '../components/ModalReautenticar';

// Divide "José Roberto Montero" en [nombre, apellido]: el primer elemento es
// el nombre y el resto el apellido.
const dividirNombre = (completo) => {
  const partes = String(completo || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return ['', ''];
  if (partes.length === 1) return [partes[0], ''];
  return [partes[0], partes.slice(1).join(' ')];
};

export default function MiPerfil({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fotoBase64, setFotoBase64] = useState('');

  // Modales
  const [confirmarSalir, setConfirmarSalir] = useState(false);
  const [mostrarModalFoto, setMostrarModalFoto] = useState(false);
  const [pedirClave, setPedirClave] = useState(false);
  const [cambiandoCorreo, setCambiandoCorreo] = useState(false);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargar = async () => {
    try {
      const datos = await obtenerPerfil(user.uid);
      const [n, a] = dividirNombre(user.displayName);
      setNombre(datos.nombre || n);
      setApellido(datos.apellido || a);
      setEmail(datos.email || user.email || '');
      setTelefono(datos.telefono || '');
      setFotoBase64(datos.fotoBase64 || '');
    } catch (e) {
      notificar('error', 'No se pudo cargar el perfil', mensajeErrorFirestore(e));
    } finally {
      setCargando(false);
    }
  };

  // ---------- Validación en vivo (solo correo, como en el registro) ----------
  const correoError = validarCorreo(email);
  const correoOk = email.trim().length > 0 && !correoError;
  const correoActual = (user.email || '').toLowerCase();
  const correoCambio = email.trim().toLowerCase() !== correoActual;

  // ---------- Guardar ----------
  const validarFormulario = () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim()) {
      notificar('error', 'Faltan datos', 'Todos los campos son obligatorios.');
      return false;
    }
    const errNombre = validarNombre(nombre, 'el nombre');
    if (errNombre) {
      notificar('error', 'Nombre inválido', errNombre);
      return false;
    }
    const errApellido = validarNombre(apellido, 'el apellido');
    if (errApellido) {
      notificar('error', 'Apellido inválido', errApellido);
      return false;
    }
    if (correoError) {
      notificar('error', 'Correo inválido', correoError);
      return false;
    }
    if (!telefonoValido(telefono)) {
      notificar('error', 'Teléfono inválido', 'Ingresá un número válido (mínimo 8 dígitos).');
      return false;
    }
    return true;
  };

  const guardarDatos = async (exito = {}) => {
    setGuardando(true);
    try {
      const nombreCompleto = `${nombre.trim().replace(/\s+/g, ' ')} ${apellido.trim().replace(/\s+/g, ' ')}`.trim();
      await updateProfile(user, { displayName: nombreCompleto });
      await guardarPerfil(user.uid, { nombre, apellido, email, telefono, fotoBase64 });
      notificar('success', exito.titulo || 'Perfil actualizado', exito.mensaje || 'Tus datos se guardaron en Firebase.');
    } catch (e) {
      notificar('error', 'No se pudo guardar', mensajeErrorAuth(e.code, 'perfil') || mensajeErrorFirestore(e) || 'Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleGuardar = () => {
    if (!validarFormulario()) return;
    if (correoCambio) {
      setPedirClave(true);
      return;
    }
    guardarDatos();
  };

  // ---------- Cambio de correo (reautenticación) ----------
  const confirmarCambioCorreo = async (clave) => {
    if (!clave) {
      notificar('error', 'Falta la contraseña', 'Ingresá tu contraseña actual.');
      return;
    }
    setCambiandoCorreo(true);
    try {
      const credencial = EmailAuthProvider.credential(correoActual, clave);
      await reauthenticateWithCredential(user, credencial);
      // Firebase exige verificar el nuevo correo antes de cambiarlo: enviamos
      // un link de verificación y el cambio se aplica al confirmarlo.
      const actionCodeSettings = {
        url: `https://${process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN}/__/auth/action`,
        handleCodeInApp: false,
      };
      await verifyBeforeUpdateEmail(user, email.trim().toLowerCase(), actionCodeSettings);
    } catch (e) {
      console.error('Error cambiando correo:', e.code, e.message);
      notificar('error', 'No se pudo cambiar el correo', mensajeErrorAuth(e.code, 'perfil') || 'Revisá tu contraseña e intentá de nuevo.');
      return;
    } finally {
      setCambiandoCorreo(false);
    }

    setPedirClave(false);
    await guardarDatos({
      titulo: 'Correo de verificación enviado',
      mensaje: `Revisá ${email.trim().toLowerCase()} y confirmá el link para completar el cambio.`,
    });
  };

  // ---------- Foto de perfil ----------
  const seleccionarImagen = async (origen) => {
    const permiso =
      origen === 'camara'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permiso.status !== 'granted') {
      notificar('error', 'Permiso denegado', 'Necesitamos permiso para acceder a tus fotos.');
      return;
    }

    const opciones = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true };

    const resultado =
      origen === 'camara'
        ? await ImagePicker.launchCameraAsync(opciones)
        : await ImagePicker.launchImageLibraryAsync(opciones);

    if (resultado.canceled) return;
    const base64 = resultado.assets?.[0]?.base64;
    if (!base64) {
      notificar('error', 'No se pudo leer la imagen', 'Intentá con otra foto.');
      return;
    }

    setFotoBase64(base64);
    notificar('success', 'Foto actualizada', 'Guardá los cambios para aplicarla.');
  };

  const elegirOpcionFoto = (origen) => {
    setMostrarModalFoto(false);
    if (origen === 'quitar') {
      setFotoBase64('');
      return;
    }
    // Esperamos a que el modal termine de cerrarse antes de abrir la
    // cámara/galería (evita un problema de presentación en iOS).
    setTimeout(() => seleccionarImagen(origen), 300);
  };

  // ---------- Cerrar sesión ----------
  const handleCerrarSesion = async () => {
    const ok = await cerrarSesion();
    setConfirmarSalir(false);
    if (!ok) notificar('error', 'No se pudo cerrar sesión', 'Intentá de nuevo.');
  };

  return (
    <View style={styles.pantalla}>
      <StatusBar style="light" />

      {/* ---------- Header ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Mi perfil</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {cargando ? (
          <ActivityIndicator color={COLORES.dorado} style={{ marginTop: 40 }} />
        ) : (
          <>
            <AvatarPerfil
              fotoUrl={fotoBase64 ? `data:image/jpeg;base64,${fotoBase64}` : ''}
              onPress={() => setMostrarModalFoto(true)}
            />
            <Text style={styles.ayudaFoto}>Tocá la foto para cambiarla</Text>

            <View style={styles.form}>
              <FormInput label="NOMBRE" icono="person-outline" placeholder="Ej: José Roberto" value={nombre} onChangeText={(v) => setNombre(soloLetras(v))} autoCapitalize="words" />
              <FormInput label="APELLIDO" icono="person-outline" placeholder="Ej: Montero" value={apellido} onChangeText={(v) => setApellido(soloLetras(v))} autoCapitalize="words" />

              <FormInput
                label="CORREO ELECTRÓNICO"
                icono="mail-outline"
                placeholder="Usuario@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                containerStyle={bordeCampo(email.length === 0 ? null : correoOk ? 'ok' : 'error')}
                right={correoOk ? <Ionicons name="checkmark-circle" size={20} color={COLORES.verde} /> : null}
              />

              <FormInput label="TELÉFONO" icono="call-outline" placeholder="+54 387598987" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
            </View>

            <TouchableOpacity style={[styles.botonGuardar, guardando && { opacity: 0.6 }]} onPress={handleGuardar} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.botonGuardarTexto}>Guardar cambios</Text>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.botonSalir} onPress={() => setConfirmarSalir(true)}>
              <Ionicons name="log-out-outline" size={18} color={COLORES.rojo} />
              <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BarberTabBar activo="perfil" onPressTab={(tab) => { if (tab.key === 'inicio') navigation.navigate('Home'); }} />

      <ModalElegirFoto visible={mostrarModalFoto} tieneFoto={!!fotoBase64} onElegir={elegirOpcionFoto} onCerrar={() => setMostrarModalFoto(false)} />

      <ModalConfirmar
        visible={confirmarSalir}
        titulo="Cerrar sesión"
        mensaje="¿Seguro que querés cerrar tu sesión?"
        textoConfirmar="Cerrar sesión"
        peligro
        onConfirmar={handleCerrarSesion}
        onCancelar={() => setConfirmarSalir(false)}
      />

      <ModalReautenticar visible={pedirClave} cargando={cambiandoCorreo} onConfirmar={confirmarCambioCorreo} onCancelar={() => !cambiandoCorreo && setPedirClave(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: COLORES.fondo },
  scroll: { flex: 1 },
  contenido: { paddingBottom: 24 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  headerTitulo: { fontFamily: SERIF, fontSize: 18, color: COLORES.dorado, letterSpacing: 0.5 },

  ayudaFoto: { color: 'rgba(255,255,255,0.55)', fontSize: 11.5, textAlign: 'center', marginTop: 8 },
  form: { paddingHorizontal: 24, marginTop: 4 },

  botonGuardar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderRadius: 8, backgroundColor: COLORES.dorado, marginHorizontal: 24, marginTop: 22 },
  botonGuardarTexto: { color: '#fff', fontSize: 14, fontWeight: '700' },

  botonSalir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(224,90,90,0.5)', backgroundColor: 'rgba(224,90,90,0.08)', marginHorizontal: 24, marginTop: 12 },
  botonSalirTexto: { color: COLORES.rojo, fontSize: 14, fontWeight: '700' },
});
