import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { THEME } from '../../theme/constants';

interface Message {
  id: string;
  speaker: 'user' | 'other';
  original: string;
  translated: string;
  language: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', speaker: 'other', original: 'Today\'s specials are grilled salmon and tempura.', translated: 'Los especiales de hoy son salmón a la plancha y tempura.', language: 'EN' },
  { id: '2', speaker: 'user', original: '¿Cuánto cuesta el salmón?', translated: 'How much does the salmon cost?', language: 'ES' },
  { id: '3', speaker: 'other', original: 'The salmon is fifteen dollars.', translated: 'El salmón cuesta quince dólares.', language: 'EN' },
];

export default function ConversationScreen() {
  const navigation = useNavigation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState<'user' | 'other' | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleAcceptDisclaimer = () => setShowDisclaimer(false);

  const handleListen = (speaker: 'user' | 'other') => {
    if (isListening) return;
    setIsListening(speaker);
    setTimeout(() => {
      const mock = MOCK_MESSAGES[messages.length % MOCK_MESSAGES.length];
      setMessages((prev) => [...prev, { ...mock, id: String(Date.now()), speaker }]);
      setIsListening(null);
    }, 2000);
  };

  const toggleRecording = () => {
    setIsRecording((r) => !r);
    if (!isRecording) Alert.alert('Grabación iniciada', 'La conversación se está grabando.');
    else Alert.alert('Grabación detenida', 'Conversación guardada en tu historial.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Modal de advertencia (obligatorio según spec) */}
      <Modal visible={showDisclaimer} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>⚠️</Text>
            <Text style={styles.modalTitle}>Advertencia importante</Text>
            <Text style={styles.modalBody}>
              El sistema de traducción automática intentará ser lo más preciso posible, pero{' '}
              <Text style={{ color: THEME.colors.secondary.pinkHot, fontWeight: '700' }}>
                puede cometer errores
              </Text>
              .{'\n\n'}
              Usa este modo como una herramienta de apoyo y mantén una actitud comprensiva durante la conversación.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={handleAcceptDisclaimer}>
              <Text style={styles.modalBtnText}>Entendido, continuar →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💬  Modo Conversación</Text>
        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          onPress={toggleRecording}
        >
          <Text style={styles.recordBtnText}>{isRecording ? '⏹' : '⏺️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Mensajes */}
      <ScrollView
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>
              Usa los botones de abajo para iniciar la conversación.{'\n'}
              Cada persona habla en su idioma.
            </Text>
          </View>
        )}
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.bubble, msg.speaker === 'user' ? styles.bubbleUser : styles.bubbleOther]}>
            <Text style={styles.bubbleLang}>{msg.language}</Text>
            <Text style={styles.bubbleOriginal}>{msg.original}</Text>
            <View style={styles.bubbleDivider} />
            <Text style={styles.bubbleTranslated}>{msg.translated}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Controles de conversación */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.speakBtn, styles.speakBtnOther, isListening === 'other' && styles.speakBtnListening]}
          onPress={() => handleListen('other')}
          disabled={isListening !== null}
        >
          <Text style={styles.speakBtnEmoji}>{isListening === 'other' ? '🔴' : '🎙️'}</Text>
          <Text style={styles.speakBtnLabel}>
            {isListening === 'other' ? 'Escuchando...' : 'Ellos hablan'}
          </Text>
        </TouchableOpacity>

        <View style={styles.controlsDivider} />

        <TouchableOpacity
          style={[styles.speakBtn, styles.speakBtnUser, isListening === 'user' && styles.speakBtnListening]}
          onPress={() => handleListen('user')}
          disabled={isListening !== null}
        >
          <Text style={styles.speakBtnEmoji}>{isListening === 'user' ? '🔴' : '🎙️'}</Text>
          <Text style={styles.speakBtnLabel}>
            {isListening === 'user' ? 'Escuchando...' : 'Yo hablo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background.deepSpace },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: THEME.colors.background.darkPurple,
    borderWidth: THEME.borders.width.glow,
    borderColor: THEME.colors.secondary.pinkHot,
    borderRadius: THEME.borders.radius.standard,
    padding: 28,
    alignItems: 'center',
    maxWidth: 360,
    width: '100%',
  },
  modalEmoji: { fontSize: 48, marginBottom: 12 },
  modalTitle: {
    fontSize: THEME.typography.sizes.title,
    fontWeight: '800',
    color: THEME.colors.text.main,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: THEME.typography.sizes.body,
    color: THEME.colors.text.subtle,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: THEME.colors.primary.cyanElectric,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: THEME.borders.radius.pill,
  },
  modalBtnText: {
    color: THEME.colors.background.deepSpace,
    fontWeight: '800',
    fontSize: THEME.typography.sizes.body,
  },

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
  backText: { color: THEME.colors.primary.cyanElectric, fontWeight: '600', fontSize: THEME.typography.sizes.body, width: 70 },
  headerTitle: { color: THEME.colors.text.main, fontWeight: '700', fontSize: THEME.typography.sizes.body },
  recordBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: { backgroundColor: 'rgba(255,0,0,0.3)', borderColor: '#FF0000' },
  recordBtnText: { fontSize: 16 },

  messageList: { flex: 1 },
  messageListContent: { padding: 16, gap: 12, paddingBottom: 8 },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyText: {
    color: THEME.colors.text.subtle,
    textAlign: 'center',
    fontSize: THEME.typography.sizes.body,
    lineHeight: 22,
  },

  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: THEME.borders.radius.standard,
    borderWidth: 1,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(30,144,255,0.1)',
    borderColor: THEME.colors.primary.blueVibrant,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,0,255,0.08)',
    borderColor: THEME.colors.secondary.magentaNeon,
  },
  bubbleLang: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.text.subtle,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bubbleOriginal: { color: THEME.colors.text.main, fontSize: THEME.typography.sizes.body, lineHeight: 20 },
  bubbleDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
  bubbleTranslated: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small, lineHeight: 18, fontStyle: 'italic' },

  controls: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.secondary.magentaNeon,
    backgroundColor: THEME.colors.background.darkPurple,
  },
  controlsDivider: { width: 1, backgroundColor: THEME.colors.secondary.magentaNeon },
  speakBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  speakBtnUser: { backgroundColor: 'rgba(30,144,255,0.08)' },
  speakBtnOther: { backgroundColor: 'rgba(255,0,255,0.08)' },
  speakBtnListening: { backgroundColor: 'rgba(255,0,0,0.1)' },
  speakBtnEmoji: { fontSize: 28 },
  speakBtnLabel: { color: THEME.colors.text.subtle, fontSize: THEME.typography.sizes.small, fontWeight: '600' },
});
