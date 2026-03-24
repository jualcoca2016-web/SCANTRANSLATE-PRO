import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../theme/constants';
import { mockTranslationResult } from '../modules/camera/ocr.mock';
import type { SupportedLanguage } from '../types/translation';

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

export default function TextTranslateScreen() {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState<SupportedLanguage>('es');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === targetLang)!;

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    try {
      // Simula latencia de API (reemplazar por POST /api/translate)
      await new Promise((r) => setTimeout(r, 700));
      const mock = mockTranslationResult();
      setTranslatedText(mock.fullTranslatedText);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
  };

  const handleSaveCapture = () => {
    Alert.alert('Guardado', 'Captura combinada guardada en tu galería. (expo-view-shot → Core V2)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background.deepSpace} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✍️  Traducción de Texto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Selector de idioma destino */}
        <Text style={styles.label}>Traducir al idioma:</Text>
        <TouchableOpacity
          style={styles.langSelector}
          onPress={() => setShowLangPicker((v) => !v)}
        >
          <Text style={styles.langSelectorText}>
            {selectedLang.flag}  {selectedLang.label}
          </Text>
          <Text style={styles.langSelectorArrow}>
            {showLangPicker ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {showLangPicker && (
          <View style={styles.langList}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  lang.code === targetLang && styles.langOptionActive,
                ]}
                onPress={() => {
                  setTargetLang(lang.code);
                  setShowLangPicker(false);
                }}
              >
                <Text style={styles.langOptionText}>
                  {lang.flag}  {lang.label}
                </Text>
                {lang.code === targetLang && (
                  <Text style={styles.langOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input de texto */}
        <Text style={styles.label}>Texto original:</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Escribe aquí el texto a traducir..."
            placeholderTextColor={THEME.colors.text.subtle}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{inputText.length}/500</Text>
            {inputText.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearBtn}>✕ Limpiar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Botón traducir */}
        <TouchableOpacity
          style={[styles.translateBtn, (!inputText.trim() || isTranslating) && styles.translateBtnDisabled]}
          onPress={handleTranslate}
          disabled={!inputText.trim() || isTranslating}
          activeOpacity={0.8}
        >
          {isTranslating ? (
            <ActivityIndicator color={THEME.colors.background.deepSpace} size="small" />
          ) : (
            <Text style={styles.translateBtnText}>Traducir →</Text>
          )}
        </TouchableOpacity>

        {/* Resultado */}
        {translatedText.length > 0 && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>
                {selectedLang.flag}  Traducción ({selectedLang.label})
              </Text>
            </View>
            <Text style={styles.resultText}>{translatedText}</Text>

            <View style={styles.resultActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleSaveCapture}
              >
                <Text style={styles.actionBtnText}>💾  Guardar captura</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnSecondary]}
                onPress={() => Alert.alert('Copiado', 'Texto copiado al portapapeles.')}
              >
                <Text style={styles.actionBtnTextSecondary}>📋  Copiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.primary.cyanElectric,
    backgroundColor: THEME.colors.background.darkPurple,
  },
  headerTitle: {
    fontSize: THEME.typography.sizes.title,
    fontWeight: '700',
    color: THEME.colors.text.main,
  },

  label: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 8,
  },

  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.standard,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  langSelectorText: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
    fontWeight: '600',
  },
  langSelectorArrow: {
    color: THEME.colors.primary.cyanElectric,
    fontSize: 12,
  },

  langList: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.standard,
    marginTop: 4,
    overflow: 'hidden',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.1)',
  },
  langOptionActive: { backgroundColor: 'rgba(0,255,255,0.08)' },
  langOptionText: { color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body },
  langOptionCheck: { color: THEME.colors.primary.cyanElectric, fontWeight: '700' },

  inputWrapper: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.thin,
    borderColor: 'rgba(0,255,255,0.3)',
    borderRadius: THEME.borders.radius.standard,
    overflow: 'hidden',
  },
  textInput: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
    padding: 14,
    minHeight: 120,
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,255,255,0.1)',
  },
  charCount: { fontSize: 11, color: THEME.colors.text.subtle },
  clearBtn: { fontSize: 12, color: THEME.colors.secondary.pinkHot, fontWeight: '600' },

  translateBtn: {
    marginTop: 16,
    backgroundColor: THEME.colors.primary.cyanElectric,
    paddingVertical: 16,
    borderRadius: THEME.borders.radius.pill,
    alignItems: 'center',
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  translateBtnDisabled: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  translateBtnText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
    letterSpacing: 0.5,
  },

  resultCard: {
    marginTop: 20,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.blueVibrant,
    borderRadius: THEME.borders.radius.standard,
    overflow: 'hidden',
    shadowColor: THEME.colors.primary.blueVibrant,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  resultHeader: {
    backgroundColor: 'rgba(30,144,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,144,255,0.3)',
  },
  resultLabel: {
    color: THEME.colors.primary.blueVibrant,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.small,
    letterSpacing: 0.5,
  },
  resultText: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
    lineHeight: 24,
    padding: 16,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,144,255,0.2)',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary.cyanElectric,
    paddingVertical: 10,
    borderRadius: THEME.borders.radius.standard,
    alignItems: 'center',
  },
  actionBtnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
  },
  actionBtnText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.small,
  },
  actionBtnTextSecondary: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.small,
  },
});
