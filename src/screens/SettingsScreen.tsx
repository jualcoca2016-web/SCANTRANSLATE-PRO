import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../theme/constants';
import { useLanguage } from '../context/LanguageContext';
import type { SupportedLanguage } from '../types/translation';

const LANGUAGES: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'es', label: 'Español',   flag: '🇪🇸' },
  { code: 'en', label: 'English',   flag: '🇺🇸' },
  { code: 'ja', label: '日本語',     flag: '🇯🇵' },
  { code: 'zh', label: '中文',       flag: '🇨🇳' },
  { code: 'fr', label: 'Français',  flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',   flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ko', label: '한국어',     flag: '🇰🇷' },
  { code: 'it', label: 'Italiano',  flag: '🇮🇹' },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
];

type LangPickerType = 'native' | 'target' | null;

export default function SettingsScreen() {
  const navigation = useNavigation();
  const {
    nativeLang, setNativeLang,
    targetLang, setTargetLang,
    soundEnabled, setSoundEnabled,
  } = useLanguage();

  const [activePicker, setActivePicker] = React.useState<LangPickerType>(null);

  const nativeLangInfo = LANGUAGES.find((l) => l.code === nativeLang)!;
  const targetLangInfo = LANGUAGES.find((l) => l.code === targetLang)!;

  const handleSelectLang = (code: SupportedLanguage) => {
    if (activePicker === 'native') setNativeLang(code);
    if (activePicker === 'target') setTargetLang(code);
    setActivePicker(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️  Ajustes</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Idiomas ── */}
        <Text style={styles.sectionTitle}>Idiomas</Text>

        {/* Idioma principal */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setActivePicker(activePicker === 'native' ? null : 'native')}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🗣️</Text>
            <View>
              <Text style={styles.settingLabel}>Mi idioma principal</Text>
              <Text style={styles.settingDesc}>El idioma que hablas</Text>
            </View>
          </View>
          <View style={styles.settingValueRow}>
            <Text style={styles.settingFlag}>{nativeLangInfo.flag}</Text>
            <Text style={styles.settingValue}>{nativeLangInfo.label}</Text>
            <Text style={styles.settingCaret}>{activePicker === 'native' ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {activePicker === 'native' && (
          <View style={styles.langPicker}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, lang.code === nativeLang && styles.langOptionActive]}
                onPress={() => handleSelectLang(lang.code)}
              >
                <Text style={styles.langOptionFlag}>{lang.flag}</Text>
                <Text style={styles.langOptionLabel}>{lang.label}</Text>
                {lang.code === nativeLang && <Text style={styles.langOptionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Idioma de traducción */}
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setActivePicker(activePicker === 'target' ? null : 'target')}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌐</Text>
            <View>
              <Text style={styles.settingLabel}>Traducir al idioma</Text>
              <Text style={styles.settingDesc}>Idioma destino por defecto</Text>
            </View>
          </View>
          <View style={styles.settingValueRow}>
            <Text style={styles.settingFlag}>{targetLangInfo.flag}</Text>
            <Text style={[styles.settingValue, { color: THEME.colors.primary.cyanElectric }]}>
              {targetLangInfo.label}
            </Text>
            <Text style={styles.settingCaret}>{activePicker === 'target' ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {activePicker === 'target' && (
          <View style={styles.langPicker}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langOption, lang.code === targetLang && styles.langOptionActive]}
                onPress={() => handleSelectLang(lang.code)}
              >
                <Text style={styles.langOptionFlag}>{lang.flag}</Text>
                <Text style={styles.langOptionLabel}>{lang.label}</Text>
                {lang.code === targetLang && <Text style={styles.langOptionCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Audio ── */}
        <Text style={styles.sectionTitle}>Audio</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔊</Text>
            <View>
              <Text style={styles.settingLabel}>Reproducir traducción en voz</Text>
              <Text style={styles.settingDesc}>Lee el texto traducido en voz alta</Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: 'rgba(160,160,160,0.3)', true: 'rgba(0,255,255,0.4)' }}
            thumbColor={soundEnabled ? THEME.colors.primary.cyanElectric : THEME.colors.text.subtle}
          />
        </View>

        {/* ── Almacenamiento ── */}
        <Text style={styles.sectionTitle}>Almacenamiento</Text>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert(
            'Limpiar historial',
            '¿Eliminar todas las capturas e historial de traducciones?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Hecho', 'Historial eliminado.') },
            ]
          )}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🗑️</Text>
            <View>
              <Text style={styles.settingLabel}>Limpiar historial</Text>
              <Text style={styles.settingDesc}>Elimina capturas y traducciones guardadas</Text>
            </View>
          </View>
          <Text style={[styles.settingCaret, { color: THEME.colors.secondary.pinkHot }]}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Alert.alert('Uso de almacenamiento', 'Capturas: 12 MB\nGrabaciones: 0 MB\nTotal: 12 MB')}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📊</Text>
            <View>
              <Text style={styles.settingLabel}>Uso de almacenamiento</Text>
              <Text style={styles.settingDesc}>Ver espacio utilizado por la app</Text>
            </View>
          </View>
          <Text style={styles.settingCaret}>›</Text>
        </TouchableOpacity>

        {/* ── Acerca de ── */}
        <Text style={styles.sectionTitle}>Acerca de</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>📱</Text>
            <View>
              <Text style={styles.settingLabel}>Versión de la app</Text>
              <Text style={styles.settingDesc}>ScanTranslate Pro</Text>
            </View>
          </View>
          <Text style={[styles.settingValue, { color: THEME.colors.text.subtle }]}>0.1.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    borderBottomColor: THEME.colors.primary.cyanElectric,
    backgroundColor: THEME.colors.background.darkPurple,
  },
  backText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '600',
    fontSize: THEME.typography.sizes.body,
    width: 70,
  },
  headerTitle: {
    color: THEME.colors.text.main,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.body,
  },

  sectionTitle: {
    fontSize: THEME.typography.sizes.small,
    fontWeight: '700',
    color: THEME.colors.text.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.background.darkPurple,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.06)',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  settingIcon: { fontSize: 22, width: 30 },
  settingLabel: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
    fontWeight: '500',
  },
  settingDesc: {
    color: THEME.colors.text.subtle,
    fontSize: THEME.typography.sizes.small,
    marginTop: 1,
  },
  settingValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingFlag: { fontSize: 18 },
  settingValue: {
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.small,
    fontWeight: '600',
  },
  settingCaret: { color: THEME.colors.text.subtle, fontSize: 14 },

  langPicker: {
    backgroundColor: THEME.colors.background.deepSpace,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,255,255,0.15)',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,255,255,0.05)',
  },
  langOptionActive: { backgroundColor: 'rgba(0,255,255,0.08)' },
  langOptionFlag: { fontSize: 20 },
  langOptionLabel: {
    flex: 1,
    color: THEME.colors.text.main,
    fontSize: THEME.typography.sizes.body,
  },
  langOptionCheck: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
  },
});
