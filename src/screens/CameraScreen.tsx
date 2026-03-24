import React from 'react';
import { View, StyleSheet } from 'react-native';
import { THEME } from '../theme/constants';
import CameraTranslator from '../modules/camera/CameraTranslator';

/**
 * Wrapper de navegación para CameraTranslator.
 * Aquí se pueden añadir headers o lógica de sesión antes de mostrar la cámara.
 */
export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <CameraTranslator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background.deepSpace,
  },
});
