import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { THEME } from '../theme/constants';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useLanguage } from '../context/LanguageContext';
import { mockPlanLimits } from '../modules/camera/ocr.mock';

type ProfileNav = NativeStackNavigationProp<RootStackParamList>;

const PREMIUM_FEATURES = [
  { icon: '🎙️', title: 'Traducción de Voz', desc: 'Habla y escucha la traducción al instante.' },
  { icon: '💬', title: 'Modo Conversación', desc: 'Comunicación bidireccional entre dos idiomas.' },
  { icon: '⏺️', title: 'Grabación de conversaciones', desc: 'Revisa y aprende de tus conversaciones grabadas.' },
  { icon: '📚', title: 'Módulo de aprendizaje', desc: 'Contenido visual, ejercicios y actividades gamificadas.' },
  { icon: '🌆', title: 'Aventura Urbana', desc: 'Juego de decisiones en ciudades del mundo.' },
  { icon: '🤖', title: 'Simulación Conversacional', desc: 'Evalúa pronunciación, gramática y comprensión.' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNav>();
  const { targetLang, nativeLang } = useLanguage();
  const [plan] = useState<'free' | 'premium'>('free');
  const FREE_PLAN = mockPlanLimits('free');

  const scansPercent = (FREE_PLAN.dailyScansUsed / FREE_PLAN.dailyScansLimit) * 100;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar y nombre */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.userName}>Mi Perfil</Text>
          <View style={[styles.planBadge, plan === 'premium' && styles.planBadgePremium]}>
            <Text style={styles.planBadgeText}>
              {plan === 'free' ? 'Plan Gratuito' : '✨ Premium'}
            </Text>
          </View>
        </View>

        {/* Uso diario (Free) */}
        {plan === 'free' && (
          <View style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Text style={styles.usageTitle}>Escaneos hoy</Text>
              <Text style={styles.usageCount}>
                {FREE_PLAN.dailyScansUsed}/{FREE_PLAN.dailyScansLimit}
              </Text>
            </View>
            <View style={styles.usageTrack}>
              <View style={[styles.usageFill, { width: `${scansPercent}%` }]} />
            </View>
            <Text style={styles.usageNote}>
              Se reinicia a medianoche · Historial: {FREE_PLAN.historyRetentionDays} días
            </Text>
          </View>
        )}

        {/* Banner Premium */}
        {plan === 'free' && (
          <View style={styles.premiumCard}>
            <Text style={styles.premiumCardTitle}>✨ Desbloquea Premium</Text>
            <Text style={styles.premiumCardSub}>
              Escaneos ilimitados · Voz en tiempo real · Juegos avanzados · Historial 365 días
            </Text>

            <View style={styles.featureList}>
              {PREMIUM_FEATURES.map((f) => (
                <View key={f.title} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureTitle}>{f.title}</Text>
                    <Text style={styles.featureDesc}>{f.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.premiumBtn}
              onPress={() => Alert.alert('Próximamente', 'Integración de pagos en la siguiente versión.')}
            >
              <Text style={styles.premiumBtnText}>Ver planes de precio →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Accesos rápidos Premium */}
        <Text style={styles.sectionTitle}>Funciones Premium</Text>
        <View style={styles.quickAccess}>
          {[
            { icon: '🎙️', label: 'Voz', screen: 'VoiceTranslate' as const },
            { icon: '💬', label: 'Conversación', screen: 'Conversation' as const },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.quickBtn, plan === 'free' && styles.quickBtnLocked]}
              onPress={() => {
                if (plan === 'free') {
                  Alert.alert('Premium requerido', 'Actualiza tu plan para acceder a esta función.');
                } else {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Text style={styles.quickBtnIcon}>{item.icon}</Text>
              <Text style={styles.quickBtnLabel}>{item.label}</Text>
              {plan === 'free' && <Text style={styles.lockOverlay}>🔒</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Opciones de cuenta */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        {[
          { icon: '⚙️', label: 'Configuración', screen: 'Settings' as const },
          { icon: '📊', label: 'Mi historial', screen: null },
          { icon: '❓', label: 'Ayuda y soporte', screen: null },
          { icon: '🚪', label: 'Cerrar sesión', screen: null },
        ].map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => {
              if (item.screen) navigation.navigate(item.screen);
              else Alert.alert(item.label, 'Próximamente.');
            }}
          >
            <Text style={styles.menuItemIcon}>{item.icon}</Text>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.cyanElectric,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarEmoji: { fontSize: 36 },
  userName: {
    fontSize: THEME.typography.sizes.header,
    fontWeight: '700',
    color: THEME.colors.text.main,
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  planBadgePremium: {
    borderColor: THEME.colors.secondary.magentaNeon,
    backgroundColor: 'rgba(255,0,255,0.1)',
  },
  planBadgeText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.small,
  },

  usageCard: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: 1,
    borderColor: 'rgba(0,255,255,0.3)',
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
    marginBottom: 16,
  },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  usageTitle: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small, fontWeight: '600' },
  usageCount: { color: THEME.colors.primary.cyanElectric, fontWeight: '700', fontSize: THEME.typography.sizes.small },
  usageTrack: {
    height: 8,
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  usageFill: { height: '100%', backgroundColor: THEME.colors.primary.cyanElectric, borderRadius: 4 },
  usageNote: { fontSize: 11, color: THEME.colors.text.subtle },

  premiumCard: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.secondary.magentaNeon,
    borderRadius: THEME.borders.radius.standard,
    padding: 20,
    marginBottom: 24,
    shadowColor: THEME.colors.secondary.magentaNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  premiumCardTitle: {
    fontSize: THEME.typography.sizes.title,
    fontWeight: '800',
    color: THEME.colors.secondary.magentaNeon,
    marginBottom: 6,
  },
  premiumCardSub: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    lineHeight: 18,
    marginBottom: 16,
  },
  featureList: { gap: 12, marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIcon: { fontSize: 22, width: 30 },
  featureTitle: { color: THEME.colors.text.main, fontWeight: '600', fontSize: THEME.typography.sizes.small },
  featureDesc: { color: THEME.colors.text.subtle, fontSize: 11, lineHeight: 15, marginTop: 2 },

  premiumBtn: {
    backgroundColor: THEME.colors.secondary.magentaNeon,
    paddingVertical: 14,
    borderRadius: THEME.borders.radius.pill,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
  },

  sectionTitle: {
    fontSize: THEME.typography.sizes.small,
    fontWeight: '700',
    color: THEME.colors.text.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 4,
  },

  quickAccess: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickBtn: {
    flex: 1,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.secondary.magentaNeon,
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  quickBtnLocked: { opacity: 0.5 },
  quickBtnIcon: { fontSize: 28 },
  quickBtnLabel: { color: THEME.colors.text.main, fontWeight: '600', fontSize: THEME.typography.sizes.small },
  lockOverlay: { position: 'absolute', top: 6, right: 8, fontSize: 14 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background.darkPurple,
    borderRadius: THEME.borders.radius.standard,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
  },
  menuItemIcon: { fontSize: 20, width: 28 },
  menuItemLabel: { flex: 1, color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body },
  menuItemArrow: { color: THEME.colors.text.subtle, fontSize: 20 },
});
