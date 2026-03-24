import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME } from '../theme/constants';

// ─── Datos del juego (mock — Core V2 conectará con backend) ──────────────────

interface Question {
  word: string;
  sourceLanguage: string;
  options: string[];
  correctIndex: number;
  emoji: string;
}

const QUESTIONS: Question[] = [
  { word: 'Hello', sourceLanguage: 'English', options: ['Hola', 'Adiós', 'Gracias', 'Por favor'], correctIndex: 0, emoji: '👋' },
  { word: 'Cat', sourceLanguage: 'English', options: ['Perro', 'Pájaro', 'Gato', 'Pez'], correctIndex: 2, emoji: '🐱' },
  { word: 'Water', sourceLanguage: 'English', options: ['Fuego', 'Agua', 'Tierra', 'Viento'], correctIndex: 1, emoji: '💧' },
  { word: 'Thank you', sourceLanguage: 'English', options: ['Lo siento', 'De nada', 'Gracias', 'Por favor'], correctIndex: 2, emoji: '🙏' },
  { word: 'House', sourceLanguage: 'English', options: ['Casa', 'Coche', 'Árbol', 'Libro'], correctIndex: 0, emoji: '🏠' },
];

type GameState = 'menu' | 'playing' | 'result';

export default function GameHubScreen() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const question = QUESTIONS[currentQuestion];
  const total = QUESTIONS.length;

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === question.correctIndex) {
      setScore((s) => s + 1);
      setCoins((c) => c + 10);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < total) {
        setCurrentQuestion((q) => q + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setGameState('result');
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameState('playing');
  };

  const getOptionStyle = (index: number) => {
    if (!isAnswered || selectedOption === null) return styles.option;
    if (index === question.correctIndex) return [styles.option, styles.optionCorrect];
    if (index === selectedOption) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDim];
  };

  const getOptionTextStyle = (index: number) => {
    if (!isAnswered) return styles.optionText;
    if (index === question.correctIndex) return [styles.optionText, styles.optionTextCorrect];
    if (index === selectedOption) return [styles.optionText, styles.optionTextWrong];
    return [styles.optionText, styles.optionTextDim];
  };

  // ── Menú ──────────────────────────────────────────────────────────────────
  if (gameState === 'menu') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.screenTitle}>🎮  Aprende Jugando</Text>
          <Text style={styles.screenSubtitle}>
            Selecciona la traducción correcta para avanzar de nivel y ganar monedas.
          </Text>

          {/* Tarjeta juego gratis */}
          <View style={styles.gameCard}>
            <Text style={styles.gameCardEmoji}>🏃</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameCardTitle}>Aventura de Palabras</Text>
              <Text style={styles.gameCardDesc}>
                Selecciona la traducción correcta para avanzar. {total} preguntas · EN → ES
              </Text>
              <View style={styles.gameCardMeta}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>GRATIS</Text>
                </View>
                <Text style={styles.gameCardLevel}>Nivel 1 · Básico</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.startBtn} onPress={() => setGameState('playing')}>
            <Text style={styles.startBtnText}>▶  Iniciar Juego</Text>
          </TouchableOpacity>

          {/* Tarjetas premium bloqueadas */}
          <Text style={styles.sectionTitle}>🔒  Premium — Juegos Avanzados</Text>

          {[
            { emoji: '🌆', title: 'Aventura Urbana', desc: 'Viaja por ciudades del mundo y usa el idioma para tomar decisiones reales.' },
            { emoji: '🤖', title: 'Simulación Conversacional', desc: 'Habla con personajes virtuales. El sistema evalúa pronunciación y gramática.' },
          ].map((game) => (
            <TouchableOpacity
              key={game.title}
              style={[styles.gameCard, styles.gameCardLocked]}
              onPress={() => Alert.alert('Premium', 'Desbloquea esta función con el plan Premium.')}
              activeOpacity={0.8}
            >
              <Text style={styles.gameCardEmoji}>{game.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gameCardTitle, { color: THEME.colors.text.subtle }]}>{game.title}</Text>
                <Text style={styles.gameCardDesc}>{game.desc}</Text>
                <View style={styles.gameCardMeta}>
                  <View style={[styles.badge, styles.badgePremium]}>
                    <Text style={[styles.badgeText, { color: '#000' }]}>PREMIUM</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.lockIcon}>🔒</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  if (gameState === 'result') {
    const percent = Math.round((score / total) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.scroll, { alignItems: 'center', paddingTop: 60 }]}>
          <Text style={{ fontSize: 72 }}>
            {percent >= 80 ? '🏆' : percent >= 50 ? '⭐' : '💪'}
          </Text>
          <Text style={styles.resultTitle}>
            {percent >= 80 ? '¡Excelente!' : percent >= 50 ? '¡Bien hecho!' : '¡Sigue practicando!'}
          </Text>
          <Text style={styles.resultScore}>{score}/{total} correctas</Text>

          <View style={styles.coinsEarned}>
            <Text style={styles.coinsEarnedText}>🪙  +{coins} monedas ganadas</Text>
          </View>

          <View style={styles.resultStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{percent}%</Text>
              <Text style={styles.statLabel}>Precisión</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>Correctas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{coins}</Text>
              <Text style={styles.statLabel}>Monedas</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleRestart}>
            <Text style={styles.startBtnText}>🔁  Jugar de nuevo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, styles.secondaryBtn]}
            onPress={() => { setCoins(0); setGameState('menu'); }}
          >
            <Text style={styles.secondaryBtnText}>← Volver al menú</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Juego en curso ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>{currentQuestion + 1}/{total}</Text>
          <Text style={styles.coinsText}>🪙 {coins}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((currentQuestion) / total) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.gameArea}>
        {/* Palabra a traducir */}
        <View style={styles.wordCard}>
          <Text style={styles.wordEmoji}>{question.emoji}</Text>
          <Text style={styles.wordLabel}>{question.sourceLanguage}</Text>
          <Text style={styles.wordText}>{question.word}</Text>
          <Text style={styles.wordPrompt}>¿Cómo se dice en español?</Text>
        </View>

        {/* Opciones */}
        <View style={styles.optionsGrid}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleAnswer(index)}
              disabled={isAnswered}
              activeOpacity={0.8}
            >
              <Text style={styles.optionLetter}>
                {['A', 'B', 'C', 'D'][index]}
              </Text>
              <Text style={getOptionTextStyle(index)}>{option}</Text>
              {isAnswered && index === question.correctIndex && (
                <Text style={styles.optionCheck}>✓</Text>
              )}
              {isAnswered && index === selectedOption && index !== question.correctIndex && (
                <Text style={styles.optionX}>✗</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  screenTitle: {
    fontSize: THEME.typography.sizes.header,
    fontWeight: '800',
    color: THEME.colors.text.main,
    marginTop: 24,
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: THEME.typography.sizes.body,
    color: THEME.colors.text.subtle,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: THEME.typography.sizes.small,
    fontWeight: '700',
    color: THEME.colors.text.subtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 12,
  },

  gameCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.standard,
    padding: 16,
    marginBottom: 12,
  },
  gameCardLocked: {
    borderColor: 'rgba(255,0,255,0.4)',
    opacity: 0.8,
  },
  gameCardEmoji: { fontSize: 36, marginTop: 4 },
  gameCardTitle: {
    fontSize: THEME.typography.sizes.body,
    fontWeight: '700',
    color: THEME.colors.text.main,
    marginBottom: 4,
  },
  gameCardDesc: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    lineHeight: 17,
    marginBottom: 8,
  },
  gameCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gameCardLevel: { fontSize: 11, color: THEME.colors.text.subtle },
  lockIcon: { fontSize: 20, alignSelf: 'center' },

  badge: {
    backgroundColor: THEME.colors.primary.cyanElectric,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgePremium: { backgroundColor: THEME.colors.secondary.magentaNeon },
  badgeText: { fontSize: 9, fontWeight: '900', color: THEME.colors.background.deepSpace, letterSpacing: 0.5 },

  startBtn: {
    backgroundColor: THEME.colors.primary.cyanElectric,
    paddingVertical: 16,
    borderRadius: THEME.borders.radius.pill,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 12,
  },
  secondaryBtnText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '600',
    fontSize: THEME.typography.sizes.body,
  },

  // ── Juego ──
  progressBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: THEME.colors.background.darkPurple,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.primary.cyanElectric,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small },
  coinsText: { color: THEME.colors.primary.cyanElectric, fontWeight: '700', fontSize: THEME.typography.sizes.small },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary.cyanElectric,
    borderRadius: 3,
  },

  gameArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },

  wordCard: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.standard,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: THEME.colors.primary.cyanElectric,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  wordEmoji: { fontSize: 52, marginBottom: 8 },
  wordLabel: { fontSize: THEME.typography.sizes.small, color: THEME.colors.text.subtle, marginBottom: 4 },
  wordText: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.colors.text.main,
    marginBottom: 8,
  },
  wordPrompt: { fontSize: THEME.typography.sizes.small, color: THEME.colors.text.subtle },

  optionsGrid: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.thin,
    borderColor: 'rgba(0,255,255,0.3)',
    borderRadius: THEME.borders.radius.standard,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionCorrect: {
    borderColor: '#4ADE80',
    backgroundColor: 'rgba(74,222,128,0.1)',
  },
  optionWrong: {
    borderColor: THEME.colors.secondary.pinkHot,
    backgroundColor: 'rgba(255,20,147,0.1)',
  },
  optionDim: { opacity: 0.4 },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,255,0.1)',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.small,
    lineHeight: 28,
  },
  optionText: { flex: 1, color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body, fontWeight: '600' },
  optionTextCorrect: { color: '#4ADE80' },
  optionTextWrong: { color: THEME.colors.secondary.pinkHot },
  optionTextDim: { color: THEME.colors.text.subtle },
  optionCheck: { color: '#4ADE80', fontWeight: '700', fontSize: 18 },
  optionX: { color: THEME.colors.secondary.pinkHot, fontWeight: '700', fontSize: 18 },

  // ── Resultado ──
  resultTitle: {
    fontSize: THEME.typography.sizes.header,
    fontWeight: '800',
    color: THEME.colors.text.main,
    marginTop: 16,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: THEME.typography.sizes.title,
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
    marginBottom: 20,
  },
  coinsEarned: {
    backgroundColor: 'rgba(0,255,255,0.1)',
    borderWidth: 1,
    borderColor: THEME.colors.primary.cyanElectric,
    borderRadius: THEME.borders.radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginBottom: 24,
  },
  coinsEarnedText: {
    color: THEME.colors.primary.cyanElectric,
    fontWeight: '700',
    fontSize: THEME.typography.sizes.body,
  },
  resultStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: THEME.typography.sizes.header,
    fontWeight: '800',
    color: THEME.colors.text.main,
  },
  statLabel: {
    fontSize: THEME.typography.sizes.small,
    color: THEME.colors.text.subtle,
    marginTop: 2,
  },
});
