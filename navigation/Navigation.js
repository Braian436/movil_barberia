import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../src/config/firebaseConfig';
import { consumirSupresionLogin } from '../src/authFlow';
import Login from '../screens/Login';
import Home from '../screens/Home';
import Productos from '../screens/Productos';
import Registro from '../screens/SignUp';
import RecuperarPassword from '../screens/RecuperarPassword';

const Stack = createStackNavigator();

export default function Navigation() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      // Al registrarse, Firebase inicia sesión solo. Ignoramos ese evento
      // para no saltar a Home: el registro nos manda de vuelta al Login.
      if (u && consumirSupresionLogin()) return;
      setUser(u);
    });
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Falta configurar Firebase. Copia .env.example como .env y completa los datos de tu proyecto.
        </Text>
      </View>
    );
  }

  if (user === undefined) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Productos" component={Productos} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="Registro" component={Registro} options={{ headerShown: false }} />
            <Stack.Screen name="RecuperarPassword" component={RecuperarPassword} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  message: { textAlign: 'center', fontSize: 16 },
});
