/**
 * Mock local para la app mobile.
 * Devuelve datos estáticos que simulan respuestas reales de OCR + traducción.
 * Las coordenadas de boundingBox asumen una imagen de referencia de 390×280px
 * (ancho típico de pantalla móvil). Se escalan en TranslationOverlay.
 */

import type { OcrResult, TranslationResult, PlanLimits } from "../../types/translation";

export const IMAGE_REF_WIDTH = 390;
export const IMAGE_REF_HEIGHT = 280;

export function mockOcrResult(): OcrResult {
  return {
    fullText: "Warning: Keep out of reach of children.",
    detectedLanguage: "en",
    processedAt: new Date(),
    blocks: [
      {
        text: "Warning:",
        confidence: 0.98,
        detectedLanguage: "en",
        boundingBox: { x: 20, y: 40, width: 130, height: 32 },
      },
      {
        text: "Keep out of reach of children.",
        confidence: 0.96,
        detectedLanguage: "en",
        boundingBox: { x: 20, y: 85, width: 310, height: 32 },
      },
    ],
  };
}

export function mockPlanLimits(plan: "free" | "premium" = "free"): PlanLimits {
  return plan === "free"
    ? { plan: "free", dailyScansUsed: 4, dailyScansLimit: 10, historyRetentionDays: 7 }
    : { plan: "premium", dailyScansUsed: 37, dailyScansLimit: -1, historyRetentionDays: 365 };
}

export function mockTranslationResult(): TranslationResult {
  return {
    fullOriginalText: "Warning: Keep out of reach of children.",
    fullTranslatedText: "Advertencia: Mantener fuera del alcance de los niños.",
    sourceLanguage: "en",
    targetLanguage: "es",
    translatedAt: new Date(),
    blocks: [
      {
        originalText: "Warning:",
        translatedText: "Advertencia:",
        sourceLanguage: "en",
        targetLanguage: "es",
        boundingBox: { x: 20, y: 40, width: 130, height: 32 },
      },
      {
        originalText: "Keep out of reach of children.",
        translatedText: "Mantener fuera del alcance de los niños.",
        sourceLanguage: "en",
        targetLanguage: "es",
        boundingBox: { x: 20, y: 85, width: 310, height: 32 },
      },
    ],
  };
}
