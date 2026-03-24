import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../theme/constants';
import type { SupportedLanguage } from '../../types/translation';

type VoiceState = 'idle' | 'listening' | 'processing' | 'result';

const MOCK_TRANSCRIPT = 'Today\'s specials: Grilled salmon and Tempura set.';
const MOCK_TRANSLATION = 'Especialidades del día: Salmón a la plancha y set de tempura.';

export default function VoiceTranslateScreen() {
  const navigation = useNavigation();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [sourceLang] = useState<SupportedLanguage>('en');
  const [targetLang] = useState<SupportedLanguage>('es');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');

  const handleListen = async () => {
    if (voiceState !== 'idle') return;
    setVoiceState('listening');
    // Simula 2s de escucha → procesamiento → resultado
    setTimeout(() => setVoiceState('processing'), 2000);
    setTimeout(() => {
      setTranscript(MOCK_TRANSCRIPT);
      setTranslation(MOCK_TRANSLATION);
      setVoiceState('result');
    }, 3000);
  };

  const handleReset = () => {
    setTranscript('');
    setTranslation('');
    setVoiceState('idle');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎙️  Traducción de Voz</Text>
        <View style={{ width: 70 }} />
      </View>

      <View style={styles.body}>
        {/* Indicador de idiomas */}
        <View style={styles.langRow}>
          <View style={styles.langChip}>
            <Text style={styles.langChipText}>{sourceLang.toUpperCase()}</Text>
          </View>
          <Text style={styles.langArrow}>⟶</Text>
          <View style={[styles.langChip, styles.langChipTarget]}>
            <Text style={[styles.langChipText, styles.langChipTargetText]}>
              {targetLang.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Botón micrófono principal */}
        <TouchableOpacity
          style={[
            styles.micButton,
            voiceState === 'listening' && styles.micButtonListening,
            voiceState === 'processing' && styles.micButtonProcessing,
          ]}
          onPress={handleListen}
          disabled={voiceState !== 'idle'}
          activeOpacity={0.8}
        >
          <Text style={styles.micEmoji}>
            {voiceState === 'listening' ? '🔴' : voiceState === 'processing' ? '⏳' : '🎙️'}
          </Text>
          <Text style={styles.micLabel}>
            {voiceState === 'idle' && 'Toca para hablar'}
            {voiceState === 'listening' && 'Escuchando...'}
            {voiceState === 'processing' && 'Traduciendo...'}
            {voiceState === 'result' && '¡Listo!'}
          </Text>
        </TouchableOpacity>

        {/* Resultado */}
        {voiceState === 'result' && (
          <View style={styles.resultSection}>
            <View style={styles.resultBlock}>
              <Text style={styles.resultBlockLabel}>Detectado ({sourceLang.toUpperCase()})</Text>
              <Text style={styles.resultBlockText}>{transcript}</Text>
            </View>
            <View style={[styles.resultBlock, styles.resultBlockTranslation]}>
              <Text style={[styles.resultBlockLabel, { color: THEME.colors.primary.cyanElectric }]}>
                Traducción ({targetLang.toUpperCase()})
              </Text>
              <Text style={[styles.resultBlockText, { color: THEME.colors.text.cyanGlow }]}>
                {translation}
              </Text>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleReset}>
                <Text style={styles.actionBtnText}>🎙️  Volver a hablar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnSecondary]}
                onPress={() => Alert.alert('Guardado', 'Audio guardado.')}
              >
                <Text style={styles.actionBtnTextSecondary}>⏺️  Grabar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Nota: advertencia obligatoria según spec */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️  La traducción automática puede contener errores. Úsala como guía y no como sustituto de un traductor profesional.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.secondary.magentaNeon,
    backgroundColor: THEME.colors.background.darkPurple,
  },
  backBtn: { width: 70 },
  backText: { color: THEME.colors.primary.cyanElectric, fontSize: THEME.typography.sizes.body, fontWeight: '600' },
  headerTitle: { color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body, fontWeight: '700' },

  body: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },

  langRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 40 },
  langChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: THEME.borders.radius.pill,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.text.subtle,
  },
  langChipTarget: { borderColor: THEME.colors.secondary.magentaNeon },
  langChipText: { color: THEME.colors.text.main, fontWeight: '800', fontSize: THEME.typography.sizes.body, letterSpacing: 2 },
  langChipTargetText: { color: THEME.colors.secondary.magentaNeon },
  langArrow: { color: THEME.colors.text.subtle, fontSize: 20 },

  micButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 3,
    borderColor: THEME.colors.secondary.magentaNeon,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: THEME.colors.secondary.magentaNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 32,
  },
  micButtonListening: {
    borderColor: THEME.colors.secondary.pinkHot,
    shadowColor: THEME.colors.secondary.pinkHot,
  },
  micButtonProcessing: {
    borderColor: THEME.colors.primary.cyanElectric,
    shadowColor: THEME.colors.primary.cyanElectric,
  },
  micEmoji: { fontSize: 52 },
  micLabel: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small, fontWeight: '600' },

  resultSection: { width: '100%', gap: 12 },
  resultBlock: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
  },
  resultBlockTranslation: { borderColor: THEME.colors.primary.cyanElectric },
  resultBlockLabel: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  resultBlockText: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
    lineHeight: 22,
  },

  resultActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    backgroundColor: THEME.colors.secondary.magentaNeon,
    paddingVertical: 12,
    borderRadius: THEME.borders.radius.standard,
    alignItems: 'center',
  },
  actionBtnSecondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: THEME.colors.secondary.magentaNeon },
  actionBtnText: { color: '#000', fontWeight: '700', fontSize: THEME.typography.sizes.small },
  actionBtnTextSecondary: { color: THEME.colors.secondary.magentaNeon, fontWeight: '700', fontSize: THEME.typography.sizes.small },

  disclaimer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  disclaimerText: {
    color: THEME.colors.text.subtle,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
