import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { THEME } from '../theme/constants';
import { APP_CONFIG } from '../constants/appConfig';
import type { RootTabParamList } from '../navigation/AppNavigator';

type HomeNav = BottomTabNavigationProp<RootTabParamList>;

interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  tab: keyof RootTabParamList;
  premium: boolean;
  color: string;
}

const FEATURES: FeatureCard[] = [
  {
    icon: '📷',
    title: 'Traducción por Cámara',
    description: 'Apunta al texto y tradúcelo al instante con overlay en pantalla.',
    tab: 'Camera',
    premium: false,
    color: THEME.colors.primary.cyanElectric,
  },
  {
    icon: '✍️',
    title: 'Traducción de Texto',
    description: 'Escribe cualquier texto y obtén su traducción inmediata.',
    tab: 'Text',
    premium: false,
    color: THEME.colors.primary.blueVibrant,
  },
  {
    icon: '🎮',
    title: 'Aprende Jugando',
    description: 'Juego de plataformas donde cada nivel te enseña un idioma nuevo.',
    tab: 'Game',
    premium: false,
    color: THEME.colors.secondary.pinkHot,
  },
  {
    icon: '🎙️',
    title: 'Traducción de Voz',
    description: 'Habla y escucha la traducción al instante. Modo conversación incluido.',
    tab: 'Profile',
    premium: true,
    color: THEME.colors.secondary.magentaNeon,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.colors.background.deepSpace} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>{APP_CONFIG.name}</Text>
          <Text style={styles.appNamePro}>PRO</Text>
        </View>
        <Text style={styles.tagline}>Traducción inteligente en tiempo real,{'\n'}sin límites.</Text>

        {/* Banner neón */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🌐</Text>
          <View>
            <Text style={styles.bannerTitle}>¡Bienvenido!</Text>
            <Text style={styles.bannerSubtitle}>
              Usa la cámara para traducir texto al instante.
            </Text>
          </View>
        </View>

        {/* Cards de funcionalidades */}
        <Text style={styles.sectionTitle}>¿Qué quieres hacer?</Text>
        {FEATURES.map((feature) => (
          <TouchableOpacity
            key={feature.title}
            style={[styles.card, { borderColor: feature.color }]}
            onPress={() => navigation.navigate(feature.tab)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardIcon}>{feature.icon}</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                {feature.premium && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDescription}>{feature.description}</Text>
            </View>
            <Text style={[styles.cardArrow, { color: feature.color }]}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Banner premium */}
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.85}
        >
          <Text style={styles.premiumBannerTitle}>✨ Desbloquea Premium</Text>
          <Text style={styles.premiumBannerText}>
            Voz en tiempo real · Modo conversación · Juegos avanzados · Aprendizaje interactivo
          </Text>
          <View style={styles.premiumBannerButton}>
            <Text style={styles.premiumBannerButtonText}>Ver planes →</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>v{APP_CONFIG.version} · Yasuni Tech</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 24,
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.text.cyanGlow,
    letterSpacing: 1,
  },
  appNamePro: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.primary.cyanElectric,
    marginLeft: 6,
    marginBottom: 4,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: THEME.typography.sizes.body,
    color: THEME.colors.text.subtle,
    lineHeight: 22,
    marginBottom: 24,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
    marginBottom: 28,
    gap: 14,
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: {
    fontSize: THEME.typography.sizes.title,
    fontWeight: '700',
    color: THEME.colors.text.main,
  },
  bannerSubtitle: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: THEME.typography.sizes.body,
    fontWeight: '700',
    color: THEME.colors.text.subtle,
    marginBottom: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.thin,
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardLeft: { width: 44, alignItems: 'center' },
  cardIcon: { fontSize: 28 },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: {
    fontSize: THEME.typography.sizes.body,
    fontWeight: '700',
    color: THEME.colors.text.main,
  },
  premiumBadge: {
    backgroundColor: THEME.colors.secondary.magentaNeon,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    lineHeight: 17,
  },
  cardArrow: { fontSize: 24, fontWeight: '300' },

  premiumBanner: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.secondary.magentaNeon,
    borderRadius: THEME.borders.radius.standard,
    padding: 20,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: THEME.colors.secondary.magentaNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  premiumBannerTitle: {
    fontSize: THEME.typography.sizes.title,
    fontWeight: '800',
    color: THEME.colors.secondary.magentaNeon,
    marginBottom: 8,
  },
  premiumBannerText: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    lineHeight: 18,
    marginBottom: 14,
  },
  premiumBannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: THEME.colors.secondary.magentaNeon,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: THEME.borders.radius.pill,
  },
  premiumBannerButtonText: {
    color: '#000',
    fontWeight: '800',
    fontSize: THEME.typography.sizes.small,
  },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 11, color: THEME.colors.text.subtle },
});
