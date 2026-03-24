/**
 * Tipos espejo del backend (backend/src/types/translation.ts).
 * La mobile app no importa del backend directamente — esta copia garantiza
 * que ambos lados del proyecto comparten la misma forma de datos.
 * Si modificas una interfaz, actualiza AMBOS archivos.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrBlock {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  detectedLanguage: string;
}

export interface OcrResult {
  blocks: OcrBlock[];
  fullText: string;
  detectedLanguage: string;
  processedAt: Date;
}

export type SupportedLanguage =
  | "en" | "es" | "ja" | "zh"
  | "fr" | "de" | "pt" | "ko"
  | "it" | "ru";

export interface TranslationBlock {
  originalText: string;
  translatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  boundingBox: BoundingBox;
}

export interface TranslationResult {
  blocks: TranslationBlock[];
  fullOriginalText: string;
  fullTranslatedText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  translatedAt: Date;
}

export type UserPlan = "free" | "premium";

export interface TranslationHistoryEntry {
  id: string;
  userId: string;
  originalImageUrl: string;
  compositeImageUrl: string;
  ocrResult: OcrResult;
  translationResult: TranslationResult;
  isFavorite: boolean;
  createdAt: Date;
}

export interface PlanLimits {
  plan: UserPlan;
  dailyScansUsed: number;
  dailyScansLimit: number;
  historyRetentionDays: number;
}
