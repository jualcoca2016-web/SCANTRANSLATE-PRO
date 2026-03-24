import React, { createContext, useContext, useState } from 'react';
import type { SupportedLanguage } from '../types/translation';

// ─── Detectar idioma del dispositivo ────────────────────────────────────────

export function getDeviceLanguage(): SupportedLanguage {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const lang = locale.split('-')[0].toLowerCase() as SupportedLanguage;
    const supported: SupportedLanguage[] = ['en', 'es', 'ja', 'zh', 'fr', 'de', 'pt', 'ko', 'it', 'ru'];
    return supported.includes(lang) ? lang : 'es';
  } catch {
    return 'es';
  }
}

function getDefaultTargetLang(native: SupportedLanguage): SupportedLanguage {
  return native === 'es' ? 'en' : 'es';
}

// ─── Contexto ────────────────────────────────────────────────────────────────

interface LanguageContextType {
  /** Idioma nativo del usuario (su idioma principal) */
  nativeLang: SupportedLanguage;
  setNativeLang: (lang: SupportedLanguage) => void;

  /** Idioma al que se traduce por defecto */
  targetLang: SupportedLanguage;
  setTargetLang: (lang: SupportedLanguage) => void;

  /** Último idioma detectado por la cámara (para sincronizar con Texto) */
  lastDetectedLang: SupportedLanguage | null;
  setLastDetectedLang: (lang: SupportedLanguage) => void;

  /** Reproducción de audio traducido activada */
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  nativeLang: 'es',
  setNativeLang: () => {},
  targetLang: 'en',
  setTargetLang: () => {},
  lastDetectedLang: null,
  setLastDetectedLang: () => {},
  soundEnabled: false,
  setSoundEnabled: () => {},
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const native = getDeviceLanguage();
  const [nativeLang, setNativeLang] = useState<SupportedLanguage>(native);
  const [targetLang, setTargetLang] = useState<SupportedLanguage>(getDefaultTargetLang(native));
  const [lastDetectedLang, setLastDetectedLang] = useState<SupportedLanguage | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <LanguageContext.Provider
      value={{
        nativeLang, setNativeLang,
        targetLang, setTargetLang,
        lastDetectedLang, setLastDetectedLang,
        soundEnabled, setSoundEnabled,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
