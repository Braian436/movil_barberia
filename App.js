import React from 'react';
import 'react-native-gesture-handler';
import Navigation from './navigation/Navigation';
import AppToast from './components/AppToast';

export default function App() {
  return (
    <>
      <Navigation />
      <AppToast />
    </>
  );
}
