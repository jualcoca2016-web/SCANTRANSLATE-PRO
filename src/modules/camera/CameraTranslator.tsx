import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Modal, ScrollView, LayoutChangeEvent,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useMediaLibraryPermissions, saveToLibraryAsync } from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { THEME } from '../../theme/constants';
import { useLanguage } from '../../context/LanguageContext';
import type { SupportedLanguage } from '../../types/translation';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type ScanState = 'idle' | 'scanning' | 'detected' | 'no_text';

interface OverlayBlock {
  text: string;
  x: number; // fracción 0-1 del ancho del CameraView
  y: number; // fracción 0-1 del alto del CameraView
  w: number;
  h: number;
}

interface LiveResult {
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  fullTranslation: string;
  blocks: OverlayBlock[];
}

// ─── Idiomas ────────────────────────────────────────────────────────────────

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

const LANG_NAMES: Record<SupportedLanguage, string> = {
  es: 'ES', en: 'EN', ja: 'JA', zh: 'ZH',
  fr: 'FR', de: 'DE', pt: 'PT', ko: 'KO',
  it: 'IT', ru: 'RU',
};

// ─── Escenarios mock ─────────────────────────────────────────────────────────

type TrMap = Partial<Record<SupportedLanguage, { full: string; texts: string[] }>>;

interface Scenario {
  src: SupportedLanguage;
  blocks: { orig: string; x: number; y: number; w: number; h: number }[];
  tr: TrMap;
}

