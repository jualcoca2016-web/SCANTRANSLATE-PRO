import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { THEME } from '../../theme/constants';
import type { TranslationResult } from '../../types/translation';
import { mockTranslationResult } from './ocr.mock';
import TranslationOverlay from './TranslationOverlay';

export default function CameraTranslator() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // ── Sin permiso ────────────────────────────────────────────────────────────
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Permiso de cámara</Text>
        <Text style={styles.permissionBody}>
          Necesitamos acceso a tu cámara para detectar y traducir texto en tiempo real.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Captura + mock (→ API real en Core V2) ─────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;
    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo) throw new Error('Sin imagen');
      setCapturedUri(photo.uri);
      await new Promise((r) => setTimeout(r, 900)); // simula latencia API
      setTranslationResult(mockTranslationResult());
    } catch {
      Alert.alert('Error', 'No se pudo procesar la imagen. Inténtalo de nuevo.');
      setCapturedUri(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedUri(null);
    setTranslationResult(null);
  };

  // ── Vista de resultado ─────────────────────────────────────────────────────
  if (capturedUri && translationResult) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Chip de idioma detectado */}
        <View style={styles.langBar}>
          <Text style={styles.langText}>
            {translationResult.sourceLanguage.toUpperCase()}
          </Text>
          <Text style={styles.langArrow}>→</Text>
          <Text style={styles.langText}>
            {translationResult.targetLanguage.toUpperCase()}
          </Text>
        </View>

        <View style={styles.resultImageWrapper}>
          <Image source={{ uri: capturedUri }} style={styles.resultImage} resizeMode="contain" />
          <TranslationOverlay result={translationResult} />
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetake}>
            <Text style={styles.secondaryButtonText}>↩  Nueva captura</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Alert.alert('Guardado', 'Captura guardada en tu galería.')}
          >
            <Text style={styles.primaryButtonText}>💾  Guardar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vista de cámara ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* HUD superior */}
        <View style={styles.hudTop}>
          <Text style={styles.hudText}>Apunta al texto que quieres traducir</Text>
        </View>

        {/* Visor con esquinas neón */}
        <View style={styles.viewfinder}>
          {(['TL', 'TR', 'BL', 'BR'] as const).map((pos) => (
            <View key={pos} style={[styles.corner, styles[`corner${pos}`]]} />
          ))}
        </View>

        {/* Controles inferiores */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
            disabled={isProcessing}
          >
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isProcessing && styles.captureButtonBusy]}
            onPress={handleCapture}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <>
                <ActivityIndicator color={THEME.colors.background.deepSpace} size="small" />
                <Text style={styles.captureLabelBusy}>Analizando...</Text>
              </>
            ) : (
              <>
                <Text style={styles.captureLabel}>Capturar</Text>
                <Text style={styles.captureSubLabel}>y Traducir</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.iconButton} />
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const C = 22; // corner size
const CB = 3; // corner border

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },

  // ── Permiso ──
  permissionScreen: {
    flex: 1,
    backgroundColor: THEME.colors.background.deepSpace,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  permissionEmoji: { fontSize: 52, marginBottom: 16 },
  permissionTitle: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.header,
    fontWeight: '700',
    marginBottom: 10,
  },
  permissionBody: {
    color: THEME.colors.text.subtle,
    fontSize: THEME.typography.sizes.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: THEME.colors.primary.cyanElectric,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: THEME.borders.radius.pill,
  },
  permissionButtonText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.body,
  },

  // ── Cámara ──
  camera: { flex: 1 },
  hudTop: { paddingTop: 16, alignItems: 'center' },
  hudText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: THEME.typography.sizes.small,
    backgroundColor: 'rgba(4,0,26,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.borders.radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: 40,
    marginVertical: 16,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: C,
    height: C,
    borderColor: THEME.colors.primary.cyanElectric,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CB, borderLeftWidth: CB, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CB, borderRightWidth: CB, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CB, borderLeftWidth: CB, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CB, borderRightWidth: CB, borderBottomRightRadius: 4 },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 36,
    paddingTop: 12,
    backgroundColor: 'rgba(4,0,26,0.7)',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.primary.cyanElectric,
  },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 26 },

  captureButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10,
  },
  captureButtonBusy: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 2,
    borderColor: THEME.colors.primary.cyanElectric,
    shadowOpacity: 0.3,
  },
  captureLabel: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '800',
    fontSize: 13,
  },
  captureSubLabel: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '600',
    fontSize: 11,
  },
  captureLabelBusy: {
    color: THEME.colors.primary.cyanElectric,
    fontSize: 10,
    marginTop: 4,
  },

  // ── Resultado ──
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 10,
    backgroundColor: THEME.colors.background.darkPurple,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.primary.cyanElectric,
  },
  langText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
    letterSpacing: 2,
  },
  langArrow: {
    color: THEME.colors.text.subtle,
    fontSize: THEME.typography.sizes.body,
  },
  resultImageWrapper: { flex: 1, backgroundColor: '#000', position: 'relative' },
  resultImage: { flex: 1, width: '100%' },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME.colors.background.darkPurple,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.primary.cyanElectric,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: THEME.borders.radius.standard,
    borderWidth: THEME.borders.width.thin,
    borderColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '600',
    fontSize: THEME.typography.sizes.body,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: THEME.borders.radius.standard,
    backgroundColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.body,
  },
});