const SCENARIOS: Scenario[] = [
  {
    src: 'en',
    blocks: [
      { orig: 'Warning:',                      x: 0.05, y: 0.19, w: 0.36, h: 0.065 },
      { orig: 'Keep out of reach of children.', x: 0.05, y: 0.29, w: 0.84, h: 0.065 },
    ],
    tr: {
      es: { full: 'Advertencia: Mantener fuera del alcance de los niños.',   texts: ['Advertencia:', 'Mantener fuera del alcance de los niños.'] },
      fr: { full: 'Attention: Tenir hors de portée des enfants.',            texts: ['Attention:', 'Tenir hors de portée des enfants.'] },
      de: { full: 'Warnung: Außer Reichweite von Kindern aufbewahren.',      texts: ['Warnung:', 'Außer Reichweite von Kindern.'] },
      pt: { full: 'Aviso: Manter fora do alcance das crianças.',             texts: ['Aviso:', 'Fora do alcance das crianças.'] },
      ja: { full: '警告：子供の手の届かない場所に保管してください。',              texts: ['警告：', '子供の手の届かない場所に。'] },
      zh: { full: '警告：请放在儿童无法触及的地方。',                            texts: ['警告：', '放在儿童无法触及的地方。'] },
      ko: { full: '경고: 어린이 손에 닿지 않는 곳에 보관하세요.',                texts: ['경고:', '어린이 손에 닿지 않는 곳에.'] },
      it: { full: 'Attenzione: Tenere fuori dalla portata dei bambini.',     texts: ['Attenzione:', 'Fuori dalla portata dei bambini.'] },
      ru: { full: 'Предупреждение: Хранить в недоступном для детей месте.', texts: ['Предупреждение:', 'Хранить недоступным для детей.'] },
    },
  },
  {
    src: 'ja',
    blocks: [
      { orig: '営業時間',        x: 0.10, y: 0.21, w: 0.46, h: 0.075 },
      { orig: '10:00 - 22:00',  x: 0.10, y: 0.34, w: 0.56, h: 0.065 },
    ],
    tr: {
      es: { full: 'Horario de apertura: 10:00 - 22:00',      texts: ['Horario de apertura:', '10:00 - 22:00'] },
      en: { full: 'Business hours: 10:00 - 22:00',           texts: ['Business hours:', '10:00 - 22:00'] },
      fr: { full: "Heures d'ouverture: 10:00 - 22:00",       texts: ["Heures d'ouverture:", '10:00 - 22:00'] },
      de: { full: 'Öffnungszeiten: 10:00 - 22:00',           texts: ['Öffnungszeiten:', '10:00 - 22:00'] },
      pt: { full: 'Horário de funcionamento: 10:00 - 22:00', texts: ['Horário:', '10:00 - 22:00'] },
      zh: { full: '营业时间：10:00 - 22:00',                  texts: ['营业时间：', '10:00 - 22:00'] },
      ko: { full: '영업 시간: 10:00 - 22:00',                texts: ['영업 시간:', '10:00 - 22:00'] },
      it: { full: 'Orario di apertura: 10:00 - 22:00',       texts: ['Orario:', '10:00 - 22:00'] },
      ru: { full: 'Часы работы: 10:00 - 22:00',              texts: ['Часы работы:', '10:00 - 22:00'] },
    },
  },
  {
    src: 'fr',
    blocks: [
      { orig: 'Entrée principale', x: 0.08, y: 0.27, w: 0.63, h: 0.085 },
    ],
    tr: {
      es: { full: 'Entrada principal',   texts: ['Entrada principal'] },
      en: { full: 'Main entrance',       texts: ['Main entrance'] },
      de: { full: 'Haupteingang',        texts: ['Haupteingang'] },
      pt: { full: 'Entrada principal',   texts: ['Entrada principal'] },
      ja: { full: 'メインエントランス',   texts: ['メインエントランス'] },
      zh: { full: '主入口',              texts: ['主入口'] },
      ko: { full: '정문',                texts: ['정문'] },
      it: { full: 'Ingresso principale', texts: ['Ingresso principale'] },
      ru: { full: 'Главный вход',        texts: ['Главный вход'] },
    },
  },
  {
    src: 'de',
    blocks: [
      { orig: 'Zutaten:',               x: 0.05, y: 0.17, w: 0.31, h: 0.065 },
      { orig: 'Wasser, Zucker, Salz',   x: 0.05, y: 0.28, w: 0.73, h: 0.065 },
    ],
    tr: {
      es: { full: 'Ingredientes: Agua, Azúcar, Sal',      texts: ['Ingredientes:', 'Agua, Azúcar, Sal'] },
      en: { full: 'Ingredients: Water, Sugar, Salt',      texts: ['Ingredients:', 'Water, Sugar, Salt'] },
      fr: { full: 'Ingrédients: Eau, Sucre, Sel',         texts: ['Ingrédients:', 'Eau, Sucre, Sel'] },
      pt: { full: 'Ingredientes: Água, Açúcar, Sal',      texts: ['Ingredientes:', 'Água, Açúcar, Sal'] },
      ja: { full: '材料：水、砂糖、塩',                    texts: ['材料：', '水、砂糖、塩'] },
      zh: { full: '成分：水、糖、盐',                      texts: ['成分：', '水、糖、盐'] },
      ko: { full: '재료: 물, 설탕, 소금',                 texts: ['재료:', '물, 설탕, 소금'] },
      it: { full: 'Ingredienti: Acqua, Zucchero, Sale',  texts: ['Ingredienti:', 'Acqua, Zucchero, Sale'] },
      ru: { full: 'Ингредиенты: Вода, Сахар, Соль',     texts: ['Ингредиенты:', 'Вода, Сахар, Соль'] },
    },
  },
];

function getMockLiveScan(targetLang: SupportedLanguage, index: number): LiveResult | null {
  if (index > 0 && index % 4 === 3) return null;
  const scenario = SCENARIOS[index % SCENARIOS.length];
  if (scenario.src === targetLang) {
    return {
      sourceLanguage: scenario.src,
      targetLanguage: targetLang,
      fullTranslation: scenario.blocks.map((b) => b.orig).join(' '),
      blocks: scenario.blocks.map((b) => ({ text: b.orig, x: b.x, y: b.y, w: b.w, h: b.h })),
    };
  }
  const trans = scenario.tr[targetLang] ?? scenario.tr.es;
  if (!trans) return null;
  return {
    sourceLanguage: scenario.src,
    targetLanguage: targetLang,
    fullTranslation: trans.full,
    blocks: scenario.blocks.map((b, i) => ({
      text: trans.texts[i] ?? trans.texts[0],
      x: b.x, y: b.y, w: b.w, h: b.h,
    })),
  };
}

// ─── Componente principal ───────────────────────────────────────────────────

export default function CameraTranslator() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = useMediaLibraryPermissions();

  const { targetLang, setTargetLang, setLastDetectedLang } = useLanguage();

  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraSize, setCameraSize] = useState({ width: 390, height: 700 });
  const [pulse, setPulse] = useState(true);

  // Captura
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [captureResult, setCaptureResult] = useState<LiveResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const compositeRef = useRef<View>(null);
  const scanIndexRef = useRef(0);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedLang = LANGUAGES.find((l) => l.code === targetLang)!;

  // ── Pulso ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setPulse((p) => !p), 600);
    return () => clearInterval(t);
  }, []);

  // ── Ciclo de escaneo automático ─────────────────────────────────────────
  const runScan = useCallback(() => {
    if (isPaused || capturedUri) return;
    setScanState('scanning');
    setLiveResult(null);

    setTimeout(() => {
      const result = getMockLiveScan(targetLang, scanIndexRef.current);
      scanIndexRef.current += 1;
      if (result) {
        setLiveResult(result);
        setScanState('detected');
        setLastDetectedLang(result.sourceLanguage);
      } else {
        setScanState('no_text');
        setTimeout(() => setScanState('idle'), 1500);
      }
    }, 1200);
  }, [isPaused, capturedUri, targetLang, setLastDetectedLang]);

  useEffect(() => {
    if (isPaused || capturedUri) {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
      return;
    }
    scanTimerRef.current = setInterval(runScan, 3500);
    return () => {
      if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    };
  }, [runScan, isPaused, capturedUri]);

  // Relanzar cuando cambie el idioma
  useEffect(() => {
    setLiveResult(null);
    setScanState('idle');
    scanIndexRef.current = 0;
  }, [targetLang]);

  const handleCameraLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraSize({ width, height });
  };

  // ── Captura de imagen ───────────────────────────────────────────────────
  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.92 });
      if (photo) {
        setCapturedUri(photo.uri);
        setCaptureResult(liveResult);
        setIsPaused(true);
      }
    } catch {
      Alert.alert('Error', 'No se pudo capturar la imagen. Inténtalo de nuevo.');
    }
  };

  // ── Guardar imagen combinada en galería ─────────────────────────────────
  const handleSave = async () => {
    if (!compositeRef.current) return;

    if (!mediaPermission?.granted) {
      const { granted } = await requestMediaPermission();
      if (!granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para guardar la captura.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const uri = await captureRef(compositeRef, { format: 'jpg', quality: 0.95 });
      await saveToLibraryAsync(uri);
      Alert.alert('✓ Guardado', 'Captura combinada guardada en tu galería.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la imagen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissCapture = () => {
    setCapturedUri(null);
    setCaptureResult(null);
    setIsPaused(false);
  };

  // ── Sin permiso de cámara ───────────────────────────────────────────────
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

  // ── Vista de resultado de captura ───────────────────────────────────────
  if (capturedUri) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Barra superior */}
        <View style={styles.captureHeader}>
          <Text style={styles.captureHeaderTitle}>📸  Captura con traducción</Text>
          {captureResult && (
            <Text style={styles.captureHeaderLangs}>
              {LANG_NAMES[captureResult.sourceLanguage]} → {LANG_NAMES[captureResult.targetLanguage]}
            </Text>
          )}
        </View>

        {/* Imagen combinada (foto + overlay) — esto es lo que captura ViewShot */}
        <View
          ref={compositeRef}
          style={[styles.compositeContainer, { height: cameraSize.height * 0.7 }]}
          collapsable={false}
        >
          <Image
            source={{ uri: capturedUri }}
            style={styles.compositeImage}
            resizeMode="cover"
          />
          {/* Overlay de traducción sobre la foto */}
          {captureResult && captureResult.blocks.map((block, i) => (
            <View
              key={i}
              style={[
                styles.overlayBlock,
                {
                  left: block.x * cameraSize.width,
                  top: block.y * (cameraSize.height * 0.7),
                  minWidth: block.w * cameraSize.width,
                },
              ]}
            >
              <Text style={styles.overlayBlockText} numberOfLines={2}>
                {block.text}
              </Text>
            </View>
          ))}
          {/* Barra de traducción completa en la foto */}
          {captureResult && (
            <View style={styles.compositeTranslationBar}>
              <Text style={styles.compositeTranslationLangs}>
                {LANG_NAMES[captureResult.sourceLanguage]} → {LANG_NAMES[captureResult.targetLanguage]}
              </Text>
              <Text style={styles.compositeTranslationText} numberOfLines={2}>
                {captureResult.fullTranslation}
              </Text>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.captureActions}>
          <TouchableOpacity style={styles.captureActionSecondary} onPress={handleDismissCapture}>
            <Text style={styles.captureActionSecondaryText}>↩  Volver a cámara</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.captureActionPrimary, isSaving && styles.captureActionDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving
              ? <ActivityIndicator color={THEME.colors.background.deepSpace} size="small" />
              : <Text style={styles.captureActionPrimaryText}>💾  Guardar en galería</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Vista de cámara con overlay en tiempo real ──────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        onLayout={handleCameraLayout}
      >
        {/* ── Barra de idiomas (top) ── */}
        <View style={styles.langBar}>
          <View style={styles.langChip}>
            <Text style={styles.langChipLabel}>Detectado</Text>
            <Text style={styles.langChipCode}>
              {liveResult ? LANG_NAMES[liveResult.sourceLanguage] : '···'}
            </Text>
          </View>

          <Text style={styles.langArrow}>⟶</Text>

          <TouchableOpacity
            style={[styles.langChip, styles.langChipTarget]}
            onPress={() => setShowLangPicker(true)}
          >
            <Text style={styles.langChipLabel}>Traducir a</Text>
            <View style={styles.langChipRow}>
              <Text style={styles.langChipFlag}>{selectedLang.flag}</Text>
              <Text style={[styles.langChipCode, styles.langChipCodeTarget]}>
                {LANG_NAMES[targetLang]}
              </Text>
              <Text style={styles.langChipCaret}>▾</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Overlay de bloques de traducción ── */}
        {scanState === 'detected' && liveResult && liveResult.blocks.map((block, i) => (
          <View
            key={i}
            style={[
              styles.overlayBlock,
              {
                position: 'absolute',
                left: block.x * cameraSize.width,
                top: block.y * cameraSize.height,
                minWidth: block.w * cameraSize.width,
              },
            ]}
          >
            <Text style={styles.overlayBlockText} numberOfLines={2}>
              {block.text}
            </Text>
          </View>
        ))}

        {/* ── Indicadores de estado (centro) ── */}
        <View style={styles.stateIndicator} pointerEvents="none">
          {scanState === 'scanning' && (
            <View style={[styles.scanningBadge, { opacity: pulse ? 1 : 0.35 }]}>
              <Text style={styles.scanningDot}>⬤</Text>
              <Text style={styles.scanningText}>Detectando texto...</Text>
            </View>
          )}
          {scanState === 'no_text' && (
            <View style={styles.noTextBadge}>
              <Text style={styles.noTextText}>Sin texto detectado</Text>
            </View>
          )}
          {scanState === 'idle' && !isPaused && (
            <View style={[styles.idleBadge, { opacity: pulse ? 0.7 : 0.3 }]}>
              <Text style={styles.idleText}>Apunta al texto a traducir</Text>
            </View>
          )}
          {isPaused && (
            <View style={styles.pausedBadge}>
              <Text style={styles.pausedText}>⏸  Escaneo pausado</Text>
            </View>
          )}
        </View>

        {/* ── Barra de traducción completa ── */}
        {scanState === 'detected' && liveResult && (
          <View style={styles.fullTranslationBar}>
            <Text style={styles.fullTranslationLangs}>
              {LANG_NAMES[liveResult.sourceLanguage]} → {LANG_NAMES[liveResult.targetLanguage]}
            </Text>
            <Text style={styles.fullTranslationText} numberOfLines={2}>
              {liveResult.fullTranslation}
            </Text>
          </View>
        )}

        {/* ── Controles inferiores ── */}
        <View style={styles.controls}>
          {/* Girar cámara */}
          <TouchableOpacity style={styles.iconButton} onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}>
            <Text style={styles.iconText}>🔄</Text>
          </TouchableOpacity>

          {/* Botón captura */}
          <TouchableOpacity
            style={[styles.captureButton, !liveResult && styles.captureButtonDim]}
            onPress={handleCapture}
            activeOpacity={0.8}
          >
            <Text style={styles.captureButtonIcon}>📸</Text>
            <Text style={styles.captureButtonLabel}>Capturar</Text>
          </TouchableOpacity>

          {/* Pausar / Reanudar */}
          <TouchableOpacity
            style={[styles.iconButton, isPaused && styles.iconButtonActive]}
            onPress={() => { setIsPaused((p) => !p); if (!isPaused) setScanState('idle'); }}
          >
            <Text style={styles.iconText}>{isPaused ? '▶️' : '⏸'}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* ── Modal selector de idioma ── */}
      <Modal
        visible={showLangPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLangPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Traducir al idioma</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, lang.code === targetLang && styles.langOptionActive]}
                  onPress={() => { setTargetLang(lang.code); setShowLangPicker(false); }}
                >
                  <Text style={styles.langOptionFlag}>{lang.flag}</Text>
                  <Text style={styles.langOptionLabel}>{lang.label}</Text>
                  {lang.code === targetLang && <Text style={styles.langOptionCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },

  // ── Permiso ──
  permissionScreen: {
    flex: 1, backgroundColor: THEME.colors.background.deepSpace,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  permissionEmoji: { fontSize: 52, marginBottom: 16 },
  permissionTitle: { color: THEME.colors.text.main, fontSize: THEME.typography.sizes.header, fontWeight: '700', marginBottom: 10 },
  permissionBody: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.body, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  permissionButton: { backgroundColor: THEME.colors.primary.cyanElectric, paddingHorizontal: 32, paddingVertical: 14, borderRadius: THEME.borders.radius.pill },
  permissionButtonText: { color: THEME.colors.background.deepSpace, fontWeight: '700', fontSize: THEME.typography.sizes.body },

  // ── Cámara ──
  camera: { flex: 1 },

  // ── Barra de idiomas ──
  langBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(4,0,26,0.82)',
    borderBottomWidth: 1, borderBottomColor: THEME.colors.primary.cyanElectric,
  },
  langChip: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.35)',
    borderRadius: THEME.borders.radius.standard,
    paddingHorizontal: 14, paddingVertical: 6, minWidth: 90,
  },
  langChipTarget: { borderColor: THEME.colors.primary.cyanElectric, backgroundColor: 'rgba(0,255,255,0.14)' },
  langChipLabel: { fontSize: 9, color: THEME.colors.text.subtle, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  langChipCode: { fontSize: THEME.typography.sizes.body, fontWeight: '800', color: THEME.colors.text.subtle, letterSpacing: 1 },
  langChipCodeTarget: { color: THEME.colors.primary.cyanElectric },
  langChipRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langChipFlag: { fontSize: 16 },
  langChipCaret: { color: THEME.colors.primary.cyanElectric, fontSize: 12 },
  langArrow: { color: THEME.colors.text.subtle, fontSize: 18 },

  // ── Overlay de texto traducido ──
  overlayBlock: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderLeftWidth: 3, borderLeftColor: '#4ADE80',
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 4,
  },
  overlayBlockText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 18 },

  // ── Indicadores ──
  stateIndicator: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  scanningBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,255,255,0.12)',
    borderWidth: 1, borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.pill, paddingHorizontal: 18, paddingVertical: 9,
  },
  scanningDot: { color: THEME.colors.primary.cyanElectric, fontSize: 10 },
  scanningText: { color: THEME.colors.primary.cyanElectric, fontWeight: '700', fontSize: THEME.typography.sizes.small },
  noTextBadge: {
    backgroundColor: 'rgba(4,0,26,0.75)',
    borderWidth: 1, borderColor: 'rgba(160,160,160,0.4)',
    borderRadius: THEME.borders.radius.pill, paddingHorizontal: 18, paddingVertical: 9,
  },
  noTextText: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small, fontWeight: '600' },
  idleBadge: {
    backgroundColor: 'rgba(4,0,26,0.6)',
    borderWidth: 1, borderColor: 'rgba(0,255,255,0.2)',
    borderRadius: THEME.borders.radius.pill, paddingHorizontal: 18, paddingVertical: 9,
  },
  idleText: { color: 'rgba(255,255,255,0.6)', fontSize: THEME.typography.sizes.small },
  pausedBadge: {
    backgroundColor: 'rgba(255,165,0,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,165,0,0.5)',
    borderRadius: THEME.borders.radius.pill, paddingHorizontal: 18, paddingVertical: 9,
  },
  pausedText: { color: '#FFA500', fontWeight: '700', fontSize: THEME.typography.sizes.small },

  // ── Barra de traducción completa ──
  fullTranslationBar: {
    position: 'absolute', bottom: 88, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderTopWidth: 1, borderTopColor: '#4ADE80',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  fullTranslationLangs: { fontSize: 10, fontWeight: '700', color: '#4ADE80', letterSpacing: 1, marginBottom: 3 },
  fullTranslationText: { color: '#FFFFFF', fontSize: THEME.typography.sizes.body, lineHeight: 22, fontWeight: '500' },

  // ── Controles ──
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 30, paddingBottom: 20, paddingTop: 12, height: 88,
    backgroundColor: 'rgba(4,0,26,0.88)',
    borderTopWidth: 1, borderTopColor: THEME.colors.primary.cyanElectric,
  },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconButtonActive: { backgroundColor: 'rgba(255,165,0,0.15)', borderRadius: 24 },
  iconText: { fontSize: 24 },

  captureButton: {
    alignItems: 'center', justifyContent: 'center', gap: 3,
    width: 80, height: 64,
    borderRadius: THEME.borders.radius.standard,
    backgroundColor: THEME.colors.primary.cyanElectric,
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 12, elevation: 8,
  },
  captureButtonDim: { backgroundColor: THEME.colors.background.darkPurple, borderWidth: 1, borderColor: 'rgba(0,255,255,0.3)', shadowOpacity: 0, elevation: 0 },
  captureButtonIcon: { fontSize: 22 },
  captureButtonLabel: { color: THEME.colors.background.deepSpace, fontWeight: '800', fontSize: 11 },

  // ── Vista de captura ──
  captureHeader: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: THEME.colors.background.darkPurple,
    borderBottomWidth: 1, borderBottomColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
  },
  captureHeaderTitle: { color: THEME.colors.text.main, fontWeight: '700', fontSize: THEME.typography.sizes.body },
  captureHeaderLangs: { color: THEME.colors.primary.cyanElectric, fontSize: THEME.typography.sizes.small, marginTop: 4, fontWeight: '600' },

  compositeContainer: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  compositeImage: { width: '100%', height: '100%' },
  compositeTranslationBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderTopWidth: 1, borderTopColor: '#4ADE80',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  compositeTranslationLangs: { fontSize: 10, fontWeight: '700', color: '#4ADE80', letterSpacing: 1, marginBottom: 3 },
  compositeTranslationText: { color: '#FFFFFF', fontSize: THEME.typography.sizes.small, lineHeight: 18 },

  captureActions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: THEME.colors.background.darkPurple,
    borderTopWidth: 1, borderTopColor: THEME.colors.primary.cyanElectric,
  },
  captureActionSecondary: {
    flex: 1, paddingVertical: 14,
    borderRadius: THEME.borders.radius.standard,
    borderWidth: 1, borderColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
  },
  captureActionSecondaryText: { color: THEME.colors.primary.cyanElectric, fontWeight: '600', fontSize: THEME.typography.sizes.body },
  captureActionPrimary: {
    flex: 1, paddingVertical: 14,
    borderRadius: THEME.borders.radius.standard,
    backgroundColor: THEME.colors.primary.cyanElectric, alignItems: 'center',
  },
  captureActionDisabled: { opacity: 0.6 },
  captureActionPrimaryText: { color: THEME.colors.background.deepSpace, fontWeight: '700', fontSize: THEME.typography.sizes.body },

  // ── Modal selector de idioma ──
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: THEME.borders.width.glow, borderColor: THEME.colors.primary.cyanElectric,
    paddingTop: 12, maxHeight: '70%',
  },
  modalHandle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(0,255,255,0.3)', marginBottom: 14 },
  modalTitle: { color: THEME.colors.text.main, fontWeight: '700', fontSize: THEME.typography.sizes.title, textAlign: 'center', marginBottom: 16, paddingHorizontal: 20 },
  langOption: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 14, gap: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,255,255,0.08)',
  },
  langOptionActive: { backgroundColor: 'rgba(0,255,255,0.08)' },
  langOptionFlag: { fontSize: 24 },
  langOptionLabel: { flex: 1, color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body, fontWeight: '500' },
  langOptionCheck: { color: THEME.colors.primary.cyanElectric, fontWeight: '800', fontSize: THEME.typography.sizes.body },
});
